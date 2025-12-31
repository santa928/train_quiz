import { lines } from "./data/lines.js";
import { createQuizSession, validateLines } from "./domain/quiz.js";
import { renderCredits, renderQuestion, renderResult, renderStart } from "./ui/render.js";

const appRoot = document.getElementById("app");
const QUESTION_COUNT = 5;
const CHOICE_COUNT = 4;

let session = null;
let currentIndex = 0;
let selectedId = null;
let answers = [];
let lastScreen = "start";
let currentScreen = "start";

function openCredits() {
  lastScreen = currentScreen;
  renderCredits(appRoot, {
    credits: lines.map((line) => ({ line, credit: line.credit })),
    onBack: () => restoreScreen(),
  });
}

function restoreScreen() {
  if (lastScreen === "start") {
    showStart();
    return;
  }
  if (lastScreen === "result") {
    showResult();
    return;
  }
  showQuestion();
}

function showStart() {
  currentScreen = "start";
  const validation = validateLines(lines);
  session = null;
  currentIndex = 0;
  selectedId = null;
  answers = [];
  renderStart(appRoot, {
    totalQuestions: QUESTION_COUNT,
    totalLines: lines.length,
    ready: validation.ready,
    issues: validation.issues,
    onStart: () => startQuiz(),
    onOpenCredits: () => openCredits(),
  });
}

function startQuiz() {
  session = createQuizSession(lines, QUESTION_COUNT, CHOICE_COUNT);
  currentIndex = 0;
  selectedId = null;
  answers = [];
  showQuestion();
}

function showQuestion() {
  currentScreen = "question";
  const question = session.questions[currentIndex];
  renderQuestion(appRoot, {
    question,
    index: currentIndex,
    total: session.questions.length,
    selectedId,
    onSelect: (choiceId) => handleSelect(question, choiceId),
    onNext: () => goNext(),
    onRestart: () => showStart(),
    onOpenCredits: () => openCredits(),
  });
}

function handleSelect(question, choiceId) {
  if (selectedId) return;
  selectedId = choiceId;
  answers[currentIndex] = { question, selectedId };
  showQuestion();
}

function goNext() {
  if (!selectedId) return;
  if (currentIndex >= session.questions.length - 1) {
    showResult();
    return;
  }
  currentIndex += 1;
  selectedId = null;
  showQuestion();
}

function showResult() {
  currentScreen = "result";
  renderResult(appRoot, {
    answers,
    total: session.questions.length,
    onRestart: () => showStart(),
    onOpenCredits: () => openCredits(),
  });
}

showStart();
