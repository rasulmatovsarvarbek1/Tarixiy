import { supabase } from './supabase';

const listeners = new Set();
const oyKeshi = new Map();
let snapshot = {
  authenticated: null,
  holat: null,
  paketlar: null,
  error: '',
  completionNotice: null,
  revision: 0,
};
let userId = null;
let initialLoadAttempted = false;
let initialLoadPromise = null;
let holatLoadPromise = null;
let packageLoadPromise = null;
const oySorovlari = new Map();
let hiddenAt = null;
let visibilityListenerInstalled = false;
let authListenerInstalled = false;
let lastCompletionNoticeDate = null;

function publish(changes = {}) {
  snapshot = { ...snapshot, ...changes, revision: snapshot.revision + 1 };
  listeners.forEach((listener) => listener());
}

function clearUserData() {
  oyKeshi.clear();
  oySorovlari.clear();
  holatLoadPromise = null;
  lastCompletionNoticeDate = null;
  publish({ holat: null, error: '', completionNotice: null });
}

function normalizeRpcData(data) {
  return Array.isArray(data) ? data[0] : data;
}

function ensureSameUser(requestUserId) {
  if (requestUserId === userId) return;
  const error = new Error('Sessiya o‘zgardi. Qayta urinib ko‘ring.');
  publish({ error: error.message });
  throw error;
}

function getTodayDateString() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function monthCacheKey(year, month) {
  return `${userId || 'unknown'}:${year}-${String(month).padStart(2, '0')}`;
}

function updateCachedToday(holat) {
  const today = holat?.bugun?.sana;
  if (!today) return;
  const [year, month] = today.split('-').map(Number);
  const key = monthCacheKey(year, month);
  const rows = oyKeshi.get(key);
  if (!rows) return;
  const existing = rows.find((row) => row.sana === today);
  const nextRow = {
    sana: today,
    soniya: holat.bugun.soniya,
    reja_bajarildi: holat.bugun.bajarildi,
    muz_ishlatildi: existing?.muz_ishlatildi ?? false,
  };
  oyKeshi.set(key, [...rows.filter((row) => row.sana !== today), nextRow]);
}

async function getAuthenticatedClient() {
  if (!supabase) {
    publish({ authenticated: false });
    throw new Error('Kirish talab qilinadi');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    publish({ error: error.message });
    throw error;
  }

  const sessionUserId = data.session?.user?.id;
  if (!sessionUserId) {
    if (userId) {
      userId = null;
      clearUserData();
    }
    publish({ authenticated: false });
    throw new Error('Kirish talab qilinadi');
  }

  if (userId && userId !== sessionUserId) clearUserData();
  userId = sessionUserId;
  publish({ authenticated: true });
  return supabase;
}

function handleHolat(holat, newCompletion = false) {
  if (!holat || typeof holat !== 'object') {
    const error = new Error('Faollik holati noto‘g‘ri formatda qaytdi.');
    publish({ error: error.message });
    throw error;
  }
  updateCachedToday(holat);
  let completionNotice = snapshot.completionNotice;
  const completionDate = holat.bugun?.sana || getTodayDateString();
  if (newCompletion && completionDate !== lastCompletionNoticeDate) {
    lastCompletionNoticeDate = completionDate;
    completionNotice = { date: completionDate, reward: holat.bugun?.mukofot_tanga ?? 0 };
  }
  publish({ holat, error: '', completionNotice });
  return holat;
}

async function fetchHolat(client) {
  const requestUserId = userId;
  const { data, error } = await client.rpc('holat_olish');
  if (error) {
    publish({ error: error.message });
    throw error;
  }
  ensureSameUser(requestUserId);
  return handleHolat(normalizeRpcData(data));
}

