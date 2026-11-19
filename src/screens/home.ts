import type { PersistedState, Question } from "../types.ts";
import { el } from "../dom.ts";
import { computeReadiness } from "../lib/readiness.ts";
import { displayedStreak } from "../lib/streak.ts";
import { queueItems } from "../lib/spaced-repetition.ts";

function readinessLabel(score: number): string {
  if (score <= 39) return "Just starting";
  if (score <= 69) return "Getting there";
  if (score <= 84) return "Almost ready";
  return "Test ready";
}

export type HomeHandlers = {
  dismissInstallHint: () => void;
  discardInProgress: () => void;
};

export function renderHome(state: PersistedState, questions: Question[], handlers: HomeHandlers): HTMLElement {
  const readiness = computeReadiness(state, questions);
  const streak = displayedStreak(state);
  const reviewCount = queueItems(state.review, questions).length;
  const root = el("div", { class: "screen screen-home" });
  root.append(el("h1", {}, "Oregon Permit Study"));
  root.append(
    el(
      "p",
      { class: "lede" },
      "An unofficial practice app for Oregon’s instruction permit knowledge test: 35 questions, 28 to pass."
    )
  );

  const score = el(
    "section",
    { class: "readiness-card", "aria-labelledby": "readiness-heading" },
    el("h2", { id: "readiness-heading", class: "visually-hidden" }, "Readiness"),
    el("p", { class: "readiness-number", "aria-live": "polite" }, `${readiness}`),
    el("p", { class: "readiness-label" }, readinessLabel(readiness)),
    el("p", { class: "streak" }, streak === 1 ? "1-day streak" : `${streak}-day streak`)
  );
  root.append(score);

  if (state.inProgressTest) {
    const answered = state.inProgressTest.questions.filter((q) => q.selectedVisibleIndex !== null).length;
    root.append(
      el(
        "aside",
        { class: "continue-card" },
        el("p", {}, `You have a practice test in progress (${answered} of ${state.inProgressTest.questions.length} answered).`),
        el(
          "div",
          { class: "btn-row" },
          el("a", { class: "btn btn-primary", href: "#/practice" }, "Continue test"),
          el("button", { type: "button", class: "btn btn-secondary", onclick: handlers.discardInProgress }, "Discard and start over")
        )
      )
    );
  }

  const reviewLabel = reviewCount > 0 ? `Review Mistakes (${reviewCount})` : "Review Mistakes";
  root.append(
    el(
      "nav",
      { class: "home-actions", "aria-label": "Study actions" },
      el("a", { class: "btn btn-primary btn-block", href: "#/practice" }, "Practice Test"),
      el("a", { class: "btn btn-primary btn-block", href: "#/study" }, "Study by Topic"),
      el("a", { class: "btn btn-primary btn-block", href: "#/review" }, reviewLabel),
      el("a", { class: "btn btn-secondary btn-block", href: "#/permit" }, "Getting My Permit")
    )
  );

  if (!state.installHintDismissed) {
    root.append(
      el(
        "aside",
        { class: "install-hint", "aria-label": "Add to Home Screen" },
        el(
          "p",
          {},
          "Add this app to your home screen for quicker access and offline study. On iPhone, open Safari’s Share menu and choose Add to Home Screen. On Android, use Chrome’s menu and choose Install or Add to Home Screen."
        ),
        el("button", { type: "button", class: "btn btn-text", onclick: handlers.dismissInstallHint }, "Got it")
      )
    );
  }

  return root;
}
