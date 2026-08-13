import { NextResponse } from "next/server";
import { chatAckSchema } from "../../../../lib/chat";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import { acknowledgeChatMessages } from "../../../../lib/chat-service";

export async function POST(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const parsed = chatAckSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "INVALID_ACK" }, { status: 400 });

    return NextResponse.json(await acknowledgeChatMessages(user.id, parsed.data.messageIds));
  } catch (error) {
    return chatErrorResponse(error);
  }
}
