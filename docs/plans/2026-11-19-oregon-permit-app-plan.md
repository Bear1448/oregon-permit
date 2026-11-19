# Oregon Permit Study App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an unofficial, installable, login-free PWA Jake can text to his daughter so she can study for the Oregon instruction permit knowledge test (35 questions, 28 to pass) with original, manual-verified questions, mistake review, and a DMV checklist.

**Architecture:** A static Vite + TypeScript single-page app with no backend. The question bank is bundled JSON. Progress, streak, review queue, and checklist ticks live in `localStorage` under `or-permit-v1`. A service worker precaches the shell, bank, and sign images so the app works offline after the first load. Screens are client-side routes: Home, Practice Test, Study by Topic, Review Mistakes, and Getting My Permit.

**Tech Stack:** Vite 7, vanilla TypeScript (no React), Vitest, a JSON Schema validator (`ajv` or equivalent) in tests and the dev loader, `vite-plugin-pwa` for the manifest and workbox precache. Host on GitHub Pages.

**Spec:** [docs/specs/2026-11-19-oregon-permit-app-design.md](../specs/2026-11-19-oregon-permit-app-design.md). Research facts: [research.md](../../research.md). Official manual: <https://www.oregon.gov/odot/forms/dmv/37.pdf>.

## Global Constraints

- No login, no backend, no analytics, no parent view, no cloud sync.
- Practice tests are **untimed**; official sources do not confirm a time limit.
- Official format only: 35 unique questions, pass at 28 correct, no per-section cutoff.
- English only in v1.
- Question wording must be original. Do not copy the Oregon Driver Manual's text or any commercial question bank. Do not include DMV's 20 official sample questions in the shipped bank.
- Every Oregon-specific number must be verified against the 2026–2027 manual or the official DMV page cited in `research.md` before `verified` is set to `true`.
- Sign images only from FHWA Standard Highway Signs or Wikimedia Commons PD-USGov-MUTCD. Never use the Interstate shield or images ripped from the Oregon PDF.
- Storage key is `or-permit-v1`. Readiness, streak, and review rules in the spec (master at 3 consecutive correct) are product contracts.
- Every screen footer uses this disclaimer, verbatim: “This is an unofficial study aid. It is not affiliated with the Oregon DMV or ODOT and is not a legal source. Official rules are in the 2026–2027 Oregon Driver Manual and at OregonDMV.com.”
- Target WCAG 2.2 AA where practical; 44×44 px targets; works at 320 px width.
- This plan writes documents and later code; do not start implementation until the engineer begins Task 1.

## File structure (to be created during tasks)

```
oregon-permit-app/
  research.md
  docs/specs/2026-11-19-oregon-permit-app-design.md
  docs/plans/2026-11-19-oregon-permit-app-plan.md
  docs/content/SIGN_SOURCES.md          # Task 6
  docs/content/verification-log.md      # Task 7
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  index.html
  public/manifest.webmanifest
  public/icons/icon-192.png
  public/icons/icon-512.png
  public/signs/*.svg
  src/main.ts
  src/app.ts
  src/router.ts
  src/styles.css
  src/types.ts
  src/data/questions.schema.json
  src/data/questions.json
  src/lib/load-questions.ts
  src/lib/storage.ts
  src/lib/scoring.ts
  src/lib/quiz.ts
  src/lib/spaced-repetition.ts
  src/lib/readiness.ts
  src/lib/streak.ts
  src/lib/dates.ts
  src/screens/home.ts
  src/screens/practice-test.ts
  src/screens/study-topic.ts
  src/screens/review.ts
  src/screens/checklist.ts
  src/components/question-card.ts
  src/components/results-list.ts
  src/components/footer.ts
  src/checklist-items.ts
  tests/load-questions.test.ts
  tests/quiz.test.ts
  tests/scoring.test.ts
  tests/spaced-repetition.test.ts
  tests/readiness.test.ts
  tests/streak.test.ts
  tests/storage.test.ts
```

Vanilla TypeScript is the stack. Do not add React, a CSS framework, or a UI kit unless a later spec change says so.

---

