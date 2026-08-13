import { createHmac, timingSafeEqual } from "node:crypto";

export type SignableChatEnvelope = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

function signingSecret() {
  const secret = process.env.CHAT_MESSAGE_SIGNING_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("CHAT_MESSAGE_SIGNING_SECRET or AUTH_SECRET is required");
  }

  return secret;
}

function signableValue(envelope: SignableChatEnvelope) {
  return JSON.stringify([
    "shardup-chat-v1",
    envelope.id,
    envelope.conversationId,
    envelope.senderId,
    envelope.body,
    envelope.createdAt,
  ]);
}

export function signChatEnvelope(envelope: SignableChatEnvelope) {
  return createHmac("sha256", signingSecret()).update(signableValue(envelope)).digest("base64url");
}

export function verifyChatEnvelope(envelope: SignableChatEnvelope, signature: string) {
  const expected = Buffer.from(signChatEnvelope(envelope));
  const provided = Buffer.from(signature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
