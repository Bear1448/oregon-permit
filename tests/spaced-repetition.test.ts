import { describe, it, expect } from "vitest";
import { queueItems, recordAnswer } from "../src/lib/spaced-repetition.ts";
import { makeQuestion } from "./helpers.ts";

const q1 = makeQuestion({ id: "q-signs-001", topic: "signs" });
const q2 = makeQuestion({ id: "q-signs-002", topic: "signs" });

describe("recordAnswer and queueItems", () => {
  it("creates a review item on the first miss", () => {
    const review = recordAnswer({}, q1.id, false, "2026-11-19T10:00:00");
    expect(review[q1.id].timesMissed).toBe(1);
    expect(review[q1.id].consecutiveCorrect).toBe(0);
    expect(queueItems(review, [q1, q2])).toEqual([q1]);
  });

  it("resets the consecutive count after a miss", () => {
    let review = recordAnswer({}, q1.id, false, "t1");
    review = recordAnswer(review, q1.id, true, "t2");
    review = recordAnswer(review, q1.id, true, "t3");
    expect(review[q1.id].consecutiveCorrect).toBe(2);
    review = recordAnswer(review, q1.id, false, "t4");
    expect(review[q1.id].consecutiveCorrect).toBe(0);
    expect(review[q1.id].timesMissed).toBe(2);
  });

  it("removes an item from the queue after three consecutive correct answers", () => {
    let review = recordAnswer({}, q1.id, false, "t1");
    review = recordAnswer(review, q1.id, true, "t2");
    review = recordAnswer(review, q1.id, true, "t3");
    review = recordAnswer(review, q1.id, true, "t4");
    expect(review[q1.id].consecutiveCorrect).toBe(3);
    expect(review[q1.id].masteredAt).toBe("t4");
    expect(queueItems(review, [q1])).toEqual([]);
  });

  it("re-enters the queue after a later miss", () => {
    let review = recordAnswer({}, q1.id, false, "t1");
    review = recordAnswer(review, q1.id, true, "t2");
    review = recordAnswer(review, q1.id, true, "t3");
    review = recordAnswer(review, q1.id, true, "t4");
    review = recordAnswer(review, q1.id, false, "t5");
    expect(review[q1.id].consecutiveCorrect).toBe(0);
    expect(review[q1.id].masteredAt).toBeNull();
    expect(queueItems(review, [q1])).toEqual([q1]);
  });

  it("sorts by lowest consecutiveCorrect, then oldest lastSeenAt, then id", () => {
    let review = recordAnswer({}, q2.id, false, "t1");
    review = recordAnswer(review, q1.id, false, "t2");
    review = recordAnswer(review, q2.id, true, "t3"); // q2 now consecutive 1, seen later
    const queued = queueItems(review, [q1, q2]);
    expect(queued.map((q) => q.id)).toEqual(["q-signs-001", "q-signs-002"]);
  });

  it("does not queue a first-time correct answer", () => {
    const review = recordAnswer({}, q1.id, true, "t1");
    expect(review[q1.id]).toBeUndefined();
    expect(queueItems(review, [q1])).toEqual([]);
  });
});
