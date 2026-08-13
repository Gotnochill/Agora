"use client";

import { useCallback, useEffect, useState } from "react";
import { listLocalChatMessages } from "../lib/chat-client-db";

const REFRESH_INTERVAL_MS = 15_000;

async function pendingMessageIds() {
  const messageIds = new Set<string>();
  let cursor: string | null = null;

  do {
    const url = cursor ? `/api/chat/inbox?cursor=${encodeURIComponent(cursor)}` : "/api/chat/inbox";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return messageIds;

    const page = (await response.json()) as {
      messages?: Array<{ id?: unknown }>;
      nextCursor?: string | null;
    };

    for (const message of page.messages ?? []) {
      if (typeof message.id === "string") messageIds.add(message.id);
    }
    cursor = page.nextCursor ?? null;
  } while (cursor);

  return messageIds;
}

export default function MessageIndicator({ userId }: Readonly<{ userId: string }>) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (typeof indexedDB === "undefined") return;

    try {
      const [localMessages, pendingIds] = await Promise.all([
        listLocalChatMessages(userId),
        pendingMessageIds(),
      ]);
      const unreadIds = new Set(
        localMessages.filter((message) => message.unread).map((message) => message.id),
      );
      for (const messageId of Array.from(pendingIds)) unreadIds.add(messageId);
      setUnreadCount(unreadIds.size);
    } catch {
      // Realtime and the messages inbox remain usable if a badge refresh fails.
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(`shardup-chat-${userId}`);
    if (channel) channel.onmessage = () => void refresh();
    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);

    return () => {
      channel?.close();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [refresh, userId]);

  const label = unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Messages";

  return (
    <div className="message-indicator-wrap">
      <a
        className={`message-indicator${unreadCount > 0 ? " is-unread" : ""}`}
        href="/messages"
        aria-label={label}
        title={label}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
        {unreadCount > 0 ? (
          <span className="notification-bell-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </a>
    </div>
  );
}
