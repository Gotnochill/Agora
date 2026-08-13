import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type LocalChatSender = {
  id: string;
  name: string;
  image: string | null;
};

export type LocalChatMessage = {
  id: string;
  conversationId: string;
  sender: LocalChatSender;
  body: string;
  createdAt: string;
  signature: string | null;
  outgoing: boolean;
  status: "sending" | "sent" | "failed" | "received";
  unread: boolean;
  ackPending: 0 | 1;
  clientMessageId: string | null;
};

export type IncomingChatEnvelope = {
  id: string;
  conversationId: string;
  sender: LocalChatSender;
  body: string;
  createdAt: string;
  signature: string;
};

interface ChatDatabase extends DBSchema {
  messages: {
    key: string;
    value: LocalChatMessage;
    indexes: {
      "by-conversation": string;
      "by-ack-pending": number;
    };
  };
}

const databases = new Map<string, Promise<IDBPDatabase<ChatDatabase>>>();

function databaseFor(userId: string) {
  let database = databases.get(userId);
  if (!database) {
    database = openDB<ChatDatabase>(`shardup-chat-${userId}`, 1, {
      upgrade(db) {
        const messages = db.createObjectStore("messages", { keyPath: "id" });
        messages.createIndex("by-conversation", "conversationId");
        messages.createIndex("by-ack-pending", "ackPending");
      },
    });
    databases.set(userId, database);
  }
  return database;
}

export async function storeIncomingMessage(userId: string, envelope: IncomingChatEnvelope) {
  const db = await databaseFor(userId);
  const transaction = db.transaction("messages", "readwrite");
  const existing = await transaction.store.get(envelope.id);

  if (!existing) {
    await transaction.store.put({
      ...envelope,
      outgoing: false,
      status: "received",
      unread: true,
      ackPending: 1,
      clientMessageId: null,
    });
  } else if (!existing.outgoing && !existing.ackPending) {
    await transaction.store.put({ ...existing, ackPending: 1 });
  }

  await transaction.done;
}

export async function listLocalChatMessages(userId: string) {
  const db = await databaseFor(userId);
  const messages = await db.getAll("messages");
  return messages.sort(
    (first, second) =>
      first.createdAt.localeCompare(second.createdAt) || first.id.localeCompare(second.id),
  );
}

export async function createOptimisticChatMessage(
  userId: string,
  input: {
    conversationId: string;
    clientMessageId: string;
    sender: LocalChatSender;
    body: string;
    createdAt: string;
  },
) {
  const db = await databaseFor(userId);
  const message: LocalChatMessage = {
    id: `local:${input.clientMessageId}`,
    conversationId: input.conversationId,
    sender: input.sender,
    body: input.body,
    createdAt: input.createdAt,
    signature: null,
    outgoing: true,
    status: "sending",
    unread: false,
    ackPending: 0,
    clientMessageId: input.clientMessageId,
  };
  await db.put("messages", message);
  return message;
}

export async function reconcileOptimisticChatMessage(
  userId: string,
  clientMessageId: string,
  messageId: string,
  createdAt: string,
) {
  const db = await databaseFor(userId);
  const transaction = db.transaction("messages", "readwrite");
  const temporaryId = `local:${clientMessageId}`;
  const existing = await transaction.store.get(temporaryId);

  if (existing) {
    await transaction.store.delete(temporaryId);
    await transaction.store.put({
      ...existing,
      id: messageId,
      createdAt,
      status: "sent",
    });
  }

  await transaction.done;
}

export async function failOptimisticChatMessage(userId: string, clientMessageId: string) {
  const db = await databaseFor(userId);
  const id = `local:${clientMessageId}`;
  const existing = await db.get("messages", id);
  if (existing) await db.put("messages", { ...existing, status: "failed" });
}

export async function pendingChatAcknowledgements(userId: string) {
  const db = await databaseFor(userId);
  const messages = await db.getAllFromIndex("messages", "by-ack-pending", 1);
  return messages.filter((message) => !message.outgoing).map((message) => message.id);
}

export async function markChatAcknowledged(userId: string, messageIds: string[]) {
  const db = await databaseFor(userId);
  const transaction = db.transaction("messages", "readwrite");

  for (const messageId of messageIds) {
    const message = await transaction.store.get(messageId);
    if (message) await transaction.store.put({ ...message, ackPending: 0 });
  }

  await transaction.done;
}

export async function markLocalConversationRead(userId: string, conversationId: string) {
  const db = await databaseFor(userId);
  const transaction = db.transaction("messages", "readwrite");
  let cursor = await transaction.store.index("by-conversation").openCursor(conversationId);

  while (cursor) {
    if (cursor.value.unread) await cursor.update({ ...cursor.value, unread: false });
    cursor = await cursor.continue();
  }

  await transaction.done;
}
