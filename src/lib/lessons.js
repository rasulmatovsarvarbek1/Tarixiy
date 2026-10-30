import { requireSupabase, supabase } from './supabase';

const LESSON_COLUMNS = 'id,level_id,tartib,fan,sarlavha,muqova,bloklar,holat,yangilangan';
const MISSING_ROW_ERROR = 'Saqlanmadi: ruxsat yo‘q yoki dars topilmadi';
const INSERT_DENIED_ERROR = 'Saqlanmadi: ruxsat yo‘q';
const PUBLIC_CACHE_KEY = 'tarixiy-lessons-cache';
const PUBLIC_CACHE_VERSION = 1;

let publicLevels = readPublicCache();
let adminLevels = null;
let publicLoadPromise = null;
let adminLoadPromise = null;
let adminRefreshPending = false;
let adminRefreshTimer = null;
let adminInitialLoadAttempted = false;
let adminSessionPreloadPromise = null;
let adminSessionPreloadAttempted = false;
let adminCacheGeneration = 0;
let publicDataError = '';
let adminDataError = '';
const listeners = new Set();

function readPublicCache() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(PUBLIC_CACHE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed?.version !== PUBLIC_CACHE_VERSION
      || !Array.isArray(parsed.levels)
      || parsed.levels.some((level) => !Array.isArray(level.darslar))) return null;
    return parsed.levels;
  } catch {
    return null;
  }
}

function persistPublicCache() {
  if (typeof window === 'undefined' || !publicLevels) return;
  try {
    window.localStorage.setItem(PUBLIC_CACHE_KEY, JSON.stringify({
      version: PUBLIC_CACHE_VERSION,
      levels: publicLevels,
    }));
  } catch {
    // The in-memory cache remains usable when browser storage is unavailable.
  }
}

function notifyDataChange() {
  listeners.forEach((listener) => listener());
}

function getPublishedLevels(levels) {
  return levels.map((level) => ({
    ...level,
    darslar: level.darslar.filter((lesson) => lesson.holat === 'elon_qilingan'),
  }));
}

function splitLevels(levels, lessons) {
  const lessonsByLevel = new Map(levels.map((level) => [level.id, []]));
  lessons.forEach((lesson) => lessonsByLevel.get(lesson.level_id)?.push(lesson));
  return levels.map((level) => ({
    ...level,
    darslar: lessonsByLevel.get(level.id) || [],
  }));
}

function setAdminLevels(levels) {
  adminLevels = levels;
  publicLevels = getPublishedLevels(levels);
  persistPublicCache();
  adminDataError = '';
  publicDataError = '';
  notifyDataChange();
}

function upsertLevel(level) {
  if (!adminLevels) return;
  const index = adminLevels.findIndex((item) => item.id === level.id);
  const next = [...adminLevels];
  if (index === -1) next.push({ ...level, darslar: [] });
  else next[index] = { ...next[index], ...level };
  next.sort((first, second) => first.sinf - second.sinf || first.tartib - second.tartib);
  setAdminLevels(next);
}

function updateCachedLesson(levelId, lesson) {
  if (!adminLevels) return;
  setAdminLevels(adminLevels.map((level) => {
    if (level.id !== levelId) return level;
    const index = level.darslar.findIndex((item) => item.id === lesson.id);
    const darslar = [...level.darslar];
    if (index === -1) darslar.push(lesson);
    else darslar[index] = lesson;
    darslar.sort((first, second) => first.tartib - second.tartib);
    return { ...level, darslar };
  }));
}

function removeCachedLesson(levelId, lessonId) {
  if (!adminLevels) return;
  setAdminLevels(adminLevels.map((level) => (
    level.id === levelId
      ? { ...level, darslar: level.darslar.filter((lesson) => lesson.id !== lessonId) }
      : level
  )));
}

function scheduleAdminRefresh() {
  if (!adminLevels || adminRefreshTimer) return;
  adminRefreshTimer = setTimeout(() => {
    adminRefreshTimer = null;
    void refreshAdminData();
  }, 100);
}

