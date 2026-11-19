import type { PersistedState, Question } from "../types.ts";
import { el } from "../dom.ts";
import { shuffleChoices, type ShuffledQuestion } from "../lib/quiz.ts";
import { queueItems } from "../lib/spaced-repetition.ts";
import { renderQuestionCard } from "../components/question-card.ts";

type ReviewSession = {
  items: ShuffledQuestion[];
  index: number;
  selected: number | null;
  revealed: boolean;
  answered: number;
};

let session: ReviewSession | null = null;
let sessionQueueKey = "";

export function resetReviewView(): void {
  session = null;
  sessionQueueKey = "";
}

export type ReviewHandlers = {
  recordQuestion: (questionId: string, correct: boolean) => void;
  finishIfNeeded: (answered: number) => void;
};

export function renderReview(state: PersistedState, questions: Question[], handlers: ReviewHandlers): HTMLElement {
  const queue = queueItems(state.review, questions);
  const key = queue.map((q) => q.id).join("|");
  if (!session || (sessionQueueKey !== key && !session.revealed && session.selected === null && session.answered === 0)) {
    session = {
      items: queue.map((question) => shuffleChoices(question)),
      index: 0,
      selected: null,
      revealed: false,
      answered: 0
    };
    sessionQueueKey = key;
  }

  const root = el("div", { class: "screen screen-review" });
  root.append(el("h1", {}, "Review Mistakes"));

  if (queue.length === 0 && (!session || session.items.length === 0 || (session.index >= session.items.length && !session.revealed))) {
    root.append(el("p", { class: "lede" }, "You have no missed questions waiting for review. Take a practice test or a topic quiz, then come back to drill anything you miss."));
    root.append(
      el(
        "div",
        { class: "btn-row" },
        el("a", { class: "btn btn-secondary", href: "#/" }, "Home"),
        el("a", { class: "btn btn-primary", href: "#/study" }, "Study by Topic")
      )
    );
    return root;
  }

  if (!session || session.index >= session.items.length) {
    root.append(
      el(
        "div",
        { class: "score-banner", role: "status", "aria-live": "polite" },
        el("p", {}, session && session.answered > 0 ? "You finished this review session." : "You are caught up for now.")
      )
    );
    root.append(el("a", { class: "btn btn-primary", href: "#/" }, "Home"));
    return root;
  }

  const current = session.items[session.index];
  const remaining = session.items.length - session.index;
  root.append(el("p", { class: "progress-label" }, `${remaining} left in this session`));
  root.append(
    renderQuestionCard({
      question: current.question,
      choiceOrder: current.choiceOrder,
      selectedVisibleIndex: session.selected,
      mode: "study",
      revealed: session.revealed,
      name: "review",
      onSelect: (visibleIndex) => {
        if (!session || session.revealed) return;
        const canonical = current.choiceOrder[visibleIndex];
        const correct = canonical === current.question.correctIndex;
        session.selected = visibleIndex;
        session.revealed = true;
        session.answered += 1;
        handlers.recordQuestion(current.question.id, correct);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    })
  );

  const actions = el("div", { class: "btn-row" });
  if (session.revealed) {
    actions.append(
      el(
        "button",
        {
          type: "button",
          class: "btn btn-primary",
          onclick: () => {
            if (!session) return;
            session.index += 1;
            session.selected = null;
            session.revealed = false;
            if (session.index >= session.items.length) {
              handlers.finishIfNeeded(session.answered);
            }
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }
        },
        "Next"
      )
    );
  }
  actions.append(
    el(
      "button",
      {
        type: "button",
        class: "btn btn-secondary",
        onclick: () => {
          if (session) handlers.finishIfNeeded(session.answered);
          location.hash = "#/";
        }
      },
      "Done"
    )
  );
  root.append(actions);
  return root;
}
