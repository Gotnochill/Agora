import { NotificationType } from "@prisma/client";
import { RATING_TIER_BADGES, tierForRating } from "./contest";
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
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}

// The actor never sees their own achievement; everyone else does.
function visibleToUser(userId: string) {
  return { OR: [{ actorId: null }, { actorId: { not: userId } }] };
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