export function subscribeToLessonData(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCachedLevels() {
  return publicLevels;
}

export function getCachedLevel(levelId) {
  const level = publicLevels?.find((item) => item.id === levelId);
  return level ? { id: level.id, nom: level.nom, darslar: level.darslar } : null;
}

export function getCachedAdminLevels() {
  return adminLevels;
}

export function getCachedLevelAdmin(levelId) {
  const level = adminLevels?.find((item) => item.id === levelId);
  if (!level) return null;
  return {
    id: level.id,
    sinf: level.sinf,
    nom: level.nom,
    darslar: level.darslar,
  };
}

export function getPublicDataError() {
  return publicDataError;
}

export function getAdminDataError() {
  return adminDataError;
}

async function fetchPublicLevels() {
  const client = requireSupabase();
  const [levelsResult, lessonsResult] = await Promise.all([
    client.from('levels')
      .select('id,sinf,tartib,nom')
      .order('sinf', { ascending: true })
      .order('tartib', { ascending: true }),
    client.from('lessons')
      .select(LESSON_COLUMNS)
      .eq('holat', 'elon_qilingan')
      .order('tartib', { ascending: true }),
  ]);
  if (levelsResult.error) throw levelsResult.error;
  if (lessonsResult.error) throw lessonsResult.error;
  return splitLevels(levelsResult.data || [], lessonsResult.data || []);
}

export function refreshPublicData() {
  if (publicLoadPromise) return publicLoadPromise;
  publicLoadPromise = fetchPublicLevels()
    .then((levels) => {
      publicLevels = getPublishedLevels(levels);
      publicDataError = '';
      persistPublicCache();
      notifyDataChange();
      return publicLevels;
    })
    .catch((error) => {
      publicDataError = error instanceof Error ? error.message : 'Levellarni yuklab bo‘lmadi.';
      notifyDataChange();
      return publicLevels;
    })
    .finally(() => { publicLoadPromise = null; });
  return publicLoadPromise;
}

export function preloadPublicData() {
  return refreshPublicData();
}

export function refreshAdminData() {
  if (!adminLevels) adminInitialLoadAttempted = true;
  if (adminRefreshTimer) {
    clearTimeout(adminRefreshTimer);
    adminRefreshTimer = null;
  }
  if (adminLoadPromise) {
    adminRefreshPending = true;
    return adminLoadPromise;
  }
  const generation = adminCacheGeneration;
  let request;
  request = (async () => {
    do {
      adminRefreshPending = false;
      try {
        const client = requireSupabase();
        const [levelsResult, lessonsResult] = await Promise.all([
          client.from('levels')
            .select('id,sinf,tartib,nom')
            .order('sinf', { ascending: true })
            .order('tartib', { ascending: true }),
          client.from('lessons')
            .select(LESSON_COLUMNS)
            .order('tartib', { ascending: true }),
        ]);
        if (levelsResult.error) throw levelsResult.error;
        if (lessonsResult.error) throw lessonsResult.error;
        if (generation !== adminCacheGeneration) return null;
        setAdminLevels(splitLevels(levelsResult.data || [], lessonsResult.data || []));
      } catch (error) {
        if (generation !== adminCacheGeneration) return null;
        adminDataError = error instanceof Error ? error.message : 'Admin ma’lumotlarini yuklab bo‘lmadi.';
        notifyDataChange();
        if (!adminLevels) throw error;
      }
    } while (adminRefreshPending);
    return adminLevels;
  })().finally(() => {
    if (adminLoadPromise === request) adminLoadPromise = null;
  });
  adminLoadPromise = request;
  return request;
}

export function loadAdminData() {
  if (adminLevels) return Promise.resolve(adminLevels);
  if (adminLoadPromise) return adminLoadPromise;
  if (adminInitialLoadAttempted) {
    return Promise.reject(new Error(adminDataError || 'Admin ma’lumotlarini yuklab bo‘lmadi.'));
  }
  adminInitialLoadAttempted = true;
  return refreshAdminData();
}

export function preloadAdminDataForSession() {
  if (adminLevels) return Promise.resolve(adminLevels);
  if (adminSessionPreloadPromise) return adminSessionPreloadPromise;
  if (adminSessionPreloadAttempted || !supabase) return Promise.resolve(null);

  adminSessionPreloadAttempted = true;
  const generation = adminCacheGeneration;
  adminSessionPreloadPromise = (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (generation !== adminCacheGeneration) return null;
    const userId = data.session?.user?.id;
    if (!userId) return null;

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (adminError) throw adminError;
    if (generation !== adminCacheGeneration) return null;
    if (!admin) return null;
    return loadAdminData();
  })()
    .catch((error) => {
      if (generation === adminCacheGeneration && !adminLevels) {
        adminDataError = error instanceof Error
          ? error.message
          : 'Admin ma’lumotlarini yuklab bo‘lmadi.';
        notifyDataChange();
      }
      return null;
    })
    .finally(() => { adminSessionPreloadPromise = null; });
  return adminSessionPreloadPromise;
}

