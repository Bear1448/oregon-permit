import type { Question } from "../types.ts";
import { el } from "../dom.ts";

export type QuestionCardMode = "exam" | "study";

export type QuestionCardOptions = {
  question: Question;
  choiceOrder: number[];
  selectedVisibleIndex: number | null;
  mode: QuestionCardMode;
  revealed: boolean;
  name: string;
  onSelect: (visibleIndex: number) => void;
};

function signAlt(question: Question, revealed: boolean): string {
  const image = question.signImage;
  if (!image) return "";
  if (revealed && image.mutcdCode) {
    return `${image.alt}. Official designation ${image.mutcdCode}.`;
  }
  return image.alt;
}

export function renderQuestionCard(options: QuestionCardOptions): HTMLElement {
  const { question, choiceOrder, selectedVisibleIndex, mode, revealed, name, onSelect } = options;
  const card = el("section", { class: "question-card", "aria-labelledby": `${name}-prompt` });

  if (question.signImage) {
    card.append(
      el(
        "figure",
        { class: "sign-figure" },
        el("img", {
          src: question.signImage.src,
          alt: signAlt(question, revealed),
          width: "180",
          height: "180"
        })
      )
    );
  }

  card.append(el("h2", { id: `${name}-prompt`, class: "prompt" }, question.prompt));

  const group = el("div", { class: "choices", role: "radiogroup", "aria-labelledby": `${name}-prompt` });
  choiceOrder.forEach((canonical, visible) => {
    const selected = selectedVisibleIndex === visible;
    const isCorrect = canonical === question.correctIndex;
    const showFeedback = revealed && mode === "study" && selectedVisibleIndex !== null;
    const classes = ["choice"];
    if (selected) classes.push("is-selected");
    if (showFeedback && isCorrect) classes.push("is-correct");
    if (showFeedback && selected && !isCorrect) classes.push("is-wrong");
    const inputId = `${name}-choice-${visible}`;
    const label = el(
      "label",
      { class: classes.join(" "), for: inputId },
      el("input", {
        type: "radio",
        name,
        id: inputId,
        value: String(visible),
        checked: selected,
        disabled: revealed && mode === "study",
        onchange: () => onSelect(visible)
      }),
      el("span", { class: "choice-text" }, question.choices[canonical])
    );
    if (showFeedback && isCorrect) {
      label.append(el("span", { class: "choice-flag" }, " Correct"));
    } else if (showFeedback && selected && !isCorrect) {
      label.append(el("span", { class: "choice-flag" }, " Your answer"));
    }
    group.append(label);
  });
  card.append(group);

  if (revealed && mode === "study" && selectedVisibleIndex !== null) {
    const canonical = selectedVisibleIndex === null ? null : choiceOrder[selectedVisibleIndex];
    const correct = canonical === question.correctIndex;
    const feedback = el(
      "div",
      {
        class: `feedback ${correct ? "feedback-ok" : "feedback-bad"}`,
        role: "status",
        "aria-live": "polite"
      },
      el("p", { class: "feedback-result" }, correct ? "Correct" : "Not quite"),
      el("p", {}, question.explanation),
      el(
        "p",
        { class: "cite" },
        "Source: ",
        el("a", { href: question.manual.url, target: "_blank", rel: "noopener noreferrer" }, question.manual.section),
        `, page ${question.manual.page}, ${question.manual.edition} Oregon Driver Manual.`
      )
    );
    card.append(feedback);
  }

  return card;
}
