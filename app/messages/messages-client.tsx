"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOptimisticChatMessage,
  failOptimisticChatMessage,
  listLocalChatMessages,
  markChatAcknowledged,
  markLocalConversationRead,
  pendingChatAcknowledgements,
  reconcileOptimisticChatMessage,
  storeIncomingMessage,
  type IncomingChatEnvelope,
  type LocalChatMessage,
  type LocalChatSender,
} from "../../lib/chat-client-db";

type MemberOption = LocalChatSender;
type ClientConversationType = "DIRECT" | "GROUP";
type ClientMemberRole = "OWNER" | "MEMBER";

type ConversationSummary = {
  id: string;
  type: ClientConversationType;
  title: string | null;
  lastActivityAt: string;
  members: Array<MemberOption & { role: ClientMemberRole }>;
};

type Props = {
  currentUser: LocalChatSender;
  conversations: ConversationSummary[];
  members: MemberOption[];
  initialConversationId: string | null;
  initialRecipientId: string | null;
};

function conversationName(conversation: ConversationSummary, currentUserId: string) {
  if (conversation.type === "GROUP") return conversation.title || "Group";
  return (
    conversation.members.find((member) => member.id !== currentUserId)?.name || "Direct message"
  );
}

function isIncomingEnvelope(value: unknown): value is IncomingChatEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Partial<IncomingChatEnvelope>;
  return (
    typeof envelope.id === "string" &&
    typeof envelope.conversationId === "string" &&
    typeof envelope.body === "string" &&
    typeof envelope.createdAt === "string" &&
    typeof envelope.signature === "string" &&
    Boolean(envelope.sender && typeof envelope.sender.id === "string")
  );
}

