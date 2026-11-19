# Oregon Permit Study App — Design Spec

- **Date:** 2026-11-19
- **Status:** Approved by Jake Perry
- **Related:** [Research brief](../../research.md), [Implementation plan](../plans/2026-11-19-oregon-permit-app-plan.md)
- **Official manual:** 2026–2027 Oregon Driver Manual, <https://www.oregon.gov/odot/forms/dmv/37.pdf>

This spec is the source of truth for v1. If a later idea conflicts with a rule here, change the spec first.

---

## 1. Purpose

Build a small, installable web app Jake can text to his daughter as a link, so she can study for the Oregon Class C instruction permit (learner's / provisional instruction permit) knowledge test.

The app must feel like the real test, teach Oregon-specific rules from the current manual, help her drill the questions she misses, and give the family a practical checklist for test day and the steps after the permit. It is a study aid only. It is not affiliated with Oregon DMV or ODOT and is not a legal source.

## 2. Users and context

- **Primary user:** Jake's daughter, a teen preparing for her first Oregon instruction permit knowledge test.
- **Secondary user:** Jake, who sends her the link and may glance at the app, but does **not** need a parent dashboard or remote access to her scores.
- **Devices:** Any modern phone, tablet, or desktop browser. A phone will be the most common study device, even though the official DMV2U knowledge test itself cannot be taken on a phone.
- **Constraints she will live with:** no account to create or forget, no paywall, usable with a flaky connection after the first load, progress that stays on the device she uses.

## 3. Product shape

An installable Progressive Web App (PWA):

- One static site, shared as a URL.
- No login, no server, no backend.
- Progress saved in `localStorage` on that browser/device.
- Works offline after the first successful load (app shell, question bank, and sign images cached).
- Hosted on free static hosting. **Recommended: GitHub Pages.** Cloudflare Pages or Netlify are acceptable alternatives.
- Add-to-home-screen support so it can sit on her phone like a regular app.

## 4. Out of scope for v1

- User accounts, passwords, email, or social sign-in.
- A parent view, cloud sync, or progress that follows her across devices.
- A backend, database, or analytics/telemetry.
- Copying the Oregon Driver Manual's wording, layout, photos, or PDF artwork.
- Copying questions from driving-tests.org, Zutobi, DMV Genie, or any other commercial bank.
- Using the Interstate shield or other FHWA-owned marks.
- Spanish or other languages (the official test offers several; v1 is English only).
- A countdown timer on the practice test. Official sources reviewed in the research brief do not state a time limit, so v1 practice tests are untimed.
- A per-topic passing cutoff on the 35-question practice test. Official scoring is 28 of 35 overall.
- Behind-the-wheel training, hour logging beyond a short checklist reminder, or scheduling a DMV appointment in-app.
- Paid features, ads, or an app-store listing.

Possible later (not in this build): a parent view, multi-device sync, a Spanish UI, or an optional study timer clearly labeled as unofficial.

## 5. Screens

There are five screens. Navigation is a persistent bottom or header nav on all of them, plus large home buttons. Each screen shows the unofficial-disclaimer footer in section 13.

### 5.1 Home

Shows:

- **Readiness score** (0–100), computed by the formula in section 8. Display the number and a short status label: “Just starting” (0–39), “Getting there” (40–69), “Almost ready” (70–84), “Test ready” (85–100). The label is coaching copy, not an official DMV rating.
- **Streak:** the number of consecutive local calendar days with at least one completed activity (a finished practice test, a finished topic quiz, or a review session with at least one answered question). See section 8.
- Three primary buttons: **Practice Test**, **Study by Topic**, **Review Mistakes**.
- A secondary button: **Getting My Permit**.
- If the review queue has items, a badge on Review Mistakes with the queue count.
- If a practice test is in progress (she refreshed mid-test), a “Continue test” prompt that resumes it, with an option to discard and start over.

### 5.2 Practice Test

Mirrors the official Class C knowledge test format:

- **35** unique multiple-choice questions, drawn at random from the verified bank, mixing signs and rules as specified in section 7.
- Passing score: **28** correct. The results screen says “You need 28 correct to pass” and reports `correct / 35`, plus Passed or Not yet.
- Questions are shown one at a time. She selects one answer and uses Next. She can go Back and change an earlier answer until she submits the test.
- No answer key, explanation, or manual cite is shown during the test.
- After she answers all 35, a Submit button scores the attempt.
- **Results:** overall score and pass/fail; then every missed question with (1) the prompt and sign if any, (2) her answer, (3) the correct answer, (4) a one-line original explanation, and (5) the manual section title and printed page, plus a link to the official PDF. A collapsed “Answered correctly” list is allowed but not required.
- Every missed question is added to or updated in the Review Mistakes queue (section 8).
- Starting a new test when one is in progress requires confirmation and discards the in-progress attempt.

### 5.3 Study by Topic

A list of these eight topics, in this order:

1. Signs
2. Speed limits
3. Right of way
4. Turns and lanes
5. Parking
6. Alcohol and phone laws
7. School buses
8. Teen / GDL rules

Each row shows the topic name, how many verified questions exist, and her topic accuracy (hidden or shown as “Not started” until she has answered at least five unique questions in that topic).

A topic quiz is **10** questions from that topic when 10 or more verified questions exist; otherwise it uses all verified questions in the topic. Questions already answered correctly in the current quiz are not reused in that quiz. Immediate feedback follows each answer: correct or incorrect, the right choice, the one-line explanation, and the manual section and page. Misses go to the Review Mistakes queue. At the end, show `correct / asked` for that quiz.

### 5.4 Review Mistakes

Spaced-repetition review of questions she has missed. Only queued items appear (section 8). If the queue is empty, show a short empty state and a button back to Home or Study by Topic.

A review session presents queued questions one at a time, highest priority first. After each answer, show immediate feedback in the same form as a topic quiz, then update the item’s consecutive-correct count. The session can end when the queue for today is exhausted or she taps Done. A session counts toward her streak if she answers at least one review question.

### 5.5 Getting My Permit

A persistent checklist she can tick on her device. Items are facts from official sources in [research.md](../../research.md). Wording in the UI must stay faithful to those facts and must not invent numbers. Group the list as follows.

**Before the test**

- I am at least **15** and an Oregon resident.
- I have studied the 2026–2027 Oregon Driver Manual (link the official PDF).
- I have (or can get) proof of identity and date of birth — original or certified copy, not a photocopy. A hospital birth certificate is not accepted. A U.S. birth certificate or a U.S. passport (valid or expired no more than five years) is a common option. Link the official identity brochure: <https://www.oregon.gov/odot/Forms/DMV/7318.pdf>.
- I have proof of current residence address (one document for a standard permit; two from different sources for REAL ID). A parent who lives at the same address may come with me and show their own address proof.
- I can provide my Social Security number, or I will certify that I have not been assigned one. I do not have to bring the card itself.
- A parent or legal guardian will sign at the DMV, or they will complete [Form 735-173DP](https://www.oregon.gov/odot/Forms/DMV/173DPfill.pdf). They will also certify school enrollment, or I will bring a diploma or GED.

**Fees (confirm on the official fee page before paying)**

- Knowledge test: **$7** each attempt, paid before the test, separate from the permit fee.
- Standard instruction permit: **$30**. REAL ID permit: **$60**.
- Vision test: no fee, given at the DMV office.
- Link: <https://www.oregon.gov/odot/dmv/pages/fees/driver.aspx> and <https://www.oregon.gov/odot/dmv/pages/online_quick_tips/driver_information.aspx>.

**Taking the knowledge test**

- I can take it online at any time through [DMV2U](https://dmv2u.oregon.gov), walk in for standby, or make an appointment. Offices stop giving the knowledge test one hour before closing.
- Online test rules: desktop or laptop with a keyboard, mouse, and working webcam — **no phones or tablets**. A photo is taken at the start and at random during the test. Closed book.
- If I am under 18, a proctor **21 or older** must register and watch me. The proctor does not have to be a parent, but must have a Social Security number, may supervise only **two** tests in 24 hours, and may not have proctored more than **five** DMV tests in the past 12 months.
- Testers and proctors need a valid SSN to register online. If I have no SSN, I test at a DMV office.
- Online retakes: at most **two** attempts in any 24-hour period, and at most **four** online attempts total; then I must test at a DMV office. Each attempt is $7.
- In a DMV office, I may be able to retest the same day if they have capacity. Cheating fails the test and means a **90-day** wait.
- The test is 35 questions; I need 28 correct. After I pass online, I still go to a DMV office for the vision test, documents, parent signature, photo, and issuance fee.

**Permit rules and what comes next**

- I may drive only with a licensed supervisor who is at least **21**, sitting beside me. Hours count toward a license only if that person has held a valid license for at least **three years**.
- Under 18 I may not use a phone or other mobile device while driving, including hands-free.
- The permit is valid **two years**. DMV does not send an expiration notice.
- To get a provisional license at 16 or 17 I must hold the permit at least **six months**, and complete **100 hours** of supervised driving, **or 50 hours** if I also pass an ODOT-approved driver education course (driver ed is optional; completing it within the past two years can also waive the drive test).
- After the provisional license: no phone use until 18; first six months, no passenger under 20 except immediate family, and no driving midnight–5:00 a.m. except listed exceptions; second six months, no more than three such passengers, same night rule. Those passenger and night limits end after one year or at age 18, whichever comes first.

**Progress reset**

A “Clear progress on this device” control, behind a confirm dialog, wipes scores, streak, review queue, in-progress tests, and checklist ticks stored under the app’s `localStorage` key. It does not affect the question bank.

## 6. Question data schema

The production bank is one or more JSON files loaded by the app at build time (bundled, so they work offline). Only questions with `"verified": true` are used in any quiz or test. Target size is **200–250** verified original questions before launch, with a minimum of **200**. Suggested distribution (adjust slightly if the manual is richer in one area, but keep every topic testable):

| Topic id | Label | Target count |
|---|---|---|
| `signs` | Signs | 50 |
| `speed-limits` | Speed limits | 30 |
| `right-of-way` | Right of way | 30 |
| `turns-and-lanes` | Turns and lanes | 35 |
| `parking` | Parking | 25 |
| `alcohol-and-phone` | Alcohol and phone laws | 25 |
| `school-buses` | School buses | 20 |
| `teen-gdl` | Teen / GDL rules | 25 |

**JSON Schema (draft 2020-12) and TypeScript shape must match.**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://local.oregon-permit-app/questions.schema.json",
  "title": "OregonPermitQuestionBank",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "manualEdition", "manualUrl", "questions"],
  "properties": {
    "version": { "type": "integer", "minimum": 1 },
    "manualEdition": { "const": "2026-2027" },
    "manualUrl": { "const": "https://www.oregon.gov/odot/forms/dmv/37.pdf" },
    "questions": {
      "type": "array",
      "minItems": 200,
      "items": { "$ref": "#/$defs/question" }
    }
  },
  "$defs": {
    "topicId": {
      "enum": [
        "signs",
        "speed-limits",
        "right-of-way",
        "turns-and-lanes",
        "parking",
        "alcohol-and-phone",
        "school-buses",
        "teen-gdl"
      ]
    },
    "question": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "topic",
        "prompt",
        "choices",
        "correctIndex",
        "explanation",
        "manual",
        "verified"
      ],
      "properties": {
        "id": { "type": "string", "pattern": "^q-[a-z0-9-]+-[0-9]{3}$" },
        "topic": { "$ref": "#/$defs/topicId" },
        "prompt": { "type": "string", "minLength": 8, "maxLength": 400 },
        "choices": {
          "type": "array",
          "minItems": 3,
          "maxItems": 4,
          "items": { "type": "string", "minLength": 1, "maxLength": 220 }
        },
        "correctIndex": { "type": "integer", "minimum": 0, "maximum": 3 },
        "explanation": { "type": "string", "minLength": 8, "maxLength": 240 },
        "manual": {
          "type": "object",
          "additionalProperties": false,
          "required": ["edition", "section", "page", "url"],
          "properties": {
            "edition": { "const": "2026-2027" },
            "section": { "type": "string", "minLength": 3 },
            "page": { "type": "integer", "minimum": 1, "maximum": 96 },
            "url": { "const": "https://www.oregon.gov/odot/forms/dmv/37.pdf" }
          }
        },
        "signImage": {
          "type": "object",
          "additionalProperties": false,
          "required": ["src", "alt", "source", "attribution"],
          "properties": {
            "src": { "type": "string", "pattern": "^/signs/.+\\.(svg|png)$" },
            "alt": { "type": "string", "minLength": 3, "maxLength": 160 },
            "source": { "enum": ["fhwa-shs", "wikimedia-pd-usgov-mutcd"] },
            "attribution": { "type": "string", "minLength": 8 },
            "mutcdCode": { "type": "string" }
          }
        },
        "verified": { "type": "boolean" },
        "verifiedAgainst": { "type": "string" }
      }
    }
  }
}
```

Invariant the loader must enforce even if schema validation already ran: `correctIndex < choices.length`. IDs are unique. `verified` questions that fail this check are excluded and reported as a build or boot error in development.

Example item (illustrative wording; the authoring pass must still verify the page cite against the PDF):

```json
{
  "id": "q-speed-limits-001",
  "topic": "speed-limits",
  "prompt": "Unless a different speed is posted, what is the speed limit in an Oregon business district?",
  "choices": ["15 mph", "20 mph", "25 mph", "55 mph"],
  "correctIndex": 1,
  "explanation": "The statutory limit in any business district is 20 mph unless a different speed is posted.",
  "manual": {
    "edition": "2026-2027",
    "section": "Speed Regulations",
    "page": 19,
    "url": "https://www.oregon.gov/odot/forms/dmv/37.pdf"
  },
  "verified": true,
  "verifiedAgainst": "Oregon Driver Manual 2026-2027, printed page 19"
}
```

Content rules for each question are in section 12.

## 7. Practice-test assembly

When she starts a Practice Test, build a set of **35 unique verified** questions:

1. Take at least **8** from `signs`.
2. Take at least **2** from each of the other seven topics (14 more).
3. Fill the remaining **13** at random from whatever verified questions are left, any topic.
4. If a topic does not have enough remaining items (should not happen in a 200+ bank), relax that topic’s minimum, fill from the global remainder, and still ship 35 unique questions. Log a development warning.
5. Shuffle the 35 questions. At render time, shuffle each question’s choice order and remap `correctIndex` for that attempt only. Stored review items keep the canonical bank order; shuffling is display-only.

Official scoring has no per-section minimum. Do not invent one. A test can be passed with a weak signs run if the overall score is at least 28.

## 8. Scoring, spaced repetition, readiness, and streak

### 8.1 Practice-test scoring

- Score = number of questions whose selected choice index (after unshuffling to the canonical bank) matches `correctIndex`.
- Passed if `score >= 28`. Otherwise not passed.
- An unanswered question is wrong. The UI should not allow Submit until all 35 have a selected answer, so this case is a safety net only.

### 8.2 Spaced repetition (Review Mistakes)

Goal, from the approved design: missed questions keep coming back until she answers them correctly **several times in a row**.

Concrete rule for v1:

- `CONSECUTIVE_TO_MASTER = 3`.
- The first time she misses a question in a practice test or topic quiz, it enters the review queue with `consecutiveCorrect: 0`, `timesMissed: 1`, `lastMissedAt` and `lastSeenAt` set to now (ISO-8601).
- Each later miss on that question increments `timesMissed`, sets `consecutiveCorrect` back to **0**, and updates the timestamps.
- Each correct review-queue answer increments `consecutiveCorrect` and updates `lastSeenAt`. A correct answer on a practice test or topic quiz also increments `consecutiveCorrect` for an item already in the queue (the knowledge was retrieved, so it counts).
- When `consecutiveCorrect` reaches **3**, the item leaves the queue (`masteredAt` set). It is no longer shown in Review Mistakes.
- If she later misses a mastered question, it re-enters the queue with `consecutiveCorrect: 0`.
- **Session order:** items with the lowest `consecutiveCorrect` first, then the oldest `lastSeenAt` (nulls first), then `id` ascending. This is a simple spaced loop: newly missed and shaky items return sooner; items she is getting right wait behind them until they also reach three in a row.
- Review does not introduce brand-new questions she has never missed.

This is intentionally simpler than a full SM-2 scheduler. Do not add ease factors or calendar intervals in v1.

### 8.3 Readiness score (0–100, integer)

```
readiness = round(0.45 * topicAverage + 0.45 * latestPracticePercent + 0.10 * reviewHealth)
```

- **topicAverage:** mean of eight topic accuracies. A topic accuracy is `uniqueCorrect / uniqueAttempted` as a percent, using distinct question ids in that topic across all finished practice tests and topic quizzes (latest result per question id wins). If a topic has fewer than **5** unique attempted questions, that topic contributes **0**.
- **latestPracticePercent:** `(score / 35) * 100` for the most recently completed practice test, or **0** if she has not finished one.
- **reviewHealth:** if she has never missed a question, **100**. Otherwise, `100 * masteredEver / everMissed`, where `everMissed` is the number of distinct question ids she has missed at least once, and `masteredEver` is how many of those currently have `consecutiveCorrect >= 3` or a `masteredAt` and are not re-queued.

Clamp the result to 0–100. This formula is part of the product contract; tests must lock it down.

### 8.4 Streak

- Store `streakCount` (integer) and `lastActivityDate` as a `YYYY-MM-DD` string in the device’s **local** timezone.
- An “activity day” is a local date on which she completed at least one practice test, one topic quiz, or a review session with at least one answered question. Opening the app, ticking the checklist, or abandoning a test does not count.
- If she is active today and `lastActivityDate` is yesterday, increment `streakCount` and set `lastActivityDate` to today.
- If she is active today and `lastActivityDate` is today, leave `streakCount` unchanged.
- If she is active today and `lastActivityDate` is before yesterday, or it is missing, set `streakCount` to 1 and `lastActivityDate` to today.
- On Home render, if `lastActivityDate` is before yesterday, display the streak as 0 (the stored count may be left as-is until the next activity, which will reset it to 1). Do not use UTC dates for this calculation.

## 9. Storage

All durable client state lives in a single `localStorage` key: `or-permit-v1`. The value is a JSON object. If parsing fails or `version` is unsupported, start from a fresh default state and do not crash. v1 does not need a multi-version migration beyond rejecting unknown future versions and filling missing fields with defaults.

```ts
type PersistedState = {
  version: 1;
  streakCount: number;
  lastActivityDate: string | null; // YYYY-MM-DD local
  checklist: Record<string, boolean>;
  inProgressTest: PracticeTestAttempt | null;
  attempts: FinishedAttempt[];
  topicQuizHistory: FinishedTopicQuiz[];
  review: Record<string, ReviewItem>;
};