export function subscribeToFaollik(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFaollikSnapshot() {
  return snapshot;
}

function loadHolat(forceRefresh) {
  if (holatLoadPromise) return holatLoadPromise;
  let request;
  request = (async () => {
    const client = await getAuthenticatedClient();
    if (!forceRefresh && snapshot.holat) return snapshot.holat;
    return fetchHolat(client);
  })().finally(() => {
    if (holatLoadPromise === request) holatLoadPromise = null;
  });
  holatLoadPromise = request;
  return request;
}

export function refreshHolat() {
  return loadHolat(true);
}

export function getHolat() {
  return loadHolat(false);
}

export async function qoshFaollik(soniya) {
  if (!Number.isInteger(soniya) || soniya < 1 || soniya > 60) {
    throw new RangeError('Faollik soniyasi 1 dan 60 gacha butun son bo‘lishi kerak.');
  }
  const client = await getAuthenticatedClient();
  const requestUserId = userId;
  const { data, error } = await client.rpc('faollik_qosh', { p_soniya: soniya });
  if (error) {
    publish({ error: error.message });
    throw error;
  }
  ensureSameUser(requestUserId);
  const result = normalizeRpcData(data);
  const holat = handleHolat(result, result?.yangi_bajarildi === true);
  return { ...result, ...holat, yangi_bajarildi: result?.yangi_bajarildi === true };
}

export async function sotibOlMuz(paketId) {
  const client = await getAuthenticatedClient();
  const requestUserId = userId;
  const { data, error } = await client.rpc('muz_sotib_ol', { p_paket_id: paketId });
  if (error) {
    publish({ error: error.message });
    throw error;
  }
  ensureSameUser(requestUserId);
  const holat = handleHolat(normalizeRpcData(data));
  return holat;
}

export function getMuzPaketlari() {
  if (packageLoadPromise) return packageLoadPromise;
  let request;
  request = (async () => {
    const client = await getAuthenticatedClient();
    if (snapshot.paketlar) return snapshot.paketlar;
    const { data, error } = await client
      .from('muz_paketlari')
      .select('id, soni, narx, tartib')
      .order('tartib');
    if (error) {
      publish({ error: error.message });
      throw error;
    }
    const paketlar = data || [];
    publish({ paketlar, error: '' });
    return paketlar;
  })().finally(() => {
    if (packageLoadPromise === request) packageLoadPromise = null;
  });
  packageLoadPromise = request;
  return request;
}

export async function getOyFaolligi(yil, oy) {
  if (!Number.isInteger(yil) || !Number.isInteger(oy) || oy < 1 || oy > 12) {
    throw new RangeError('Yil yoki oy noto‘g‘ri.');
  }
  const client = await getAuthenticatedClient();
  const key = monthCacheKey(yil, oy);
  if (oyKeshi.has(key)) return oyKeshi.get(key);
  if (oySorovlari.has(key)) return oySorovlari.get(key);
  const requestUserId = userId;

  const request = (async () => {
    const oyBoshi = `${yil}-${String(oy).padStart(2, '0')}-01`;
    const oyOxiri = `${yil}-${String(oy).padStart(2, '0')}-${String(new Date(yil, oy, 0).getDate()).padStart(2, '0')}`;
    const { data, error } = await client
      .from('kunlik_faollik')
      .select('sana, soniya, reja_bajarildi, muz_ishlatildi')
      .gte('sana', oyBoshi)
      .lte('sana', oyOxiri);
    if (error) {
      publish({ error: error.message });
      throw error;
    }
    ensureSameUser(requestUserId);
    const rows = data || [];
    oyKeshi.set(key, rows);
    publish({ error: '' });
    return rows;
  })().finally(() => oySorovlari.delete(key));
  oySorovlari.set(key, request);
  return request;
}

export function dismissCompletionNotice() {
  if (snapshot.completionNotice) publish({ completionNotice: null });
}

export function preloadFaollikForSession() {
  if (initialLoadAttempted) return initialLoadPromise || Promise.resolve(null);
  if (initialLoadPromise) return initialLoadPromise;

  installRefreshListeners();
  initialLoadPromise = (async () => {
    try {
      await getAuthenticatedClient();
      initialLoadAttempted = true;
      const results = await Promise.allSettled([refreshHolat(), getMuzPaketlari()]);
      const failure = results.find((result) => result.status === 'rejected'
        && result.reason?.message !== 'Kirish talab qilinadi');
      if (failure) {
        publish({ error: failure.reason instanceof Error ? failure.reason.message : 'Faollik ma’lumotlarini yuklab bo‘lmadi.' });
        console.error('Faollik ma’lumotlarini yuklab bo‘lmadi:', failure.reason);
      }
      return snapshot;
    } catch (error) {
      if (error?.message !== 'Kirish talab qilinadi') {
        publish({ error: error instanceof Error ? error.message : 'Faollik ma’lumotlarini yuklab bo‘lmadi.' });
        console.error('Faollik ma’lumotlarini yuklab bo‘lmadi:', error);
      }
      return null;
    } finally {
      initialLoadPromise = null;
    }
  })();
  return initialLoadPromise;
}

function installRefreshListeners() {
  if (typeof document !== 'undefined' && !visibilityListenerInstalled) {
    visibilityListenerInstalled = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt === null) return;
      const wasHiddenFor = Date.now() - hiddenAt;
      hiddenAt = null;
      if (wasHiddenFor < 30 * 60 * 1000) return;
      void refreshHolat().catch((error) => {
        if (error?.message !== 'Kirish talab qilinadi') {
          console.error('Faollik holatini yangilab bo‘lmadi:', error);
        }
      });
    });
  }

  if (supabase && !authListenerInstalled) {
    authListenerInstalled = true;
    supabase.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user?.id || null;
      if (nextUserId !== userId) {
        userId = nextUserId;
        initialLoadAttempted = false;
        clearUserData();
      }
      publish({ authenticated: Boolean(nextUserId) });
      if (nextUserId && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        window.setTimeout(() => { void preloadFaollikForSession(); }, 0);
      }
    });
  }
}

export function refreshFaollikForRetry() {
  return Promise.all([refreshHolat(), getMuzPaketlari()]);
}
