import { describe, it, expect } from "vitest";
import { applyActivity, displayedStreak } from "../src/lib/streak.ts";
import { defaultState } from "../src/lib/storage.ts";

describe("streak", () => {
  const day1 = new Date(2026, 10, 19, 15, 0, 0); // local Nov 19
  const sameDay = new Date(2026, 10, 19, 22, 0, 0);
  const day2 = new Date(2026, 10, 20, 8, 0, 0);
  const day4 = new Date(2026, 10, 22, 8, 0, 0);

  it("starts at 1 on the first activity", () => {
    const next = applyActivity(defaultState(), day1);
    expect(next.streakCount).toBe(1);
    expect(next.lastActivityDate).toBe("2026-11-19");
    expect(displayedStreak(next, day1)).toBe(1);
  });

  it("increments on the next local day", () => {
    const next = applyActivity(applyActivity(defaultState(), day1), day2);
    expect(next.streakCount).toBe(2);
    expect(next.lastActivityDate).toBe("2026-11-20");
    expect(displayedStreak(next, day2)).toBe(2);
  });

  it("does not increment twice on the same local day", () => {
    const next = applyActivity(applyActivity(defaultState(), day1), sameDay);
    expect(next.streakCount).toBe(1);
  });

  it("displays 0 after a skipped day, and the next activity starts at 1", () => {
    const mid = applyActivity(defaultState(), day1);
    expect(displayedStreak(mid, day4)).toBe(0);
    const restarted = applyActivity(mid, day4);
    expect(restarted.streakCount).toBe(1);
    expect(restarted.lastActivityDate).toBe("2026-11-22");
  });
});
