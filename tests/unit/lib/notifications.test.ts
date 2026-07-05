import { describe, expect, it } from "vitest";
import {
  badgeEarnedMessage,
  contestFinishedMessage,
  overallRankUpMessage,
  practiceSolvedMessage,
  rankUpMessage,
  relativeTimeFromNow,
  shouldNotifyRankUp,
} from "../../../lib/notifications";

describe("notification message builders", () => {
  it("formats each achievement message", () => {
    expect(practiceSolvedMessage("Ada", "Two Sum")).toBe('Ada solved "Two Sum" on Practice.');
    expect(rankUpMessage("Ada", "Polished")).toBe("Ada reached the Polished rank.");
    expect(badgeEarnedMessage("Ada", "Practice Champion")).toBe(
      'Ada earned the "Practice Champion" badge.',
    );
    expect(contestFinishedMessage("Weekly 1", "Ada")).toBe(
      'Contest "Weekly 1" wrapped up — Ada topped the standings.',
    );
  });

  it("omits the winner clause when there is none", () => {
    expect(contestFinishedMessage("Weekly 1", null)).toBe('Contest "Weekly 1" wrapped up.');
  });

  it("phrases overall rank-ups by position", () => {
    expect(overallRankUpMessage("Ada", 1)).toBe("Ada is now #1 on the overall XP leaderboard.");
    expect(overallRankUpMessage("Bo", 2)).toBe("Bo climbed to #2 on the overall XP leaderboard.");
    expect(overallRankUpMessage("Cy", 3)).toBe("Cy climbed to #3 on the overall XP leaderboard.");
  });
});

describe("shouldNotifyRankUp", () => {
  it("stays quiet within the same tier", () => {
    // 1000 and 1050 are both Rough (0-1099).
    expect(shouldNotifyRankUp(1000, 1050)).toBe(false);
  });

  it("fires when crossing into a higher tier", () => {
    // 1099 -> Rough, 1100 -> Cut
    expect(shouldNotifyRankUp(1099, 1100)).toBe(true);
    // 1399 -> Polished, 1400 -> Radiant
    expect(shouldNotifyRankUp(1399, 1400)).toBe(true);
  });

  it("does not fire on a demotion", () => {
    // 1450 -> Radiant, 1300 -> Polished
    expect(shouldNotifyRankUp(1450, 1300)).toBe(false);
  });
});

describe("relativeTimeFromNow", () => {
  const now = new Date("2026-07-05T12:00:00.000Z");

  it("treats very recent times as just now", () => {
    expect(relativeTimeFromNow(new Date("2026-07-05T11:59:40.000Z"), now)).toBe("just now");
  });

  it("formats older times with the largest fitting unit", () => {
    expect(relativeTimeFromNow(new Date("2026-07-05T11:55:00.000Z"), now)).toBe("5 minutes ago");
    expect(relativeTimeFromNow(new Date("2026-07-05T09:00:00.000Z"), now)).toBe("3 hours ago");
    expect(relativeTimeFromNow(new Date("2026-07-03T12:00:00.000Z"), now)).toBe("2 days ago");
  });
});
