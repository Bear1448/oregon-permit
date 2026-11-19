import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import bankJson from "../src/data/questions.json";
import { getVerifiedQuestions, loadQuestionBank } from "../src/lib/load-questions.ts";
import { assemblePracticeTest } from "../src/lib/quiz.ts";
import { TOPICS } from "../src/types.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("production question bank", () => {
  const bank = loadQuestionBank(bankJson);
  const verified = getVerifiedQuestions(bank);

  it("has 200–250 verified questions covering every topic", () => {
    expect(verified.length).toBeGreaterThanOrEqual(200);
    expect(verified.length).toBeLessThanOrEqual(250);
    expect(verified.every((q) => q.verified)).toBe(true);
    expect(verified.length).toBe(bank.questions.length);
  });

  it("meets per-topic minimums", () => {
    const counts = Object.fromEntries(
      TOPICS.map((topic) => [topic, verified.filter((q) => q.topic === topic).length])
    );
    expect(counts.signs).toBeGreaterThanOrEqual(40);
    for (const topic of TOPICS) {
      if (topic === "signs") continue;
      expect(counts[topic], topic).toBeGreaterThanOrEqual(15);
    }
  });

  it("references existing public-domain sign files and never the Interstate shield", () => {
    for (const question of verified) {
      const image = question.signImage;
      if (!image) continue;
      const rel = image.src.replace(/^\//, "");
      expect(existsSync(resolve(here, "../public", rel)), image.src).toBe(true);
      const blob = `${image.src} ${image.attribution} ${image.mutcdCode ?? ""}`.toLowerCase();
      expect(blob).not.toMatch(/interstate|m1-5|mutcd_i-2/);
    }
  });

  it("can assemble a 35-question practice test with topic mix", () => {
    const test = assemblePracticeTest(verified, () => 0.3);
    expect(test).toHaveLength(35);
    expect(new Set(test.map((q) => q.id)).size).toBe(35);
    expect(test.filter((q) => q.topic === "signs").length).toBeGreaterThanOrEqual(8);
    for (const topic of TOPICS) {
      if (topic === "signs") continue;
      expect(test.some((q) => q.topic === topic), topic).toBe(true);
    }
  });
});
