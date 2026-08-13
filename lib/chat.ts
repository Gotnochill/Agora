import { ChatConversationType, ChatMemberRole, UserStatus } from "@/prisma-client";
import { z } from "zod";

export const CHAT_MESSAGE_MAX_LENGTH = 4000;
export const CHAT_GROUP_MAX_MEMBERS = 20;
export const CHAT_UNDELIVERED_TTL_DAYS = 30;
export const CHAT_SEND_RECEIPT_TTL_HOURS = 24;

const chatId = z.string().trim().min(1).max(128);

export const sendChatMessageSchema = z.object({
  conversationId: chatId,
  clientMessageId: chatId,
  body: z.string().trim().min(1, "Write a message").max(CHAT_MESSAGE_MAX_LENGTH),
});

export const createDirectConversationSchema = z.object({
  recipientId: chatId,
});

export const createGroupConversationSchema = z.object({
  title: z.string().trim().min(2, "Add a group name").max(80),
  memberIds: z
    .array(chatId)
    .min(1, "Choose at least one member")
    .max(CHAT_GROUP_MAX_MEMBERS - 1)
    .refine((memberIds) => new Set(memberIds).size === memberIds.length, {
      message: "Choose each member once",
    }),
});

export const chatAckSchema = z.object({
  messageIds: z
    .array(chatId)
    .min(1)
    .max(100)
    .transform((messageIds) => Array.from(new Set(messageIds))),
});

export const markChatReadSchema = z.object({
  conversationId: chatId,
});

export const chatReportSchema = z.object({
  conversationId: chatId,
  messageId: chatId,
  reportedSenderId: chatId,
  body: z.string().min(1).max(CHAT_MESSAGE_MAX_LENGTH),
  messageCreatedAt: z.coerce.date(),
  signature: z.string().trim().min(1).max(256),
  note: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => value || null),
});

export function directConversationKey(firstUserId: string, secondUserId: string) {
  const userIds = [firstUserId.trim(), secondUserId.trim()];

  if (userIds.some((userId) => !userId) || userIds[0] === userIds[1]) {
    throw new Error("A direct conversation requires two different users");
  }

  return `direct:${userIds.sort().map(encodeURIComponent).join(":")}`;
}

type ChatMembership = {
  userId: string;
  role: ChatMemberRole;
  leftAt: Date | null;
};

type ChatConversationAccess = {
  type: ChatConversationType;
  members: ChatMembership[];
};

export function activeChatMember(
  conversation: ChatConversationAccess,
  userId: string,
): ChatMembership | null {
  return (
    conversation.members.find((member) => member.userId === userId && member.leftAt === null) ??
    null
  );
}

export function canAccessChat(conversation: ChatConversationAccess, userId: string) {
  return activeChatMember(conversation, userId) !== null;
}

export function canManageChat(conversation: ChatConversationAccess, userId: string) {
  const member = activeChatMember(conversation, userId);
  return conversation.type === ChatConversationType.GROUP && member?.role === ChatMemberRole.OWNER;
}

export function chatRecipientIds(conversation: ChatConversationAccess, senderId: string) {
  return Array.from(
    new Set(
      conversation.members
        .filter((member) => member.leftAt === null && member.userId !== senderId)
        .map((member) => member.userId),
    ),
  );
}

export function allChatParticipantsActive(
  users: Array<{ status: UserStatus }>,
  expectedCount: number,
) {
  return users.length === expectedCount && users.every((user) => user.status === UserStatus.ACTIVE);
}
