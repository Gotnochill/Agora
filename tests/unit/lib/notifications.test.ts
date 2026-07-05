import { describe, expect, it } from "vitest";
import {
  badgeEarnedMessage,
  contestFinishedMessage,
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
});

describe("shouldNotifyRankUp", () => {
  it("stays quiet within the same tier", () => {
    expect(shouldNotifyRankUp(1200, 1300)).toBe(false);
  });

  it("fires when crossing into a higher tier", () => {
    // 1199 -> Rough, 1200 -> Cut
    expect(shouldNotifyRankUp(1199, 1200)).toBe(true);
    // 1399 -> Cut, 1400 -> Polished
    expect(shouldNotifyRankUp(1399, 1400)).toBe(true);
  });

  it("does not fire on a demotion", () => {
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
