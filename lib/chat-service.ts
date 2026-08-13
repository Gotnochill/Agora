import {
  ChatConversationType,
  ChatMemberRole,
  ChatRateLimitScope,
  Prisma,
  UserStatus,
} from "@/prisma-client";
import {
  CHAT_SEND_RECEIPT_TTL_HOURS,
  CHAT_UNDELIVERED_TTL_DAYS,
  allChatParticipantsActive,
  chatRecipientIds,
  directConversationKey,
} from "./chat";
import { consumeChatRateLimit } from "./chat-rate-limit";
import { signChatEnvelope, verifyChatEnvelope } from "./chat-signing";
import { memberDisplayName } from "./members";
import { prisma } from "./prisma";

const CHAT_INBOX_PAGE_SIZE = 50;

export type ChatServiceErrorCode =
  | "FORBIDDEN"
  | "INVALID_PARTICIPANTS"
  | "NOT_FOUND"
  | "RATE_LIMITED";

export class ChatServiceError extends Error {
  constructor(
    readonly code: ChatServiceErrorCode,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

export type ChatEnvelope = {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
  body: string;
  createdAt: string;
  signature: string;
};

type EnqueueChatMessageInput = {
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  body: string;
};

function addMilliseconds(date: Date, milliseconds: number) {
  return new Date(date.getTime() + milliseconds);
}

function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

async function serializableTransaction<T>(
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isPrismaError(error, "P2034") || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Chat transaction retry limit reached");
}

async function enforceRateLimit(
  transaction: Prisma.TransactionClient,
  userId: string,
  scope: ChatRateLimitScope,
  now: Date,
) {
  const rateLimit = await consumeChatRateLimit(transaction, userId, scope, now);

  if (!rateLimit.allowed) {
    throw new ChatServiceError(
      "RATE_LIMITED",
      "Too many chat requests",
      rateLimit.retryAfterSeconds,
    );
  }
}

export async function createDirectConversation(creatorId: string, recipientId: string) {
  if (creatorId === recipientId) {
    throw new ChatServiceError("INVALID_PARTICIPANTS", "Choose another member");
  }

  const directKey = directConversationKey(creatorId, recipientId);

  try {
    return await serializableTransaction(async (transaction) => {
      const existing = await transaction.chatConversation.findUnique({ where: { directKey } });

      if (existing) {
        return existing;
      }

      const recipient = await transaction.user.findFirst({
        where: { id: recipientId, status: UserStatus.ACTIVE },
        select: { id: true },
      });

      if (!recipient) {
        throw new ChatServiceError("INVALID_PARTICIPANTS", "Member is unavailable");
      }

      const now = new Date();
      await enforceRateLimit(transaction, creatorId, ChatRateLimitScope.CONVERSATION_CREATE, now);

      return await transaction.chatConversation.create({
        data: {
          type: ChatConversationType.DIRECT,
          directKey,
          createdById: creatorId,
          members: {
            create: [
              { userId: creatorId, role: ChatMemberRole.MEMBER },
              { userId: recipient.id, role: ChatMemberRole.MEMBER },
            ],
          },
        },
      });
    });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      const concurrent = await prisma.chatConversation.findUnique({ where: { directKey } });
      if (concurrent) return concurrent;
    }
    throw error;
  }
}

export async function createGroupConversation(
  creatorId: string,
  title: string,
  requestedMemberIds: string[],
) {
  const memberIds = Array.from(new Set(requestedMemberIds));

  if (memberIds.includes(creatorId)) {
    throw new ChatServiceError("INVALID_PARTICIPANTS", "The creator is already included");
  }

  return serializableTransaction(async (transaction) => {
    const users = await transaction.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, status: true },
    });

    if (!allChatParticipantsActive(users, memberIds.length)) {
      throw new ChatServiceError("INVALID_PARTICIPANTS", "Every member must be active");
    }

    const now = new Date();
    await enforceRateLimit(transaction, creatorId, ChatRateLimitScope.CONVERSATION_CREATE, now);

    return transaction.chatConversation.create({
      data: {
        type: ChatConversationType.GROUP,
        title,
        createdById: creatorId,
        members: {
          create: [
            { userId: creatorId, role: ChatMemberRole.OWNER },
            ...memberIds.map((userId) => ({ userId, role: ChatMemberRole.MEMBER })),
          ],
        },
      },
    });
  });
}

export async function listChatConversations(userId: string) {
  return prisma.chatConversation.findMany({
    where: { members: { some: { userId, leftAt: null } } },
    orderBy: { lastActivityAt: "desc" },
    include: {
      members: {
        where: { leftAt: null },
        orderBy: { joinedAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              status: true,
              profile: { select: { displayName: true, photoUrl: true } },
            },
          },
        },
      },
    },
  });
}