export function clearAdminData() {
  adminCacheGeneration += 1;
  adminLoadPromise = null;
  if (adminRefreshTimer) clearTimeout(adminRefreshTimer);
  adminRefreshTimer = null;
  adminLevels = null;
  adminDataError = '';
  adminRefreshPending = false;
  adminInitialLoadAttempted = false;
  adminSessionPreloadPromise = null;
  adminSessionPreloadAttempted = false;
  notifyDataChange();
}

if (typeof window !== 'undefined') void preloadPublicData();

function throwOperationError(error, fallback) {
  if (error instanceof Error && [MISSING_ROW_ERROR, INSERT_DENIED_ERROR].includes(error.message)) {
    throw error;
  }
  if (error instanceof Error && error.message.startsWith('Supabase ulanishi sozlanmagan.')) {
    throw error;
  }
  const details = error instanceof Error ? error.message : '';
  throw new Error(details ? `${fallback}: ${details}` : fallback);
}

async function runQuery(fallback, operation) {
  try {
    return await operation(requireSupabase());
  } catch (error) {
    throwOperationError(error, fallback);
  }
}

async function loadLevel(client, levelId) {
  const { data, error } = await client
    .from('levels')
    .select('id,sinf,tartib,nom')
    .eq('id', levelId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Level topilmadi.');
  return data;
}

export async function getLevels() {
  if (publicLevels) return publicLevels;
  const levels = await refreshPublicData();
  if (levels) return levels;
  throw new Error(publicDataError || 'Levellarni yuklab bo‘lmadi.');
}

export async function getLevel(levelId) {
  const cachedLevel = getCachedLevel(levelId);
  if (cachedLevel) return cachedLevel;
  const levels = await getLevels();
  const level = levels.find((item) => item.id === levelId);
  if (!level) throw new Error('Level topilmadi.');
  return { id: level.id, nom: level.nom, darslar: level.darslar };
}

export async function getLevelAdmin(levelId) {
  const cachedLevel = getCachedLevelAdmin(levelId);
  if (cachedLevel) return cachedLevel;
  const levels = await loadAdminData();
  const level = levels.find((item) => item.id === levelId);
  if (!level) throw new Error('Level topilmadi.');
  return {
    id: level.id,
    sinf: level.sinf,
    nom: level.nom,
    darslar: level.darslar,
  };
}

export async function createLesson(levelId) {
  return runQuery('Yangi dars yaratilmadi', async (client) => {
    const { data: latestLesson, error: latestError } = await client
      .from('lessons')
      .select('tartib')
      .eq('level_id', levelId)
      .order('tartib', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    const { data, error } = await client
      .from('lessons')
      .insert({
        level_id: levelId,
        tartib: (latestLesson?.tartib || 0) + 1,
        fan: 'jahon',
        sarlavha: '',
        muqova: {},
        bloklar: [],
        holat: 'qoralama',
      })
      .select(LESSON_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(INSERT_DENIED_ERROR);
    updateCachedLesson(levelId, data);
    scheduleAdminRefresh();
    return data;
  });
}

export async function createLevel({ sinf, nom }) {
  if (!Number.isInteger(sinf) || sinf < 1) {
    throw new Error('Sinf raqami butun va musbat son bo‘lishi kerak.');
  }
  if (typeof nom !== 'string' || !nom.trim()) {
    throw new Error('Level nomi bo‘sh bo‘lmasligi kerak.');
  }

  return runQuery('Yangi level yaratilmadi', async (client) => {
    const { data: latestLevel, error: latestError } = await client
      .from('levels')
      .select('tartib')
      .eq('sinf', sinf)
      .order('tartib', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    const { data, error } = await client
      .from('levels')
      .insert({
        sinf,
        nom,
        tartib: (latestLevel?.tartib || 0) + 1,
      })
      .select('id,sinf,tartib,nom')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(INSERT_DENIED_ERROR);
    upsertLevel(data);
    return data;
  });
}

function buildMissingDefaultLessons(level, existing) {
  const existingKeys = new Set(existing.map((lesson) => `${lesson.fan}\u0000${lesson.sarlavha}`));
  const templates = [
    { fan: 'ozbekiston', sarlavha: "O'zbekiston tarixi" },
    { fan: 'jahon', sarlavha: 'Jahon tarixi 1' },
    { fan: 'jahon', sarlavha: 'Jahon tarixi 2' },
  ];
  const nextOrder = existing.reduce((max, lesson) => Math.max(max, lesson.tartib || 0), 0);
  const missing = [];

  for (const template of templates) {
    if (existing.length + missing.length >= 3) break;
    const lessonKey = `${template.fan}\u0000${template.sarlavha}`;
    if (existingKeys.has(lessonKey)) continue;

    missing.push({
      level_id: level.id,
      tartib: nextOrder + missing.length + 1,
      ...template,
      muqova: {},
      bloklar: [],
      holat: 'qoralama',
    });
    existingKeys.add(lessonKey);
  }
  return missing;
}

export async function ensureLevelLessons(levelId) {
  return runQuery('Level darslarini yaratib bo‘lmadi', async (client) => {
    const level = await loadLevel(client, levelId);
    const { data: existing, error: selectError } = await client
      .from('lessons')
      .select(LESSON_COLUMNS)
      .eq('level_id', levelId)
      .order('tartib', { ascending: true });
    if (selectError) throw selectError;
    (existing || []).forEach((lesson) => updateCachedLesson(levelId, lesson));

    const missingLessons = buildMissingDefaultLessons(level, existing || []);
    if (missingLessons.length === 0) return { lessonsCreated: 0 };

    const { data, error } = await client
      .from('lessons')
      .insert(missingLessons)
      .select(LESSON_COLUMNS);
    if (error) throw error;
    if (!data || data.length !== missingLessons.length) throw new Error(INSERT_DENIED_ERROR);
    data.forEach((lesson) => updateCachedLesson(levelId, lesson));
    scheduleAdminRefresh();
    return { lessonsCreated: data.length };
  });
}

export async function ensureGradeCatalog() {
  return runQuery('Level va darslar tuzilmasini tiklab bo‘lmadi', async (client) => {
    const desiredLevels = Array.from({ length: 6 }, (_, gradeIndex) => {
      const sinf = gradeIndex + 6;
      return Array.from({ length: 12 }, (_, levelIndex) => ({
        sinf,
        nom: `${levelIndex + 1} Level`,
      }));
    }).flat();

    const { data: currentLevels, error: levelsError } = await client
      .from('levels')
      .select('id,sinf,tartib,nom')
      .order('sinf', { ascending: true })
      .order('tartib', { ascending: true });
    if (levelsError) throw levelsError;

    const levelsByKey = new Map(
      (currentLevels || []).map((level) => [`${level.sinf}\u0000${level.nom}`, level]),
    );
    let levelsCreated = 0;

    for (let sinf = 6; sinf <= 11; sinf += 1) {
      const missing = desiredLevels.filter((level) => (
        level.sinf === sinf && !levelsByKey.has(`${level.sinf}\u0000${level.nom}`)
      ));
      if (missing.length === 0) continue;

      const maxOrder = (currentLevels || [])
        .filter((level) => level.sinf === sinf)
        .reduce((max, level) => Math.max(max, level.tartib || 0), 0);
      const { data, error } = await client
        .from('levels')
        .insert(missing.map((level, index) => ({
          ...level,
          tartib: maxOrder + index + 1,
        })))
        .select('id,sinf,tartib,nom');

      if (error) throw error;
      if (!data || data.length !== missing.length) throw new Error(INSERT_DENIED_ERROR);
      data.forEach((level) => levelsByKey.set(`${level.sinf}\u0000${level.nom}`, level));
      levelsCreated += data.length;
    }

    const catalogLevels = desiredLevels.map((level) => levelsByKey.get(`${level.sinf}\u0000${level.nom}`));
    const { data: currentLessons, error: lessonsError } = await client
      .from('lessons')
      .select('id,level_id,tartib,fan,sarlavha')
      .in('level_id', catalogLevels.map((level) => level.id))
      .order('tartib', { ascending: true });
    if (lessonsError) throw lessonsError;

    const lessonsByLevel = new Map(catalogLevels.map((level) => [level.id, []]));
    (currentLessons || []).forEach((lesson) => lessonsByLevel.get(lesson.level_id)?.push(lesson));
    const lessonsToCreate = [];

    for (const level of catalogLevels) {
      const existing = lessonsByLevel.get(level.id);
      lessonsToCreate.push(...buildMissingDefaultLessons(level, existing));
    }

    let lessonsCreated = 0;
    if (lessonsToCreate.length > 0) {
      const { data, error } = await client
        .from('lessons')
        .insert(lessonsToCreate)
        .select('id');
      if (error) throw error;
      if (!data || data.length !== lessonsToCreate.length) throw new Error(INSERT_DENIED_ERROR);
      lessonsCreated = data.length;
    }

    return { levelsCreated, lessonsCreated };
  });
}

function dataUrlToFile(dataUrl, fileName) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([a-z\d+/]+=*)$/i);
  if (!match) throw new Error('Rasmning data URL formati noto‘g‘ri yoki qo‘llab-quvvatlanmaydi.');
  const [, type, encoded] = match;
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new File([bytes], fileName, { type: type.toLowerCase() });
}

export async function importOldData() {
  return runQuery('Eski ma’lumotlarni yuklab bo‘lmadi', async (client) => {
    const { default: oldLevels } = await import('../data/mockLevel');
    const result = {
      levelsImported: 0,
      lessonsImported: 0,
      levelsSkipped: 0,
      lessonsSkipped: 0,
      imagesSkipped: 0,
      errors: 0,
      warnings: [],
    };

    const { data: existingLevels, error: levelsError } = await client
      .from('levels')
      .select('id,sinf,tartib,nom')
      .order('tartib', { ascending: true });
    if (levelsError) throw levelsError;

    const levelsByKey = new Map(
      (existingLevels || []).map((level) => [`${level.sinf}\u0000${level.nom}`, level]),
    );

    for (const [levelIndex, oldLevel] of oldLevels.entries()) {
      const sinf = Math.floor(levelIndex / 10) + 5;
      const levelKey = `${sinf}\u0000${oldLevel.nom}`;
      let level = levelsByKey.get(levelKey);

      if (level) {
        result.levelsSkipped += 1;
      } else {
        try {
          level = await createLevel({ sinf, nom: oldLevel.nom });
          levelsByKey.set(levelKey, level);
          result.levelsImported += 1;
        } catch (error) {
          result.errors += 1;
          result.warnings.push(`${oldLevel.nom}: ${error instanceof Error ? error.message : 'Level yaratilmadi.'}`);
          continue;
        }
      }

      const { data: existingLessons, error: lessonsError } = await client
        .from('lessons')
        .select('fan,sarlavha')
        .eq('level_id', level.id);

      if (lessonsError) {
        result.errors += 1;
        result.warnings.push(`${oldLevel.nom} darslari tekshirilmadi: ${lessonsError.message}`);
        continue;
      }

      const lessonKeys = new Set((existingLessons || []).map((lesson) => `${lesson.fan}\u0000${lesson.sarlavha}`));
      for (const [lessonIndex, oldLesson] of oldLevel.darslar.entries()) {
        const lessonKey = `${oldLesson.fan}\u0000${oldLesson.sarlavha}`;
        if (lessonKeys.has(lessonKey)) {
          result.lessonsSkipped += 1;
          continue;
        }

        try {
          const blocks = [];
          for (const [blockIndex, oldBlock] of (oldLesson.bloklar || []).entries()) {
            const block = {
              ...oldBlock,
              id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${lessonIndex + 1}-${blockIndex + 1}`,
            };
            if (block.tur === 'rasm' && typeof block.url === 'string' && block.url.startsWith('data:')) {
              const file = dataUrlToFile(block.url, `import-${Date.now()}-${blockIndex}`);
              if (file.size > 2 * 1024 * 1024) {
                result.imagesSkipped += 1;
                result.warnings.push(`${oldLevel.nom} · ${oldLesson.sarlavha}: 2 MB dan katta rasm o‘tkazib yuborildi.`);
                block.url = '';
              } else {
                try {
                  block.url = await uploadImage(file);
                } catch (error) {
                  result.errors += 1;
                  result.warnings.push(`${oldLevel.nom} · ${oldLesson.sarlavha}: rasm yuklanmadi — ${error instanceof Error ? error.message : 'Noma’lum xato.'}`);
                  block.url = '';
                }
              }
            }
            blocks.push(block);
          }

          const { data, error } = await client
            .from('lessons')
            .insert({
              level_id: level.id,
              tartib: lessonIndex + 1,
              fan: oldLesson.fan,
              sarlavha: oldLesson.sarlavha,
              muqova: oldLesson.muqova,
              bloklar: blocks,
              holat: oldLesson.holat || 'qoralama',
            })
            .select(LESSON_COLUMNS)
            .maybeSingle();

          if (error) throw error;
          if (!data) throw new Error(INSERT_DENIED_ERROR);
          updateCachedLesson(level.id, data);
          lessonKeys.add(lessonKey);
          result.lessonsImported += 1;
        } catch (error) {
          result.errors += 1;
          result.warnings.push(`${oldLevel.nom} · ${oldLesson.sarlavha}: ${error instanceof Error ? error.message : 'Dars yuklanmadi.'}`);
        }
      }
    }

    return result;
  });
}

export async function saveLesson(levelId, dars) {
  return runQuery('Dars saqlanmadi', async (client) => {
    const { data, error } = await client
      .from('lessons')
      .update({
        fan: dars.fan,
        sarlavha: dars.sarlavha,
        muqova: dars.muqova,
        bloklar: dars.bloklar,
        holat: dars.holat,
        yangilangan: new Date().toISOString(),
      })
      .eq('id', dars.id)
      .eq('level_id', levelId)
      .select(LESSON_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(MISSING_ROW_ERROR);
    updateCachedLesson(levelId, data);
    scheduleAdminRefresh();
    return data;
  });
}

export async function deleteLesson(levelId, darsId) {
  return runQuery('Dars o‘chirilmadi', async (client) => {
    const { data, error } = await client
      .from('lessons')
      .delete()
      .eq('id', darsId)
      .eq('level_id', levelId)
      .select(LESSON_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(MISSING_ROW_ERROR);
    removeCachedLesson(levelId, darsId);
    scheduleAdminRefresh();
    return data;
  });
}

export async function uploadImage(file) {
  if (!file || typeof file !== 'object') {
    throw new Error('Yuklash uchun rasm faylini tanlang.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Rasm hajmi 2 MB dan oshmasligi kerak.');
  }

  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const extension = extensions[file.type];
  if (!extension) {
    throw new Error('Faqat JPG, PNG, WEBP yoki GIF formatidagi rasm yuklash mumkin.');
  }

  return runQuery('Rasm yuklanmadi', async (client) => {
    const randomPart = globalThis.crypto?.randomUUID?.()
      || `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const filePath = `${Date.now()}-${randomPart}.${extension}`;
    const { error } = await client.storage
      .from('dars-rasmlari')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = client.storage.from('dars-rasmlari').getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error('Rasm uchun ommaviy URL olinmadi.');
    return data.publicUrl;
  });
}
