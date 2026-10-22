// ═══════════════════════════════════════════════════
// readerStorage.js — localStorage wrapper
// Har funksiyaning tepasida "// TODO: Supabase" bor
// ═══════════════════════════════════════════════════

const KEYS = {
  progress: 'roadmap:progress',   // { [levelId]: { lessonIndex, wordIndex } }
  saved: 'roadmap:saved',         // { [levelId]: [ { id, levelId, lessonIndex, startWord, endWord, text, createdAt } ] }
  settings: 'reader:settings',    // { fontSize, fontFamily, bgTheme, brightness, autoTheme }
  unlocked: 'roadmap:unlocked',   // [1, 2, 3, ...]
  completed: 'roadmap:completed', // [1, 2, ...]
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
}

/* ─── SAVED (belgilangan matnlar) ─── */

// TODO: Supabase
export function getSaved(levelId) {
  const all = read(KEYS.saved, {});
  return all[levelId] || [];
}

// TODO: Supabase
export function addSaved(levelId, item) {
  const all = read(KEYS.saved, {});
  if (!all[levelId]) all[levelId] = [];
  all[levelId].push(item);
  write(KEYS.saved, all);
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
