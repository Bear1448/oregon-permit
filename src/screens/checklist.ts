import type { PersistedState } from "../types.ts";
import { el } from "../dom.ts";
import { CHECKLIST_GROUPS, CHECKLIST_ITEMS } from "../checklist-items.ts";

export type ChecklistHandlers = {
  toggleItem: (id: string, checked: boolean) => void;
  clearProgress: () => void;
};

export function renderChecklist(state: PersistedState, handlers: ChecklistHandlers): HTMLElement {
  const root = el("div", { class: "screen screen-checklist" });
  root.append(el("h1", {}, "Getting My Permit"));
  root.append(
    el(
      "p",
      { class: "lede" },
      "Tick items on this device as you go. Re-check official fee and process pages before you visit the DMV, because those details can change."
    )
  );

  for (const group of CHECKLIST_GROUPS) {
    const items = CHECKLIST_ITEMS.filter((item) => item.group === group);
    const section = el("section", { class: "checklist-group" }, el("h2", {}, group));
    for (const item of items) {
      const inputId = `check-${item.id}`;
      const box = el("div", { class: "check-item" });
      const label = el(
        "label",
        { class: "check-label", for: inputId },
        el("input", {
          type: "checkbox",
          id: inputId,
          checked: Boolean(state.checklist[item.id]),
          onchange: (event: Event) => {
            const input = event.target as HTMLInputElement;
            handlers.toggleItem(item.id, input.checked);
          }
        }),
        el("span", {}, item.label)
      );
      box.append(label);
      if (item.links?.length) {
        const links = el("p", { class: "check-links" });
        item.links.forEach((link, index) => {
          if (index > 0) links.append(" · ");
          links.append(el("a", { href: link.href, target: "_blank", rel: "noopener noreferrer" }, link.label));
        });
        box.append(links);
      }
      section.append(box);
    }
    root.append(section);
  }

  root.append(
    el(
      "section",
      { class: "danger-zone" },
      el("h2", {}, "Progress reset"),
      el("p", {}, "This clears scores, your streak, the review queue, an in-progress test, and checklist ticks stored on this device. It does not change the question bank."),
      el(
        "button",
        {
          type: "button",
          class: "btn btn-danger",
          onclick: () => {
            if (window.confirm("Clear all progress on this device? This cannot be undone.")) {
              handlers.clearProgress();
            }
          }
        },
        "Clear progress on this device"
      )
    )
  );

  return root;
}
