import { describe, it, expect } from "vitest";
import { hashFor, parseHash } from "../src/router.ts";

describe("parseHash", () => {
  it("maps known paths to screen ids and unknown hashes to home", () => {
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/practice")).toEqual({ name: "practice" });
    expect(parseHash("#/study")).toEqual({ name: "study" });
    expect(parseHash("#/study/signs")).toEqual({ name: "study-topic", topic: "signs" });
    expect(parseHash("#/study/not-a-topic")).toEqual({ name: "home" });
    expect(parseHash("#/review")).toEqual({ name: "review" });
    expect(parseHash("#/permit")).toEqual({ name: "permit" });
    expect(parseHash("#/nope")).toEqual({ name: "home" });
  });

  it("round-trips hashFor into parseHash", () => {
    const routes = [
      { name: "home" as const },
      { name: "practice" as const },
      { name: "study" as const },
      { name: "study-topic" as const, topic: "teen-gdl" as const },
      { name: "review" as const },
      { name: "permit" as const }
    ];
    for (const route of routes) {
      expect(parseHash(hashFor(route))).toEqual(route);
    }
  });
});
