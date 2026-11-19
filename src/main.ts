import { registerSW } from "virtual:pwa-register";
import { startApp } from "./app.ts";
import { getVerifiedQuestions, loadQuestionBank } from "./lib/load-questions.ts";
import bankJson from "./data/questions.json";
import "./styles.css";

registerSW({ immediate: true });

const bank = loadQuestionBank(bankJson);
const questions = getVerifiedQuestions(bank);
const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
startApp(root, { questions });
