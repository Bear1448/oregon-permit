import { MANUAL_URL } from "../types.ts";
import { el } from "../dom.ts";

export const DISCLAIMER =
  "This is an unofficial study aid. It is not affiliated with the Oregon DMV or ODOT and is not a legal source. Official rules are in the 2026–2027 Oregon Driver Manual and at OregonDMV.com.";

export function renderFooter(): HTMLElement {
  return el(
    "footer",
    { class: "site-footer" },
    el("p", { class: "disclaimer" }, DISCLAIMER),
    el(
      "p",
      { class: "footer-links" },
      el("a", { href: MANUAL_URL, target: "_blank", rel: "noopener noreferrer" }, "2026–2027 Oregon Driver Manual (PDF)"),
      " · ",
      el("a", { href: "https://www.oregon.gov/odot/dmv/", target: "_blank", rel: "noopener noreferrer" }, "OregonDMV.com")
    )
  );
}
