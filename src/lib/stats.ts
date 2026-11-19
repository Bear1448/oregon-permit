import type { PersistedState, Question, TopicId } from "../types.ts";

export type TopicStat = {
  uniqueAttempted: number;
  uniqueCorrect: number;
  percent: number | null;
};

export function latestAnswersByQuestion(
  state: PersistedState,
  questions: Question[]
): Map<string, { topic: TopicId; correct: boolean }> {
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

  return latest;
}

export function topicStat(
  state: PersistedState,
  questions: Question[],
  topic: TopicId
): TopicStat {
  const items = [...latestAnswersByQuestion(state, questions).values()].filter((x) => x.topic === topic);
  const uniqueAttempted = items.length;
  const uniqueCorrect = items.filter((x) => x.correct).length;
  return {
    uniqueAttempted,
    uniqueCorrect,
    percent: uniqueAttempted >= 5 ? Math.round((uniqueCorrect / uniqueAttempted) * 100) : null
  };
}
