import { describe, it, expect } from "vitest";
import { clearProgress, defaultState, loadState, saveState } from "../src/lib/storage.ts";
import { STORAGE_KEY } from "../src/types.ts";
import { MemoryStorage } from "./helpers.ts";

describe("storage", () => {
  it("returns a default state", () => {
    const state = defaultState();
    expect(state.version).toBe(1);
    expect(state.streakCount).toBe(0);
    expect(state.attempts).toEqual([]);
  });

  it("round-trips save and load", () => {
    const storage = new MemoryStorage();
    const state = defaultState();
    state.streakCount = 4;
    state.lastActivityDate = "2026-11-19";
    saveState(state, storage);
    expect(loadState(storage).streakCount).toBe(4);
    expect(loadState(storage).lastActivityDate).toBe("2026-11-19");
  });

  it("recovers from corrupt JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "{not json");
    expect(loadState(storage)).toEqual(defaultState());
    storage.setItem(STORAGE_KEY, "null");
    expect(loadState(storage)).toEqual(defaultState());
  });

  it("recovers from an unsupported version", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, streakCount: 3 }));
    expect(loadState(storage).streakCount).toBe(0);
  });

  it("clears progress back to defaults", () => {
    const storage = new MemoryStorage();
    const state = defaultState();
    state.streakCount = 9;
    saveState(state, storage);
    clearProgress(storage);
    expect(loadState(storage)).toEqual(defaultState());
  });
});
