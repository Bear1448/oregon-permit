import Ajv2020 from "ajv/dist/2020.js";
import schema from "../data/questions.schema.json";
import type { Question, QuestionBank } from "../types.ts";
import { MANUAL_EDITION, MANUAL_URL } from "../types.ts";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

export function loadQuestionBank(raw: unknown): QuestionBank {
  if (!validate(raw)) {
    const details = (validate.errors ?? [])
      .map((e) => `${e.instancePath || "/"} ${e.message}`)
      .join("; ");
    throw new Error(`Question bank failed schema validation: ${details}`);
  }

  const bank = raw as QuestionBank;
  const ids = new Set<string>();

  if (bank.manualEdition !== MANUAL_EDITION) {
    throw new Error(`Unexpected manual edition: ${bank.manualEdition}`);
  }
  if (bank.manualUrl !== MANUAL_URL) {
    throw new Error(`Unexpected manual URL: ${bank.manualUrl}`);
  }

  for (const question of bank.questions) {
    if (ids.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}`);
    }
    ids.add(question.id);
    if (question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
      throw new Error(`correctIndex out of range for ${question.id}`);
    }
    if (question.manual.edition !== MANUAL_EDITION) {
      throw new Error(`Bad manual edition on ${question.id}`);
    }
  }

  return bank;
}

export function getVerifiedQuestions(bank: QuestionBank): Question[] {
  return bank.questions.filter((q) => q.verified);
}
