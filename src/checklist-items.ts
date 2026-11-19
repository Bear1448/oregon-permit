export type ChecklistLink = { href: string; label: string };

export type ChecklistItem = {
  id: string;
  group: string;
  label: string;
  links?: ChecklistLink[];
};

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "age-resident",
    group: "Before the test",
    label: "I am at least 15 and an Oregon resident."
  },
  {
    id: "studied-manual",
    group: "Before the test",
    label: "I have studied the 2026–2027 Oregon Driver Manual.",
    links: [{ href: "https://www.oregon.gov/odot/forms/dmv/37.pdf", label: "Official manual (PDF)" }]
  },
  {
    id: "identity",
    group: "Before the test",
    label:
      "I have (or can get) proof of identity and date of birth — an original or certified copy, not a photocopy. A hospital birth certificate is not accepted. A U.S. birth certificate or a U.S. passport (valid or expired no more than five years) is a common option.",
    links: [{ href: "https://www.oregon.gov/odot/Forms/DMV/7318.pdf", label: "Identity document brochure (PDF)" }]
  },
  {
    id: "address",
    group: "Before the test",
    label:
      "I have proof of current residence address (one document for a standard permit; two from different sources for REAL ID). A parent who lives at the same address may come with me and show their own address proof."
  },
  {
    id: "ssn",
    group: "Before the test",
    label:
      "I can provide my Social Security number, or I will certify that I have not been assigned one. I do not have to bring the card itself."
  },
  {
    id: "parent-sign",
    group: "Before the test",
    label:
      "A parent or legal guardian will sign at the DMV, or they will complete Form 735-173DP. They will also certify school enrollment, or I will bring a diploma or GED.",
    links: [{ href: "https://www.oregon.gov/odot/Forms/DMV/173DPfill.pdf", label: "Form 735-173DP (PDF)" }]
  },
  {
    id: "fee-test",
    group: "Fees (confirm on the official fee page before paying)",
    label: "Knowledge test: $7 each attempt, paid before the test, separate from the permit fee.",
    links: [
      { href: "https://www.oregon.gov/odot/dmv/pages/fees/driver.aspx", label: "Official driver fees" },
      {
        href: "https://www.oregon.gov/odot/dmv/pages/online_quick_tips/driver_information.aspx",
        label: "Driver information and tips"
      }
    ]
  },
  {
    id: "fee-permit",
    group: "Fees (confirm on the official fee page before paying)",
    label: "Standard instruction permit: $30. REAL ID permit: $60."
  },
  {
    id: "fee-vision",
    group: "Fees (confirm on the official fee page before paying)",
    label: "Vision test: no fee, given at the DMV office."
  },
  {
    id: "how-to-test",
    group: "Taking the knowledge test",
    label:
      "I can take it online at any time through DMV2U, walk in for standby, or make an appointment. Offices stop giving the knowledge test one hour before closing.",
    links: [
      { href: "https://dmv2u.oregon.gov", label: "DMV2U" },
      { href: "https://www.oregon.gov/odot/dmv/teen/pages/permit.aspx", label: "Under-18 permit page" }
    ]
  },
  {
    id: "online-equipment",
    group: "Taking the knowledge test",
    label:
      "Online test rules: desktop or laptop with a keyboard, mouse, and working webcam — no phones or tablets. A photo is taken at the start and at random during the test. Closed book."
  },
  {
    id: "proctor",
    group: "Taking the knowledge test",
    label:
      "If I am under 18, a proctor 21 or older must register and watch me. The proctor does not have to be a parent, but must have a Social Security number, may supervise only two tests in 24 hours, and may not have proctored more than five DMV tests in the past 12 months."
  },
  {
    id: "ssn-online",
    group: "Taking the knowledge test",
    label: "Testers and proctors need a valid SSN to register online. If I have no SSN, I test at a DMV office."
  },
  {
    id: "online-retakes",
    group: "Taking the knowledge test",
    label:
      "Online retakes: at most two attempts in any 24-hour period, and at most four online attempts total; then I must test at a DMV office. Each attempt is $7."
  },
  {
    id: "office-retakes",
    group: "Taking the knowledge test",
    label:
      "In a DMV office, I may be able to retest the same day if they have capacity. Cheating fails the test and means a 90-day wait."
  },
  {
    id: "score-and-after",
    group: "Taking the knowledge test",
    label:
      "The test is 35 questions; I need 28 correct. After I pass online, I still go to a DMV office for the vision test, documents, parent signature, photo, and issuance fee."
  },
  {
    id: "supervisor",
    group: "Permit rules and what comes next",
    label:
      "I may drive only with a licensed supervisor who is at least 21, sitting beside me. Hours count toward a license only if that person has held a valid license for at least three years."
  },
  {
    id: "phone-under18",
    group: "Permit rules and what comes next",
    label: "Under 18 I may not use a phone or other mobile device while driving, including hands-free."
  },
  {
    id: "permit-term",
    group: "Permit rules and what comes next",
    label: "The permit is valid two years. DMV does not send an expiration notice."
  },
  {
    id: "hours-and-hold",
    group: "Permit rules and what comes next",
    label:
      "To get a provisional license at 16 or 17 I must hold the permit at least six months, and complete 100 hours of supervised driving, or 50 hours if I also pass an ODOT-approved driver education course (driver ed is optional; completing it within the past two years can also waive the drive test)."
  },
  {
    id: "provisional-limits",
    group: "Permit rules and what comes next",
    label:
      "After the provisional license: no phone use until 18; first six months, no passenger under 20 except immediate family, and no driving midnight–5:00 a.m. except listed exceptions; second six months, no more than three such passengers, same night rule. Those passenger and night limits end after one year or at age 18, whichever comes first."
  }
];

export const CHECKLIST_GROUPS = [
  "Before the test",
  "Fees (confirm on the official fee page before paying)",
  "Taking the knowledge test",
  "Permit rules and what comes next"
];
