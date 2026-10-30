import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import BookReader, { getImagePageNumbers } from '../components/BookReader';
import { normalizeLessonText } from '../lib/lessonText';
import {
  createLesson,
  createLevel,
  clearAdminData,
  deleteLesson,
  ensureLevelLessons,
  getAdminDataError,
  getCachedAdminLevels,
  getCachedLevelAdmin,
  getLevelAdmin,
  importOldData,
  loadAdminData,
  refreshAdminData,
  saveLesson,
  subscribeToLessonData,
  uploadImage,
} from '../lib/lessons';

const PAGE_BG = 'bg-[#FBF7F2]';
const FIELD = 'min-w-0 w-full rounded-xl border border-[#DED8CE] bg-white px-3 py-2.5 text-sm text-[#2A2A2A] outline-none transition focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/25';
const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8B84B] px-4 py-2.5 text-sm font-semibold text-[#2A2A2A] transition hover:bg-[#ddb044] disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED8CE] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A2A2A] transition hover:bg-[#F6F1E9]';
const AdminAuthContext = createContext({ signOut: () => {} });

function routeFromPath(pathname) {
  const lessonMatch = pathname.match(/^\/admin\/level\/([^/]+)\/dars\/([^/]+)\/?$/);
  if (lessonMatch) {
    return { page: 'lesson', levelId: decodeURIComponent(lessonMatch[1]), lessonId: decodeURIComponent(lessonMatch[2]) };
  }
  const levelMatch = pathname.match(/^\/admin\/level\/([^/]+)\/?$/);
  if (levelMatch) return { page: 'level', levelId: decodeURIComponent(levelMatch[1]) };
  if (pathname === '/admin' || pathname === '/admin/') return { page: 'home' };
  return { page: 'notFound' };
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Kutilmagan xatolik yuz berdi.';
}

function AdminHeader({ navigate, backPath, title }) {
  return (
    <header className="border-b border-[#E9E2D8] bg-white">
      <div className="mx-auto flex w-full items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="rounded-lg p-2 text-[#514B43] hover:bg-[#F6F1E9]"
          aria-label="Orqaga"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7A3B]">Tarixiy · Admin</p>
          <h1 className="break-words text-base font-bold leading-snug text-[#2A2A2A] min-[375px]:text-lg sm:text-xl">{title}</h1>
        </div>
      </div>
    </header>
  );
}

function LoadingMessage() {
  return <p className="py-12 text-center text-sm text-[#6F6A62]">Yuklanmoqda...</p>;
}

function AdminSkeleton({ rows = 3 }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl bg-[#F1EBDD]" />
      ))}
    </div>
  );
}

