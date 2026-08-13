import { NextResponse } from "next/server";
import { activeChatUser } from "../../../../lib/chat-auth";
import { unauthorizedChatResponse } from "../../../../lib/chat-http";
import { createChatSocketToken } from "../../../../lib/chat-realtime";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  const token = await createChatSocketToken(user.id);
  return NextResponse.json({ token, socketUrl: process.env.NEXT_PUBLIC_CHAT_WS_URL ?? null });
}
