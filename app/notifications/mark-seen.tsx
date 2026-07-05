"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsSeenAction } from "./actions";

// Marks the feed as read once, when it is opened, then refreshes so the header
// unread badge clears. Runs on mount only; the ref guards React strict-mode
// double-invocation in development.
export default function MarkSeen({ hasUnread }: Readonly<{ hasUnread: boolean }>) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !hasUnread) {
      return;
    }

    done.current = true;
    markNotificationsSeenAction()
      .then(() => router.refresh())
      .catch(() => undefined);
  }, [hasUnread, router]);

  return null;
}
