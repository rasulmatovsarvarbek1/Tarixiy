import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import BookReader from '../components/BookReader';
import {
  createLesson,
  getLevelAdmin,
  getLevels,
  saveLesson,
  uploadImage,
} from '../lib/lessons';

const PAGE_BG = 'bg-[#FBF7F2]';
const FIELD = 'min-w-0 w-full rounded-xl border border-[#DED8CE] bg-white px-3 py-2.5 text-sm text-[#2A2A2A] outline-none transition focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/25';
const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8B84B] px-4 py-2.5 text-sm font-semibold text-[#2A2A2A] transition hover:bg-[#ddb044] disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED8CE] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A2A2A] transition hover:bg-[#F6F1E9]';

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
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
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

function AdminHome({ navigate }) {
  const [levels, setLevels] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getLevels()
      .then((result) => { if (active) setLevels(result); })
      .catch((reason) => { if (active) setError(getErrorMessage(reason)); });
    return () => { active = false; };
  }, []);

  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath="/admin" title="Levellar" />
      <main className="mx-auto w-full max-w-5xl px-3 py-5 min-[375px]:px-4 sm:px-6 sm:py-9">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!levels && !error && <LoadingMessage />}
        {levels?.length === 0 && <p className="rounded-xl bg-white p-6 text-center text-[#6F6A62]">Hozircha levellar mavjud emas.</p>}
        {levels && levels.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => {
              const published = level.darslar.filter((lesson) => lesson.holat === 'elon_qilingan').length;
              return (
                <button
                  type="button"
                  key={level.id}
                  onClick={() => navigate(`/admin/level/${encodeURIComponent(level.id)}`)}
                  className="min-w-0 rounded-2xl border border-[#E9E2D8] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#E8B84B] hover:shadow-md min-[375px]:p-5"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF2DB] text-[#9A7A3B]">
                    <BookOpen size={22} />
                  </div>
                  <h2 className="break-words text-lg font-bold text-[#2A2A2A]">{level.nom}</h2>
                  <p className="mt-1 break-words text-sm text-[#6F6A62]">{level.darslar.length} dars, {published} e’lon qilingan</p>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminLevel({ levelId, navigate }) {
  const [level, setLevel] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getLevelAdmin(levelId)
      .then((result) => { if (active) setLevel(result); })
      .catch((reason) => { if (active) setError(getErrorMessage(reason)); });
    return () => { active = false; };
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
      <AdminHeader navigate={navigate} backPath="/admin" title={level?.nom || 'Level darslari'} />
      <main className="mx-auto w-full max-w-5xl px-3 py-5 min-[375px]:px-4 sm:px-6 sm:py-9">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-[#6F6A62]">Darslarni ko‘ring va tahrirlang.</p>
          <button type="button" className={PRIMARY + ' w-full sm:w-auto'} onClick={handleCreate}>
            <Plus size={18} /> Yangi dars qo‘shish
          </button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!level && !error && <LoadingMessage />}
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

function moveBlock(blocks, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= blocks.length) return blocks;
  const reordered = [...blocks];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered;
}

function CoverPreview({ cover }) {
  const title = (cover.sarlavha || 'Jahon *Tarixi*').split(/(\*[^*]+\*)/g);
  return (
    <div className="mx-auto flex min-h-32 w-full max-w-sm items-center justify-center rounded-2xl border border-[#E9E2D8] bg-[#FBF7F2] px-3 py-5 text-center shadow-inner min-[375px]:px-5 sm:min-h-36">
      <p className="break-words text-[clamp(1.2rem,6vw,1.5rem)] font-extrabold leading-tight text-[#2A2A2A] [overflow-wrap:anywhere]">
        {title.map((part, index) => part.startsWith('*') && part.endsWith('*')
          ? <span key={index} className="text-[#E8650A]">{part.slice(1, -1)}</span>
          : <span key={index}>{part}</span>)}
      </p>
    </div>
  );
}

function LessonEditor({ levelId, lessonId, navigate, onDirtyChange }) {
  const [lesson, setLesson] = useState(null);
  const [levelName, setLevelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const savedSnapshot = useRef('');

  useEffect(() => {
    let active = true;
    Promise.all([getLevelAdmin(levelId)])
      .then(([level]) => {
        if (!active) return;
        setLevelName(level.nom);
        const found = level.darslar.find((item) => item.id === lessonId);
        if (!found) {
          setError('Dars topilmadi.');
          return;
        }
        const normalized = {
          ...found,
          muqova: {
            sarlavha: found.muqova?.sarlavha || 'Jahon *Tarixi*',
            tagsarlavha: found.muqova?.tagsarlavha || found.sarlavha || '',
          },
          bloklar: (found.bloklar || []).map((block) => ({ ...block, id: block.id || createBlockId() })),
        };
        savedSnapshot.current = JSON.stringify(normalized);
        setLesson(normalized);
      })
      .catch((reason) => { if (active) setError(getErrorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [levelId, lessonId]);

  const updateLesson = (changes) => {
    const next = { ...lesson, ...changes };
    const hasChanges = JSON.stringify(next) !== savedSnapshot.current;
    setLesson(next);
    setDirty(hasChanges);
    onDirtyChange(hasChanges);
    setNotice('');
  };

  const updateCover = (field, value) => updateLesson({
    muqova: { ...lesson.muqova, [field]: value },
  });

  const updateBlock = (index, changes) => updateLesson({
    bloklar: lesson.bloklar.map((block, position) => position === index ? { ...block, ...changes } : block),
  });

  const addBlock = (tur) => updateLesson({
    bloklar: [...lesson.bloklar, tur === 'matn'
      ? { id: createBlockId(), tur, qiymat: '' }
      : { id: createBlockId(), tur, url: '', izoh: '' }],
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

  const handleSave = async () => {
    setError('');
    try {
      await saveLesson(levelId, lesson);
      savedSnapshot.current = JSON.stringify(lesson);
      setDirty(false);
      onDirtyChange(false);
      setNotice('Saqlandi');
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  if (preview && lesson) {
    return (
      <div className="fixed inset-0 z-[1000000] bg-white">
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
      </div>
    );
  }

  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath={`/admin/level/${encodeURIComponent(levelId)}`} title={levelName ? `${levelName} · Dars tahriri` : 'Dars tahriri'} />
      <main className="mx-auto w-full max-w-4xl space-y-4 px-3 py-5 min-[375px]:space-y-6 min-[375px]:px-4 sm:px-6 sm:py-9">
        {loading && <LoadingMessage />}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && lesson && (
          <>
            <section className="grid min-w-0 gap-4 rounded-2xl border border-[#E9E2D8] bg-white p-3 min-[375px]:p-4 sm:grid-cols-2 sm:p-6">
              <label className="block text-sm font-semibold text-[#514B43]">
                Fan
                <select className={FIELD + ' mt-2'} value={lesson.fan} onChange={(event) => updateLesson({ fan: event.target.value, muqova: { ...lesson.muqova, sarlavha: event.target.value === 'ozbekiston' ? "O'zbekiston *Tarixi*" : 'Jahon *Tarixi*' } })}>
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
                <h2 className="text-lg font-bold text-[#2A2A2A]">Muqova</h2>
                <p className="mt-1 text-sm text-[#6F6A62]">Muqova ko‘rinishini shu yerda sozlang.</p>
              </div>
              <label className="block text-sm font-semibold text-[#514B43]">
                Muqova sarlavhasi
                <input className={FIELD + ' mt-2'} value={lesson.muqova.sarlavha} onChange={(event) => updateCover('sarlavha', event.target.value)} />
                <span className="mt-1.5 block text-xs font-normal text-[#777168]">Rangli so‘zni *yulduzcha* ichiga oling: Jahon *Tarixi*</span>
              </label>
              <label className="block text-sm font-semibold text-[#514B43]">
                Muqova tagsarlavhasi
                <input className={FIELD + ' mt-2'} value={lesson.muqova.tagsarlavha} onChange={(event) => updateCover('tagsarlavha', event.target.value)} />
              </label>
              <CoverPreview cover={lesson.muqova} />
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
                        <button type="button" aria-label="Blokni o‘chirish" title="O‘chirish" onClick={() => removeBlock(index)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                      </div>
                    </div>
                    {block.tur === 'matn' ? (
                      <textarea className={FIELD + ' min-h-40 resize-y'} rows={7} value={block.qiymat} onChange={(event) => updateBlock(index, { qiymat: event.target.value })} placeholder="Dars matnini kiriting..." />
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#514B43]">
                          Rasm faylini tanlang
                          <input className="mt-2 block min-w-0 max-w-full text-xs text-[#6F6A62] file:mr-2 file:rounded-lg file:border-0 file:bg-[#F1EBDD] file:px-2 file:py-2 file:font-semibold file:text-[#514B43] min-[375px]:text-sm min-[375px]:file:mr-3 min-[375px]:file:px-3" type="file" accept="image/*" onChange={(event) => handleImageUpload(index, event.target.files?.[0])} />
                        </label>
                        <label className="block text-sm font-medium text-[#514B43]">
                          Yoki rasm URL manzili
                          <input className={FIELD + ' mt-2'} type="url" value={block.url || ''} onChange={(event) => updateBlock(index, { url: event.target.value })} placeholder="https://..." />
                        </label>
                        {block.url && <img src={block.url} alt={block.izoh || 'Tanlangan rasm'} className="max-h-52 max-w-full rounded-lg border border-[#E9E2D8] object-contain" />}
                        <label className="block text-sm font-medium text-[#514B43]">
                          Izoh
                          <input className={FIELD + ' mt-2'} value={block.izoh || ''} onChange={(event) => updateBlock(index, { izoh: event.target.value })} placeholder="Rasm izohi" />
                        </label>
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
              {notice && <span role="status" className="text-center text-sm font-medium text-green-700 sm:text-left">{notice}</span>}
              {dirty && <span className="break-words text-center text-sm text-[#7C746A] sm:text-left">Saqlanmagan o‘zgarishlar bor</span>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const route = routeFromPath(pathname);

  const changeDirty = useCallback((value) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);

  const navigate = useCallback((path) => {
    if (dirtyRef.current && !window.confirm('Saqlanmagan o‘zgarishlar bor. Sahifadan chiqishni xohlaysizmi?')) return;
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

  if (route.page === 'level') return <AdminLevel key={route.levelId} levelId={route.levelId} navigate={navigate} />;
  if (route.page === 'lesson') {
    return <LessonEditor key={`${route.levelId}:${route.lessonId}`} levelId={route.levelId} lessonId={route.lessonId} navigate={navigate} onDirtyChange={changeDirty} />;
  }
  if (route.page === 'home') return <AdminHome navigate={navigate} />;
  return (
    <div className={PAGE_BG + ' min-h-screen'}>
      <AdminHeader navigate={navigate} backPath="/admin" title="Sahifa topilmadi" />
      <p className="mx-auto max-w-5xl px-4 py-12 text-center text-[#6F6A62]">Admin sahifasi topilmadi.</p>
    </div>
  );
}
