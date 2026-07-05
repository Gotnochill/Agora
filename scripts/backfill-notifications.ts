/**
 * Backfill the community notification feed from historical achievements.
 *
 * Notifications are only emitted for events that happen after the feature
 * launched, so the feed starts empty even though members have already solved
 * problems, earned badges, and climbed the leaderboards. This script clears the
 * Notification table and regenerates it from existing data:
 *
 *   - one PRACTICE_SOLVED per member's first accepted solve of a problem
 *   - one BADGE_EARNED per badge a member holds
 *   - a summary highlighting the practice-leaderboard champion
 *   - a summary highlighting the top overall members (top 3) by total XP
 *
 * Run (local):  DATABASE_URL=... npx tsx scripts/backfill-notifications.ts
 * Run (prod):   DATABASE_URL="<neon url>" npx tsx scripts/backfill-notifications.ts
 */
import { NotificationType, ProblemDifficulty, SubmissionVerdict, UserStatus } from "@prisma/client";
import {
  memberDisplayName,
  memberTotalXp,
  OVERALL_RANK_TOP_N,
  rankMembersByXp,
} from "../lib/members";
import { badgeEarnedMessage, practiceSolvedMessage } from "../lib/notifications";
import { rankPracticeUsers, TOP_PRACTICE_BADGE_NAME } from "../lib/practice";
import { prisma } from "../lib/prisma";

type NotificationSeed = {
  type: NotificationType;
  actorId: string;
  message: string;
  link: string | null;
  createdAt: Date;
};

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      profile: { select: { displayName: true } },
      memberBadges: {
        select: {
          awardedAt: true,
          badgeId: true,
          badge: { select: { name: true, xp: true } },
        },
      },
    },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  // Earliest accepted submission per (user, problem) on a published problem.
  const acceptedSubmissions = await prisma.submission.findMany({
    where: { verdict: SubmissionVerdict.ACCEPTED, problem: { published: true } },
    orderBy: { createdAt: "asc" },
    select: {
      userId: true,
      problemId: true,
      createdAt: true,
      problem: { select: { slug: true, title: true, difficulty: true } },
    },
  });

  const firstSolves = new Map<
    string,
    {
      userId: string;
      problemId: string;
      createdAt: Date;
      slug: string;
      title: string;
      difficulty: ProblemDifficulty;
    }
  >();

  for (const submission of acceptedSubmissions) {
    const key = `${submission.userId}:${submission.problemId}`;

    if (firstSolves.has(key)) {
      continue;
    }

    firstSolves.set(key, {
      userId: submission.userId,
      problemId: submission.problemId,
      createdAt: submission.createdAt,
      slug: submission.problem.slug,
      title: submission.problem.title,
      difficulty: submission.problem.difficulty,
    });
  }

  const seeds: NotificationSeed[] = [];

  // Historical badge awards.
  for (const user of users) {
    const name = memberDisplayName(user);

    for (const memberBadge of user.memberBadges) {
      seeds.push({
        type: NotificationType.BADGE_EARNED,
        actorId: user.id,
        message: badgeEarnedMessage(name, memberBadge.badge.name),
        link: `/members/${user.id}`,
        createdAt: memberBadge.awardedAt,
      });
    }
  }

  // Historical practice solves.
  for (const solve of Array.from(firstSolves.values())) {
    const user = usersById.get(solve.userId);

    if (!user) {
      continue;
    }

    seeds.push({
      type: NotificationType.PRACTICE_SOLVED,
      actorId: solve.userId,
      message: practiceSolvedMessage(memberDisplayName(user), solve.title),
      link: `/problems/${solve.slug}`,
      createdAt: solve.createdAt,
    });
  }

  // Leaderboard summaries, timestamped last so they surface at the top of the feed.
  const now = new Date();
  const practiceRankUsers = Array.from(
    new Set(Array.from(firstSolves.values()).map((s) => s.userId)),
  )
    .map((id) => usersById.get(id))
    .filter((user): user is (typeof users)[number] => Boolean(user));
  const practiceRanking = rankPracticeUsers(
    Array.from(firstSolves.values()).map((solve) => ({
      userId: solve.userId,
      problemId: solve.problemId,
      difficulty: solve.difficulty,
    })),
    practiceRankUsers,
  );
  const champion = practiceRanking[0];

  if (champion) {
    seeds.push({
      type: NotificationType.BADGE_EARNED,
      actorId: champion.userId,
      message: `${champion.name} has reached the top rank on the practice leaderboard and earned the ${TOP_PRACTICE_BADGE_NAME} badge.`,
      link: "/problems",
      createdAt: new Date(now.getTime() - 60_000),
    });
  }

  const topByXp = rankMembersByXp(
    users
      .filter((user) => user.status === UserStatus.ACTIVE)
      .map((user) => ({
        id: user.id,
        name: memberDisplayName(user),
        xp: memberTotalXp(user.memberBadges),
      })),
  ).slice(0, OVERALL_RANK_TOP_N);

  topByXp.forEach((entry, index) => {
    seeds.push({
      type: NotificationType.OVERALL_RANK_UP,
      actorId: entry.id,
      message: `${entry.name} is ranked #${index + 1} overall with a total XP of ${entry.xp}.`,
      link: `/members/${entry.id}`,
      createdAt: now,
    });
  });

  const deleted = await prisma.notification.deleteMany({});
  const created = seeds.length
    ? await prisma.notification.createMany({ data: seeds })
    : { count: 0 };

  console.log(`Removed ${deleted.count} existing notification(s).`);
  console.log(
    `Created ${created.count} notification(s): ` +
      `${seeds.filter((s) => s.type === NotificationType.PRACTICE_SOLVED).length} solves, ` +
      `${seeds.filter((s) => s.type === NotificationType.BADGE_EARNED).length} badges, ` +
      `${seeds.filter((s) => s.type === NotificationType.OVERALL_RANK_UP).length} rank summaries.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
