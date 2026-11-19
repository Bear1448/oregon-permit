import type { Question } from "../types.ts";
import { CORRECT_TO_PASS } from "../types.ts";
import { selectedCanonicalIndex } from "./quiz.ts";

export type ScoredAnswer = {
  question: Question;
  choiceOrder: number[];
  selectedVisibleIndex: number | null;
};

export function scoreAttempt(answers: ScoredAnswer[]): {
  correct: number;
  passed: boolean;
  misses: Question[];
} {
  let correct = 0;
  const misses: Question[] = [];
  for (const answer of answers) {
    if (
      answer.selectedVisibleIndex !== null &&
      selectedCanonicalIndex(answer.choiceOrder, answer.selectedVisibleIndex) ===
        answer.question.correctIndex
    ) {
      correct += 1;
    } else {
      misses.push(answer.question);
    }
  }
  return { correct, passed: correct >= CORRECT_TO_PASS, misses };
}
