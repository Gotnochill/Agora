import { NextResponse } from "next/server";
import { ChatServiceError } from "./chat-service";

export function chatErrorResponse(error: unknown) {
  if (error instanceof ChatServiceError) {
    const status =
      error.code === "RATE_LIMITED"
        ? 429
        : error.code === "FORBIDDEN"
          ? 403
          : error.code === "NOT_FOUND"
            ? 404
            : 400;
    const response = NextResponse.json({ error: error.code, message: error.message }, { status });

    if (error.retryAfterSeconds) {
      response.headers.set("Retry-After", String(error.retryAfterSeconds));
    }

    return response;
  }

  console.error("Chat request failed", error);
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}

export function unauthorizedChatResponse() {
  return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}