### Task 1: Scaffold the Vite + TypeScript + Vitest app

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.ts`, `src/styles.css`, `.gitignore`
- Test: `tests/sanity.test.ts` (deleted after the first real test file exists, or replaced in Task 2)

**Interfaces:**
- Consumes: nothing
- Produces: `npm run dev`, `npm run build`, and `npm test` scripts; Vite root at the repo directory that already contains `research.md` and `docs/`

- [ ] **Step 1: Initialize the toolchain in the existing repo root** (`/workspace/oregon-permit-app` or the clone root), not in a nested folder that would hide `docs/` and `research.md`.

```bash
npm create vite@latest . -- --template vanilla-ts
# If the directory is not empty, scaffold files by hand instead of overwriting docs/ or research.md.
npm install
npm install -D vitest jsdom
```

`package.json` scripts must include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Add Vitest config** in `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
  },
});
```

- [ ] **Step 3: Write a failing sanity test** `tests/sanity.test.ts` that imports a not-yet-used helper if needed, or simply:

```ts
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run `npm test` and confirm it passes.** Then run `npm run build` and confirm `dist/` is produced.

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src tests .gitignore
git commit -m "chore: scaffold Vite TypeScript app with Vitest"
```

---

### Task 2: Types, JSON schema, and question loader

**Files:**
- Create: `src/types.ts`, `src/data/questions.schema.json`, `src/data/questions.json` (a tiny fixture bank of 8 unverified placeholders is not allowed — use 8 *original, verified* seed questions, one per topic, taken from research.md facts), `src/lib/load-questions.ts`
- Test: `tests/load-questions.test.ts`

**Interfaces:**
- Consumes: schema rules in the spec, section 6
- Produces:
  - `export const TOPICS` and `export type TopicId`
  - `export const MANUAL_URL = "https://www.oregon.gov/odot/forms/dmv/37.pdf"`
  - `export const MANUAL_EDITION = "2026-2027"`
  - `export const QUESTIONS_PER_TEST = 35`
  - `export const CORRECT_TO_PASS = 28`
  - `export const CONSECUTIVE_TO_MASTER = 3`
  - `export const STORAGE_KEY = "or-permit-v1"`
  - `export type Question`, `export type QuestionBank`
  - `export function loadQuestionBank(raw: unknown): QuestionBank` — throws a descriptive error if schema or invariants fail
  - `export function getVerifiedQuestions(bank: QuestionBank): Question[]` — returns only `verified === true`

- [ ] **Step 1: Write failing tests** in `tests/load-questions.test.ts` that (a) accept a valid one-question-per-topic bank, (b) reject a duplicate `id`, (c) reject `correctIndex` that is out of range, (d) make `getVerifiedQuestions` drop `verified: false` items.

- [ ] **Step 2: Run `npx vitest run tests/load-questions.test.ts`.** Expected: FAIL because `load-questions.ts` does not exist.

- [ ] **Step 3: Add `src/types.ts` and `src/data/questions.schema.json` exactly as specified in the design spec section 6.** Implement `loadQuestionBank` with Ajv (install `ajv` and `ajv-formats` if needed) or an equivalent explicit validator plus the invariants: unique ids, `correctIndex < choices.length`, `manual.edition === "2026-2027"`.

- [ ] **Step 4: Author eight seed questions**, one per `TopicId`, using only facts already verified in `research.md` (examples: business district 20 mph, p. 19; hydrant 10 feet, p. 70; under-21 BAC any amount, p. 83; school bus red lights, p. 55; under-18 no phone including hands-free; 28 of 35 is test format but do not write “trick” items that are about the app). Set `verified: true` and a real `verifiedAgainst` page cite. IDs match `^q-[a-z0-9-]+-[0-9]{3}$` (for example `q-speed-limits-001`).

- [ ] **Step 5: Run `npx vitest run tests/load-questions.test.ts`.** Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/data src/lib/load-questions.ts tests/load-questions.test.ts package.json package-lock.json
git commit -m "feat: add question types, schema, and verified loader"
```

---

### Task 3: Storage

**Files:**
- Create: `src/lib/storage.ts`
- Test: `tests/storage.test.ts`

