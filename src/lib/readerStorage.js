// ═══════════════════════════════════════════════════
// readerStorage.js — localStorage wrapper
// Har funksiyaning tepasida "// TODO: Supabase" bor
// ═══════════════════════════════════════════════════

const KEYS = {
  progress: 'roadmap:progress',   // { [levelId]: { lessonIndex, wordIndex } }
  saved: 'roadmap:saved',         // { [levelId]: [ { id, levelId, lessonIndex, startWord, endWord, text, color, lessonTitle, grade, createdAt } ] }
  settings: 'reader:settings',    // { fontSize, fontFamily, bgTheme, brightness, autoTheme }
  unlocked: 'roadmap:unlocked',   // [1, 2, 3, ...]
  completed: 'roadmap:completed', // [1, 2, ...]
  lastReadLevel: 'roadmap:last-read-level',
};
const READER_THEME_IDS = ['white', 'cream', 'gray', 'black'];
const READER_SETTINGS_VERSION = 2;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota aşımı */ }
}

/* ─── PROGRESS (joyni eslab qolish) ─── */

// TODO: Supabase
export function getProgress(levelId) {
  const all = read(KEYS.progress, {});
  return all[levelId] || null;
}

// TODO: Supabase
export function saveProgress(levelId, data) {
  // data = { lessonIndex, wordIndex }
  const all = read(KEYS.progress, {});
  all[levelId] = data;
  write(KEYS.progress, all);
  write(KEYS.lastReadLevel, String(levelId));
}

export function getLastReadLevelId() {
  const levelId = read(KEYS.lastReadLevel, null);
  return typeof levelId === 'string' || typeof levelId === 'number' ? levelId : null;
}

/* ─── SAVED (belgilangan matnlar) ─── */

// TODO: Supabase
export function getSaved(levelId) {
  const all = read(KEYS.saved, {});
  return (all[levelId] || []).map(normalizeSavedItem).filter(Boolean);
}

// TODO: Supabase
export function addSaved(levelId, item) {
  const all = read(KEYS.saved, {});
  if (!all[levelId]) all[levelId] = [];
  all[levelId].push(normalizeSavedItem({ ...item, levelId }) || item);
  write(KEYS.saved, all);
}

// TODO: Supabase
export function updateSaved(levelId, itemId, changes) {
  const all = read(KEYS.saved, {});
  if (!all[levelId]) return null;
  const index = all[levelId].findIndex((item) => item.id === itemId);
  if (index === -1) return null;
  all[levelId][index] = normalizeSavedItem({ ...all[levelId][index], ...changes, levelId }) || all[levelId][index];
  write(KEYS.saved, all);
  return all[levelId][index];
}

// TODO: Supabase
export function getAllSaved() {
  const all = read(KEYS.saved, {});
  return Object.entries(all).flatMap(([levelId, items]) =>
    (Array.isArray(items) ? items : [])
      .map((item) => normalizeSavedItem({ ...item, levelId }))
      .filter(Boolean)
  ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function normalizeSavedItem(item) {
  if (!item || typeof item.text !== 'string' || !item.text.trim()) return null;
  const allowedColors = ['yellow', 'green', 'blue'];
  return {
    ...item,
    id: item.id || String(Date.now()),
    levelId: item.levelId,
    lessonIndex: Number(item.lessonIndex || 0),
    startWord: Number(item.startWord || 0),
    endWord: Number(item.endWord || item.startWord || 0),
    text: item.text.trim(),
    color: allowedColors.includes(item.color) ? item.color : 'yellow',
    lessonTitle: item.lessonTitle || item.title || '',
    grade: item.grade || '',
    createdAt: item.createdAt || Date.now(),
  };
}

// TODO: Supabase
export function removeSaved(levelId, itemId) {
  const all = read(KEYS.saved, {});
  if (!all[levelId]) return;
  all[levelId] = all[levelId].filter((s) => s.id !== itemId);
  write(KEYS.saved, all);
}

/* ─── SETTINGS (reader sozlamalari) ─── */

export const DEFAULT_SETTINGS = {
  fontSize: 18,
  fontFamily: 'Noto Serif',
  bgTheme: 'white',
  brightness: 1,
  autoTheme: false,
};

// TODO: Supabase
export function getSettings() {
  const saved = read(KEYS.settings, {});
  const isLegacySettings = saved.version !== READER_SETTINGS_VERSION;
  const settings = {
    ...DEFAULT_SETTINGS,
    ...saved,
    ...(isLegacySettings ? {
      fontSize: DEFAULT_SETTINGS.fontSize,
      fontFamily: DEFAULT_SETTINGS.fontFamily,
      bgTheme: DEFAULT_SETTINGS.bgTheme,
      brightness: DEFAULT_SETTINGS.brightness,
      autoTheme: DEFAULT_SETTINGS.autoTheme,
    } : {}),
    version: READER_SETTINGS_VERSION,
  };
  if (!READER_THEME_IDS.includes(settings.bgTheme)) settings.bgTheme = DEFAULT_SETTINGS.bgTheme;
  if (isLegacySettings) write(KEYS.settings, settings);
  return settings;
}

// TODO: Supabase
export function saveSettings(settings) {
  write(KEYS.settings, { ...settings, version: READER_SETTINGS_VERSION });
}

/* ─── UNLOCKED (ochiq levellar) ─── */

// TODO: Supabase
export function getUnlocked() {
  return read(KEYS.unlocked, [1]);
}

// TODO: Supabase
export function saveUnlocked(ids) {
  write(KEYS.unlocked, ids);
}

/* ─── COMPLETED (100% tugatilgan levellar) ─── */

// TODO: Supabase
export function getCompleted() {
  return read(KEYS.completed, []);
}

// TODO: Supabase
export function saveCompleted(ids) {
  write(KEYS.completed, ids);
}
