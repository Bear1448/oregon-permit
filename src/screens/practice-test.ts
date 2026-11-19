import {
  CORRECT_TO_PASS,
  QUESTIONS_PER_TEST,
  type PersistedState,
  type PracticeTestAnswer,
  type Question
} from "../types.ts";
import { el } from "../dom.ts";
import { assemblePracticeTest, shuffleChoices } from "../lib/quiz.ts";
import { renderQuestionCard } from "../components/question-card.ts";
import { renderResultsList, type ResultRow } from "../components/results-list.ts";

let currentIndex = 0;
let lastResults: { rows: ResultRow[]; correct: number; passed: boolean } | null = null;
let resumeApplied = false;

export function resetPracticeView(): void {
  currentIndex = 0;
  lastResults = null;
  resumeApplied = false;
}

export function setPracticeResults(rows: ResultRow[], correct: number, passed: boolean): void {
  lastResults = { rows, correct, passed };
  resumeApplied = false;
}

export type PracticeHandlers = {
  persist: (answers: PracticeTestAnswer[], startedAt: string) => void;
  startNew: (answers: PracticeTestAnswer[], startedAt: string) => void;
  submit: (rows: ResultRow[]) => { correct: number; passed: boolean };
  requestDiscard: () => boolean;
};

function lookup(questions: Question[]): Map<string, Question> {
  return new Map(questions.map((q) => [q.id, q]));
}

function firstUnanswered(answers: PracticeTestAnswer[]): number {
  const idx = answers.findIndex((a) => a.selectedVisibleIndex === null);
  return idx === -1 ? Math.max(0, answers.length - 1) : idx;
}

export function renderPracticeTest(
  state: PersistedState,
  questions: Question[],
  handlers: PracticeHandlers
): HTMLElement {
  const root = el("div", { class: "screen screen-practice" });

  if (lastResults) {
    root.append(el("h1", {}, "Practice Test results"));
    const status = lastResults.passed ? "Passed" : "Not yet";
    root.append(
      el(
        "div",
        { class: lastResults.passed ? "score-banner pass" : "score-banner fail", role: "status", "aria-live": "polite" },
        el("p", { class: "score-line" }, `${lastResults.correct} / ${QUESTIONS_PER_TEST} correct — ${status}`),
        el("p", {}, "You need 28 correct to pass.")
      )
    );
    root.append(el("h2", {}, "Questions to review"));
    root.append(renderResultsList(lastResults.rows, true));
    root.append(
      el(
        "div",
        { class: "btn-row" },
        el("a", { class: "btn btn-secondary", href: "#/" }, "Home"),
        el(
          "button",
          {
            type: "button",
            class: "btn btn-primary",
            onclick: () => {
              if (state.inProgressTest && !handlers.requestDiscard()) return;
              beginTest(questions, handlers);
            }
          },
          "Take another test"
        )
      )
    );
    return root;
  }

  const inProgress = state.inProgressTest;
  if (!inProgress) {
    root.append(el("h1", {}, "Practice Test"));
    root.append(
      el(
        "p",
        { class: "lede" },
        `This works like the official Class C knowledge test: ${QUESTIONS_PER_TEST} questions, ${CORRECT_TO_PASS} correct to pass. There is no timer. You will not see answers until you submit.`
      )
    );
    root.append(
      el(
        "button",
        {
          type: "button",
          class: "btn btn-primary btn-block",
          onclick: () => beginTest(questions, handlers)
        },
        "Start practice test"
      )
    );
    return root;
  }

  if (!resumeApplied) {
    currentIndex = firstUnanswered(inProgress.questions);
    resumeApplied = true;
  }
  currentIndex = Math.min(currentIndex, inProgress.questions.length - 1);

  const byId = lookup(questions);
  const current = inProgress.questions[currentIndex];
  const question = byId.get(current.questionId);
  if (!question) {
    root.append(el("h1", {}, "Practice Test"));
    root.append(el("p", {}, "This saved test refers to a question that is no longer in the bank. Please start a new test."));
    root.append(
      el("button", { type: "button", class: "btn btn-primary", onclick: () => beginTest(questions, handlers) }, "Start a new test")
    );
    return root;
  }

  const allAnswered = inProgress.questions.every((q) => q.selectedVisibleIndex !== null);
  root.append(el("h1", {}, "Practice Test"));
  root.append(el("p", { class: "progress-label" }, `Question ${currentIndex + 1} of ${inProgress.questions.length}`));
  root.append(
    renderQuestionCard({
      question,
      choiceOrder: current.choiceOrder,
      selectedVisibleIndex: current.selectedVisibleIndex,
      mode: "exam",
      revealed: false,
      name: "practice",
      onSelect: (visibleIndex) => {
        const nextAnswers = inProgress.questions.map((answer, index) =>
          index === currentIndex ? { ...answer, selectedVisibleIndex: visibleIndex } : answer
        );
        handlers.persist(nextAnswers, inProgress.startedAt);
      }
    })
  );

  const nav = el("div", { class: "btn-row test-nav" });
  const back = el(
    "button",
    {
      type: "button",
      class: "btn btn-secondary",
      disabled: currentIndex === 0,
      onclick: () => {
        currentIndex = Math.max(0, currentIndex - 1);
        handlers.persist(inProgress.questions, inProgress.startedAt);
      }
    },
    "Back"
  );
  nav.append(back);
  if (currentIndex < inProgress.questions.length - 1) {
    nav.append(
      el(
        "button",
        {
          type: "button",
          class: "btn btn-primary",
          onclick: () => {
            currentIndex += 1;
            handlers.persist(inProgress.questions, inProgress.startedAt);
          }
        },
        "Next"
      )
    );
  }
  if (allAnswered) {
    nav.append(
      el(
        "button",
        {
          type: "button",
          class: "btn btn-primary",
          onclick: () => {
            const rows: ResultRow[] = inProgress.questions.map((answer) => {
              const q = byId.get(answer.questionId);
              if (!q) throw new Error(`Missing question ${answer.questionId}`);
              return {
                question: q,
                choiceOrder: answer.choiceOrder,
                selectedVisibleIndex: answer.selectedVisibleIndex
              };
            });
            const scored = handlers.submit(rows);
            setPracticeResults(rows, scored.correct, scored.passed);
          }
        },
        "Submit test"
      )
    );
  } else if (currentIndex === inProgress.questions.length - 1) {
    nav.append(el("p", { class: "hint" }, "Answer every question before you can submit."));
  }
  root.append(nav);
  return root;
}

function beginTest(questions: Question[], handlers: PracticeHandlers): void {
  const selected = assemblePracticeTest(questions);
  const answers: PracticeTestAnswer[] = selected.map((question) => ({
    questionId: question.id,
    choiceOrder: shuffleChoices(question).choiceOrder,
    selectedVisibleIndex: null
  }));
  currentIndex = 0;
  lastResults = null;
  resumeApplied = true;
  handlers.startNew(answers, new Date().toISOString());
}
