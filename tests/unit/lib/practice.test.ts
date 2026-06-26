import { describe, expect, it } from "vitest";
import { rankPracticeUsers } from "../../../lib/practice";

describe("practice helpers", () => {
  it("ranks users by unique accepted problems, then name", () => {
    const ranking = rankPracticeUsers(
      [
        { userId: "a", problemId: "one" },
        { userId: "a", problemId: "one" },
        { userId: "b", problemId: "one" },
        { userId: "b", problemId: "two" },
        { userId: "c", problemId: "one" },
        { userId: "c", problemId: "two" },
      ],
      [
        { id: "a", name: "Ava", email: "ava@example.com" },
        { id: "b", name: "Zed", email: "zed@example.com" },
        { id: "c", name: "Bea", email: "bea@example.com" },
      ],
    );

    expect(ranking).toEqual([
      { userId: "c", name: "Bea", solvedCount: 2 },
      { userId: "b", name: "Zed", solvedCount: 2 },
      { userId: "a", name: "Ava", solvedCount: 1 },
    ]);
  });
});
