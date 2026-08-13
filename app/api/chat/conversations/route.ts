import { ChatConversationType } from "@/prisma-client";
import { NextResponse } from "next/server";
import {
  createDirectConversationSchema,
  createGroupConversationSchema,
} from "../../../../lib/chat";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import {
  createDirectConversation,
  createGroupConversation,
  listChatConversations,
} from "../../../../lib/chat-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();
  return NextResponse.json({ conversations: await listChatConversations(user.id) });
}

export async function POST(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const body = (await request.json()) as { type?: unknown };
    if (body.type === ChatConversationType.DIRECT) {
      const parsed = createDirectConversationSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "INVALID_DIRECT" }, { status: 400 });
      const conversation = await createDirectConversation(user.id, parsed.data.recipientId);
      return NextResponse.json({ conversationId: conversation.id });
    }

    if (body.type === ChatConversationType.GROUP) {
      const parsed = createGroupConversationSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "INVALID_GROUP" }, { status: 400 });
      const conversation = await createGroupConversation(
        user.id,
        parsed.data.title,
        parsed.data.memberIds,
      );
      return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
    }

    return NextResponse.json({ error: "INVALID_CONVERSATION_TYPE" }, { status: 400 });
  } catch (error) {
    return chatErrorResponse(error);
  }
}