function receiptResult(receipt: { messageId: string; conversationId: string; createdAt: Date }) {
  return {
    duplicate: true as const,
    messageId: receipt.messageId,
    conversationId: receipt.conversationId,
    createdAt: receipt.createdAt.toISOString(),
    recipientIds: [] as string[],
    envelope: null,
  };
}

function pendingMessageResult(message: { id: string; conversationId: string; createdAt: Date }) {
  return receiptResult({
    messageId: message.id,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
  });
}

export async function enqueueChatMessage(input: EnqueueChatMessageInput) {
  const priorReceipt = await prisma.chatSendReceipt.findUnique({
    where: {
      senderId_clientMessageId: {
        senderId: input.senderId,
        clientMessageId: input.clientMessageId,
      },
    },
  });

  if (priorReceipt) {
    return receiptResult(priorReceipt);
  }

  const priorPendingMessage = await prisma.pendingChatMessage.findUnique({
    where: {
      senderId_clientMessageId: {
        senderId: input.senderId,
        clientMessageId: input.clientMessageId,
      },
    },
  });

  if (priorPendingMessage) {
    return pendingMessageResult(priorPendingMessage);
  }

  try {
    return await serializableTransaction(async (transaction) => {
      const receipt = await transaction.chatSendReceipt.findUnique({
        where: {
          senderId_clientMessageId: {
            senderId: input.senderId,
            clientMessageId: input.clientMessageId,
          },
        },
      });

      if (receipt) {
        return receiptResult(receipt);
      }

      const pendingMessage = await transaction.pendingChatMessage.findUnique({
        where: {
          senderId_clientMessageId: {
            senderId: input.senderId,
            clientMessageId: input.clientMessageId,
          },
        },
      });

      if (pendingMessage) {
        return pendingMessageResult(pendingMessage);
      }

      const conversation = await transaction.chatConversation.findFirst({
        where: {
          id: input.conversationId,
          members: { some: { userId: input.senderId, leftAt: null } },
        },
        include: { members: { where: { leftAt: null } } },
      });

      if (!conversation) {
        throw new ChatServiceError("FORBIDDEN", "Conversation is unavailable");
      }

      const memberRecipientIds = chatRecipientIds(conversation, input.senderId);
      const activeRecipients = await transaction.user.findMany({
        where: { id: { in: memberRecipientIds }, status: UserStatus.ACTIVE },
        select: { id: true },
      });
      const recipientIds = activeRecipients.map((recipient) => recipient.id);

      if (recipientIds.length === 0) {
        throw new ChatServiceError("INVALID_PARTICIPANTS", "No active recipient is available");
      }

      const now = new Date();
      await enforceRateLimit(transaction, input.senderId, ChatRateLimitScope.MESSAGE_SEND, now);

      const messageId = crypto.randomUUID();
      const expiresAt = addMilliseconds(now, CHAT_UNDELIVERED_TTL_DAYS * 24 * 60 * 60_000);
      const receiptExpiresAt = addMilliseconds(now, CHAT_SEND_RECEIPT_TTL_HOURS * 60 * 60_000);

      const sender = await transaction.user.findUniqueOrThrow({
        where: { id: input.senderId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: { select: { displayName: true, photoUrl: true } },
        },
      });

      await transaction.pendingChatMessage.create({
        data: {
          id: messageId,
          conversationId: conversation.id,
          senderId: input.senderId,
          clientMessageId: input.clientMessageId,
          body: input.body,
          createdAt: now,
          expiresAt,
          deliveries: { create: recipientIds.map((recipientId) => ({ recipientId })) },
        },
      });
      await transaction.chatSendReceipt.create({
        data: {
          senderId: input.senderId,
          clientMessageId: input.clientMessageId,
          messageId,
          conversationId: conversation.id,
          createdAt: now,
          expiresAt: receiptExpiresAt,
        },
      });
      await transaction.chatConversation.update({
        where: { id: conversation.id },
        data: { lastActivityAt: now },
      });

      const createdAt = now.toISOString();
      const signable = {
        id: messageId,
        conversationId: conversation.id,
        senderId: sender.id,
        body: input.body,
        createdAt,
      };
      const envelope: ChatEnvelope = {
        id: messageId,
        conversationId: conversation.id,
        sender: {
          id: sender.id,
          name: memberDisplayName(sender),
          image: sender.profile?.photoUrl ?? sender.image,
        },
        body: input.body,
        createdAt,
        signature: signChatEnvelope(signable),
      };

      return {
        duplicate: false as const,
        messageId,
        conversationId: conversation.id,
        createdAt,
        recipientIds,
        envelope,
      };
    });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      const receipt = await prisma.chatSendReceipt.findUnique({
        where: {
          senderId_clientMessageId: {
            senderId: input.senderId,
            clientMessageId: input.clientMessageId,
          },
        },
      });
      if (receipt) return receiptResult(receipt);
      const pendingMessage = await prisma.pendingChatMessage.findUnique({
        where: {
          senderId_clientMessageId: {
            senderId: input.senderId,
            clientMessageId: input.clientMessageId,
          },
        },
      });
      if (pendingMessage) return pendingMessageResult(pendingMessage);
    }
    throw error;
  }
}

