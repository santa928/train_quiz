export const DEFAULT_QUESTION_COUNT = 5;
export const DEFAULT_CHOICE_COUNT = 4;

export function formatLineLabel(line) {
  if (!line) return "";
  if (line.series && line.series.trim()) {
    return `${line.lineName}（${line.series}）`;
  }
  return line.lineName;
}

export function createQuizSession(lines, questionCount = DEFAULT_QUESTION_COUNT, choiceCount = DEFAULT_CHOICE_COUNT) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("路線データがありません");
  }
  if (lines.length < choiceCount) {
    throw new Error("選択肢を作るための路線数が足りません");
  }

  const shuffled = shuffle([...lines]);
  const selectedLines = shuffled.slice(0, Math.min(questionCount, shuffled.length));

  const questions = selectedLines.map((correctLine) => {
    const pool = lines.filter((line) => line.id !== correctLine.id);
    const choices = shuffle([correctLine, ...shuffle(pool).slice(0, choiceCount - 1)]);
    return {
      id: correctLine.id,
      correctId: correctLine.id,
      line: correctLine,
      choices,
    };
  });

  return { questions };
}

export function validateLines(lines) {
  const issues = [];
  if (lines.length < DEFAULT_CHOICE_COUNT) {
    issues.push(`路線数が足りません（最低${DEFAULT_CHOICE_COUNT}件）`);
  }
  if (lines.length < DEFAULT_QUESTION_COUNT) {
    issues.push(`5問出題できる路線数が不足しています`);
  }
  const missingImage = lines.filter((line) => !line.image || !line.image.trim());
  const missingSeries = lines.filter((line) => !line.series || !line.series.trim());
  const missingCredit = lines.filter(
    (line) => !line.credit || !line.credit.sourceName || !line.credit.sourceUrl || !line.credit.license
  );

  if (missingImage.length > 0) {
    issues.push(`写真未設定: ${missingImage.length}件`);
  }
  if (missingSeries.length > 0) {
    issues.push(`形式未設定: ${missingSeries.length}件`);
  }
  if (missingCredit.length > 0) {
    issues.push(`クレジット未設定: ${missingCredit.length}件`);
  }

  return {
    ready: issues.length === 0,
    issues,
  };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
