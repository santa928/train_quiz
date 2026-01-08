const TOTAL_QUESTIONS = 10;
let trainsData = [];
let quizQueue = [];
let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const app = document.getElementById('app');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const creditsBtn = document.getElementById('credits-btn');
const closeCreditsBtn = document.getElementById('close-credits-btn');
const creditsOverlay = document.getElementById('credits-overlay');
const creditsList = document.getElementById('credits-list');

const questionNumberEl = document.getElementById('question-number');
const questionImageEl = document.getElementById('question-image');
const feedbackOverlay = document.getElementById('feedback-overlay');
const choiceBtns = document.querySelectorAll('.choice-btn');
const scoreCountEl = document.getElementById('score-count');
const resultMessageEl = document.getElementById('result-message');

// Initialize
async function init() {
    try {
        const response = await fetch('data/trains.json');
        trainsData = await response.json();
        setupCredits();
    } catch (error) {
        console.error('Failed to load train data:', error);
        alert('データを読み込めませんでした。');
    }

    startBtn.addEventListener('click', startQuiz);
    retryBtn.addEventListener('click', startQuiz);

    // Choice button handlers
    choiceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => handleAnswer(e.currentTarget));
    });

    // Credits handlers
    creditsBtn.addEventListener('click', () => creditsOverlay.classList.remove('hidden'));
    closeCreditsBtn.addEventListener('click', () => creditsOverlay.classList.add('hidden'));
}

function setupCredits() {
    creditsList.innerHTML = '';
    trainsData.forEach(train => {
        const li = document.createElement('li');
        li.textContent = `${train.name}: ${train.credit}`;
        creditsList.appendChild(li);
    });
}

function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;

    // Create a shuffled queue containing all available trains, then pick the first TOTAL_QUESTIONS
    quizQueue = shuffleArray([...trainsData]).slice(0, TOTAL_QUESTIONS);

    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    const currentTrain = quizQueue[currentQuestionIndex];

    // Update UI
    questionNumberEl.textContent = `だい ${currentQuestionIndex + 1} もん`;
    questionImageEl.src = currentTrain.image;
    feedbackOverlay.className = 'hidden'; // Ensure hidden
    feedbackOverlay.className = 'hidden'; // Ensure hidden
    feedbackOverlay.innerHTML = ''; // Clear icon and text

    // Prepare Choices
    // 1 Correct + 3 Incorrect
    const correctChoice = currentTrain;

    // Get all other trains as distractors
    const distractors = trainsData.filter(t => t.id !== currentTrain.id);
    const selectedDistractors = shuffleArray(distractors).slice(0, 3);

    // Combine and shuffle
    const choices = shuffleArray([correctChoice, ...selectedDistractors]);

    // Assign to buttons
    choiceBtns.forEach((btn, index) => {
        const choice = choices[index];
        btn.textContent = choice.label;
        btn.dataset.id = choice.id;
        btn.disabled = false; // Re-enable
    });
}

function handleAnswer(targetBtn) {
    // Prevent double clicking
    if (feedbackOverlay.classList.contains('active-feedback')) return;

    const selectedId = targetBtn.dataset.id;
    const correctId = quizQueue[currentQuestionIndex].id;
    const isCorrect = selectedId === correctId;

    // Disable all buttons to prevent multiple answers
    choiceBtns.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        score++;
        showFeedback(true);
    } else {
        const correctChoice = quizQueue[currentQuestionIndex];
        showFeedback(false, correctChoice.label);
    }

    // Wait and proceed
    setTimeout(() => {
        nextQuestion();
    }, 3000);
}

function showFeedback(isCorrect, correctAnswerLabel) {
    feedbackOverlay.classList.remove('hidden');
    feedbackOverlay.classList.add('active-feedback');
    feedbackOverlay.innerHTML = ''; // Clear previous content

    if (isCorrect) {
        feedbackOverlay.classList.add('feedback-correct');
        feedbackOverlay.classList.remove('feedback-incorrect');
        feedbackOverlay.innerHTML = '<div class="feedback-icon">⭕</div>';
    } else {
        feedbackOverlay.classList.add('feedback-incorrect');
        feedbackOverlay.classList.remove('feedback-correct');

        feedbackOverlay.innerHTML = `
            <div class="feedback-icon">❌</div>
            <div class="correct-answer-display">
                <span>せいかいは...</span><br>${correctAnswerLabel}
            </div>
        `;
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    feedbackOverlay.classList.remove('active-feedback');

    if (currentQuestionIndex < TOTAL_QUESTIONS) {
        loadQuestion();
    } else {
        showResult();
    }
}


/*
function showResult() {
    scoreCountEl.textContent = score;

    if (score === TOTAL_QUESTIONS) {
        resultMessageEl.textContent = "ぜんもんせいかい！天才！";
    } else if (score >= 3) {
        resultMessageEl.textContent = "すごい！あとちょっと！";
    } else {
        resultMessageEl.textContent = "がんばったね！";
    }

    showScreen('result-screen');
}
*/

function showResult() {
    scoreCountEl.textContent = score;
    // Update total count just in case it changes
    document.getElementById('total-count').textContent = TOTAL_QUESTIONS;

    showScreen('result-screen');
}

function showScreen(screenId) {
    [startScreen, quizScreen, resultScreen].forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        } else {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        }
    });
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Start
init();
