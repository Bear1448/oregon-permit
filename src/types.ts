export const TOPICS = [
  "signs",
  "speed-limits",
  "right-of-way",
  "turns-and-lanes",
  "parking",
  "alcohol-and-phone",
  "school-buses",
  "teen-gdl"
] as const;

export type TopicId = (typeof TOPICS)[number];

export const MANUAL_URL = "https://www.oregon.gov/odot/forms/dmv/37.pdf";
export const MANUAL_EDITION = "2026-2027";
export const QUESTIONS_PER_TEST = 35;
export const CORRECT_TO_PASS = 28;
export const CONSECUTIVE_TO_MASTER = 3;
export const STORAGE_KEY = "or-permit-v1";

export type SignSource = "fhwa-shs" | "wikimedia-pd-usgov-mutcd";

export type SignImage = {
  src: string;
  alt: string;
  source: SignSource;
  attribution: string;
  mutcdCode?: string;
};

export type ManualCite = {
  edition: "2026-2027";
  section: string;
  page: number;
  url: typeof MANUAL_URL;
};

export type Question = {
  id: string;
  topic: TopicId;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  manual: ManualCite;
  signImage?: SignImage;
  verified: boolean;
  verifiedAgainst?: string;
};

export type QuestionBank = {
  version: number;
  manualEdition: "2026-2027";
  manualUrl: typeof MANUAL_URL;
  questions: Question[];
};

export type ReviewItem = {
  questionId: string;
  consecutiveCorrect: number;
  timesMissed: number;
  lastMissedAt: string | null;
  lastSeenAt: string | null;
  masteredAt: string | null;
};

export type PracticeTestAnswer = {
  questionId: string;
  choiceOrder: number[];
  selectedVisibleIndex: number | null;
};

export type PracticeTestAttempt = {
  startedAt: string;
  questions: PracticeTestAnswer[];
};

export type FinishedAttempt = {
  finishedAt: string;
  correct: number;
  passed: boolean;
  answers: PracticeTestAnswer[];
};

export type FinishedTopicQuiz = {
  finishedAt: string;
  topic: TopicId;
  questionIds: string[];
  correctIds: string[];
};

export type PersistedState = {
  version: 1;
  streakCount: number;
  lastActivityDate: string | null;
  checklist: Record<string, boolean>;
  inProgressTest: PracticeTestAttempt | null;
  attempts: FinishedAttempt[];
  topicQuizHistory: FinishedTopicQuiz[];
  review: Record<string, ReviewItem>;
  installHintDismissed?: boolean;
};
