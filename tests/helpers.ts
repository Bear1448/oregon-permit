import type { Question, QuestionBank, TopicId } from "../src/types.ts";
import { MANUAL_URL, TOPICS } from "../src/types.ts";

export function makeQuestion(partial: Partial<Question> & { id: string; topic: TopicId }): Question {
  return {
    prompt: partial.prompt ?? `Sample prompt for ${partial.id} goes here.`,
    choices: partial.choices ?? ["Alpha", "Bravo", "Charlie", "Delta"],
    correctIndex: partial.correctIndex ?? 1,
    explanation: partial.explanation ?? "This is a one-line original explanation.",
    manual: partial.manual ?? {
      edition: "2026-2027",
      section: "Testing",
      page: 2,
      url: MANUAL_URL
    },
    verified: partial.verified ?? true,
    verifiedAgainst: partial.verifiedAgainst ?? "Oregon Driver Manual 2026-2027, printed page 2",
    signImage: partial.signImage,
    id: partial.id,
    topic: partial.topic
  };
}

export function makeBank(questions: Question[]): QuestionBank {
  return {
    version: 1,
    manualEdition: "2026-2027",
    manualUrl: MANUAL_URL,
    questions
  };
}

export function fillBank(perTopic = 12): Question[] {
  const questions: Question[] = [];
  for (const topic of TOPICS) {
    for (let i = 1; i <= perTopic; i += 1) {
      questions.push(
        makeQuestion({
          id: `q-${topic}-${String(i).padStart(3, "0")}`,
          topic,
          prompt: `Which option is correct for ${topic} item ${i} in this practice bank?`,
          correctIndex: i % 4
        })
      );
    }
  }
  return questions;
}

export class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number {
    return this.data.size;
  }
  clear(): void {
    this.data.clear();
  }
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}
