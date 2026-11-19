import type { PersistedState, Question, TopicId } from "../types.ts";
import { QUESTIONS_PER_TEST, TOPICS } from "../types.ts";
import { CONSECUTIVE_TO_MASTER } from "../types.ts";

export function computeReadiness(state: PersistedState, questions: Question[]): number {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const latest = new Map<string, { topic: TopicId; correct: boolean }>();

  for (const quiz of state.topicQuizHistory) {
    for (const id of quiz.questionIds) {
      const q = byId.get(id);
      const topic = q?.topic ?? quiz.topic;
      latest.set(id, { topic, correct: quiz.correctIds.includes(id) });
    }
  }

  for (const attempt of state.attempts) {
    for (const answer of attempt.answers) {
      const q = byId.get(answer.questionId);
      if (!q) continue;
      const selected = answer.selectedVisibleIndex;
      const canonical = selected === null ? null : answer.choiceOrder[selected];
      latest.set(answer.questionId, {
        topic: q.topic,
        correct: canonical === q.correctIndex
      });
    }
  }

  const topicScores: number[] = [];
  for (const topic of TOPICS) {
    const items = [...latest.values()].filter((x) => x.topic === topic);
    const uniqueAttempted = items.length;
    if (uniqueAttempted < 5) {
      topicScores.push(0);
      continue;
    }
    const uniqueCorrect = items.filter((x) => x.correct).length;
    topicScores.push((uniqueCorrect / uniqueAttempted) * 100);
  }
  const topicAverage = topicScores.reduce((a, b) => a + b, 0) / TOPICS.length;

  const last = state.attempts[state.attempts.length - 1];
  const latestPracticePercent = last ? (last.correct / QUESTIONS_PER_TEST) * 100 : 0;

  const everMissedIds = Object.keys(state.review);
  let reviewHealth = 100;
  if (everMissedIds.length > 0) {
    const masteredEver = everMissedIds.filter((id) => {
      const item = state.review[id];
      const mastered = item.consecutiveCorrect >= CONSECUTIVE_TO_MASTER || Boolean(item.masteredAt);
      const requeued = item.consecutiveCorrect < CONSECUTIVE_TO_MASTER && item.masteredAt === null;
      return mastered && !requeued;
    }).length;
    reviewHealth = (100 * masteredEver) / everMissedIds.length;
  }

  const readiness = Math.round(0.45 * topicAverage + 0.45 * latestPracticePercent + 0.1 * reviewHealth);
  return Math.max(0, Math.min(100, readiness));
}

