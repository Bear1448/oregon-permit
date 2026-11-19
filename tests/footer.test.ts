import { describe, expect, it } from "vitest";
import { DISCLAIMER, renderFooter } from "../src/components/footer.ts";

describe("disclaimer footer", () => {
  it("uses the verbatim unofficial-study-aid wording and links the official manual", () => {
    expect(DISCLAIMER).toBe(
      "This is an unofficial study aid. It is not affiliated with the Oregon DMV or ODOT and is not a legal source. Official rules are in the 2026–2027 Oregon Driver Manual and at OregonDMV.com."
    );
    document.body.innerHTML = "";
    document.body.append(renderFooter());
    expect(document.body.textContent).toContain(DISCLAIMER);
    const manual = document.querySelector('a[href="https://www.oregon.gov/odot/forms/dmv/37.pdf"]');
    expect(manual).not.toBeNull();
  });
});