**Interfaces:**
- Consumes: `STORAGE_KEY`, `PersistedState` from the spec section 9
- Produces:
  - `export function defaultState(): PersistedState`
  - `export function loadState(storage?: Storage): PersistedState` — on missing/corrupt/unsupported version, return `defaultState()` and do not throw
  - `export function saveState(state: PersistedState, storage?: Storage): void`
  - `export function clearProgress(storage?: Storage): void` — writes `defaultState()` (or removes the key and lets the next load default)

Inject `Storage` so tests can pass a memory stub instead of real `localStorage`.

- [ ] **Step 1: Write failing tests** for default state, round-trip save/load, corrupt JSON (`"{not json"` and `"null"`), wrong `version`, and `clearProgress`.

- [ ] **Step 2: Run `npx vitest run tests/storage.test.ts`.** Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/storage.ts`.**

- [ ] **Step 4: Run the test file.** Expected: PASS.

- [ ] **Step 5: Commit** `feat: persist app state in localStorage with corrupt-data fallback`

---

### Task 4: Practice-test assembly and scoring

**Files:**
- Create: `src/lib/quiz.ts`, `src/lib/scoring.ts`
- Test: `tests/quiz.test.ts`, `tests/scoring.test.ts`

**Interfaces:**
- Consumes: `Question`, `QUESTIONS_PER_TEST`, `CORRECT_TO_PASS`, `getVerifiedQuestions`
- Produces:
  - `export type ShuffledQuestion = { question: Question; choiceOrder: number[] }` where `choiceOrder[visibleSlot] === originalIndex`
  - `export function assemblePracticeTest(questions: Question[], rng?: () => number): Question[]` — 35 unique verified items, at least 8 `signs`, at least 2 from each other topic, remainder random, then shuffled. If a topic is short, relax that minimum and still return 35 unique items when 35 exist; if fewer than 35 verified exist (only true in early seed builds), return all verified and tests for the short-bank path must cover that.
  - `export function shuffleChoices(question: Question, rng?: () => number): ShuffledQuestion`
  - `export function selectedCanonicalIndex(choiceOrder: number[], visibleIndex: number): number`
  - `export function scoreAttempt(answers: Array<{ question: Question; choiceOrder: number[]; selectedVisibleIndex: number | null }>): { correct: number; passed: boolean; misses: Question[] }` — `passed` is `correct >= 28`. Null selection counts as wrong.

Use a seeded `rng` in tests so assembly is deterministic.

- [ ] **Step 1: Write failing assembly tests** with a fake bank of 35+ items that meets the per-topic minimums, plus a short-bank case.

- [ ] **Step 2: Write failing scoring tests:** 28 correct → passed; 27 → not passed; shuffled choices still score against the canonical `correctIndex`; null answer is wrong.

- [ ] **Step 3: Run the two test files.** Expected: FAIL.

- [ ] **Step 4: Implement `quiz.ts` and `scoring.ts`.**

- [ ] **Step 5: Re-run tests.** Expected: PASS.

- [ ] **Step 6: Commit** `feat: assemble mixed 35-question tests and score 28 to pass`

---

### Task 5: Spaced repetition, readiness, and streak

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/spaced-repetition.ts`, `src/lib/readiness.ts`, `src/lib/streak.ts`
- Test: `tests/spaced-repetition.test.ts`, `tests/readiness.test.ts`, `tests/streak.test.ts`

**Interfaces:**
- Consumes: `CONSECUTIVE_TO_MASTER`, `ReviewItem`, `PersistedState`, scoring outputs
- Produces:
  - `export function todayLocal(now?: Date): string` — `YYYY-MM-DD` in local time
  - `export function yesterdayLocal(now?: Date): string`
  - `export function recordAnswer(review: Record<string, ReviewItem>, questionId: string, correct: boolean, nowIso: string): Record<string, ReviewItem>` — implements spec section 8.2 (first miss creates the item; a miss resets `consecutiveCorrect` to 0; a correct increments; at 3, set `masteredAt` and treat as mastered; a later miss re-queues with `consecutiveCorrect: 0`)
  - `export function queueItems(review: Record<string, ReviewItem>, questions: Question[]): Question[]` — only non-mastered items, sorted by lowest `consecutiveCorrect`, then oldest `lastSeenAt` (null first), then `id`
  - `export function computeReadiness(state: PersistedState, questions: Question[]): number` — exact formula in spec section 8.3
  - `export function displayedStreak(state: PersistedState, now?: Date): number` and `export function applyActivity(state: PersistedState, now?: Date): PersistedState` — spec section 8.4