type ReviewItem = {
  questionId: string;
  consecutiveCorrect: number;
  timesMissed: number;
  lastMissedAt: string | null;
  lastSeenAt: string | null;
  masteredAt: string | null;
};
```

Do not store PII. Do not write answers or scores anywhere except `localStorage` on that device. “Clear progress on this device” removes this key (or resets it to defaults) and leaves the bundled question bank untouched.

## 10. Offline and installability

- Provide a Web App Manifest (`name`, `short_name`, `start_url`, `display: standalone`, theme and background colors, at least 192 and 512 PNG icons).
- Provide a service worker that precaches the app shell, JS/CSS, the question JSON, and all bundled sign images. After a successful first visit, a later visit with no network must still open Home and run tests from the cache.
- A later deploy should update the cache on the next online visit without bricking an offline session already in progress.
- No runtime network calls are required for v1 features. Do not fetch the DMV site from the app; official links simply open in the browser when she is online.
- Document Add to Home Screen briefly on Home the first time (dismissible): iOS Safari Share → Add to Home Screen; Android Chrome menu → Install or Add to Home Screen.

## 11. Accessibility and UI quality

- Target WCAG 2.2 AA where practical: visible focus, 4.5:1 text contrast, keyboard access to every control, semantic headings, form labels, and `aria-live` for score and feedback messages.
- Touch targets at least 44×44 px. Layout works at a 320 px wide viewport and on desktop.
- Honor `prefers-reduced-motion`.
- Sign images need `alt` text. For a question that asks her to identify a sign, the alt text must describe the shape and colors without naming the sign (for example, “A red octagonal road sign with white markings”), so a screen-reader user is not handed the answer. After the answer is revealed, the alt or an adjacent text may use the official name. For questions that already name the sign in the prompt, the alt may use the official name.
- Do not rely on color alone for correct/incorrect.
- The app is English, in a friendly teen-appropriate tone, without slang that muddies a legal rule.

## 12. Content and licensing rules

These are ship blockers.

- Every question is **original wording**, written from facts in the 2026–2027 Oregon Driver Manual and the official pages cited in [research.md](../../research.md). Do not quote substantial manual sentences. Do not copy commercial question banks, and do not paste DMV’s 20 official sample questions into the bank (they may be used only as a private quality check during authoring).
- Every Oregon-specific number (speeds, distances, hours, fees, BAC, ages, time windows) must be verified against the 2026–2027 PDF or the official DMV page listed in the research brief, and recorded in `manual.page` / `manual.section` / `verifiedAgainst`. If a fact cannot be confirmed, do not write a question about it.
- Explanations are one sentence, original, and include no invented numbers.
- Sign artwork must come from public-domain MUTCD sources only: FHWA Standard Highway Signs (SVG preferred) or Wikimedia Commons files tagged PD-USGov-MUTCD. Record `source`, `attribution`, and `mutcdCode` when known. **Do not use the Interstate shield or other FHWA-owned marks.** Do not rip images out of the Oregon PDF.
- Keep a short `docs/content/SIGN_SOURCES.md` (created during the plan’s authoring tasks) listing each bundled sign file and its source URL.
- Fees and DMV process on the checklist must match official pages and should tell her to re-check the fee page, because fees can change.

## 13. Disclaimer and official links

Every screen’s footer includes this disclaimer, verbatim:

> This is an unofficial study aid. It is not affiliated with the Oregon DMV or ODOT and is not a legal source. Official rules are in the 2026–2027 Oregon Driver Manual and at OregonDMV.com.

Also link the official manual PDF and, on the checklist, DMV2U and the under-18 permit page: <https://www.oregon.gov/odot/dmv/teen/pages/permit.aspx>.

## 14. Testing requirements

Automated tests (Vitest) must cover:

- JSON schema / loader invariants (unique ids, `correctIndex` bounds, only `verified: true` in production selections, target topic ids).
- Practice-test assembly (35 unique, minimums, fallback if a topic is short).
- Scoring (28-to-pass, unshuffling choices).
- Review-queue updates (enter on miss, reset on miss, master at 3, re-enter after a later miss, priority order).
- Readiness formula and streak date logic, including timezone-local calendar dates and mid-streak breaks.
- `localStorage` read/write, corrupt JSON recovery, and clear-progress.

Manual checks before deploy: phone and desktop layouts, install/offline path, keyboard pass, sign-image alts on a signs question, checklist links, and a fact-verification sample of at least 40 questions plus every Oregon-specific number in the bank (see the plan).

## 15. Hosting and delivery

- Build is a static `dist/` folder.
- Recommended host: GitHub Pages, deployed from CI on the default branch, with Vite `base` set to the repository subpath if the site is not at the domain root.
- Jake delivers the app by sending his daughter the live HTTPS URL. No account is required to open it.

## 16. Spec self-review

Reviewed against the approved design and [research.md](../../research.md):

- No TBD / TODO placeholders remain. Practice tests are **untimed** because official sources do not confirm a time limit (this drops an earlier informal “timed test” idea so the app does not invent a rule).
- The checklist uses the accurate GDL rule (**100 hours**, or **50 hours plus ODOT-approved driver ed**, and **six months** with the permit), not a shortened “50 hours + 6 months” that would leave out the no-driver-ed path.
- Readiness, streak, review mastery (3 in a row), test mix, and storage are defined with testable numbers and no competing formulas.
- Topic list, screen set, 35/28 scoring, localStorage-only progress, PWA/offline, free static hosting, original question bank, and MUTCD image rules match the approved design.
- Out of scope (accounts, parent view, commercial banks, Interstate shield) is explicit.
- One deliberate product choice: Study by Topic and Review give immediate feedback; Practice Test waits until the end, like the official test.

If implementation needs a behavior that is not in this document, update this spec in the same change as the code.
