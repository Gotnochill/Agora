import { ProblemDifficulty, SubmissionVerdict } from "@/prisma-client";
import { revalidatePath } from "next/cache";
import { memberDisplayName } from "./members";
import { badgeEarnedMessage, createNotification } from "./notifications";
import { prisma } from "./prisma";

export const TOP_PRACTICE_BADGE_NAME = "Practice Champion";
export const PRACTICE_DIFFICULTY_SCORES: Record<ProblemDifficulty, number> = {
  [ProblemDifficulty.EASY]: 1,
  [ProblemDifficulty.MEDIUM]: 3,
  [ProblemDifficulty.HARD]: 7,
};

// Grind75-style weekly time budget (hours=6 in the reference distribution).
export const PRACTICE_WEEK_MINUTES = 6 * 60;
export const PRACTICE_DIFFICULTY_MINUTES: Record<ProblemDifficulty, number> = {
  [ProblemDifficulty.EASY]: 15,
  [ProblemDifficulty.MEDIUM]: 30,
  [ProblemDifficulty.HARD]: 45,
};

export function groupProblemsByWeek<T extends { difficulty: ProblemDifficulty }>(
  problems: T[],
  weeklyBudgetMinutes = PRACTICE_WEEK_MINUTES,
): { week: number; problems: T[] }[] {
  const weeks: { week: number; problems: T[] }[] = [];
  let current: T[] = [];
  let currentMinutes = 0;

  for (const problem of problems) {
    const estimate = PRACTICE_DIFFICULTY_MINUTES[problem.difficulty];

    if (current.length > 0 && currentMinutes + estimate > weeklyBudgetMinutes) {
      weeks.push({ week: weeks.length + 1, problems: current });
      current = [];
      currentMinutes = 0;
    }

    current.push(problem);
    currentMinutes += estimate;
  }

  if (current.length > 0) {
    weeks.push({ week: weeks.length + 1, problems: current });
  }

  return weeks;
}

type PracticeSubmission = { problemId: string; userId: string; difficulty: ProblemDifficulty };
type PracticeUser = {
  id: string;
  name: string | null;
  email: string;
  profile?: { displayName: string | null } | null;
};

export function rankPracticeUsers(submissions: PracticeSubmission[], users: PracticeUser[]) {
  const solvedPairs = new Set<string>();
  const solvedStats: Record<string, { solvedCount: number; score: number }> = {};

  submissions.forEach((submission) => {
    const key = `${submission.userId}:${submission.problemId}`;

    if (solvedPairs.has(key)) {
      return;
    }

    solvedPairs.add(key);
    const stats = solvedStats[submission.userId] ?? { solvedCount: 0, score: 0 };

    stats.solvedCount += 1;
    stats.score += PRACTICE_DIFFICULTY_SCORES[submission.difficulty];
    solvedStats[submission.userId] = stats;
  });

  const userById = new Map(users.map((user) => [user.id, user]));

  return Object.entries(solvedStats)
    .map(([userId, stats]) => {
      const user = userById.get(userId);

      return {
        userId,
        solvedCount: stats.solvedCount,
        score: stats.score,
        name: user ? memberDisplayName(user) : "ShardUp member",
      };
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

export async function practiceRanking() {
  const problems = await prisma.problem.findMany({
    where: { published: true },
    select: { id: true, difficulty: true },
  });
  const difficultyByProblemId = new Map(
    problems.map((problem) => [problem.id, problem.difficulty]),
  );
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

  return rankPracticeUsers(
    submissions.map((submission) => ({
      ...submission,
      difficulty: difficultyByProblemId.get(submission.problemId)!,
    })),
    users,
  );
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
  const leaderAlreadyHeldBadge = badge.members.some((member) => member.userId === leader.userId);

  await prisma.$transaction([
    prisma.memberBadge.deleteMany({ where: { badgeId: badge.id, userId: { not: leader.userId } } }),
    prisma.memberBadge.upsert({
      where: { userId_badgeId: { userId: leader.userId, badgeId: badge.id } },
      update: {},
      create: { badgeId: badge.id, userId: leader.userId },
    }),
  ]);

  if (!leaderAlreadyHeldBadge) {
    await createNotification({
      type: "BADGE_EARNED",
      actorId: leader.userId,
      message: badgeEarnedMessage(leader.name, TOP_PRACTICE_BADGE_NAME),
      link: `/members/${leader.userId}`,
    });
  }

  revalidatePath("/members");
  revalidatePath(`/badges/${badge.id}`);
  changedUserIds.forEach((userId) => revalidatePath(`/members/${userId}`));
}
