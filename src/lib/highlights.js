import { supabase } from './supabase';

const listeners = new Set();
let cache = [];
let userId = null;
let loadPromise = null;
let initialLoadUserId = null;
let authListenerInstalled = false;
let lastMigrationNotice = '';
let highlightSnapshot = { all: cache, userId };

const MIGRATION_KEY = 'highlights_migrated_v1';
const OLD_KEYS = ['roadmap:saved', 'savedHighlights', 'tarixiy:saved-highlights'];

function notify() {
  highlightSnapshot = { all: cache, userId };
  listeners.forEach((listener) => listener());
}

function getErrorMessage(error) {
  if (error?.code === '23505') return 'allaqachon saqlangan';
  if (error?.code === 'PGRST301' || error?.code === '42501') return 'Saqlash uchun tizimga kiring';
  if (error?.code === '23514') return 'Belgi maʼlumotlari noto‘g‘ri';
  if (error?.code === 'P0001' || /2000|chegara/i.test(error?.message || '')) {
    return 'Saqlangan belgilar chegarasi (2000) to‘ldi';
  }
  if (!navigator?.onLine || /network|fetch|Failed to fetch/i.test(error?.message || '')) {
    return 'Internetga ulanib qayta urinib ko‘ring';
  }
  return error?.message || 'Internetga ulanib qayta urinib ko‘ring';
}

export function normalizeHighlightColor(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(text)) return text.toUpperCase();
  const names = {
    sariq: 'sariq',
    yellow: 'sariq',
    yashil: 'yashil',
    green: 'yashil',
    ko_k: 'ko_k',
    kok: 'ko_k',
    blue: 'ko_k',
  };
  return names[text.toLowerCase()] || 'sariq';
}

function mapRow(row) {
  if (!row) return null;
  return {
    ...row,
    levelId: row.dars_id || row.levelId || null,
    lessonIndex: 0,
    startWord: Number(row.boshlanish || 0),
    endWord: Number(row.tugash || row.boshlanish || 0),
    text: row.matn || '',
    color: normalizeHighlightColor(row.rang),
    lessonTitle: row.dars_sarlavha || '',
    grade: row.fan ? (row.fan === 'jahon' ? 'Jahon tarixi' : 'O‘zbekiston tarixi') : '',
    createdAt: row.yaratilgan ? new Date(row.yaratilgan).getTime() : Date.now(),
  };
}

async function getSession() {
  if (!supabase) throw new Error('Saqlash uchun tizimga kiring');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user?.id) throw new Error('Saqlash uchun tizimga kiring');
  userId = data.session.user.id;
  return supabase;
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function subscribeToHighlights(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHighlightsSnapshot() {
  return highlightSnapshot;
}

export function getCachedHighlights() {
  return cache;
}

export function getCachedHighlightsByLesson(darsId) {
  return cache.filter((item) => item.dars_id === darsId);
}

export function clearHighlightsCache() {
  cache = [];
  userId = null;
  initialLoadUserId = null;
  loadPromise = null;
  notify();
}

export async function loadAll(force = false) {
  const client = await getSession();
  if (!force && cache.length >= 0 && initialLoadUserId === userId) return cache;
  if (loadPromise) return loadPromise;
  const requestUserId = userId;
  let request;
  request = (async () => {
    const { data, error } = await client
      .from('saved_highlights')
      .select('*')
      .order('yaratilgan', { ascending: false })
      .limit(2000);
    if (error) throw error;
    if (userId !== requestUserId) throw new Error('Sessiya o‘zgardi. Qayta urinib ko‘ring.');
    cache = (data || []).map(mapRow).filter(Boolean);
    initialLoadUserId = userId;
    notify();
    return cache;
  })().finally(() => {
    if (loadPromise === request) loadPromise = null;
  });
  loadPromise = request;
  return request;
}

export async function addHighlight(obj) {
  const client = await getSession();
  const requestUserId = userId;
  const payload = { ...obj };
  delete payload.id;
  delete payload.user_id;
  const temporary = mapRow({
    id: obj.id && isUuid(obj.id) ? obj.id : `local-${Date.now()}-${Math.random()}`,
    dars_id: payload.dars_id,
    blok_id: payload.blok_id,
    boshlanish: payload.boshlanish,
    tugash: payload.tugash,
    matn: payload.matn,
    rang: normalizeHighlightColor(payload.rang),
    kontekst_oldi: payload.kontekst_oldi,
    kontekst_keyin: payload.kontekst_keyin,
    dars_sarlavha: payload.dars_sarlavha,
    fan: payload.fan,
    yaratilgan: new Date().toISOString(),
  });
  cache = [temporary, ...cache];
  notify();
  try {
    const query = { ...payload };
    if (obj.id && isUuid(obj.id)) query.id = obj.id;
    const { data, error } = await client
      .from('saved_highlights')
      .insert(query)
      .select()
      .single();
    if (error) throw error;
    if (userId !== requestUserId) throw new Error('Sessiya o‘zgardi. Qayta urinib ko‘ring.');
    const saved = mapRow(data);
    cache = [saved, ...cache.filter((item) => item.id !== temporary.id)];
    notify();
    return saved;
  } catch (error) {
    cache = cache.filter((item) => item.id !== temporary.id);
    notify();
    throw new Error(error?.code === '23505' ? 'allaqachon saqlangan' : getErrorMessage(error));
  }
}

export async function setHighlightColor(id, rang) {
  const client = await getSession();
  const previous = cache.find((item) => item.id === id);
  if (!previous) return null;
  const nextColor = normalizeHighlightColor(rang);
  cache = cache.map((item) => item.id === id ? { ...item, rang: nextColor, color: nextColor } : item);
  notify();
  try {
    const { error } = await client.from('saved_highlights').update({ rang: nextColor }).eq('id', id);
    if (error) throw error;
    return nextColor;
  } catch (error) {
    cache = cache.map((item) => item.id === id ? previous : item);
    notify();
    throw new Error(getErrorMessage(error));
  }
}

export async function updateHighlightPosition(id, changes) {
  const client = await getSession();
  const previous = cache.find((item) => item.id === id);
  if (!previous) return null;
  cache = cache.map((item) => item.id === id ? { ...item, ...changes } : item);
  notify();
  const allowed = {};
  ['blok_id', 'boshlanish', 'tugash', 'kontekst_oldi', 'kontekst_keyin', 'dars_sarlavha'].forEach((key) => {
    if (changes[key] !== undefined) allowed[key] = changes[key];
  });
  try {
    const { error } = await client.from('saved_highlights').update(allowed).eq('id', id);
    if (error) throw error;
    return cache.find((item) => item.id === id) || null;
  } catch (error) {
    cache = cache.map((item) => item.id === id ? previous : item);
    notify();
    throw new Error(getErrorMessage(error));
  }
}

export async function removeHighlight(id) {
  const client = await getSession();
  const previous = cache.find((item) => item.id === id);
  cache = cache.filter((item) => item.id !== id);
  notify();
  try {
    const { error } = await client.from('saved_highlights').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    if (previous) cache = [previous, ...cache];
    notify();
    throw new Error(getErrorMessage(error));
  }
}

function collectLegacyHighlights() {
  const result = [];
  OLD_KEYS.forEach((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => result.push({ ...item, _levelId: item.levelId }));
      } else if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([levelId, items]) => {
          if (Array.isArray(items)) items.forEach((item) => result.push({ ...item, _levelId: item.levelId || levelId }));
        });
      }
    } catch {
      // Eski noto‘g‘ri JSON key uchun migrationni davom ettiramiz.
    }
  });
  return result;
}