- [ ] **Step 1: Write failing spaced-repetition tests** for first miss, two correct then a miss (count back to 0), third consecutive correct removes from `queueItems`, later miss re-enters, and sort order.

- [ ] **Step 2: Write failing readiness tests** with a hand-built `PersistedState` that lock `round(0.45 * topicAverage + 0.45 * latestPracticePercent + 0.10 * reviewHealth)`, including the “fewer than 5 unique attempts in a topic contributes 0” rule and the “never missed → reviewHealth 100” rule.

- [ ] **Step 3: Write failing streak tests** using injected `Date` values: first activity → 1; next local day → 2; same day again → still 2; a skipped day → display 0, and the next activity starts at 1. Do not use UTC date strings.

- [ ] **Step 4: Run the three test files.** Expected: FAIL.

- [ ] **Step 5: Implement the four modules.**

- [ ] **Step 6: Re-run tests.** Expected: PASS.

- [ ] **Step 7: Commit** `feat: add review queue, readiness score, and local-day streaks`

---

### Task 6: Question-bank authoring and sign assets

**Files:**
- Modify: `src/data/questions.json`
- Create: `public/signs/*.svg`, `docs/content/SIGN_SOURCES.md`

**Interfaces:**
- Consumes: schema, licensing rules, `research.md` Oregon-specific numbers
- Produces: a bank of **at least 200** (target 240, cap 250) original `verified: true` questions across all eight topics, plus bundled PD MUTCD SVGs and a source log

Suggested per-topic targets: signs 50, speed limits 30, right of way 30, turns and lanes 35, parking 25, alcohol and phone 25, school buses 20, teen/GDL 25.

