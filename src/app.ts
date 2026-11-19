import type { PersistedState, PracticeTestAnswer, Question, TopicId } from "./types.ts";
import { el } from "./dom.ts";
import { hashFor, parseHash, screenTitle, type Route } from "./router.ts";
import { clearProgress, loadState, saveState } from "./lib/storage.ts";
import { recordAnswer } from "./lib/spaced-repetition.ts";
import { applyActivity } from "./lib/streak.ts";
import { scoreAttempt } from "./lib/scoring.ts";
import { renderFooter } from "./components/footer.ts";
import { renderHome } from "./screens/home.ts";
import { renderPracticeTest, resetPracticeView, setPracticeResults } from "./screens/practice-test.ts";
import type { ResultRow } from "./components/results-list.ts";
import { renderStudyTopic, resetStudyView } from "./screens/study-topic.ts";
import { renderReview, resetReviewView } from "./screens/review.ts";
import { renderChecklist } from "./screens/checklist.ts";

export type AppOptions = {
  questions: Question[];
  storage?: Storage;
};

export function startApp(root: HTMLElement, options: AppOptions): void {
  const storage = options.storage ?? localStorage;
  const questions = options.questions;
  let state: PersistedState = loadState(storage);
  let lastRouteName: Route["name"] | null = null;

  const persist = (next: PersistedState): void => {
    state = next;
    saveState(state, storage);
    render();
  };

  const nowIso = (): string => new Date().toISOString();

  function render(): void {
    const route = parseHash(location.hash);
    if (lastRouteName && lastRouteName !== route.name) {
      if (route.name !== "practice") resetPracticeView();
      if (route.name !== "study" && route.name !== "study-topic") resetStudyView();
      if (route.name !== "review") resetReviewView();
    }
    lastRouteName = route.name;

    root.replaceChildren();
    const shell = el("div", { class: "app-shell" });
    shell.append(renderNav(route));
    const main = el("main", { id: "main", tabindex: "-1" });
    main.append(renderScreen(route));
    shell.append(main);
    shell.append(renderFooter());
    root.append(shell);
    document.title = `${screenTitle(route)} · Oregon Permit Study`;
  }

  function renderNav(route: Route): HTMLElement {
    const items: Array<{ href: string; label: string; current: boolean }> = [
      { href: "#/", label: "Home", current: route.name === "home" },
      { href: "#/practice", label: "Test", current: route.name === "practice" },
      { href: "#/study", label: "Study", current: route.name === "study" || route.name === "study-topic" },
      { href: "#/review", label: "Review", current: route.name === "review" },
      { href: "#/permit", label: "Permit", current: route.name === "permit" }
    ];
    const nav = el("nav", { class: "app-nav", "aria-label": "Primary" });
    for (const item of items) {
      nav.append(
        el(
          "a",
          { href: item.href, class: item.current ? "nav-link is-current" : "nav-link", "aria-current": item.current ? "page" : undefined },
          item.label
        )
      );
    }
    return nav;
  }

  function renderScreen(route: Route): HTMLElement {
    switch (route.name) {
      case "home":
        return renderHome(state, questions, {
          dismissInstallHint: () => persist({ ...state, installHintDismissed: true }),
          discardInProgress: () => {
            if (!window.confirm("Discard the practice test in progress and lose those answers?")) return;
            resetPracticeView();
            persist({ ...state, inProgressTest: null });
          }
        });
      case "practice":
        return renderPracticeTest(state, questions, {
          persist: (answers, startedAt) =>
            persist({ ...state, inProgressTest: { startedAt, questions: answers } }),
          startNew: (answers, startedAt) => {
            if (state.inProgressTest && !window.confirm("Start a new test and discard the one in progress?")) {
              return;
            }
            resetPracticeView();
            persist({ ...state, inProgressTest: { startedAt, questions: answers } });
          },
          submit: (rows: ResultRow[]) => {
            const scored = scoreAttempt(rows);
            let review = state.review;
            const iso = nowIso();
            for (const row of rows) {
              const selected = row.selectedVisibleIndex;
              const canonical = selected === null ? null : row.choiceOrder[selected];
              const correct = canonical === row.question.correctIndex;
              review = recordAnswer(review, row.question.id, correct, iso);
            }
            const answers: PracticeTestAnswer[] = rows.map((row) => ({
              questionId: row.question.id,
              choiceOrder: row.choiceOrder,
              selectedVisibleIndex: row.selectedVisibleIndex
            }));
            const finished = {
              finishedAt: iso,
              correct: scored.correct,
              passed: scored.passed,
              answers
            };
            state = applyActivity({
              ...state,
              review,
              attempts: [...state.attempts, finished],
              inProgressTest: null
            });
            saveState(state, storage);
            setPracticeResults(rows, scored.correct, scored.passed);
            return scored;
          },
          requestDiscard: () => window.confirm("Start a new test and discard the one in progress?")
        });
      case "study":
        return renderStudyTopic(state, questions, null, studyHandlers());
      case "study-topic":
        return renderStudyTopic(state, questions, route.topic, studyHandlers());
      case "review":
        return renderReview(state, questions, {
          recordQuestion: (questionId, correct) => {
            const review = recordAnswer(state.review, questionId, correct, nowIso());
            persist(applyActivity({ ...state, review }));
          },
          finishIfNeeded: (answered) => {
            if (answered > 0) persist(applyActivity(state));
          }
        });
      case "permit":
        return renderChecklist(state, {
          toggleItem: (id, checked) =>
            persist({ ...state, checklist: { ...state.checklist, [id]: checked } }),
          clearProgress: () => {
            resetPracticeView();
            resetStudyView();
            resetReviewView();
            clearProgress(storage);
            persist(loadState(storage));
          }
        });
    }
  }

  function studyHandlers() {
    return {
      recordQuestion: (questionId: string, correct: boolean) => {
        const review = recordAnswer(state.review, questionId, correct, nowIso());
        persist({ ...state, review });
      },
      finishQuiz: (topic: TopicId, questionIds: string[], correctIds: string[]) => {
        const history = [
          ...state.topicQuizHistory,
          { finishedAt: nowIso(), topic, questionIds, correctIds }
        ];
        persist(applyActivity({ ...state, topicQuizHistory: history }));
      }
    };
  }

  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = hashFor({ name: "home" });
  render();
}
