import { UserStatus } from "@/prisma-client";
import { requireActiveUser } from "../../lib/guards";
import { listChatConversations } from "../../lib/chat-service";
import { memberDisplayName } from "../../lib/members";
import { prisma } from "../../lib/prisma";
import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: Readonly<{ searchParams?: { conversation?: string; recipient?: string } }>) {
  const user = await requireActiveUser();
  const [conversations, members] = await Promise.all([
    listChatConversations(user.id),
    prisma.user.findMany({
      where: { status: UserStatus.ACTIVE, id: { not: user.id } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        profile: { select: { displayName: true, photoUrl: true } },
      },
    }),
  ]);

  return (
    <MessagesClient
      currentUser={{
        id: user.id,
        name: user.name || user.email || "You",
        image: user.image ?? null,
      }}
      initialConversationId={searchParams?.conversation ?? null}
      initialRecipientId={searchParams?.recipient ?? null}
      members={members.map((member) => ({
        id: member.id,
        name: memberDisplayName(member),
        image: member.profile?.photoUrl ?? member.image,
      }))}
      conversations={conversations.map((conversation) => ({
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        lastActivityAt: conversation.lastActivityAt.toISOString(),
        members: conversation.members.map((membership) => ({
          id: membership.user.id,
          name: memberDisplayName(membership.user),
          image: membership.user.profile?.photoUrl ?? membership.user.image,
          role: membership.role,
        })),
      }))}
    />
  );
}