- [ ] **Step 1: Download only public-domain sign SVGs** from FHWA Standard Highway Signs (<https://mutcd.fhwa.dot.gov/kno-shs_2024.htm>) or Wikimedia Commons files tagged PD-USGov-MUTCD. Skip the Interstate shield and any file without a clear PD license. Save under `public/signs/{mutcdCode}.svg`.

- [ ] **Step 2: Write `docs/content/SIGN_SOURCES.md`** with one row per file: filename, MUTCD code, source URL, license tag (`fhwa-shs` or `wikimedia-pd-usgov-mutcd`), and retrieval date.

- [ ] **Step 3: Author questions in topic batches** (signs, then speed, then right of way, and so on). For each item:
  - Write a new prompt and new distractors; do not paste manual sentences or commercial items.
  - Cite `manual.section` and printed `manual.page` from the 2026–2027 PDF.
  - Keep `explanation` to one original sentence.
  - For sign-identification items, set `signImage.src` to `/signs/...`, write an alt that describes shape and color without naming the sign, and fill `source` / `attribution` / `mutcdCode`.
  - Leave `verified: false` until the Task 7 check for that item is done, or set `verified: true` in the same sitting as the PDF check and record `verifiedAgainst`.

- [ ] **Step 4: Run the loader tests plus a new assertion** (add to `tests/load-questions.test.ts`) that the production bank has `getVerifiedQuestions(bank).length >= 200` and each topic has at least 15 verified items (signs at least 40). This test is allowed to fail until Task 7 finishes; do not merge a launch build while it fails.

- [ ] **Step 5: Commit in topic-sized commits**, for example `content: add verified speed-limit questions from 2026-2027 manual`.

Do not ship the app until the count test in Step 4 passes.

---

### Task 7: Fact-verification pass

**Files:**
- Modify: `src/data/questions.json` (corrections only)
- Create: `docs/content/verification-log.md`

**Interfaces:**
- Consumes: 2026–2027 PDF at `https://www.oregon.gov/odot/forms/dmv/37.pdf` and official URLs in `research.md`
- Produces: every production question has `verified: true` and a `verifiedAgainst` string; a log of what was checked and what was changed or dropped

- [ ] **Step 1: For every question whose answer is an Oregon-specific number** (speeds, distances, hours, fees, BAC, ages, time windows, retake limits), open the cited printed page in the official PDF (or the official DMV page if the fact is a fee or process rule not in the study section) and confirm the number and the condition (for example “unless otherwise posted”).

- [ ] **Step 2: Record the pass** in `docs/content/verification-log.md` with columns: question id, fact checked, page or URL, result (`ok`, `corrected`, or `dropped`), and initials/date. Correct or drop any mismatch. Never invent a replacement number.

- [ ] **Step 3: Spot-check at least 40 additional questions** that are not purely numeric (right of way, signs meaning, left on red, move-over wording) the same way.

- [ ] **Step 4: Re-run `npm test`.** Expected: PASS, including the 200-question count test.

- [ ] **Step 5: Commit** `docs: record manual fact-verification pass for the question bank`

---

### Task 8: App shell, router, styles, and disclaimer footer

**Files:**
- Create: `src/router.ts`, `src/app.ts`, `src/components/footer.ts`, update `src/main.ts`, `src/styles.css`, `index.html`
- Test: a small `tests/router.test.ts` that maps paths to screen ids (optional but recommended)

**Interfaces:**
- Consumes: none of the quiz math beyond rendering hooks
- Produces:
  - Routes: `#/` Home, `#/practice` Practice Test, `#/study` and `#/study/:topic` Study by Topic, `#/review` Review Mistakes, `#/permit` Getting My Permit. Unknown hashes go to Home.
  - `renderFooter(): HTMLElement` with the verbatim disclaimer and a link to `https://www.oregon.gov/odot/forms/dmv/37.pdf`
  - A skip-to-content link, one `h1` per screen, and a nav that works with a keyboard

- [ ] **Step 1: Implement hash routing and a layout chrome** (header or bottom nav + main + footer). Use semantic HTML. Load and persist state through `loadState` / `saveState`.

- [ ] **Step 2: Add styles** for a readable, mobile-first layout, 44×44 px targets, 4.5:1 contrast, and `prefers-reduced-motion`.

- [ ] **Step 3: Visually confirm** all five routes render a heading and the disclaimer, including a 320 px wide viewport.

- [ ] **Step 4: Commit** `feat: add app shell, hash router, and unofficial disclaimer footer`

---

### Task 9: Home screen

**Files:**
- Create: `src/screens/home.ts`

**Interfaces:**
- Consumes: `computeReadiness`, `displayedStreak`, `queueItems`, `loadState`
- Produces: Home view with readiness number and status label (Just starting 0–39, Getting there 40–69, Almost ready 70–84, Test ready 85–100), streak, primary buttons, Getting My Permit, review badge count, and a Continue test prompt when `inProgressTest` is set

- [ ] **Step 1: Implement the Home screen** against the spec section 5.1. Status labels must use those exact bands.

- [ ] **Step 2: Manual check:** with default state, readiness is 0 and the review badge is hidden; after stubbing state, the badge and Continue prompt appear.

- [ ] **Step 3: Commit** `feat: add home screen with readiness, streak, and primary actions`

---

### Task 10: Question card, Practice Test, and results

**Files:**
- Create: `src/components/question-card.ts`, `src/components/results-list.ts`, `src/screens/practice-test.ts`

**Interfaces:**
- Consumes: `assemblePracticeTest`, `shuffleChoices`, `scoreAttempt`, `recordAnswer`, `applyActivity`
- Produces: the Practice Test flow in spec section 5.2, including mid-test persistence in `inProgressTest`, Back/Next, Submit only when all 35 are answered, results with each miss, correct answer, one-line explanation, and manual section plus page and PDF link

- [ ] **Step 1: Build `question-card`** so it can run in “exam” mode (no feedback until later) and “study” mode (feedback after answering). Sign `alt` follows spec section 11.

- [ ] **Step 2: Implement the practice-test screen.** Starting a new test while one is in progress asks for confirmation. Refreshing the page resumes `inProgressTest`.

- [ ] **Step 3: On submit**, save a finished attempt, update review items for every miss and every already-queued correct, apply streak activity, clear `inProgressTest`, and show results.

- [ ] **Step 4: Manual check** of a 35-question run and of mid-test refresh. Automated tests already cover scoring; add a thin test if you extract start/submit helpers.

- [ ] **Step 5: Commit** `feat: add practice test and results with manual citations`

---

### Task 11: Study by Topic

**Files:**
- Create: `src/screens/study-topic.ts`

**Interfaces:**
- Consumes: topic list, `getVerifiedQuestions`, `recordAnswer`, `applyActivity`
- Produces: topic index and 10-question (or fewer) quizzes with immediate feedback, as in spec section 5.3

- [ ] **Step 1: Implement the topic list** (eight topics in the spec order, counts, and accuracy after five unique answers).

- [ ] **Step 2: Implement the quiz** with immediate explanation and manual cite; misses update the review queue; finishing applies streak.

- [ ] **Step 3: Manual check** one quiz in each of two topics.

- [ ] **Step 4: Commit** `feat: add study-by-topic quizzes with immediate feedback`

---

### Task 12: Review Mistakes

**Files:**
- Create: `src/screens/review.ts`

**Interfaces:**
- Consumes: `queueItems`, `recordAnswer`, `applyActivity`
- Produces: the Review Mistakes flow in spec section 5.4, including the empty state

- [ ] **Step 1: Implement the queue session** in priority order. After three consecutive correct, the item disappears from subsequent reviews. A session with at least one answer counts as activity.

- [ ] **Step 2: Manual check** by missing a topic question, reviewing it wrong once, then right three times, and confirming it leaves the queue.

- [ ] **Step 3: Commit** `feat: add spaced review for missed questions`

---

### Task 13: Getting My Permit checklist

**Files:**
- Create: `src/checklist-items.ts`, `src/screens/checklist.ts`

**Interfaces:**
- Consumes: `loadState` / `saveState` `checklist` map; facts from spec section 5.5 and `research.md`
- Produces: the grouped checklist with official links and a confirmed “Clear progress on this device” action

- [ ] **Step 1: Encode checklist items** as data (`id`, `group`, `labelHtml` or structured text, optional `href`s). Copy fees, ages, retake limits, 50/100-hour paths, and proctor rules from the spec — do not shorten “50 hours + 6 months” in a way that drops the 100-hour path.

- [ ] **Step 2: Render groups, persist ticks, and implement clear-progress** with a confirm dialog that resets `or-permit-v1` to defaults without touching `questions.json`.

- [ ] **Step 3: Manual check** that links open the official manual, DMV2U, the fee/info pages, Form 735-173DP, and the under-18 permit page.

- [ ] **Step 4: Commit** `feat: add Getting My Permit checklist and progress reset`

---

### Task 14: PWA, icons, and offline cache

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Modify: `vite.config.ts`, `index.html`, `src/screens/home.ts` (dismissible install hint)

**Interfaces:**
- Consumes: `vite-plugin-pwa`
- Produces: an installable app that, after one online visit, opens and runs a practice or topic quiz with the network disabled

- [ ] **Step 1: Install and configure `vite-plugin-pwa`** to precache the app shell, JS/CSS, `questions.json`, and `public/signs/**`. Manifest `display` is `standalone`. Set Vite `base` to `'/'` for a custom domain, or to `'/<repo-name>/'` for project GitHub Pages — record the chosen value in the deploy task.

- [ ] **Step 2: Add simple, original icons** (no official DMV marks or Interstate shield).

- [ ] **Step 3: Add a dismissible Home hint** for iOS Safari Share → Add to Home Screen and Android Chrome Install / Add to Home Screen. Store dismissal in `PersistedState` only if you extend the type and default; otherwise a separate `or-permit-v1-hints` key is acceptable.

- [ ] **Step 4: Verify offline:** `npm run build && npm run preview`, load the app, disable the network in devtools, reload, and complete a short topic quiz.

- [ ] **Step 5: Commit** `feat: installable PWA with offline precache`

---

### Task 15: Accessibility pass

**Files:**
- Modify: screens, `question-card.ts`, `src/styles.css` as needed

- [ ] **Step 1: Keyboard-only walkthrough** of all five screens, including answering a question, submitting a test (or a reduced in-progress path), and ticking the checklist. Fix any focus traps or missing labels.

- [ ] **Step 2: Check contrast, visible focus, `aria-live` on feedback and score, and sign alts** on a sign-identification item (alt must not name the sign before reveal).

- [ ] **Step 3: Confirm reduced-motion and a 320 px layout** do not hide primary buttons.

- [ ] **Step 4: Commit** `fix: accessibility pass for keyboard, contrast, and sign alt text`

---

### Task 16: Full automated test run and manual QA

- [ ] **Step 1: Run `npm test` and `npm run build`.** Expected: both exit 0. The verified bank is ≥ 200 questions.

- [ ] **Step 2: Manual QA checklist**
  - Phone and desktop: all five screens.
  - Practice Test: 35 questions, mixed topics, no mid-test answers revealed, results show misses with explanation and manual page.
  - Fail a test with 27 or fewer, pass with 28 or more (you may temporarily use a debug seed in development only; remove it before deploy).
  - Review: three-in-a-row mastery.
  - Streak: two consecutive local days (or clock override in dev).
  - Checklist facts still match the spec (fees $7 / $30 / $60, 21+ proctor, 2-per-24-hours and 4 online total, 100 hours or 50 plus driver ed, six-month hold).
  - Disclaimer visible on every screen.
  - Offline and add-to-home-screen path.
  - Clear progress wipes scores and ticks only.

- [ ] **Step 3: Fix any defects and re-run `npm test`.**

- [ ] **Step 4: Commit** remaining fixes.

---

### Task 17: Deploy to GitHub Pages (or equivalent static host)

- [ ] **Step 1: Confirm `vite.config.ts` `base`** matches the host path (`/` on a custom domain or `https://<user>.github.io/<repo>/`).

- [ ] **Step 2: Add a GitHub Actions workflow** at `.github/workflows/pages.yml` that on push to the default branch runs `npm ci`, `npm test`, `npm run build`, and uploads `dist/` to GitHub Pages. Use official `actions/checkout`, `actions/setup-node` (Node 22), and `actions/upload-pages-artifact` / `actions/deploy-pages`. Do not commit secrets.

- [ ] **Step 3: Enable GitHub Pages** from GitHub Actions, push, and wait for the HTTPS URL.

- [ ] **Step 4: Smoke-test the live URL** on a phone: Home loads, a topic quiz works, install hint is present, official manual link opens, disclaimer is visible. If the first load was online, a second visit in airplane mode still works.

- [ ] **Step 5: Give Jake the live URL** so he can text it to his daughter. No account is required.

Alternative: the same `dist/` folder can be dragged to Cloudflare Pages or Netlify if GitHub Pages is inconvenient. The app remains a static site.

- [ ] **Step 6: Commit** the workflow if it is not already on the default branch: `ci: deploy static app to GitHub Pages`

---

## Plan self-review

**Spec coverage**

| Spec area | Task |
|---|---|
| PWA, no login, localStorage, offline, static host | 1, 3, 14, 17 |
| Home / readiness / streak / buttons | 5, 9 |
| Practice Test 35 / 28, misses with cites | 4, 10 |
| Study by Topic (eight topics) | 11 |
| Review Mistakes, 3-in-a-row | 5, 12 |
| Getting My Permit checklist and accurate GDL hours | 13 |
| 200–250 original verified questions | 2, 6, 7 |
| Schema, scoring, SR, storage tests | 2–5, 16 |
| Licensing, MUTCD images, no Interstate shield | 6, 7, 14 |
| Disclaimer | 8, 16 |
| Accessibility | 11, 15 |
| Out of scope (accounts, parent view, timer) | Global Constraints — no tasks add them |

**Placeholder scan:** No TBD/TODO items. Stack is fixed as Vite + vanilla TypeScript + Vitest (not “React or vanilla”). Review mastery is 3, not “several.” Practice tests are untimed. GDL hours include both the 100-hour and 50-plus-driver-ed paths.

**Type consistency:** `TopicId`, `Question`, `PersistedState`, `ReviewItem`, `STORAGE_KEY`, `QUESTIONS_PER_TEST`, `CORRECT_TO_PASS`, `CONSECUTIVE_TO_MASTER`, and function names (`assemblePracticeTest`, `scoreAttempt`, `recordAnswer`, `queueItems`, `computeReadiness`, `applyActivity`, `loadQuestionBank`) are used the same way in later tasks as in earlier ones.
