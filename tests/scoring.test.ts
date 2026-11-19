import { describe, it, expect } from "vitest";
import { scoreAttempt } from "../src/lib/scoring.ts";
import { fillBank } from "./helpers.ts";

describe("scoreAttempt", () => {
  const questions = fillBank(12).slice(0, 35);

  function answers(correctCount: number, shuffled = false) {
    return questions.map((question, i) => {
      const choiceOrder = shuffled ? [3, 2, 1, 0] : [0, 1, 2, 3];
      const canonical = i < correctCount ? question.correctIndex : (question.correctIndex + 1) % 4;
      const selectedVisibleIndex = choiceOrder.indexOf(canonical);
      return { question, choiceOrder, selectedVisibleIndex: selectedVisibleIndex as number | null };
    });
  }

  it("passes at 28 correct", () => {
    const result = scoreAttempt(answers(28));
    expect(result.correct).toBe(28);
    expect(result.passed).toBe(true);
    expect(result.misses).toHaveLength(7);
  });

  it("does not pass at 27 correct", () => {
    const result = scoreAttempt(answers(27));
    expect(result.correct).toBe(27);
    expect(result.passed).toBe(false);
  });

  it("scores shuffled choices against the canonical index", () => {
    const result = scoreAttempt(answers(35, true));
    expect(result.correct).toBe(35);
    expect(result.passed).toBe(true);
  });

  it("counts a null selection as wrong", () => {
    const list = answers(35);
    list[0].selectedVisibleIndex = null;
    const result = scoreAttempt(list);
    expect(result.correct).toBe(34);
    expect(result.misses[0].id).toBe(list[0].question.id);
  });
});
