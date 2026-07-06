import { ProblemDifficulty } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { groupProblemsByWeek, rankPracticeUsers } from "../../../lib/practice";

describe("groupProblemsByWeek", () => {
  const easy = (slug: string) => ({ slug, difficulty: ProblemDifficulty.EASY });
  const medium = (slug: string) => ({ slug, difficulty: ProblemDifficulty.MEDIUM });
  const hard = (slug: string) => ({ slug, difficulty: ProblemDifficulty.HARD });

  it("returns no weeks for an empty list", () => {
    expect(groupProblemsByWeek([])).toEqual([]);
  });

  it("packs problems into weeks up to the budget while preserving order", () => {
    // Budget 60m: EASY=15, MEDIUM=30, HARD=45.
    const weeks = groupProblemsByWeek(
      [easy("a"), easy("b"), medium("c"), easy("d"), hard("e")],
      60,
    );

    expect(weeks).toEqual([
      { week: 1, problems: [easy("a"), easy("b"), medium("c")] },
      { week: 2, problems: [easy("d"), hard("e")] },
    ]);
  });

  it("puts a single over-budget problem in its own week", () => {
    const weeks = groupProblemsByWeek([hard("only")], 30);

    expect(weeks).toEqual([{ week: 1, problems: [hard("only")] }]);
  });
});

describe("practice helpers", () => {
  it("ranks users by weighted unique accepted problem score, then name", () => {
    const ranking = rankPracticeUsers(
      [
        { userId: "a", problemId: "easy", difficulty: "EASY" },
        { userId: "a", problemId: "easy", difficulty: "EASY" },
        { userId: "a", problemId: "medium", difficulty: "MEDIUM" },
        { userId: "b", problemId: "hard", difficulty: "HARD" },
        { userId: "c", problemId: "easy", difficulty: "EASY" },
        { userId: "c", problemId: "medium", difficulty: "MEDIUM" },
      ],
      [
        { id: "a", name: "Ava", email: "ava@example.com" },
        { id: "b", name: "Zed", email: "zed@example.com" },
        { id: "c", name: "Bea", email: "bea@example.com" },
      ],
    );

    expect(ranking).toEqual([
      { userId: "b", name: "Zed", solvedCount: 1, score: 7 },
      { userId: "a", name: "Ava", solvedCount: 2, score: 4 },
      { userId: "c", name: "Bea", solvedCount: 2, score: 4 },
    ]);
  });
});