export default function MessagesClient({
  currentUser,
  conversations,
  members,
  initialConversationId,
  initialRecipientId,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId &&
      conversations.some((conversation) => conversation.id === initialConversationId)
      ? initialConversationId
      : (conversations[0]?.id ?? null),
  );
  const [localMessages, setLocalMessages] = useState<LocalChatMessage[]>([]);
  const [connection, setConnection] = useState<"connecting" | "live" | "polling">("connecting");
  const [sendError, setSendError] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<"closed" | "direct" | "group">("closed");
  const [creating, setCreating] = useState(false);
  const startedRecipient = useRef(false);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const selectedIdRef = useRef(selectedId);

  const refreshLocal = useCallback(async () => {
    setLocalMessages(await listLocalChatMessages(currentUser.id));
  }, [currentUser.id]);

  const notifyLocalChange = useCallback(() => {
    broadcastRef.current?.postMessage("changed");
    void refreshLocal();
  }, [refreshLocal]);

  const flushAcknowledgements = useCallback(async () => {
    const messageIds = await pendingChatAcknowledgements(currentUser.id);
    if (messageIds.length === 0) return;

    for (let offset = 0; offset < messageIds.length; offset += 100) {
      const batch = messageIds.slice(offset, offset + 100);
      const response = await fetch("/api/chat/ack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageIds: batch }),
      });
      if (response.ok) await markChatAcknowledged(currentUser.id, batch);
    }
  }, [currentUser.id]);

  const storeAndAcknowledge = useCallback(
    async (envelopes: IncomingChatEnvelope[]) => {
      for (const envelope of envelopes) await storeIncomingMessage(currentUser.id, envelope);
      const openConversationId = selectedIdRef.current;
      if (
        openConversationId &&
        envelopes.some((envelope) => envelope.conversationId === openConversationId)
      ) {
        await markLocalConversationRead(currentUser.id, openConversationId);
      }
      await flushAcknowledgements();
      notifyLocalChange();
    },
    [currentUser.id, flushAcknowledgements, notifyLocalChange],
  );

  const recoverInbox = useCallback(async () => {
    let cursor: string | null = null;
    do {
      const url = cursor
        ? `/api/chat/inbox?cursor=${encodeURIComponent(cursor)}`
        : "/api/chat/inbox";
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return;
      const page = (await response.json()) as {
        messages?: unknown[];
        nextCursor?: string | null;
      };
      const envelopes = (page.messages ?? []).filter(isIncomingEnvelope);
      if (envelopes.length > 0) await storeAndAcknowledge(envelopes);
      cursor = page.nextCursor ?? null;
    } while (cursor);
    await flushAcknowledgements();
  }, [flushAcknowledgements, storeAndAcknowledge]);

  useEffect(() => {
    void refreshLocal();
    const channel = new BroadcastChannel(`shardup-chat-${currentUser.id}`);
    channel.onmessage = () => void refreshLocal();
    broadcastRef.current = channel;
    return () => channel.close();
  }, [currentUser.id, refreshLocal]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;

    const connect = async () => {
      setConnection("connecting");
      try {
        const response = await fetch("/api/chat/token", { method: "POST" });
        if (!response.ok) throw new Error("Token unavailable");
        const credentials = (await response.json()) as { token: string; socketUrl: string | null };
        if (!credentials.socketUrl) {
          setConnection("polling");
          await recoverInbox();
          return;
        }

        socket = new WebSocket(credentials.socketUrl, ["shardup-chat", credentials.token]);
        socket.onopen = () => {
          retryDelay = 1000;
          setConnection("live");
          void recoverInbox();
        };
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as { type?: string; envelope?: unknown };
            if (payload.type === "message" && isIncomingEnvelope(payload.envelope)) {
              void storeAndAcknowledge([payload.envelope]);
            }
          } catch {
            // Ignore malformed transport frames; the inbox remains authoritative.
          }
        };
        socket.onclose = () => {
          if (stopped) return;
          setConnection("polling");
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            void connect();
          }, retryDelay);
        };
      } catch {
        setConnection("polling");
        await recoverInbox();
      }
    };

    void connect();
    const recovery = setInterval(() => void recoverInbox(), 15_000);
    const onOnline = () => {
      void recoverInbox();
      if (!socket || socket.readyState === WebSocket.CLOSED) void connect();
    };
    window.addEventListener("online", onOnline);

    return () => {
      stopped = true;
      clearInterval(recovery);
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("online", onOnline);
      socket?.close();
    };
  }, [currentUser.id, recoverInbox, storeAndAcknowledge]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) return;
    void markLocalConversationRead(currentUser.id, selectedId).then(notifyLocalChange);
    void fetch("/api/chat/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId }),
    });
  }, [currentUser.id, notifyLocalChange, selectedId]);

  useEffect(() => {
    if (!initialRecipientId || startedRecipient.current) return;
    startedRecipient.current = true;
    void (async () => {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "DIRECT",
          recipientId: initialRecipientId,
        }),
      });
      if (!response.ok) return;
      const result = (await response.json()) as { conversationId: string };
      setSelectedId(result.conversationId);
      router.replace(`/messages?conversation=${encodeURIComponent(result.conversationId)}`);
      router.refresh();
    })();
  }, [initialRecipientId, router]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const selectedMessages = localMessages.filter((message) => message.conversationId === selectedId);
  const latestByConversation = useMemo(() => {
    const latest = new Map<string, LocalChatMessage>();
    for (const message of localMessages) latest.set(message.conversationId, message);
    return latest;
  }, [localMessages]);

  const selectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    router.replace(`/messages?conversation=${encodeURIComponent(conversationId)}`, {
      scroll: false,
    });
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setSendError(null);
    form.reset();
    const clientMessageId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await createOptimisticChatMessage(currentUser.id, {
      conversationId: selectedId,
      clientMessageId,
      sender: currentUser,
      body,
      createdAt,
    });
    notifyLocalChange();

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, clientMessageId, body }),
      });
      if (!response.ok) throw new Error("Message was not accepted");
      const result = (await response.json()) as { messageId: string; createdAt: string };
      await reconcileOptimisticChatMessage(
        currentUser.id,
        clientMessageId,
        result.messageId,
        result.createdAt,
      );
      notifyLocalChange();
      router.refresh();
    } catch {
      await failOptimisticChatMessage(currentUser.id, clientMessageId);
      setSendError("Message was not sent. Check your connection and try again.");
      notifyLocalChange();
    }
  };

  const createConversation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload =
      composeMode === "direct"
        ? { type: "DIRECT", recipientId: String(formData.get("recipientId")) }
        : {
            type: "GROUP",
            title: String(formData.get("title")),
            memberIds: formData.getAll("memberIds").map(String),
          };

    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setCreating(false);
    if (!response.ok) {
      setSendError("Conversation could not be created.");
      return;
    }
    const result = (await response.json()) as { conversationId: string };
    setComposeMode("closed");
    setSelectedId(result.conversationId);
    router.push(`/messages?conversation=${encodeURIComponent(result.conversationId)}`);
    router.refresh();
  };

  return (
    <main className="chat-page">
      <section className="chat-workspace" aria-label="Messages">
        <aside className={`chat-sidebar${selected ? " has-selection" : ""}`}>
          <div className="chat-sidebar-header">
            <div>
              <p className="section-label">Community</p>
              <h1>Messages</h1>
            </div>
            <span className={`chat-connection is-${connection}`}>
              {connection === "live" ? "Live" : connection === "polling" ? "Syncing" : "Connecting"}
            </span>
          </div>
          <div className="chat-new-actions">
            <button type="button" onClick={() => setComposeMode("direct")}>
              New message
            </button>
            <button type="button" onClick={() => setComposeMode("group")}>
              New group
            </button>
          </div>
          {composeMode !== "closed" ? (
            <form className="chat-compose-panel" onSubmit={createConversation}>
              <strong>{composeMode === "direct" ? "Choose a member" : "Create a group"}</strong>
              {composeMode === "direct" ? (
                <select name="recipientId" required defaultValue="">
                  <option value="" disabled>
                    Select member
                  </option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input name="title" placeholder="Group name" required maxLength={80} />
                  <div className="chat-member-picker">
                    {members.map((member) => (
                      <label key={member.id}>
                        <input type="checkbox" name="memberIds" value={member.id} />
                        <span>{member.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="chat-compose-actions">
                <button type="button" onClick={() => setComposeMode("closed")}>
                  Cancel
                </button>
                <button className="button" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          ) : null}
          <div className="chat-conversation-list">
            {conversations.length ? (
              conversations.map((conversation) => {
                const latest = latestByConversation.get(conversation.id);
                const unread = localMessages.filter(
                  (message) => message.conversationId === conversation.id && message.unread,
                ).length;
                return (
                  <button
                    className={conversation.id === selectedId ? "is-active" : ""}
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <span className="chat-conversation-copy">
                      <strong>{conversationName(conversation, currentUser.id)}</strong>
                      <small>{latest?.body ?? "No local messages yet"}</small>
                    </span>
                    {unread > 0 ? <span className="chat-unread-badge">{unread}</span> : null}
                  </button>
                );
              })
            ) : (
              <p className="chat-empty-copy">Start a conversation with another member.</p>
            )}
          </div>
        </aside>

        <section className={`chat-thread${selected ? " is-open" : ""}`}>
          {selected ? (
            <>
              <header className="chat-thread-header">
                <button
                  className="chat-back"
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to conversations"
                >
                  Back
                </button>
                <div>
                  <h2>{conversationName(selected, currentUser.id)}</h2>
                  <p>
                    {selected.type === "GROUP"
                      ? `${selected.members.length} members`
                      : "Private conversation"}
                  </p>
                </div>
              </header>
              <div className="chat-message-list" aria-live="polite">
                {selectedMessages.length ? (
                  selectedMessages.map((message) => (
                    <article
                      className={`chat-message${message.outgoing ? " is-own" : ""}`}
                      key={message.id}
                    >
                      <div className="chat-message-meta">
                        <strong>{message.outgoing ? "You" : message.sender.name}</strong>
                        <time dateTime={message.createdAt}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p>{message.body}</p>
                      {message.status === "sending" ? <small>Sending...</small> : null}
                      {message.status === "failed" ? (
                        <small className="chat-message-error">Not sent</small>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="chat-thread-empty">
                    <strong>No messages on this browser</strong>
                    <p>Delivered history stays on the device that received it.</p>
                  </div>
                )}
              </div>
              <form className="chat-send-form" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor="chat-message-body">
                  Message
                </label>
                <textarea
                  id="chat-message-body"
                  name="body"
                  rows={2}
                  maxLength={4000}
                  placeholder="Write a message"
                  required
                />
                <button className="button" type="submit">
                  Send
                </button>
              </form>
              {sendError ? <p className="chat-form-error">{sendError}</p> : null}
            </>
          ) : (
            <div className="chat-thread-empty">
              <strong>Select a conversation</strong>
              <p>Your delivered messages are kept only in this browser.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
