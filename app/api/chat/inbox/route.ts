import { NextResponse } from "next/server";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import { listPendingChatMessages } from "../../../../lib/chat-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const cursor = new URL(request.url).searchParams.get("cursor")?.trim() || undefined;
    return NextResponse.json(await listPendingChatMessages(user.id, cursor));
  } catch (error) {
    return chatErrorResponse(error);
  }
}
