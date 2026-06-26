import { SubmissionVerdict } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { memberDisplayName } from "./members";
import { prisma } from "./prisma";

export const TOP_PRACTICE_BADGE_NAME = "Practice Champion";

type PracticeSubmission = { problemId: string; userId: string };
type PracticeUser = {
  id: string;
  name: string | null;
  email: string;
  profile?: { displayName: string | null } | null;
};

export function rankPracticeUsers(submissions: PracticeSubmission[], users: PracticeUser[]) {
  const solvedPairs = new Set<string>();
  const solvedCounts: Record<string, number> = {};

  submissions.forEach((submission) => {
    const key = `${submission.userId}:${submission.problemId}`;

    if (solvedPairs.has(key)) {
      return;
    }

    solvedPairs.add(key);
    solvedCounts[submission.userId] = (solvedCounts[submission.userId] ?? 0) + 1;
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return Object.entries(solvedCounts)
    .map(([userId, solvedCount]) => {
      const user = userById.get(userId);

      return {
        userId,
        solvedCount,
        name: user ? memberDisplayName(user) : "ShardUp member",
      };
    })
    .sort(
      (left, right) => right.solvedCount - left.solvedCount || left.name.localeCompare(right.name),
    );
}

export async function practiceRanking() {
  const problems = await prisma.problem.findMany({
    where: { published: true },
    select: { id: true },
  });
  const submissions = await prisma.submission.findMany({
    where: {
      verdict: SubmissionVerdict.ACCEPTED,
      problemId: { in: problems.map((problem) => problem.id) },
    },
    distinct: ["problemId", "userId"],
    select: { problemId: true, userId: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(new Set(submissions.map((submission) => submission.userId))) } },
    select: {
      id: true,
      name: true,
      email: true,
      profile: { select: { displayName: true } },
    },
  });

  return rankPracticeUsers(submissions, users);
}

export async function syncTopPracticeBadge() {
  const badge = await prisma.badge.findUnique({
    where: { name: TOP_PRACTICE_BADGE_NAME },
    include: { members: { select: { userId: true } } },
  });
  const leader = (await practiceRanking())[0];

  if (!badge || !leader) {
    return;
  }

  if (badge.members.length === 1 && badge.members[0]?.userId === leader.userId) {
    return;
  }

  const changedUserIds = new Set([...badge.members.map((member) => member.userId), leader.userId]);

  await prisma.$transaction([
    prisma.memberBadge.deleteMany({ where: { badgeId: badge.id, userId: { not: leader.userId } } }),
    prisma.memberBadge.upsert({
      where: { userId_badgeId: { userId: leader.userId, badgeId: badge.id } },
      update: {},
      create: { badgeId: badge.id, userId: leader.userId },
    }),
  ]);

  revalidatePath("/members");
  revalidatePath(`/badges/${badge.id}`);
  changedUserIds.forEach((userId) => revalidatePath(`/members/${userId}`));
}
