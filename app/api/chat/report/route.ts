import { NextResponse } from "next/server";
import { chatReportSchema } from "../../../../lib/chat";
import { activeChatUser } from "../../../../lib/chat-auth";
import { chatErrorResponse, unauthorizedChatResponse } from "../../../../lib/chat-http";
import { reportChatMessage } from "../../../../lib/chat-service";

export async function POST(request: Request) {
  const user = await activeChatUser();
  if (!user) return unauthorizedChatResponse();

  try {
    const parsed = chatReportSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "INVALID_REPORT" }, { status: 400 });
    const report = await reportChatMessage({ ...parsed.data, reporterId: user.id });
    return NextResponse.json({ reportId: report.id }, { status: 201 });
  } catch (error) {
    return chatErrorResponse(error);
  }
}
