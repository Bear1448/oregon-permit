import { describe, it, expect } from "vitest";
import { getVerifiedQuestions, loadQuestionBank } from "../src/lib/load-questions.ts";
import { makeBank, makeQuestion } from "./helpers.ts";
import { TOPICS } from "../src/types.ts";

function eightTopics(): ReturnType<typeof makeQuestion>[] {
  return TOPICS.map((topic) =>
    makeQuestion({
      id: `q-${topic}-001`,
      topic,
      verified: topic !== "teen-gdl",
      correctIndex: 0,
      choices: ["Yes", "No", "Maybe"]
    })
  );
}

describe("loadQuestionBank", () => {
  it("accepts a valid one-question-per-topic bank", () => {
    const bank = loadQuestionBank(makeBank(eightTopics().map((q) => ({ ...q, verified: true }))));
    expect(bank.questions).toHaveLength(8);
  });

  it("rejects a duplicate id", () => {
    const questions = eightTopics().map((q) => ({ ...q, verified: true }));
    questions[1] = { ...questions[1], id: questions[0].id };
    expect(() => loadQuestionBank(makeBank(questions))).toThrow(/Duplicate question id/);
  });

  it("rejects a correctIndex that is out of range", () => {
    const questions = eightTopics().map((q) => ({ ...q, verified: true }));
    questions[0] = { ...questions[0], correctIndex: 3, choices: ["A", "B", "C"] };
    expect(() => loadQuestionBank(makeBank(questions))).toThrow(/correctIndex out of range/);
  });

  it("drops unverified questions from getVerifiedQuestions", () => {
    const bank = loadQuestionBank(makeBank(eightTopics()));
    const verified = getVerifiedQuestions(bank);
    expect(verified).toHaveLength(7);
    expect(verified.every((q) => q.verified)).toBe(true);
    expect(verified.some((q) => q.topic === "teen-gdl")).toBe(false);
  });
});

import bankJson from "../src/data/questions.json";

describe("bundled question bank", () => {
  it("loads and contains one verified question per topic", () => {
    const bank = loadQuestionBank(bankJson);
    const verified = getVerifiedQuestions(bank);
    expect(verified.length).toBeGreaterThanOrEqual(8);
    for (const topic of TOPICS) {
      expect(verified.some((q) => q.topic === topic), topic).toBe(true);
    }
  });
});
