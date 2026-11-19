import type { Question, TopicId } from "../types.ts";
import { QUESTIONS_PER_TEST, TOPICS } from "../types.ts";

export type ShuffledQuestion = { question: Question; choiceOrder: number[] };

function defaultRng(): number {
  return Math.random();
}

function pick<T>(items: T[], count: number, rng: () => number): { chosen: T[]; rest: T[] } {
  const pool = [...items];
  const chosen: T[] = [];
  while (chosen.length < count && pool.length > 0) {
    const i = Math.floor(rng() * pool.length);
    chosen.push(pool.splice(i, 1)[0]);
  }
  return { chosen, rest: pool };
}

export function assemblePracticeTest(questions: Question[], rng: () => number = defaultRng): Question[] {
  const verified = questions.filter((q) => q.verified);
  if (verified.length <= QUESTIONS_PER_TEST) {
    return [...verified].sort(() => rng() - 0.5);
  }

  const byTopic = new Map<TopicId, Question[]>();
  for (const topic of TOPICS) byTopic.set(topic, []);
  for (const q of verified) byTopic.get(q.topic)!.push(q);

  const selected: Question[] = [];
  const remainder: Question[] = [];

  const take = (topic: TopicId, min: number) => {
    const pool = byTopic.get(topic) ?? [];
    const { chosen, rest } = pick(pool, min, rng);
    selected.push(...chosen);
    remainder.push(...rest);
  };

  take("signs", 8);
  for (const topic of TOPICS) {
    if (topic === "signs") continue;
    take(topic, 2);
  }

  const needed = QUESTIONS_PER_TEST - selected.length;
  const { chosen, rest: unused } = pick(remainder, Math.max(0, needed), rng);
  selected.push(...chosen);
  void unused;

  // If still short because a topic was thin, fill from any unused verified item.
  if (selected.length < QUESTIONS_PER_TEST) {
    const used = new Set(selected.map((q) => q.id));
    const leftover = verified.filter((q) => !used.has(q.id));
    const { chosen: extra } = pick(leftover, QUESTIONS_PER_TEST - selected.length, rng);
    selected.push(...extra);
  }

  const { chosen: shuffled } = pick(selected, selected.length, rng);
  return shuffled.slice(0, QUESTIONS_PER_TEST);
}

export function shuffleChoices(question: Question, rng: () => number = defaultRng): ShuffledQuestion {
  const indexes = question.choices.map((_, i) => i);
  const { chosen: choiceOrder } = pick(indexes, indexes.length, rng);
  return { question, choiceOrder };
}

export function selectedCanonicalIndex(choiceOrder: number[], visibleIndex: number): number {
  return choiceOrder[visibleIndex];
}