export async function migrateLegacyHighlights() {
  if (!window.localStorage || window.localStorage.getItem(MIGRATION_KEY) === '1') return 0;
  const legacy = collectLegacyHighlights();
  if (!legacy.length) {
    window.localStorage.setItem(MIGRATION_KEY, '1');
    OLD_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return 0;
  }
  const client = await getSession();
  const lessonIds = new Set();
  try {
    const { data, error } = await client.from('lessons').select('id');
    if (!error) (data || []).forEach((row) => lessonIds.add(row.id));
  } catch {
    // Valid dars_id tekshiruvi bajarilmasa, migrationni xavfsiz davom ettirish uchun null qilinadi.
  }

  let migrated = 0;
  let networkError = false;
  for (const item of legacy) {
    const matn = typeof item.text === 'string' ? item.text.trim().slice(0, 1000) : '';
    if (!matn) continue;
    const darsId = isUuid(item.dars_id || item.lessonId || item.levelId)
      && lessonIds.has(item.dars_id || item.lessonId || item.levelId)
      ? (item.dars_id || item.lessonId || item.levelId)
      : null;
    const payload = {
      ...(isUuid(item.id) ? { id: item.id } : {}),
      dars_id: darsId,
      blok_id: String(item.blok_id || item.blockId || `legacy-${item._levelId || 'lesson'}`).slice(0, 100),
      boshlanish: Math.max(0, Number(item.boshlanish ?? item.startWord ?? 0)),
      tugash: Math.max(0, Number(item.tugash ?? item.endWord ?? item.startWord ?? 1)),
      matn,
      rang: normalizeHighlightColor(item.rang || item.color),
      kontekst_oldi: String(item.kontekst_oldi || item.contextBefore || '').slice(0, 80),
      kontekst_keyin: String(item.kontekst_keyin || item.contextAfter || '').slice(0, 80),
      dars_sarlavha: String(item.dars_sarlavha || item.lessonTitle || '').slice(0, 200),
      fan: item.fan === 'jahon' || item.fan === 'ozbekiston' ? item.fan : null,
    };
    if (payload.tugash <= payload.boshlanish) payload.tugash = payload.boshlanish + 1;
    if (item.yaratilgan || item.createdAt) {
      const date = new Date(item.yaratilgan || item.createdAt);
      if (!Number.isNaN(date.getTime())) payload.yaratilgan = date.toISOString();
    }
    try {
      const { error } = await client
        .from('saved_highlights')
        .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
      if (error) {
        if (/network|fetch|Failed to fetch/i.test(error.message || '') && !navigator?.onLine) networkError = true;
      } else {
        migrated += 1;
      }
    } catch (error) {
      networkError = true;
    }
  }
  if (!networkError) {
    window.localStorage.setItem(MIGRATION_KEY, '1');
    OLD_KEYS.forEach((key) => window.localStorage.removeItem(key));
    lastMigrationNotice = `${migrated} ta belgi hisobingizga ko‘chirildi`;
  }
  if (!networkError) await loadAll(true);
  notify();
  return migrated;
}

export function getMigrationNotice() {
  const notice = lastMigrationNotice;
  lastMigrationNotice = '';
  return notice;
}

export function ensureHighlightAuthListener() {
  if (!supabase || authListenerInstalled) return;
  authListenerInstalled = true;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      clearHighlightsCache();
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      void migrateLegacyHighlights()
        .catch(() => {})
        .finally(() => { void loadAll().catch(() => {}); });
    }
  });
}
