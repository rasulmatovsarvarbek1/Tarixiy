import MOCK_LEVELS from '../data/mockLevel';

const STORAGE_KEY = 'tarixiy-lessons-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readLevels() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return clone(MOCK_LEVELS);

  let levels;
  try {
    levels = JSON.parse(stored);
  } catch (error) {
    throw new Error('Saqlangan dars ma’lumotlarini o‘qib bo‘lmadi.', { cause: error });
  }
  if (!Array.isArray(levels)) {
    throw new Error('Saqlangan dars ma’lumotlari noto‘g‘ri formatda.');
  }
  return levels;
}

function writeLevels(levels) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

function findLevel(levels, levelId) {
  const level = levels.find((item) => String(item.id) === String(levelId));
  if (!level) throw new Error(`Level topilmadi: ${levelId}`);
  return level;
}

function createId(prefix) {
  const unique = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${unique}`;
}

export async function getLevels() {
  return clone(readLevels());
}

export async function getLevel(levelId) {
  const level = findLevel(readLevels(), levelId);
  return {
    ...clone(level),
    darslar: clone(level.darslar.filter((lesson) => lesson.holat === 'elon_qilingan')),
  };
}

export async function getLevelAdmin(levelId) {
  return clone(findLevel(readLevels(), levelId));
}

export async function saveLesson(levelId, dars) {
  const levels = readLevels();
  const level = findLevel(levels, levelId);
  const index = level.darslar.findIndex((lesson) => lesson.id === dars.id);
  if (index < 0) {
    level.darslar.push(clone(dars));
  } else {
    level.darslar[index] = clone(dars);
  }
  writeLevels(levels);
  return clone(dars);
}

export async function createLesson(levelId) {
  const levels = readLevels();
  const level = findLevel(levels, levelId);
  const lesson = {
    id: createId('lesson'),
    fan: 'jahon',
    sarlavha: 'Yangi dars',
    muqova: {
      sarlavha: 'Jahon *Tarixi*',
      tagsarlavha: 'Yangi dars',
    },
    holat: 'qoralama',
    bloklar: [],
  };
  level.darslar.push(lesson);
  writeLevels(levels);
  return clone(lesson);
}

export async function deleteLesson(levelId, darsId) {
  const levels = readLevels();
  const level = findLevel(levels, levelId);
  const index = level.darslar.findIndex((lesson) => lesson.id === darsId);
  if (index < 0) throw new Error(`Dars topilmadi: ${darsId}`);
  const [deletedLesson] = level.darslar.splice(index, 1);
  writeLevels(levels);
  return clone(deletedLesson);
}

export async function uploadImage(file) {
  if (!(file instanceof File)) throw new TypeError('Rasm fayli tanlanmagan.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Rasm faylini data URL ga aylantirib bo‘lmadi.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error || new Error('Rasm faylini o‘qib bo‘lmadi.'));
    reader.onabort = () => reject(new Error('Rasm faylini o‘qish bekor qilindi.'));
    reader.readAsDataURL(file);
  });
}
