import { describe, it, expect } from "vitest";
import { computeReadiness } from "../src/lib/readiness.ts";
import { defaultState } from "../src/lib/storage.ts";
import { fillBank } from "./helpers.ts";
import { TOPICS, type PersistedState } from "../src/types.ts";

const questions = fillBank(8);

function stateWithTopics(attemptedPerTopic: number, allCorrect = true): PersistedState {
  const state = defaultState();
  for (const topic of TOPICS) {
    const ids = questions.filter((q) => q.topic === topic).slice(0, attemptedPerTopic).map((q) => q.id);
    state.topicQuizHistory.push({
      finishedAt: "2026-11-19T10:00:00.000Z",
      topic,
      questionIds: ids,
      correctIds: allCorrect ? ids : ids.slice(1)
    });
  }
  return state;
}

describe("computeReadiness", () => {
  it("is 10 when nothing has been attempted except perfect review health", () => {
    // topicAverage 0, latestPractice 0, reviewHealth 100
    const readiness = computeReadiness(defaultState(), questions);
    expect(readiness).toBe(Math.round(0.1 * 100));
  });

  it("treats a topic with fewer than 5 unique attempts as 0", () => {
    const state = stateWithTopics(4, true);
    const readiness = computeReadiness(state, questions);
    expect(readiness).toBe(Math.round(0.45 * 0 + 0.45 * 0 + 0.1 * 100));
  });

  it("uses the published formula", () => {
    const state = stateWithTopics(5, true);
    state.attempts.push({
      finishedAt: "2026-11-19T12:00:00.000Z",
      correct: 28,
      passed: true,
      answers: []
    });
    const topicAverage = 100;
    const latestPracticePercent = (28 / 35) * 100;
    const reviewHealth = 100;
    expect(computeReadiness(state, questions)).toBe(
      Math.round(0.45 * topicAverage + 0.45 * latestPracticePercent + 0.1 * reviewHealth)
    );
  });

  it("counts only currently mastered review items toward reviewHealth", () => {
    const state = defaultState();
    state.review["q-signs-001"] = {
      questionId: "q-signs-001",
      consecutiveCorrect: 3,
      timesMissed: 1,
      lastMissedAt: "a",
      lastSeenAt: "b",
      masteredAt: "b"
    };
    state.review["q-signs-002"] = {
      questionId: "q-signs-002",
      consecutiveCorrect: 0,
      timesMissed: 1,
      lastMissedAt: "a",
      lastSeenAt: "a",
      masteredAt: null
    };
    // topic 0, practice 0, reviewHealth 50
    expect(computeReadiness(state, questions)).toBe(Math.round(0.1 * 50));
  });
});
