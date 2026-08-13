import { NextResponse } from "next/server";
import { markChatReadSchema } from "../../../../lib/chat";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import { markChatRead } from "../../../../lib/chat-service";

export async function POST(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const parsed = markChatReadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "INVALID_READ" }, { status: 400 });
    await markChatRead(user.id, parsed.data.conversationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return chatErrorResponse(error);
  }
}
