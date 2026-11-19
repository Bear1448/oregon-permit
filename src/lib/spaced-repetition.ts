import { CONSECUTIVE_TO_MASTER, type Question, type ReviewItem } from "../types.ts";

function isMastered(item: ReviewItem): boolean {
  return item.consecutiveCorrect >= CONSECUTIVE_TO_MASTER || Boolean(item.masteredAt && item.consecutiveCorrect >= CONSECUTIVE_TO_MASTER);
}

export function recordAnswer(
  review: Record<string, ReviewItem>,
  questionId: string,
  correct: boolean,
  nowIso: string
): Record<string, ReviewItem> {
  const next = { ...review };
  const existing = next[questionId];

  if (!correct) {
    next[questionId] = {
      questionId,
      consecutiveCorrect: 0,
      timesMissed: (existing?.timesMissed ?? 0) + 1,
      lastMissedAt: nowIso,
      lastSeenAt: nowIso,
      masteredAt: null
    };
    return next;
  }

  if (!existing) {
    // A first-time correct answer does not enter the review queue.
    return next;
  }

  const consecutiveCorrect = existing.consecutiveCorrect + 1;
  next[questionId] = {
    ...existing,
    consecutiveCorrect,
    lastSeenAt: nowIso,
    masteredAt: consecutiveCorrect >= CONSECUTIVE_TO_MASTER ? nowIso : null
  };
  return next;
}

export function queueItems(
  review: Record<string, ReviewItem>,
  questions: Question[]
): Question[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const active = Object.values(review).filter((item) => !isMastered(item));
  active.sort((a, b) => {
    if (a.consecutiveCorrect !== b.consecutiveCorrect) {
      return a.consecutiveCorrect - b.consecutiveCorrect;
    }
    if (a.lastSeenAt === null && b.lastSeenAt !== null) return -1;
    if (a.lastSeenAt !== null && b.lastSeenAt === null) return 1;
    if (a.lastSeenAt !== b.lastSeenAt) {
      return (a.lastSeenAt ?? "").localeCompare(b.lastSeenAt ?? "");
    }
    return a.questionId.localeCompare(b.questionId);
  });
  return active.map((item) => byId.get(item.questionId)).filter((q): q is Question => Boolean(q));
}
