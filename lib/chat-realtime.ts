import { SignJWT } from "jose";
import type { ChatEnvelope } from "./chat-service";

const CHAT_TOKEN_ISSUER = "shardup-web";
const CHAT_TOKEN_AUDIENCE = "shardup-chat-gateway";

function tokenSecret() {
  const value = process.env.CHAT_REALTIME_TOKEN_SECRET ?? process.env.AUTH_SECRET;

  if (!value) {
    throw new Error("CHAT_REALTIME_TOKEN_SECRET or AUTH_SECRET is required");
  }

  return new TextEncoder().encode(value);
}

export async function createChatSocketToken(userId: string) {
  return new SignJWT({ scope: "chat:connect" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(CHAT_TOKEN_ISSUER)
    .setAudience(CHAT_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(tokenSecret());
}

export type ChatPublishResult = {
  attempted: number;
  delivered: number;
  unavailable: boolean;
};

export async function publishChatEnvelope(
  recipientIds: string[],
  envelope: ChatEnvelope,
): Promise<ChatPublishResult> {
  const baseUrl = process.env.CHAT_REALTIME_INTERNAL_URL;
  const secret = process.env.CHAT_REALTIME_PUBLISH_SECRET;

  if (!baseUrl || !secret) {
    return { attempted: recipientIds.length, delivered: 0, unavailable: true };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/publish`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ recipientIds, envelope }),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.error("Chat realtime publish failed", {
        messageId: envelope.id,
        status: response.status,
      });
      return { attempted: recipientIds.length, delivered: 0, unavailable: true };
    }

    const result = (await response.json()) as { delivered?: number };
    return {
      attempted: recipientIds.length,
      delivered: typeof result.delivered === "number" ? result.delivered : 0,
      unavailable: false,
    };
  } catch (error) {
    console.error("Chat realtime gateway unavailable", {
      messageId: envelope.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return { attempted: recipientIds.length, delivered: 0, unavailable: true };
  }
}
