import type { PersistedState } from "../types.ts";
import { isBeforeYesterday, todayLocal, yesterdayLocal } from "./dates.ts";

export function displayedStreak(state: PersistedState, now: Date = new Date()): number {
  if (!state.lastActivityDate || isBeforeYesterday(state.lastActivityDate, now)) {
    return 0;
  }
  return state.streakCount;
}

export function applyActivity(state: PersistedState, now: Date = new Date()): PersistedState {
  const today = todayLocal(now);
  const yesterday = yesterdayLocal(now);
  if (state.lastActivityDate === today) {
    return state;
  }
  if (state.lastActivityDate === yesterday) {
    return {
      ...state,
      streakCount: state.streakCount + 1,
      lastActivityDate: today
    };
  }
  return {
    ...state,
    streakCount: 1,
    lastActivityDate: today
  };
}