function AdminHome({ navigate }) {
  const [levels, setLevels] = useState(() => getCachedAdminLevels());
  const [isLoading, setIsLoading] = useState(() => !getCachedAdminLevels());
  const loading = isLoading && !levels;
  const [error, setError] = useState(() => (
    getCachedAdminLevels() ? '' : getAdminDataError()
  ));
  const [busy, setBusy] = useState(false);
  const [operationMessage, setOperationMessage] = useState('');
  const [importResult, setImportResult] = useState(null);

  const refreshLevels = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      await refreshAdminData();
      setLevels(getCachedAdminLevels());
      if (!getCachedAdminLevels()) setError(getAdminDataError());
    } catch (reason) {
      if (!getCachedAdminLevels()) setError(getErrorMessage(reason));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncCache = () => {
      const cachedLevels = getCachedAdminLevels();
      if (cachedLevels) setLevels(cachedLevels);
      setError(cachedLevels ? '' : getAdminDataError());
    };
    const unsubscribe = subscribeToLessonData(syncCache);
    if (!getCachedAdminLevels()) {
      loadAdminData()
        .then(setLevels)
        .catch((reason) => setError(getErrorMessage(reason)))
        .finally(() => setIsLoading(false));
    }
    return unsubscribe;
  }, []);

  const handleCreateLevel = async () => {
    const sinfInput = window.prompt('Sinf raqamini kiriting (masalan, 5):');
    if (sinfInput === null) return;
    const sinf = Number(sinfInput);
    if (!Number.isInteger(sinf) || sinf < 1) {
      setError('Sinf raqami butun va musbat son bo‘lishi kerak.');
      return;
    }

    const nom = window.prompt('Level nomini kiriting:');
    if (nom === null) return;
    if (!nom.trim()) {
      setError('Level nomi bo‘sh bo‘lmasligi kerak.');
      return;
    }

    setBusy(true);
    setError('');
    setImportResult(null);
    try {
      const level = await createLevel({ sinf, nom: nom.trim() });
      await ensureLevelLessons(level.id);
      setOperationMessage('Yangi level 3 ta darsi bilan yaratildi.');
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  };

  const handleImportOldData = async () => {
    if (!window.confirm('Koddagi barcha eski level va darslarni bazaga yuklashni xohlaysizmi? Mavjud darslar dublikat bo‘lmasligi uchun tekshiriladi.')) return;
    setBusy(true);
    setError('');
    setImportResult(null);
    setOperationMessage('Eski level va darslar tekshirilmoqda hamda bazaga yuklanmoqda...');
    try {
      const result = await importOldData();
      setImportResult(result);
      setOperationMessage('Eski ma’lumotlarni yuklash yakunlandi.');
      await refreshAdminData();
    } catch (reason) {
      setError(getErrorMessage(reason));
      setOperationMessage('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath="/" title="Levellar" />
      <main className="mx-auto w-full px-3 py-5 min-[375px]:px-4 sm:px-5 sm:py-7">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" disabled={busy || !levels} onClick={handleCreateLevel} className={PRIMARY}>
            <Plus size={18} /> Yangi level qo‘shish
          </button>
          <button type="button" disabled={busy || !levels} onClick={handleImportOldData} className={SECONDARY}>
            {busy ? 'Yuklanmoqda...' : 'Eski ma’lumotni bazaga yuklash'}
          </button>
          {levels && (
            <button type="button" disabled={busy} onClick={refreshLevels} className={SECONDARY}>
              Ro‘yxatni yangilash
            </button>
          )}
        </div>
        {operationMessage && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{operationMessage}</p>}
        {error && !loading && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {error && !levels && !loading && <button type="button" onClick={refreshLevels} className={SECONDARY + ' mb-4'}>Qayta urinish</button>}
        {busy && <p role="status" className="mb-4 text-sm text-[#6F6A62]">Yuklanmoqda, iltimos kuting...</p>}
        {importResult && (
          <section className="mb-5 rounded-xl border border-[#E9E2D8] bg-white p-4 text-sm text-[#514B43]">
            <h2 className="mb-2 font-bold text-[#2A2A2A]">Yuklash natijasi</h2>
            <p>Yangi level: {importResult.levelsImported}; o‘tkazilgan mavjud level: {importResult.levelsSkipped}.</p>
            <p>Yangi dars: {importResult.lessonsImported}; o‘tkazilgan mavjud dars: {importResult.lessonsSkipped}.</p>
            <p>O‘tkazib yuborilgan rasmlar: {importResult.imagesSkipped}; xatolar: {importResult.errors}.</p>
            {importResult.warnings.length > 0 && (
              <ul className="mt-3 max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-amber-800">
                {importResult.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}
              </ul>
            )}
          </section>
        )}
        {!levels && loading && <AdminSkeleton rows={4} />}
        {levels?.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-[#6F6A62]">Hozircha levellar mavjud emas.</p>}
        {levels && levels.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => (
                <button
                  type="button"
                  key={level.id}
                  onClick={() => navigate(`/admin/level/${encodeURIComponent(level.id)}`)}
                  className="min-w-0 rounded-2xl border border-[#E9E2D8] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#E8B84B] hover:shadow-md min-[375px]:p-5"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF2DB] text-[#9A7A3B]">
                    <BookOpen size={22} />
                  </div>
                  <h2 className="break-words text-lg font-bold text-[#2A2A2A]">{level.sinf}-sinf · {level.nom}</h2>
                  <p className="mt-1 break-words text-sm text-[#6F6A62]">
                    {level.darslar.length} dars, {level.darslar.filter((lesson) => lesson.holat === 'elon_qilingan').length} e’lon qilingan
                  </p>
                </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminLevel({ levelId, navigate }) {
  const [level, setLevel] = useState(() => getCachedLevelAdmin(levelId));
  const [isLoading, setIsLoading] = useState(() => !getCachedLevelAdmin(levelId));
  const loading = isLoading && !level;
  const [error, setError] = useState(() => (
    getCachedLevelAdmin(levelId) ? '' : getAdminDataError()
  ));

  useEffect(() => {
    const syncCache = () => {
      const cachedLevel = getCachedLevelAdmin(levelId);
      if (cachedLevel) {
        setLevel(cachedLevel);
        setError('');
      } else {
        setError(getAdminDataError());
      }
    };
    const unsubscribe = subscribeToLessonData(syncCache);
    getLevelAdmin(levelId)
      .then(setLevel)
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setIsLoading(false));
    return unsubscribe;
  }, [levelId]);

  const handleCreate = async () => {
    try {
      const lesson = await createLesson(levelId);
      navigate(`/admin/level/${encodeURIComponent(levelId)}/dars/${encodeURIComponent(lesson.id)}`);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath="/" title={level ? `${level.sinf}-sinf · ${level.nom}` : 'Level darslari'} />
      <main className="mx-auto w-full px-3 py-5 min-[375px]:px-4 sm:px-5 sm:py-7">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-[#6F6A62]">Darslarni ko‘ring va tahrirlang.</p>
          <button type="button" disabled={!level} className={PRIMARY + ' w-full sm:w-auto'} onClick={handleCreate}>
            <Plus size={18} /> Yangi dars qo‘shish
          </button>
        </div>
        {error && !loading && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {error && !level && !loading && <button type="button" onClick={() => {
          setError('');
          setIsLoading(true);
          refreshAdminData()
            .then(() => getLevelAdmin(levelId))
            .then(setLevel)
            .catch((reason) => setError(getErrorMessage(reason)))
            .finally(() => setIsLoading(false));
        }} className={SECONDARY + ' mb-4'}>Qayta urinish</button>}
        {!level && loading && <AdminSkeleton rows={3} />}
        {level?.darslar.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-[#6F6A62]">Bu levelda darslar yo‘q.</p>}
        {level && level.darslar.length > 0 && (
          <div className="grid gap-3">
            {level.darslar.map((lesson) => (
              <article key={lesson.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#E9E2D8] bg-white p-3 shadow-sm min-[375px]:p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${lesson.holat === 'elon_qilingan' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {lesson.holat === 'elon_qilingan' ? 'E’lon qilingan' : 'Qoralama'}
                    </span>
                    <span className="text-xs text-[#6F6A62]">{lesson.fan === 'ozbekiston' ? "O'zbekiston" : 'Jahon'}</span>
                  </div>
                  <h2 className="break-words font-semibold text-[#2A2A2A]">{lesson.sarlavha || 'Sarlavhasiz dars'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/level/${encodeURIComponent(levelId)}/dars/${encodeURIComponent(lesson.id)}`)}
                  className={SECONDARY + ' w-full shrink-0 sm:w-auto'}
                >
                  Tahrirlash
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function createBlockId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeLesson(lesson) {
  const imageKeys = (lesson.bloklar || [])
    .filter((block) => block.tur === 'rasm')
    .map((block) => Number(block.kalit))
    .filter((key) => Number.isInteger(key) && key > 0);
  const usedKeys = new Set();
  let nextKey = Math.max(0, ...imageKeys) + 1;
  return {
    ...lesson,
    bloklar: (lesson.bloklar || []).map((block) => {
      if (block.tur !== 'rasm') return { ...block, id: block.id || createBlockId() };
      let key = Number(block.kalit);
      if (!Number.isInteger(key) || key < 1 || usedKeys.has(key)) {
        while (usedKeys.has(nextKey)) nextKey += 1;
        key = nextKey;
        nextKey += 1;
      }
      usedKeys.add(key);
      return {
        ...block,
        id: block.id || createBlockId(),
        kalit: key,
        joy: block.joy || block.joylashuv || 'yuqori',
      };
    }),
  };
}

function getNextImageKey(blocks) {
  return blocks.reduce((max, block) => (
    block.tur === 'rasm' && Number.isInteger(Number(block.kalit))
      ? Math.max(max, Number(block.kalit))
      : max
  ), 0) + 1;
}

function getMissingImageKeys(lesson) {
  const imageKeys = new Set(
    lesson.bloklar
      .filter((block) => block.tur === 'rasm')
      .map((block) => String(block.kalit))
  );
  const markerKeys = new Set();
  lesson.bloklar.forEach((block) => {
    if (block.tur !== 'matn') return;
    const normalizedText = normalizeLessonText(block.qiymat);
    Array.from(normalizedText.matchAll(/\[rasm(\d+)\]/gi))
      .forEach((match) => markerKeys.add(String(Number(match[1]))));
  });
  return [...markerKeys].filter((key) => !imageKeys.has(key));
}

function moveBlock(blocks, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= blocks.length) return blocks;
  const reordered = [...blocks];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered;
}

function LessonEditor({ levelId, lessonId, navigate, onDirtyChange }) {
  const [initialData] = useState(() => {
    const level = getCachedLevelAdmin(levelId);
    const found = level?.darslar.find((item) => item.id === lessonId);
    return {
      levelName: level?.nom || '',
      lesson: found ? normalizeLesson(found) : null,
      levelExists: Boolean(level),
    };
  });
  const [lesson, setLesson] = useState(initialData.lesson);
  const [levelName, setLevelName] = useState(initialData.levelName);
  const [loading, setLoading] = useState(() => !initialData.levelExists);
  const [error, setError] = useState(() => (
    initialData.levelExists && !initialData.lesson ? 'Dars topilmadi.' : ''
  ));
  const [notice, setNotice] = useState('');
  const [pasteMessage, setPasteMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [imagePageNumbers, setImagePageNumbers] = useState({});
  const [imageDimensions, setImageDimensions] = useState({});
  const savedSnapshot = useRef(initialData.lesson ? JSON.stringify(initialData.lesson) : '');
  const textAreaRefs = useRef(new Map());
  const textSelections = useRef(new Map());
  const fileInputRefs = useRef(new Map());
  const pasteMessageTimeout = useRef(null);

  useEffect(() => () => window.clearTimeout(pasteMessageTimeout.current), []);

  useEffect(() => {
    if (!lesson) return undefined;
    const frame = requestAnimationFrame(() => {
      setImagePageNumbers(getImagePageNumbers(lesson, imageDimensions));
    });
    return () => cancelAnimationFrame(frame);
  }, [lesson, imageDimensions]);

  useEffect(() => {
    if (initialData.levelExists) return undefined;
    let active = true;
    getLevelAdmin(levelId)
      .then((level) => {
        if (!active) return;
        setLevelName(level.nom);
        const found = level.darslar.find((item) => item.id === lessonId);
        if (!found) {
          setError('Dars topilmadi.');
          return;
        }
        const normalized = normalizeLesson(found);
        savedSnapshot.current = JSON.stringify(normalized);
        setLesson(normalized);
      })
      .catch((reason) => { if (active) setError(getErrorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialData, levelId, lessonId]);

  const updateLesson = (changes) => {
    const next = { ...lesson, ...changes };
    const hasChanges = JSON.stringify(next) !== savedSnapshot.current;
    setLesson(next);
    setDirty(hasChanges);
    onDirtyChange(hasChanges);
    setNotice('');
  };

  const updateBlock = (index, changes) => updateLesson({
    bloklar: lesson.bloklar.map((block, position) => position === index ? { ...block, ...changes } : block),
  });

  const addBlock = (tur) => updateLesson({
    bloklar: [...lesson.bloklar, tur === 'matn'
      ? { id: createBlockId(), tur, qiymat: '' }
      : { id: createBlockId(), tur, kalit: getNextImageKey(lesson.bloklar), url: '', izoh: '', joy: 'yuqori', olcham: 'kichik' }],
  });

  const removeBlock = (index) => {
    if (!window.confirm('Bu blokni o‘chirishni xohlaysizmi?')) return;
    updateLesson({ bloklar: lesson.bloklar.filter((_, position) => position !== index) });
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      updateBlock(index, { url });
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  const insertImageMarker = (index, block) => {
    const marker = `[rasm${block.kalit}]`;
    const textarea = textAreaRefs.current.get(block.id);
    const value = typeof block.qiymat === 'string'
      ? block.qiymat
      : Array.isArray(block.qiymat)
        ? block.qiymat.join('\n')
        : '';
    const selection = textSelections.current.get(block.id);
    const start = Math.min(selection?.start ?? value.length, value.length);
    const end = Math.min(selection?.end ?? start, value.length);
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before
      ? before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n'
      : '\n\n';
    const suffix = after
      ? after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'
      : '\n\n';
    const inserted = `${prefix}${marker}${suffix}`;
    updateBlock(index, { qiymat: `${before}${inserted}${after}` });
    if (textarea) {
      const caret = start + prefix.length + marker.length;
      textSelections.current.set(block.id, { start: caret, end: caret });
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(caret, caret);
      });
    }
  };

  const handleTextPaste = (index, block, event) => {
    event.preventDefault();
    const pastedText = normalizeLessonText(event.clipboardData.getData('text/plain'));
    if (!pastedText) return;

    const textarea = event.currentTarget;
    const value = typeof block.qiymat === 'string' ? block.qiymat : '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${value.slice(0, start)}${pastedText}${value.slice(end)}`;
    const caret = start + pastedText.length;
    updateBlock(index, { qiymat: nextValue });
    textSelections.current.set(block.id, { start: caret, end: caret });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
    setPasteMessage('Matn tozalandi');
    window.clearTimeout(pasteMessageTimeout.current);
    pasteMessageTimeout.current = window.setTimeout(() => setPasteMessage(''), 2200);
  };

  const copyImageMarker = async (key) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Bu brauzer nusxa olishni qo‘llab-quvvatlamaydi.');
      await navigator.clipboard.writeText(`[rasm${key}]`);
      setNotice('Rasm belgisi nusxalandi.');
    } catch (reason) {
      setError(`Belgini nusxalab bo‘lmadi: ${getErrorMessage(reason)}`);
    }
  };

  const handleSave = async () => {
    setError('');
    try {
      await saveLesson(levelId, lesson);
      savedSnapshot.current = JSON.stringify(lesson);
      setDirty(false);
      onDirtyChange(false);
      const saveMessage = lesson.holat === 'elon_qilingan'
        ? 'Saqlandi va o‘quvchilarga e’lon qilindi.'
        : 'Saqlandi. Qoralama dars o‘quvchilarga ko‘rinmaydi; ko‘rsatish uchun “E’lon qilingan”ni tanlang.';
      const missingKeys = getMissingImageKeys(lesson);
      setNotice(missingKeys.length
        ? `${saveMessage} Rasm bloki topilmagan belgilar: ${missingKeys.map((key) => `[rasm${key}]`).join(', ')}.`
        : saveMessage);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu darsni butunlay o‘chirishni xohlaysizmi?')) return;
    setError('');
    try {
      await deleteLesson(levelId, lessonId);
      onDirtyChange(false);
      navigate(`/admin/level/${encodeURIComponent(levelId)}`);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  if (preview && lesson) {
    return (
      <>
        <button
          type="button"
          onClick={() => setPreview(false)}
          className="fixed left-3 top-3 z-[1000002] rounded-xl border border-[#DED8CE] bg-white/95 px-3 py-2 text-sm font-semibold text-[#2A2A2A] shadow-sm"
        >
          Tahrirga qaytish
        </button>
        <BookReader
          level={{ id: levelId, nom: levelName, darslar: [lesson] }}
          onClose={() => setPreview(false)}
        />
      </>
    );
  }

  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath="/" title={levelName ? `${levelName} · Dars tahriri` : 'Dars tahriri'} />
      <main className="mx-auto w-full space-y-4 px-3 py-5 min-[375px]:space-y-6 min-[375px]:px-5 sm:py-7">
        {loading && <AdminSkeleton rows={4} />}
        {error && !lesson && !loading && (
          <button type="button" onClick={() => {
            setError('');
            setLoading(true);
            refreshAdminData()
              .then(() => getLevelAdmin(levelId))
              .then((level) => {
                const found = level.darslar.find((item) => item.id === lessonId);
                if (!found) throw new Error('Dars topilmadi.');
                const normalized = normalizeLesson(found);
                savedSnapshot.current = JSON.stringify(normalized);
                setLevelName(level.nom);
                setLesson(normalized);
              })
              .catch((reason) => setError(getErrorMessage(reason)))
              .finally(() => setLoading(false));
          }} className={SECONDARY + ' mb-4'}>Qayta urinish</button>
        )}
        {error && !loading && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && lesson && (
          <>
            <section className="grid min-w-0 gap-4 rounded-2xl border border-[#E9E2D8] bg-white p-3 min-[375px]:p-4 sm:grid-cols-2 sm:p-6">
              <label className="block text-sm font-semibold text-[#514B43]">
                Fan
                <select className={FIELD + ' mt-2'} value={lesson.fan} onChange={(event) => updateLesson({ fan: event.target.value })}>
                  <option value="jahon">Jahon tarixi</option>
                  <option value="ozbekiston">O‘zbekiston tarixi</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#514B43]">
                Dars sarlavhasi
                <input className={FIELD + ' mt-2'} value={lesson.sarlavha} onChange={(event) => updateLesson({ sarlavha: event.target.value })} />
              </label>
            </section>

            <section className="min-w-0 space-y-4 rounded-2xl border border-[#E9E2D8] bg-white p-3 min-[375px]:p-4 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-[#2A2A2A]">Matn va rasm bloklari</h2>
                <p className="mt-1 text-sm text-[#6F6A62]">Blok tartibini o‘zgartirish uchun ↑ va ↓ tugmalaridan foydalaning.</p>
              </div>
              {lesson.bloklar.length === 0 && <p className="rounded-xl bg-[#FBF7F2] p-4 text-sm text-[#6F6A62]">Hozircha bloklar yo‘q.</p>}
              <div className="space-y-4">
                {lesson.bloklar.map((block, index) => (
                  <article key={block.id} className="min-w-0 rounded-xl border border-[#E9E2D8] bg-[#FDFCFA] p-2.5 min-[375px]:p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#514B43]">{index + 1}. {block.tur === 'matn' ? 'Matn bloki' : 'Rasm bloki'}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label="Tepaga ko‘chirish" title="Tepaga" disabled={index === 0} onClick={() => updateLesson({ bloklar: moveBlock(lesson.bloklar, index, -1) })} className="rounded-lg p-2 text-[#514B43] hover:bg-[#F1EBDD] disabled:opacity-30"><ArrowUp size={17} /></button>
                        <button type="button" aria-label="Pastga ko‘chirish" title="Pastga" disabled={index === lesson.bloklar.length - 1} onClick={() => updateLesson({ bloklar: moveBlock(lesson.bloklar, index, 1) })} className="rounded-lg p-2 text-[#514B43] hover:bg-[#F1EBDD] disabled:opacity-30"><ArrowDown size={17} /></button>
                        {block.tur === 'matn' && <button type="button" aria-label="Blokni o‘chirish" title="O‘chirish" onClick={() => removeBlock(index)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>}
                      </div>
                    </div>
                    {block.tur === 'matn' ? (
                      <div>
                        <textarea
                          ref={(element) => {
                            if (element) textAreaRefs.current.set(block.id, element);
                            else textAreaRefs.current.delete(block.id);
                          }}
                          className={FIELD + ' min-h-40 resize-y'}
                          rows={7}
                          value={block.qiymat || ''}
                          onChange={(event) => updateBlock(index, { qiymat: event.target.value })}
                          onPaste={(event) => handleTextPaste(index, block, event)}
                          onSelect={(event) => {
                            textSelections.current.set(block.id, {
                              start: event.currentTarget.selectionStart,
                              end: event.currentTarget.selectionEnd,
                            });
                          }}
                          onBlur={(event) => {
                            textSelections.current.set(block.id, {
                              start: event.currentTarget.selectionStart,
                              end: event.currentTarget.selectionEnd,
                            });
                          }}
                          placeholder="Dars matnini kiriting..."
                        />
                        {pasteMessage && <p role="status" className="mt-1.5 text-xs font-medium text-green-700">{pasteMessage}</p>}
                        <p className="mt-1.5 text-xs font-normal text-[#777168]">Matn kitob uslubida tekislanadi. Muhim so‘zni **qalin**, *kursiv* yozish mumkin.</p>
                        <p className="mt-1 text-xs font-normal text-[#777168]">Rasm qo‘yish: [rasm1]</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {block.url && (
                          <img
                            src={block.url}
                            alt={block.izoh || 'Tanlangan rasm'}
                            className="max-h-40 max-w-full rounded-lg border border-[#E9E2D8] object-contain"
                            onLoad={(event) => {
                              const { naturalWidth, naturalHeight } = event.currentTarget;
                              setImageDimensions((previous) => {
                                const current = previous[block.url];
                                if (current?.width === naturalWidth && current?.height === naturalHeight && !current.error) return previous;
                                return { ...previous, [block.url]: { width: naturalWidth, height: naturalHeight } };
                              });
                            }}
                            onError={() => {
                              setImageDimensions((previous) => (
                                previous[block.url]?.error
                                  ? previous
                                  : { ...previous, [block.url]: { error: true } }
                              ));
                            }}
                          />
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#514B43]">
                          <span className="font-semibold">Belgi: [rasm{block.kalit}]</span>
                          <span>Hozir: {imagePageNumbers[String(block.kalit)] || 'aniqlanmadi'}-sahifada</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <fieldset>
                            <legend className="mb-2 text-sm font-medium text-[#514B43]">Joylashuv</legend>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                ['yuqori', 'Tepada'],
                                ['orta', 'O‘rtada'],
                                ['past', 'Pastda'],
                              ].map(([value, label]) => (
                                <button
                                  type="button"
                                  key={value}
                                  aria-pressed={(block.joy || block.joylashuv || 'yuqori') === value}
                                  onClick={() => updateBlock(index, { joy: value })}
                                  className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg border px-1.5 py-2 text-xs font-semibold transition ${
                                    (block.joy || block.joylashuv || 'yuqori') === value
                                      ? 'border-[#B09B53] bg-[#F7F2DE] text-[#514B43]'
                                      : 'border-[#DED8CE] bg-white text-[#6F6A62] hover:bg-[#F6F1E9]'
                                  }`}
                                >
                                  <span className="relative block h-7 w-10" aria-hidden="true">
                                    <span className="absolute left-0 top-0.5 h-0.5 w-6 rounded bg-current opacity-60" />
                                    <span className="absolute left-0 top-2.5 h-0.5 w-6 rounded bg-current opacity-60" />
                                    <span className="absolute left-0 top-[18px] h-0.5 w-6 rounded bg-current opacity-60" />
                                    <span className={`absolute right-0 h-2.5 w-3 rounded-sm border border-[#B09B53] bg-[#E8DCA8] ${
                                      value === 'yuqori' ? 'top-0' : value === 'orta' ? 'top-2' : 'bottom-0'
                                    }`} />
                                  </span>
                                  <span>{label}</span>
                                </button>
                              ))}
                            </div>
                          </fieldset>
                          <label className="block text-sm font-medium text-[#514B43]">
                            O‘lcham
                            <select
                              className={FIELD + ' mt-2'}
                              value={['kichik', 'orta', 'katta'].includes(block.olcham) ? block.olcham : 'kichik'}
                              onChange={(event) => updateBlock(index, { olcham: event.target.value })}
                            >
                              <option value="kichik">Kichik</option>
                              <option value="orta">O‘rta</option>
                              <option value="katta">Katta</option>
                            </select>
                          </label>
                        </div>
                        <input
                          ref={(element) => {
                            if (element) fileInputRefs.current.set(block.id, element);
                            else fileInputRefs.current.delete(block.id);
                          }}
                          className="sr-only"
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            void handleImageUpload(index, event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                        <label className="block text-sm font-medium text-[#514B43]">
                          Izoh
                          <input className={FIELD + ' mt-2'} value={block.izoh || ''} onChange={(event) => updateBlock(index, { izoh: event.target.value })} placeholder="Rasm izohi" />
                        </label>
                        {(!block.url || imageDimensions[block.url]?.error || !imageDimensions[block.url]?.width) && (
                          <label className="block text-sm font-medium text-[#514B43]">
                            Rasm URL manzili (ixtiyoriy)
                            <input className={FIELD + ' mt-2'} type="url" value={block.url || ''} onChange={(event) => updateBlock(index, { url: event.target.value })} placeholder="https://..." />
                          </label>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={SECONDARY} onClick={() => fileInputRefs.current.get(block.id)?.click()}>
                            {block.url && imageDimensions[block.url]?.width ? 'Rasmni almashtirish' : 'Rasm faylini tanlash'}
                          </button>
                          <button type="button" className={SECONDARY} onClick={() => removeBlock(index)}>O‘chirish</button>
                          <button type="button" className={SECONDARY} onClick={() => void copyImageMarker(block.kalit)}>Belgini nusxalash</button>
                          <button type="button" className={SECONDARY} onClick={() => insertImageMarker(index, block)}>Matnga qo‘yish</button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#EEE8DF] pt-4">
                <button type="button" className={SECONDARY} onClick={() => addBlock('matn')}><Plus size={17} /> Matn qo‘shish</button>
                <button type="button" className={SECONDARY} onClick={() => addBlock('rasm')}><ImagePlus size={17} /> Rasm qo‘shish</button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E9E2D8] bg-white p-3 min-[375px]:p-4 sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-[#2A2A2A]">Holat</h2>
              <div className="flex flex-wrap gap-2">
                {[['qoralama', 'Qoralama'], ['elon_qilingan', 'E’lon qilingan']].map(([value, label]) => (
                  <button type="button" key={value} onClick={() => updateLesson({ holat: value })} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${lesson.holat === value ? (value === 'elon_qilingan' ? 'border-green-600 bg-green-100 text-green-800' : 'border-gray-400 bg-gray-100 text-gray-700') : 'border-[#DED8CE] text-[#6F6A62]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-2 pb-8 min-[375px]:gap-3 sm:flex-row sm:items-center">
              <button type="button" className={PRIMARY + ' w-full sm:w-auto'} onClick={handleSave}><Save size={17} /> Saqlash</button>
              <button type="button" className={SECONDARY + ' w-full sm:w-auto'} onClick={() => setPreview(true)}><Eye size={17} /> Oldindan ko‘rish</button>
              <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto" onClick={handleDelete}><Trash2 size={17} /> Darsni o‘chirish</button>
              {dirty && <span className="break-words text-center text-sm text-[#7C746A] sm:text-left">Saqlanmagan o‘zgarishlar bor</span>}
            </div>
          </>
        )}
      </main>
      {notice && (
        <div className="fixed inset-0 z-[1000005] flex items-center justify-center bg-black/35 p-4">
          <section role="status" aria-live="polite" className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <CheckCircle2 size={42} className="mx-auto mb-3 text-green-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#2A2A2A]">Saqlandi</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6F6A62]">{notice}</p>
            <button type="button" onClick={() => setNotice('')} className={PRIMARY + ' mt-5 w-full'}>
              Yaxshi
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [dirty, setDirty] = useState(false);
  const [_session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState('login');
  const [authError, setAuthError] = useState(isSupabaseConfigured
    ? ''
    : 'Supabase ulanishi sozlanmagan. VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY qiymatlarini kiriting.');
  const dirtyRef = useRef(false);
  const route = routeFromPath(pathname);

  const verifyUserIsAdmin = useCallback(async (nextSession) => {
    if (!supabase || !nextSession?.user?.id) return false;
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', nextSession.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setAuthError('Bu hisob admin emas.');
        try {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            setAuthError(`Bu hisob admin emas. Sessiyadan chiqib bo‘lmadi: ${getErrorMessage(signOutError)}`);
          }
        } catch (signOutError) {
          setAuthError(`Bu hisob admin emas. Sessiyadan chiqib bo‘lmadi: ${getErrorMessage(signOutError)}`);
        }
        return false;
      }
      setAuthError('');
      return true;
    } catch (error) {
      setAuthError(`Admin huquqini tekshirib bo‘lmadi: ${getErrorMessage(error)}`);
      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          setAuthError(`Admin huquqini tekshirib bo‘lmadi va sessiyadan chiqilmadi: ${getErrorMessage(signOutError)}`);
        }
      } catch (signOutError) {
        setAuthError(`Admin huquqini tekshirib bo‘lmadi va sessiyadan chiqilmadi: ${getErrorMessage(signOutError)}`);
      }
      return false;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    setAuthError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(`Sessiyadan chiqib bo‘lmadi: ${getErrorMessage(error)}`);
        return;
      }
      clearAdminData();
      setSession(null);
      setAuthStatus('login');
      dirtyRef.current = false;
      setDirty(false);
    } catch (error) {
      setAuthError(`Sessiyadan chiqib bo‘lmadi: ${getErrorMessage(error)}`);
    }
  }, []);

  const handleLogin = async (email, password) => {
    if (!supabase) return;
    setAuthError('');
    setAuthStatus('checking');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthStatus('login');
        setAuthError(`Kirish amalga oshmadi: ${getErrorMessage(error)}`);
        return;
      }
      setSession(data.session);
      const isAdmin = await verifyUserIsAdmin(data.session);
      if (isAdmin) {
        setAuthStatus('admin');
      } else {
        setAuthStatus('login');
      }
    } catch (error) {
      setAuthStatus('login');
      setAuthError(`Kirish amalga oshmadi: ${getErrorMessage(error)}`);
    }
  };

  const changeDirty = useCallback((value) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);

  const navigate = useCallback((path) => {
    if (dirtyRef.current && !window.confirm('Saqlanmagan o‘zgarishlar bor. Sahifadan chiqishni xohlaysizmi?')) return;
    if (path === '/') {
      window.location.assign('/home');
      return;
    }
    window.history.pushState({}, '', path);
    dirtyRef.current = false;
    setDirty(false);
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (dirtyRef.current && !window.confirm('Saqlanmagan o‘zgarishlar bor. Sahifadan chiqishni xohlaysizmi?')) {
        window.history.go(1);
        return;
      }
      dirtyRef.current = false;
      setDirty(false);
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  let page;
  if (route.page === 'level') page = <AdminLevel key={route.levelId} levelId={route.levelId} navigate={navigate} />;
  if (route.page === 'lesson') {
    page = <LessonEditor key={`${route.levelId}:${route.lessonId}`} levelId={route.levelId} lessonId={route.lessonId} navigate={navigate} onDirtyChange={changeDirty} />;
  }
  if (route.page === 'home') page = <AdminHome navigate={navigate} />;
  if (!page) {
    page = (
      <div className={PAGE_BG + ' min-h-screen'}>
        <AdminHeader navigate={navigate} backPath="/" title="Sahifa topilmadi" />
        <p className="mx-auto max-w-5xl px-4 py-12 text-center text-[#6F6A62]">Admin sahifasi topilmadi.</p>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ signOut: handleSignOut }}>
      <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] sm:flex sm:justify-center">
        <div className="min-h-screen w-full max-w-[430px] overflow-x-hidden border-x border-[#E2E8F0] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          {authStatus === 'checking' ? (
            <div className={PAGE_BG + ' flex min-h-screen items-center justify-center px-5'}>
              {authError ? <p role="alert" className="text-center text-sm text-red-700">{authError}</p> : <LoadingMessage />}
            </div>
          ) : authStatus === 'admin' ? page : (
            <AdminLogin onLogin={handleLogin} error={authError} />
          )}
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}

function AdminLogin({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={PAGE_BG + ' flex min-h-screen items-center justify-center px-4 py-10'}>
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7A3B]">Tarixiy · Admin</p>
          <h1 className="mt-2 text-2xl font-bold text-[#2A2A2A]">Admin panelga kirish</h1>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-semibold text-[#514B43]">
          Email
          <input
            className={FIELD + ' mt-2'}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold text-[#514B43]">
          Parol
          <input
            className={FIELD + ' mt-2'}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting || !isSupabaseConfigured} className={PRIMARY + ' w-full'}>
          {submitting ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </main>
  );
}
