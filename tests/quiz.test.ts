import { describe, it, expect } from "vitest";
import { assemblePracticeTest, selectedCanonicalIndex, shuffleChoices } from "../src/lib/quiz.ts";
import { fillBank } from "./helpers.ts";
import { QUESTIONS_PER_TEST, TOPICS } from "../src/types.ts";

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("assemblePracticeTest", () => {
  it("returns 35 unique questions with topic minimums", () => {
    const set = assemblePracticeTest(fillBank(12), seeded(7));
    expect(set).toHaveLength(QUESTIONS_PER_TEST);
    expect(new Set(set.map((q) => q.id)).size).toBe(QUESTIONS_PER_TEST);
    expect(set.filter((q) => q.topic === "signs").length).toBeGreaterThanOrEqual(8);
    for (const topic of TOPICS) {
      if (topic === "signs") continue;
      expect(set.filter((q) => q.topic === topic).length, topic).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns all verified questions when the bank is short", () => {
    const short = fillBank(2); // 16 questions
    const set = assemblePracticeTest(short, seeded(3));
    expect(set).toHaveLength(16);
  });

  it("relaxes a short topic and still fills 35 unique items when possible", () => {
    const bank = fillBank(12).filter((q) => q.topic !== "parking" || q.id.endsWith("001"));
    const set = assemblePracticeTest(bank, seeded(11));
    expect(set).toHaveLength(35);
    expect(new Set(set.map((q) => q.id)).size).toBe(35);
  });
});

describe("shuffleChoices", () => {
  it("remaps visible indexes back to the canonical correct index", () => {
    const question = fillBank(1)[0];
    question.correctIndex = 2;
    const shuffled = shuffleChoices(question, seeded(5));
    const visible = shuffled.choiceOrder.indexOf(2);
    expect(selectedCanonicalIndex(shuffled.choiceOrder, visible)).toBe(2);
  });
});
