import { NotificationType, UserStatus } from "@/prisma-client";
import { RATING_TIER_BADGES, tierForRating } from "./contest";
import {
  memberDisplayName,
  memberTotalXp,
  overallRankPromotions,
  type RankedMember,
} from "./members";
import { prisma } from "./prisma";

export const NOTIFICATION_FEED_LIMIT = 50;

export function practiceSolvedMessage(name: string, problemTitle: string) {
  return `${name} solved "${problemTitle}" on Practice.`;
}

export function rankUpMessage(name: string, tierLabel: string) {
  return `${name} reached the ${tierLabel} rank.`;
}

export function badgeEarnedMessage(name: string, badgeName: string) {
  return `${name} earned the "${badgeName}" badge.`;
}

export function overallRankUpMessage(name: string, rank: number) {
  return rank === 1
    ? `${name} is now #1 on the overall XP leaderboard.`
    : `${name} climbed to #${rank} on the overall XP leaderboard.`;
}

export function nudgeReceivedMessage(senderName: string, title: string) {
  return `${senderName} nudged you: "${title}"`;
}

export function relativeTimeFromNow(date: Date, now: Date = new Date()) {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 45) {
    return "just now";
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsPerUnit] of units) {
    if (seconds >= secondsPerUnit) {
      return formatter.format(-Math.floor(seconds / secondsPerUnit), unit);
    }
  }

  return "just now";
}

export function contestFinishedMessage(contestTitle: string, winnerName: string | null) {
  return winnerName
    ? `Contest "${contestTitle}" wrapped up — ${winnerName} topped the standings.`
    : `Contest "${contestTitle}" wrapped up.`;
}

export function contestPublishedMessage(contestTitle: string) {
  return `New contest "${contestTitle}" is open — register and compete.`;
}

export function eventPublishedMessage(eventTitle: string) {
  return `New event "${eventTitle}" — RSVP now.`;
}

// True only when the new rating lands in a strictly higher tier than the old one,
// so we notify on promotions but stay quiet on same-tier changes or demotions.
export function shouldNotifyRankUp(ratingBefore: number, ratingAfter: number) {
  const beforeIndex = RATING_TIER_BADGES.findIndex((tier) => tier === tierForRating(ratingBefore));
  const afterIndex = RATING_TIER_BADGES.findIndex((tier) => tier === tierForRating(ratingAfter));

  return afterIndex > beforeIndex;
}

type CreateNotificationInput = {
  type: NotificationType;
  message: string;
  actorId?: string | null;
  recipientId?: string | null;
  link?: string | null;
};

// Best-effort: a broadcast should never break the achievement that triggered it.
export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        message: input.message,
        actorId: input.actorId ?? null,
        recipientId: input.recipientId ?? null,
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}

// Snapshot every active member's summed badge XP so we can compare leaderboard
// positions before and after an XP-changing mutation.
async function rankedMembersSnapshot(): Promise<RankedMember[]> {
  const members = await prisma.user.findMany({
    where: { status: UserStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      email: true,
      profile: { select: { displayName: true } },
      memberBadges: { select: { badge: { select: { xp: true } } } },
    },
  });

  return members.map((member) => ({
    id: member.id,
    name: memberDisplayName(member),
    xp: memberTotalXp(member.memberBadges),
  }));
}

// Run an XP-changing mutation, then broadcast a notification for every member who
// climbed into (or up within) the top overall-XP positions as a result.
export async function withOverallRankNotifications<T>(mutate: () => Promise<T>): Promise<T> {
  const before = await rankedMembersSnapshot();
  const result = await mutate();
  const after = await rankedMembersSnapshot();

  for (const promotion of overallRankPromotions(before, after)) {
    await createNotification({
      type: "OVERALL_RANK_UP",
      actorId: promotion.id,
      message: overallRankUpMessage(promotion.name, promotion.rank),
      link: `/members/${promotion.id}`,
    });
  }

  return result;
}

// Broadcasts (recipientId null) reach everyone except the actor; targeted
// notifications (recipientId set) reach only their recipient.
function visibleToUser(userId: string) {
  return {
    OR: [
      { AND: [{ recipientId: null }, { OR: [{ actorId: null }, { actorId: { not: userId } }] }] },
      { recipientId: userId },
    ],
  };
}

export async function listNotifications(userId: string, limit = NOTIFICATION_FEED_LIMIT) {
  return prisma.notification.findMany({
    where: visibleToUser(userId),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function unreadNotificationCount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsSeenAt: true },
  });
  const seenAt = user?.notificationsSeenAt;

  return prisma.notification.count({
    where: {
      ...visibleToUser(userId),
      ...(seenAt ? { createdAt: { gt: seenAt } } : {}),
    },
  });
}

export async function markNotificationsSeen(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsSeenAt: new Date() },
  });
}