function envelopeFromDelivery(delivery: {
  message: {
    id: string;
    conversationId: string;
    body: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      profile: { displayName: string | null; photoUrl: string | null } | null;
    };
  };
}): ChatEnvelope {
  const message = delivery.message;
  const createdAt = message.createdAt.toISOString();
  const signable = {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.sender.id,
    body: message.body,
    createdAt,
  };

  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: {
      id: message.sender.id,
      name: memberDisplayName(message.sender),
      image: message.sender.profile?.photoUrl ?? message.sender.image,
    },
    body: message.body,
    createdAt,
    signature: signChatEnvelope(signable),
  };
}

export async function listPendingChatMessages(userId: string, cursor?: string) {
  const deliveries = await prisma.chatDelivery.findMany({
    where: { recipientId: userId, message: { expiresAt: { gt: new Date() } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: CHAT_INBOX_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      message: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: { select: { displayName: true, photoUrl: true } },
            },
          },
        },
      },
    },
  });
  const hasMore = deliveries.length > CHAT_INBOX_PAGE_SIZE;
  const page = deliveries.slice(0, CHAT_INBOX_PAGE_SIZE);

  return {
    messages: page.map(envelopeFromDelivery),
    nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
  };
}

export async function acknowledgeChatMessages(userId: string, messageIds: string[]) {
  return serializableTransaction(async (transaction) => {
    const deleted = await transaction.chatDelivery.deleteMany({
      where: { recipientId: userId, messageId: { in: messageIds } },
    });
    const payloads = await transaction.pendingChatMessage.deleteMany({
      where: { id: { in: messageIds }, deliveries: { none: {} } },
    });

    return { acknowledged: deleted.count, payloadsDeleted: payloads.count };
  });
}

export async function markChatRead(userId: string, conversationId: string) {
  const updated = await prisma.chatMember.updateMany({
    where: { userId, conversationId, leftAt: null },
    data: { lastReadAt: new Date() },
  });

  if (updated.count === 0) {
    throw new ChatServiceError("FORBIDDEN", "Conversation is unavailable");
  }
}

type ReportChatMessageInput = {
  conversationId: string;
  reporterId: string;
  messageId: string;
  reportedSenderId: string;
  body: string;
  messageCreatedAt: Date;
  note: string | null;
  signature: string;
};

export async function reportChatMessage(input: ReportChatMessageInput) {
  const membership = await prisma.chatMember.findFirst({
    where: { conversationId: input.conversationId, userId: input.reporterId, leftAt: null },
    select: { id: true },
  });

  if (!membership) {
    throw new ChatServiceError("FORBIDDEN", "Conversation is unavailable");
  }

  const valid = verifyChatEnvelope(
    {
      id: input.messageId,
      conversationId: input.conversationId,
      senderId: input.reportedSenderId,
      body: input.body,
      createdAt: input.messageCreatedAt.toISOString(),
    },
    input.signature,
  );

  if (!valid) {
    throw new ChatServiceError("FORBIDDEN", "Message authenticity check failed");
  }

  return prisma.chatReport.upsert({
    where: { reporterId_messageId: { reporterId: input.reporterId, messageId: input.messageId } },
    create: {
      conversationId: input.conversationId,
      reporterId: input.reporterId,
      reportedSenderId: input.reportedSenderId,
      messageId: input.messageId,
      body: input.body,
      messageCreatedAt: input.messageCreatedAt,
      note: input.note,
    },
    update: { note: input.note },
  });
}

export async function cleanupExpiredChatData(now: Date = new Date()) {
  return serializableTransaction(async (transaction) => {
    const [messages, receipts, rateLimits] = await Promise.all([
      transaction.pendingChatMessage.deleteMany({ where: { expiresAt: { lte: now } } }),
      transaction.chatSendReceipt.deleteMany({ where: { expiresAt: { lte: now } } }),
      transaction.chatRateLimit.deleteMany({ where: { expiresAt: { lte: now } } }),
    ]);

    return {
      messagesDeleted: messages.count,
      receiptsDeleted: receipts.count,
      rateLimitsDeleted: rateLimits.count,
    };
  });
}
