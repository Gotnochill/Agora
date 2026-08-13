import { ChatConversationType, ChatMemberRole, UserStatus } from "@/prisma-client";
import { describe, expect, it } from "vitest";
import {
  allChatParticipantsActive,
  canAccessChat,
  canManageChat,
  chatAckSchema,
  chatRecipientIds,
  createGroupConversationSchema,
  directConversationKey,
  sendChatMessageSchema,
} from "../../../lib/chat";

const group = {
  type: ChatConversationType.GROUP,
  members: [
    { userId: "owner", role: ChatMemberRole.OWNER, leftAt: null },
    { userId: "member", role: ChatMemberRole.MEMBER, leftAt: null },
    { userId: "former", role: ChatMemberRole.MEMBER, leftAt: new Date() },
  ],
};

describe("chat schemas", () => {
  it("trims valid messages and rejects empty or oversized bodies", () => {
    expect(
      sendChatMessageSchema.parse({
        conversationId: "conversation",
        clientMessageId: "client-message",
        body: "  hello  ",
      }).body,
    ).toBe("hello");
    expect(
      sendChatMessageSchema.safeParse({
        conversationId: "conversation",
        clientMessageId: "client-message",
        body: "   ",
      }).success,
    ).toBe(false);
    expect(
      sendChatMessageSchema.safeParse({
        conversationId: "conversation",
        clientMessageId: "client-message",
        body: "x".repeat(4001),
      }).success,
    ).toBe(false);
  });

  it("requires unique group members and caps the group at twenty people", () => {
    expect(
      createGroupConversationSchema.safeParse({ title: "Study group", memberIds: ["one"] }).success,
    ).toBe(true);
    expect(
      createGroupConversationSchema.safeParse({
        title: "Study group",
        memberIds: ["one", "one"],
      }).success,
    ).toBe(false);
    expect(
      createGroupConversationSchema.safeParse({
        title: "Study group",
        memberIds: Array.from({ length: 20 }, (_, index) => `member-${index}`),
      }).success,
    ).toBe(false);
  });

  it("deduplicates acknowledgement IDs", () => {
    expect(chatAckSchema.parse({ messageIds: ["one", "one", "two"] }).messageIds).toEqual([
      "one",
      "two",
    ]);
  });
});

describe("chat identity and permissions", () => {
  it("builds the same direct key in either user order", () => {
    expect(directConversationKey("alice", "bob")).toBe(directConversationKey("bob", "alice"));
    expect(() => directConversationKey("alice", "alice")).toThrow();
  });

  it("allows active members to access and only the group owner to manage", () => {
    expect(canAccessChat(group, "member")).toBe(true);
    expect(canAccessChat(group, "former")).toBe(false);
    expect(canManageChat(group, "owner")).toBe(true);
    expect(canManageChat(group, "member")).toBe(false);
  });

  it("fans out to current members other than the sender", () => {
    expect(chatRecipientIds(group, "owner")).toEqual(["member"]);
  });

  it("requires every requested participant to exist and be active", () => {
    expect(
      allChatParticipantsActive([{ status: UserStatus.ACTIVE }, { status: UserStatus.ACTIVE }], 2),
    ).toBe(true);
    expect(allChatParticipantsActive([{ status: UserStatus.ACTIVE }], 2)).toBe(false);
    expect(allChatParticipantsActive([{ status: UserStatus.SUSPENDED }], 1)).toBe(false);
  });
});
