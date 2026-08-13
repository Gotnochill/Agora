import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { cleanupExpiredChatData } from "../../../../lib/chat-service";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const provided = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!expected) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await cleanupExpiredChatData();
  console.info("Chat cleanup completed", result);
  return NextResponse.json({ ok: true, ...result });
}
