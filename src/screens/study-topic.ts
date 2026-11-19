import type { PersistedState, Question, TopicId } from "../types.ts";
import { TOPICS } from "../types.ts";
import { TOPIC_LABELS } from "../topics.ts";
import { el } from "../dom.ts";
import { shuffleChoices, type ShuffledQuestion } from "../lib/quiz.ts";
import { topicStat } from "../lib/stats.ts";
import { renderQuestionCard } from "../components/question-card.ts";

const TOPIC_QUIZ_SIZE = 10;

type TopicSession = {
  topic: TopicId;
  items: ShuffledQuestion[];
  index: number;
  selected: number | null;
  revealed: boolean;
  correctIds: string[];
  askedIds: string[];
  done: boolean;
};

let session: TopicSession | null = null;

export function resetStudyView(): void {
  session = null;
}

export type StudyHandlers = {
  recordQuestion: (questionId: string, correct: boolean) => void;
  finishQuiz: (topic: TopicId, questionIds: string[], correctIds: string[]) => void;
};

function pickQuiz(questions: Question[], topic: TopicId): ShuffledQuestion[] {
  const pool = questions.filter((q) => q.topic === topic && q.verified);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOPIC_QUIZ_SIZE).map((question) => shuffleChoices(question));
}

export function renderStudyTopic(
  state: PersistedState,
  questions: Question[],
  topic: TopicId | null,
  handlers: StudyHandlers
): HTMLElement {
  if (!topic) return renderTopicIndex(state, questions);
  return renderTopicQuiz(questions, topic, handlers);
}

function renderTopicIndex(state: PersistedState, questions: Question[]): HTMLElement {
  const root = el("div", { class: "screen screen-study" });
  root.append(el("h1", {}, "Study by Topic"));
  root.append(el("p", { class: "lede" }, "Short quizzes with immediate feedback. Accuracy appears after you have answered at least five different questions in a topic."));
  const list = el("ul", { class: "topic-list" });
  for (const topic of TOPICS) {
    const count = questions.filter((q) => q.topic === topic && q.verified).length;
    const stat = topicStat(state, questions, topic);
    const accuracy = stat.percent === null ? "Not started" : `${stat.percent}% accuracy`;
    list.append(
      el(
        "li",
        {},
        el(
          "a",
          { class: "topic-row", href: `#/study/${topic}` },
          el("span", { class: "topic-name" }, TOPIC_LABELS[topic]),
          el("span", { class: "topic-meta" }, `${count} questions · ${accuracy}`)
        )
      )
    );
  }
  root.append(list);
  return root;
}

function renderTopicQuiz(questions: Question[], topic: TopicId, handlers: StudyHandlers): HTMLElement {
  if (!session || session.topic !== topic) {
    const items = pickQuiz(questions, topic);
    session = {
      topic,
      items,
      index: 0,
      selected: null,
      revealed: false,
      correctIds: [],
      askedIds: [],
      done: false
    };
  }

  const root = el("div", { class: "screen screen-study-quiz" });
  root.append(el("h1", {}, TOPIC_LABELS[topic]));

  if (session.done) {
    const asked = session.askedIds.length;
    root.append(
      el(
        "div",
        { class: "score-banner", role: "status", "aria-live": "polite" },
        el("p", { class: "score-line" }, `${session.correctIds.length} / ${asked} correct`)
      )
    );
    root.append(
      el(
        "div",
        { class: "btn-row" },
        el("a", { class: "btn btn-secondary", href: "#/study" }, "All topics"),
        el(
          "button",
          {
            type: "button",
            class: "btn btn-primary",
            onclick: () => {
              session = null;
              // Force a re-render by retriggering hash.
              const hash = `#/study/${topic}`;
              if (location.hash === hash) {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              } else {
                location.hash = hash;
              }
            }
          },
          "Try again"
        )
      )
    );
    return root;
  }

  const current = session.items[session.index];
  root.append(el("p", { class: "progress-label" }, `Question ${session.index + 1} of ${session.items.length}`));
  root.append(
    renderQuestionCard({
      question: current.question,
      choiceOrder: current.choiceOrder,
      selectedVisibleIndex: session.selected,
      mode: "study",
      revealed: session.revealed,
      name: "study",
      onSelect: (visibleIndex) => {
        if (session!.revealed) return;
        const canonical = current.choiceOrder[visibleIndex];
        const correct = canonical === current.question.correctIndex;
        session!.selected = visibleIndex;
        session!.revealed = true;
        session!.askedIds.push(current.question.id);
        if (correct) session!.correctIds.push(current.question.id);
        handlers.recordQuestion(current.question.id, correct);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    })
  );

  if (session.revealed) {
    const last = session.index === session.items.length - 1;
    root.append(
      el(
        "button",
        {
          type: "button",
          class: "btn btn-primary btn-block",
          onclick: () => {
            if (!session) return;
            if (last) {
              session.done = true;
              handlers.finishQuiz(session.topic, session.askedIds, session.correctIds);
            } else {
              session.index += 1;
              session.selected = null;
              session.revealed = false;
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
          }
        },
        last ? "See score" : "Next question"
      )
    );
  }

  root.append(el("p", {}, el("a", { href: "#/study" }, "Back to all topics")));
  return root;
}
