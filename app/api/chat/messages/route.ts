import { NextResponse } from "next/server";
import { sendChatMessageSchema } from "../../../../lib/chat";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import { publishChatEnvelope } from "../../../../lib/chat-realtime";
import { enqueueChatMessage } from "../../../../lib/chat-service";

export async function POST(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const parsed = sendChatMessageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_MESSAGE" }, { status: 400 });
    }

    const result = await enqueueChatMessage({ ...parsed.data, senderId: user.id });
    const realtime =
      result.envelope && result.recipientIds.length > 0
        ? await publishChatEnvelope(result.recipientIds, result.envelope)
        : { attempted: 0, delivered: 0, unavailable: false };

    return NextResponse.json(
      {
        messageId: result.messageId,
        conversationId: result.conversationId,
        createdAt: result.createdAt,
        duplicate: result.duplicate,
        realtime,
      },
      { status: result.duplicate ? 200 : 202 },
    );
  } catch (error) {
    return chatErrorResponse(error);
  }
}
