import { STORAGE_KEY, type PersistedState } from "../types.ts";

export function defaultState(): PersistedState {
  return {
    version: 1,
    streakCount: 0,
    lastActivityDate: null,
    checklist: {},
    inProgressTest: null,
    attempts: [],
    topicQuizHistory: [],
    review: {},
    installHintDismissed: false
  };
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<PersistedState>;
  return v.version === 1 && typeof v.streakCount === "number" && Array.isArray(v.attempts);
}

export function loadState(storage: Storage = localStorage): PersistedState {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedState(parsed)) return defaultState();
    return {
      ...defaultState(),
      ...parsed,
      checklist: parsed.checklist ?? {},
      attempts: parsed.attempts ?? [],
      topicQuizHistory: parsed.topicQuizHistory ?? [],
      review: parsed.review ?? {}
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: PersistedState, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearProgress(storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(defaultState()));
}
