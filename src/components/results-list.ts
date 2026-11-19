import type { Question } from "../types.ts";
import { el } from "../dom.ts";
import { selectedCanonicalIndex } from "../lib/quiz.ts";

export type ResultRow = {
  question: Question;
  choiceOrder: number[];
  selectedVisibleIndex: number | null;
};

export function renderResultsList(rows: ResultRow[], onlyMisses = true): HTMLElement {
  const list = el("ol", { class: "results-list" });
  for (const row of rows) {
    const selected =
      row.selectedVisibleIndex === null
        ? null
        : selectedCanonicalIndex(row.choiceOrder, row.selectedVisibleIndex);
    const correct = selected === row.question.correctIndex;
    if (onlyMisses && correct) continue;
    const item = el("li", { class: correct ? "result-ok" : "result-miss" });
    if (row.question.signImage) {
      item.append(
        el(
          "figure",
          { class: "sign-figure sign-figure-sm" },
          el("img", {
            src: row.question.signImage.src,
            alt: `${row.question.signImage.alt}${row.question.signImage.mutcdCode ? `. Official designation ${row.question.signImage.mutcdCode}.` : ""}`,
            width: "96",
            height: "96"
          })
        )
      );
    }
    item.append(el("p", { class: "prompt" }, row.question.prompt));
    if (!correct) {
      const yours =
        selected === null ? "You did not answer this question." : `Your answer: ${row.question.choices[selected]}`;
      item.append(el("p", {}, yours));
    }
    item.append(el("p", {}, `Correct answer: ${row.question.choices[row.question.correctIndex]}`));
    item.append(el("p", {}, row.question.explanation));
    item.append(
      el(
        "p",
        { class: "cite" },
        "Source: ",
        el("a", { href: row.question.manual.url, target: "_blank", rel: "noopener noreferrer" }, row.question.manual.section),
        `, page ${row.question.manual.page}, ${row.question.manual.edition} Oregon Driver Manual.`
      )
    );
    list.append(item);
  }
  if (!list.childElementCount) {
    list.append(el("li", { class: "result-ok" }, "You did not miss any questions on this test."));
  }
  return list;
}
