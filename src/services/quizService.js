import quizQuestions from '../data/quizQuestions';

const ATTEMPTS_STORAGE_KEY = 'tarixiy:daily-quiz:attempts';

function normalizeDate(date) {
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) throw new TypeError('Quiz sanasi yaroqsiz.');
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  throw new TypeError('Quiz sanasi YYYY-MM-DD formatida bo‘lishi kerak.');
}

export function getTodayQuizDate() {
  return normalizeDate(new Date());
}

function seedFromDate(date) {
  let seed = 2166136261;
  for (let index = 0; index < date.length; index += 1) {
    seed ^= date.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function readAttempts() {
  const raw = window.localStorage.getItem(ATTEMPTS_STORAGE_KEY);
  if (raw === null) return [];
  const attempts = JSON.parse(raw);
  if (!Array.isArray(attempts)) {
    throw new Error('Quiz tarixi noto‘g‘ri formatda saqlangan.');
  }
  return attempts;
}

export function getDailyQuestions(date = getTodayQuizDate()) {
  const normalizedDate = normalizeDate(date);
  let seed = seedFromDate(normalizedDate) || 1;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const shuffled = [...quizQuestions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, 5);
}

export function getAttempts() {
  return readAttempts().sort((first, second) => second.date.localeCompare(first.date));
}

export function saveAttempt({ date, score, total, answers }) {
  const normalizedDate = normalizeDate(date);
  const attempts = readAttempts();
  if (attempts.some((attempt) => attempt.date === normalizedDate)) return false;

  attempts.push({
    date: normalizedDate,
    score,
    total,
    answers,
  });
  window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  return true;
}
