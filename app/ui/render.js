import { formatLineLabel } from "../domain/quiz.js";

export function renderStart(root, { totalQuestions, totalLines, ready, issues, onStart, onOpenCredits }) {
  const issueText = issues.length ? `<div class="helper">${issues.join(" / ")}</div>` : "";
  root.innerHTML = `
    <section class="card hero">
      <div class="header">
        <span class="badge">東京の電車</span>
        <button class="button secondary" data-action="credits">クレジット</button>
      </div>
      <h1>写真であてよう！
        <br />でんしゃクイズ</h1>
      <p>スマホ向け・4択×${totalQuestions}問。写真を見て、はしっている路線をタップしよう！</p>
      <div class="cta">
        <button class="button primary" data-action="start" ${ready ? "" : "disabled"}>スタート</button>
        <div class="helper">登録路線: ${totalLines}件</div>
      </div>
      ${issueText}
    </section>
    <section class="card">
      <h2>あそびかた</h2>
      <ol class="helper">
        <li>写真をよくみよう</li>
        <li>4つのなかからえらぶ</li>
        <li>5もんおわったらけっかを見る</li>
      </ol>
    </section>
  `;

  root.querySelector("[data-action='start']")?.addEventListener("click", onStart);
  root.querySelector("[data-action='credits']")?.addEventListener("click", onOpenCredits);
}

export function renderQuestion(root, {
  question,
  index,
  total,
  selectedId,
  onSelect,
  onNext,
  onRestart,
  onOpenCredits,
}) {
  const label = formatLineLabel(question.line);
  const progress = Math.round(((index + 1) / total) * 100);
  const imageBlock = question.line.image
    ? `<img src="${question.line.image}" alt="${label}" loading="lazy" />`
    : `<div class="image-placeholder">素材準備中</div>`;

  root.innerHTML = `
    <section class="card">
      <div class="header">
        <span class="badge">${index + 1} / ${total}</span>
        <button class="button secondary" data-action="credits">クレジット</button>
      </div>
      <div class="progress">
        <div class="progress-bar"><span style="width:${progress}%"></span></div>
      </div>
      <h2>このでんしゃは？</h2>
      <div class="image-frame">${imageBlock}</div>
    </section>
    <section class="choices" aria-live="polite">
      ${question.choices
        .map((choice) => {
          const choiceLabel = formatLineLabel(choice);
          return `<button class="choice" data-choice-id="${choice.id}">${choiceLabel}</button>`;
        })
        .join("")}
    </section>
    <section class="footer-actions">
      <button class="button primary" data-action="next" ${selectedId ? "" : "disabled"}>つぎへ</button>
      <button class="button secondary" data-action="restart">やりなおす</button>
    </section>
  `;

  root.querySelector("[data-action='credits']")?.addEventListener("click", onOpenCredits);
  root.querySelector("[data-action='next']")?.addEventListener("click", onNext);
  root.querySelector("[data-action='restart']")?.addEventListener("click", onRestart);

  const buttons = [...root.querySelectorAll("[data-choice-id]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.choiceId));
  });

  if (selectedId) {
    markChoices(buttons, question.correctId, selectedId);
    const feedback = document.createElement("div");
    feedback.className = `feedback ${selectedId === question.correctId ? "good" : "bad"}`;
    feedback.textContent = selectedId === question.correctId ? "せいかい！" : "ざんねん！";
    root.appendChild(feedback);
  }
}

export function renderResult(root, { answers, total, onRestart, onOpenCredits }) {
  const correctCount = answers.filter((answer) => answer.selectedId === answer.question.correctId).length;

  root.innerHTML = `
    <section class="card hero">
      <div class="header">
        <span class="badge">けっか</span>
        <button class="button secondary" data-action="credits">クレジット</button>
      </div>
      <div class="result-score">
        <strong>${correctCount}</strong>
        <span> / ${total} もん</span>
      </div>
      <p>もういちどチャレンジしてみよう！</p>
      <div class="cta">
        <button class="button primary" data-action="restart">もう一回</button>
      </div>
    </section>
    <section class="card">
      <h2>おさらい</h2>
      <ul class="result-list">
        ${answers
          .map((answer, idx) => {
            const label = formatLineLabel(answer.question.line);
            const mark = answer.selectedId === answer.question.correctId ? "せいかい" : "ふせいかい";
            return `
              <li class="result-item">
                <span>${idx + 1}. ${label}</span>
                <span>${mark}</span>
              </li>
            `;
          })
          .join("")}
      </ul>
    </section>
  `;

  root.querySelector("[data-action='restart']")?.addEventListener("click", onRestart);
  root.querySelector("[data-action='credits']")?.addEventListener("click", onOpenCredits);
}

export function renderCredits(root, { credits, onBack }) {
  root.innerHTML = `
    <section class="card hero">
      <div class="header">
        <span class="badge">クレジット</span>
        <button class="button secondary" data-action="back">もどる</button>
      </div>
      <p>写真素材の出典・利用条件を記載しています。</p>
    </section>
    <section class="card">
      <ul class="credit-list">
        ${credits
          .map((item) => {
            const label = formatLineLabel(item.line);
            if (!item.credit.sourceName) {
              return `
                <li class="credit-item">
                  <strong>${label}</strong>
                  <div class="helper">出典準備中</div>
                </li>
              `;
            }
            return `
              <li class="credit-item">
                <strong>${label}</strong>
                <div><a href="${item.credit.sourceUrl}" target="_blank" rel="noreferrer">${item.credit.sourceName}</a></div>
                <div class="helper">${item.credit.license}</div>
              </li>
            `;
          })
          .join("")}
      </ul>
    </section>
  `;

  root.querySelector("[data-action='back']")?.addEventListener("click", onBack);
}

function markChoices(buttons, correctId, selectedId) {
  buttons.forEach((button) => {
    const isCorrect = button.dataset.choiceId === correctId;
    const isSelected = button.dataset.choiceId === selectedId;
    button.disabled = true;
    if (isCorrect) {
      button.classList.add("is-correct");
    } else if (isSelected) {
      button.classList.add("is-wrong");
    }
  });
}
