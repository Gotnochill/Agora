import { ChatRateLimitScope, type Prisma } from "@/prisma-client";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

const CHAT_RATE_LIMITS: Record<ChatRateLimitScope, RateLimitConfig> = {
  [ChatRateLimitScope.MESSAGE_SEND]: { limit: 20, windowMs: 60_000 },
  [ChatRateLimitScope.CONVERSATION_CREATE]: { limit: 5, windowMs: 60 * 60_000 },
};

export type ChatRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export async function consumeChatRateLimit(
  transaction: Prisma.TransactionClient,
  userId: string,
  scope: ChatRateLimitScope,
  now: Date = new Date(),
): Promise<ChatRateLimitResult> {
  const config = CHAT_RATE_LIMITS[scope];
  const existing = await transaction.chatRateLimit.findUnique({
    where: { userId_scope: { userId, scope } },
  });

  if (!existing || existing.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + config.windowMs);
    await transaction.chatRateLimit.upsert({
      where: { userId_scope: { userId, scope } },
      create: { userId, scope, windowStart: now, count: 1, expiresAt },
      update: { windowStart: now, count: 1, expiresAt },
    });
    return { allowed: true, remaining: config.limit - 1 };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000),
      ),
    };
  }

  await transaction.chatRateLimit.update({
    where: { id: existing.id },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: config.limit - existing.count - 1 };
}
