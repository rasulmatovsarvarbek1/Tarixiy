import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Snowflake,
  X,
} from 'lucide-react';

function TangaCoinIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="10" fill="#FFB800" />
      <circle cx="12" cy="12" r="7.5" fill="#E6A200" />
      <circle cx="12" cy="12" r="6" fill="#FFD54F" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
    </svg>
  );
}
import {
  dismissCompletionNotice,
  getFaollikSnapshot,
  getHolat,
  getMuzPaketlari,
  getOyFaolligi,
  refreshFaollikForRetry,
  subscribeToFaollik,
  sotibOlMuz,
} from '../lib/faollik';

const DAILY_GOAL_SECONDS = 15 * 60;
const ITEM_WIDTH = 48;
const GAP = 8;
const SLOT = ITEM_WIDTH + GAP;

function getTashkentDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function monthParts(date) {
  const [year, month] = date.split('-').map(Number);
  return { year, month };
}

function addDays(date, amount) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}

function getMonthKey(date) {
  return date.slice(0, 7);
}

function isGoalCompleted(row) {
  return Number(row?.soniya) >= DAILY_GOAL_SECONDS;
}

function formatTime(seconds) {
  const remaining = Math.max(0, seconds);
  return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
}

function monthNumber(year, month) {
  return year * 12 + month - 1;
}

const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

const UZ_WEEKDAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

function formatMonth(year, month) {
  const monthName = UZ_MONTHS[month - 1] || '';
  return `${monthName} ${year}`;
}

function ArcDaysRow({ days, todayIndex }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const bgRefs = useRef([]);
  const darkTextRefs = useRef([]);
  const whiteTextRefs = useRef([]);
  const rafIdRef = useRef(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragMovedRef = useRef(false);

  const updateArc = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxScroll = todayIndex * SLOT;
    if (container.scrollLeft > maxScroll) {
      container.scrollLeft = maxScroll;
    }

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const halfContainer = containerWidth / 2;

    const items = itemRefs.current;
    const bgs = bgRefs.current;
    const darkTexts = darkTextRefs.current;
    const whiteTexts = whiteTextRefs.current;

    for (let i = 0; i < days.length; i += 1) {
      const el = items[i];
      if (!el) continue;

      const dx = i * SLOT - scrollLeft;
      const absDx = Math.abs(dx);

      if (absDx > halfContainer + SLOT * 2) {
        el.style.transform = 'translate3d(0, 26px, 0) scale(0.78)';
        el.style.opacity = '0.2';
        continue;
      }

      const drop = Math.min(26, (absDx * absDx) / 1060);
      const scale = Math.max(0.78, 1 - Math.min(0.22, (absDx / 170) * 0.22));
      const baseOpacity = Math.max(0.35, 1 - Math.min(0.65, (absDx / 180) * 0.6));
      const opacity = days[i].isFuture ? baseOpacity * 0.45 : baseOpacity;

      el.style.transform = `translate3d(0, ${drop.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(2);

      const centerRatio = Math.max(0, Math.min(1, 1 - absDx / 28));
      const bgEl = bgs[i];
      const darkEl = darkTexts[i];
      const whiteEl = whiteTexts[i];

      if (bgEl) {
        bgEl.style.opacity = (1 - centerRatio).toFixed(2);
      }
      if (darkEl) {
        darkEl.style.opacity = (1 - centerRatio).toFixed(2);
      }
      if (whiteEl) {
        whiteEl.style.opacity = centerRatio.toFixed(2);
      }
    }
  }, [days, todayIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxScroll = todayIndex * SLOT;
    container.scrollLeft = maxScroll;
    updateArc();

    const onScroll = () => {
      if (container.scrollLeft > maxScroll) {
        container.scrollLeft = maxScroll;
      }
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateArc);
    };

    const onWheel = (e) => {
      if (container.scrollLeft >= maxScroll && (e.deltaX > 0 || (e.shiftKey && e.deltaY > 0))) {
        e.preventDefault();
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onScroll);

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [todayIndex, updateArc]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = containerRef.current?.scrollLeft || 0;
    dragMovedRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 4) {
      dragMovedRef.current = true;
    }
    const maxScroll = todayIndex * SLOT;
    const nextScroll = dragStartScrollRef.current - dx;
    containerRef.current.scrollLeft = Math.max(0, Math.min(maxScroll, nextScroll));
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  const handleDayClick = (index) => {
    if (dragMovedRef.current) return;
    if (index > todayIndex) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * SLOT,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '112px' }}>
      {/* O'RTADAGI QOTIB TURGAN YAM-YASHIL KAPSULA (QIMIRLAMAYDI) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[6px] -translate-x-1/2 z-0 rounded-full"
        style={{
          width: `${ITEM_WIDTH}px`,
          height: '76px',
          background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)',
          boxShadow: '0 8px 20px -3px rgba(22, 163, 74, 0.45), 0 3px 6px -2px rgba(22, 163, 74, 0.3)',
        }}
      />

      {/* GORIZONTAL SURILADIGAN KUNLAR QATORI */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-10 flex w-full items-start overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: 'x mandatory',
          touchAction: 'pan-x',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          height: '112px',
          paddingTop: '6px',
        }}
      >
        <div
          className="flex items-start h-full shrink-0"
          style={{
            paddingLeft: `calc(50% - ${ITEM_WIDTH / 2}px)`,
            paddingRight: `calc(50% - ${ITEM_WIDTH / 2}px)`,
            gap: `${GAP}px`,
          }}
        >
          {days.map((dayItem, index) => {
            const isClickable = index <= todayIndex;
            return (
              <div
                key={dayItem.date}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => handleDayClick(index)}
                className={`shrink-0 select-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default pointer-events-none'
                }`}
                style={{
                  width: `${ITEM_WIDTH}px`,
                  height: '76px',
                  scrollSnapAlign: isClickable ? 'center' : 'none',
                  scrollSnapStop: 'normal',
                  willChange: 'transform, opacity',
                }}
              >
                <div className="relative h-[76px] w-[48px] overflow-hidden rounded-full">
                  {/* Orqa fon: o'rtaga kelganda shaffof bo'lib, pastdagi yam-yashil kapsula ko'rinadi */}
                  <div
                    ref={(el) => { bgRefs.current[index] = el; }}
                    className={`absolute inset-0 rounded-full transition-none ${
                      dayItem.isToday
                        ? 'bg-[#DCFCE7] border-2 border-[#86EFAC] shadow-sm'
                        : dayItem.isFuture
                        ? 'bg-[#F7F4EE]/60 border border-[#EAE4DC]/50'
                        : 'bg-[#F7F4EE] border border-[#EAE4DC]'
                    }`}
                  />

                  {/* Qorong'u / rangli yozuvlar (o'rtadan uzoqda bo'lganda ko'rinadi) */}
                  <div
                    ref={(el) => { darkTextRefs.current[index] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-between py-2 px-1 pointer-events-none"
                  >
                    <span
                      className={`text-[11px] font-semibold tracking-tight ${
                        dayItem.isToday
                          ? 'text-[#16A34A] font-bold'
                          : dayItem.isFuture
                          ? 'text-[#8E877D]/60'
                          : 'text-[#8E877D]'
                      }`}
                    >
                      {dayItem.weekday}
                    </span>

                    <span
                      className={`text-[16px] font-extrabold tracking-tight tabular-nums leading-none ${
                        dayItem.isToday
                          ? 'text-[#15803D]'
                          : dayItem.isFuture
                          ? 'text-[#2A2A2A]/50'
                          : 'text-[#2A2A2A]'
                      }`}
                    >
                      {dayItem.day}
                    </span>

                    <div className="flex h-3 items-center justify-center">
                      {dayItem.isFuture ? (
                        <span className="h-1.5 w-1.5" />
                      ) : dayItem.isDone ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />
                      ) : dayItem.usedIce ? (
                        <Snowflake size={11} className="text-[#60A5FA]" />
                      ) : dayItem.row?.soniya > 0 ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                      ) : dayItem.isToday ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                      ) : (
                        <span className="h-1.5 w-1.5" />
                      )}
                    </div>
                  </div>

                  {/* Oq yozuvlar (o'rtadagi yam-yashil kapsula ustiga kelganda ko'rinadi) */}
                  <div
                    ref={(el) => { whiteTextRefs.current[index] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-between py-2 px-1 pointer-events-none"
                    style={{ opacity: 0 }}
                  >
                    <span className="text-[11px] font-semibold tracking-tight text-white/90">
                      {dayItem.weekday}
                    </span>

                    <span className="text-[16px] font-black tracking-tight tabular-nums leading-none text-white">
                      {dayItem.day}
                    </span>

                    <div className="flex h-3 items-center justify-center">
                      {dayItem.isFuture ? (
                        <span className="h-1.5 w-1.5" />
                      ) : dayItem.isDone ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                      ) : dayItem.usedIce ? (
                        <Snowflake size={11} className="text-white" />
                      ) : dayItem.row?.soniya > 0 ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                      ) : (
                        <span className="h-1.5 w-1.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FaollikPage({ route, onNavigate, onContinueReading }) {
  const snapshot = useSyncExternalStore(subscribeToFaollik, getFaollikSnapshot, getFaollikSnapshot);
  const isCalendar = route === '/faollik/kalendar';
  const today = snapshot.holat?.bugun?.sana || getTashkentDate();
  const [selectedMonth, setSelectedMonth] = useState(() => monthParts(today));
  const [monthRows, setMonthRows] = useState([]);
  const [weekRows, setWeekRows] = useState([]);
  const [sheet, setSheet] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchasePending, setPurchasePending] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [toast, setToast] = useState('');
  const [monthError, setMonthError] = useState('');

  useEffect(() => {
    if (snapshot.authenticated !== null) return undefined;
    let active = true;
    Promise.allSettled([getHolat(), getMuzPaketlari()]).then((results) => {
      if (!active) return;
      results.forEach((result) => {
        if (result.status === 'rejected' && result.reason?.message !== 'Kirish talab qilinadi') {
          console.error('Faollik ma’lumotlarini yuklab bo‘lmadi:', result.reason);
        }
      });
    });
    return () => { active = false; };
  }, [snapshot.authenticated]);

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(''), 2600) : undefined;
    return () => clearTimeout(timer);
  }, [toast]);

  const allDates = useMemo(() => {
    return Array.from({ length: 180 + 1 + 14 }, (_, index) => addDays(today, index - 180));
  }, [today]);

  const allMonthKeys = useMemo(() => {
    return [...new Set(allDates.map(getMonthKey))];
  }, [allDates]);

  useEffect(() => {
    if (snapshot.authenticated !== true) return undefined;
    let active = true;
    const monthKeys = isCalendar
      ? [`${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`]
      : allMonthKeys;
    Promise.all(monthKeys.map((key) => {
      const [year, month] = key.split('-').map(Number);
      return getOyFaolligi(year, month);
    }))
      .then((monthResults) => {
        if (!active) return;
        const rows = monthResults.flat();
        if (isCalendar) setMonthRows(rows);
        else setWeekRows(rows);
        setMonthError('');
      })
      .catch((error) => {
        if (!active) return;
        setMonthError(error instanceof Error ? error.message : 'Faollik ma’lumotlarini yuklab bo‘lmadi.');
      });
    return () => { active = false; };
  }, [isCalendar, selectedMonth, snapshot.authenticated, allMonthKeys]);

  const holat = snapshot.holat;
  const bugun = holat?.bugun;
  const goal = DAILY_GOAL_SECONDS;
  const seconds = Math.max(0, Number(bugun?.soniya) || 0);
  const done = seconds >= goal;
  const reward = bugun?.mukofot_tanga ?? 20;
  const progress = done ? 1 : Math.min(seconds / goal, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const streak = Number(holat?.joriy_streak) || 0;
  const balance = Number(holat?.tanga) || 0;
  const iceCount = Number(holat?.muz) || 0;
  const packageList = snapshot.paketlar || [];
  const icePackages = packageList.length
    ? packageList.slice(0, 4)
    : [
      { id: null, soni: 1, narx: 150 },
      { id: null, soni: 3, narx: 400 },
      { id: null, soni: 5, narx: 650 },
      { id: null, soni: 10, narx: 1200 },
    ];
  const currentMonthKey = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`;
  const todayMonth = monthParts(today);
  const canGoForward = monthNumber(selectedMonth.year, selectedMonth.month)
    < monthNumber(todayMonth.year, todayMonth.month);
  const monthDayCount = new Date(selectedMonth.year, selectedMonth.month, 0).getDate();
  const rowByDate = useMemo(
    () => {
      const rows = new Map(monthRows.map((row) => [row.sana, row]));
      if (currentMonthKey === getMonthKey(today)) {
        rows.set(today, { ...rows.get(today), sana: today, soniya: seconds });
      }
      return rows;
    },
    [monthRows, currentMonthKey, today, seconds],
  );
  const completedDays = useMemo(
    () => [...rowByDate.values()].filter(isGoalCompleted).length,
    [rowByDate],
  );
  const weekRowByDate = useMemo(
    () => new Map(weekRows.map((row) => [row.sana, row])),
    [weekRows],
  );
  const arcDays = useMemo(() => {
    return allDates.map((date, index) => {
      const row = date === today
        ? { ...weekRowByDate.get(date), soniya: seconds }
        : weekRowByDate.get(date);
      const d = new Date(`${date}T00:00:00Z`);
      const weekday = UZ_WEEKDAYS[d.getUTCDay()];
      const day = Number(date.slice(-2));
      return {
        date,
        day,
        weekday,
        isDone: isGoalCompleted(row),
        usedIce: row?.muz_ishlatildi === true,
        isFuture: date > today,
        isToday: date === today,
        row,
        index,
      };
    });
  }, [allDates, today, seconds, weekRowByDate]);
  const todayIndex = 180;

  const retry = async () => {
    try {
      await refreshFaollikForRetry();
      if (isCalendar) {
        const rows = await getOyFaolligi(selectedMonth.year, selectedMonth.month);
        setMonthRows(rows);
        setMonthError('');
      } else {
        const rows = await Promise.all(allMonthKeys.map((key) => {
          const [year, month] = key.split('-').map(Number);
          return getOyFaolligi(year, month);
        }));
        setWeekRows(rows.flat());
        setMonthError('');
      }
    } catch (error) {
      if (error?.message !== 'Kirish talab qilinadi') {
        console.error('Faollikni qayta yuklab bo‘lmadi:', error);
      }
    }
  };

  const shiftMonth = (amount) => {
    setMonthRows([]);
    setMonthError('');
    setSelectedMonth((current) => {
      const next = new Date(current.year, current.month - 1 + amount, 1);
      return { year: next.getFullYear(), month: next.getMonth() + 1 };
    });
  };

  const confirmPurchase = async () => {
    if (!selectedPackage || purchasePending) return;
    setPurchasePending(true);
    setPurchaseError('');
    try {
      await sotibOlMuz(selectedPackage.id);
      setSelectedPackage(null);
      setToast('Muz sotib olindi');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Muz sotib olib bo‘lmadi.';
      setPurchaseError(message);
      console.error('Muz sotib olib bo‘lmadi:', error);
    } finally {
      setPurchasePending(false);
    }
  };

  const changeMonth = (amount) => {
    if (amount > 0 && !canGoForward) return;
    shiftMonth(amount);
  };

  const goBack = () => {
    onNavigate(isCalendar ? '/faollik' : '/home');
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-4 pb-8 pt-8 text-[#2A2A2A] page-transition">
      <header className="mb-5 flex min-h-11 items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={goBack}
            aria-label="Orqaga"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3DB] bg-[#FBF7F2] text-[#2A2A2A]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="truncate text-lg font-bold">{isCalendar ? 'Kalendar' : 'Faollik'}</h1>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FBF7F2] border border-[#EEE6DB] rounded-full px-2.5 py-1.5 shadow-sm shrink-0">
          <TangaCoinIcon size={18} />
          <span className="text-[13px] font-black text-[#1E293B]">{balance}</span>
        </div>
      </header>

      <>
        {snapshot.error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <p>{snapshot.error}</p>
            <button type="button" onClick={retry} className="mt-2 font-bold underline">
              Qayta urinish
            </button>
          </div>
        )}

        {monthError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <p>{monthError}</p>
            <button type="button" onClick={retry} className="mt-2 font-bold underline">
              Qayta urinish
            </button>
          </div>
        )}

        {isCalendar ? (
          <div className="space-y-4">
              <section className="rounded-2xl border border-[#EEE6DB] bg-[#FBF7F2] p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="Oldingi oy"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2A2A2A]"
                  >
                    <ChevronLeft size={19} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <h2 className="truncate text-base font-bold">{formatMonth(selectedMonth.year, selectedMonth.month)}</h2>
                    <p className="mt-0.5 text-xs text-[#9A9A9A]">{completedDays}/{monthDayCount}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={!canGoForward}
                    aria-label="Keyingi oy"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2A2A2A] disabled:opacity-30"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-[#9A9A9A]">
                  {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {Array.from({
                    length: (new Date(selectedMonth.year, selectedMonth.month - 1, 1).getDay() + 6) % 7,
                  }).map((_, index) => <span key={`empty-${index}`} />)}
                  {Array.from({ length: monthDayCount }, (_, index) => {
                    const day = index + 1;
                    const date = `${currentMonthKey}-${String(day).padStart(2, '0')}`;
                    const row = rowByDate.get(date);
                    const isToday = date === today;
                    const isFuture = date > today;
                    const isDone = isGoalCompleted(row);
                    const usedIce = row?.muz_ishlatildi === true;
                    const classes = isDone
                      ? 'bg-[#4CAF50] text-white'
                      : usedIce
                        ? 'bg-blue-100 text-blue-500'
                        : isToday
                          ? 'border-2 border-[#4CAF50] bg-white text-[#4CAF50]'
                          : 'bg-[#EDEDED] text-[#9A9A9A]';
                    return (
                      <div key={date} className="flex justify-center">
                        <span
                          aria-label={date}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${classes} ${isFuture ? 'opacity-30' : ''}`}
                        >
                          {usedIce && !isDone ? <Snowflake size={15} /> : day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
          </div>
        ) : (
          <div className="space-y-5">
              <section className="rounded-2xl border border-[#EEE6DB] bg-white p-4">
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                      <circle cx="64" cy="64" r={radius} fill="none" stroke="#EEEEEE" strokeWidth="9" />
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="none"
                        stroke={done ? '#4CAF50' : '#F97316'}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        className="transition-[stroke-dashoffset] duration-500"
                      />
                    </svg>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="text-[11px] font-semibold text-[#9A9A9A]">Bugungi reja</span>
                      <span className="mt-1 text-2xl font-extrabold tabular-nums">
                        {done ? '00:00' : formatTime(goal - seconds)}
                      </span>
                      <span className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${done ? 'text-[#4CAF50]' : 'text-[#B88716]'}`}>
                        <TangaCoinIcon size={15} />
                        {reward}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSheet('plan')}
                    aria-label="Reja haqida"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#5B5B5B]"
                  >
                    <Info size={21} />
                  </button>
                  <button
                    type="button"
                    onClick={onContinueReading}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F43F16] to-[#F59E0B] px-4 text-sm font-bold text-white shadow-sm active:scale-[0.99]"
                  >
                    Darsni boshlang
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-[#EEE6DB] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">Faolligingiz</h2>
                    <p className="text-xs text-[#9A9A9A]">Joriy ko‘rsatgich: {streak} kun</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/faollik/kalendar')}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#656565]"
                  >
                    To‘liq ko‘rish <ChevronRight size={17} />
                  </button>
                </div>
                <div className="rounded-2xl border border-[#EEEEEE] p-3">
                  <ArcDaysRow days={arcDays} todayIndex={todayIndex} />
                </div>
              </section>

              <section className="rounded-2xl border border-[#EEE6DB] bg-white p-4">
                <h2 className="mb-3 text-base font-bold">Zaxiralar</h2>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3.5">
                    <Snowflake size={19} className="text-[#60A5FA]" />
                    <p className="mt-2 text-xl font-extrabold">{iceCount} ta</p>
                    <p className="text-xs text-[#9A9A9A]">Muz bor</p>
                  </div>
                  <div className="rounded-2xl border border-[#EEE6DB] bg-[#FBF7F2] p-3.5">
                    <TangaCoinIcon size={22} />
                    <p className="mt-2 text-xl font-extrabold">{balance}</p>
                    <p className="text-xs text-[#9A9A9A]">Tanga bor</p>
                  </div>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-[#6F6A62]">
                  Muz darsga kira olmaydigan kuningizni himoya qiladi va joriy ko‘rsatgichingiz uzilib qolishining oldini oladi.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {icePackages.map((item) => (
                    <button
                      type="button"
                      key={item.id ?? item.soni}
                      disabled={snapshot.authenticated !== true || packageList.length === 0}
                      onClick={() => {
                        setPurchaseError('');
                        setSelectedPackage(item);
                      }}
                      className="flex min-w-0 flex-col items-center rounded-2xl border border-[#EEE6DB] bg-[#FBF7F2] px-1.5 py-3 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95 transition-transform"
                      aria-label={`${item.soni} ta muz, ${item.narx} tanga`}
                    >
                      <Snowflake size={20} className="text-[#60A5FA]" />
                      <span className="mt-1 text-sm font-bold">{item.soni}</span>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#8D6716]">
                        <TangaCoinIcon size={12} />{item.narx}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
          </div>
        )}
      </>

      {snapshot.completionNotice && (
        <div className="fixed inset-0 z-[1100001] flex items-center justify-center bg-black/45 p-5">
          <section role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#4CAF50]">
              <Check size={30} strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-lg font-bold">Bugungi reja bajarildi! +{snapshot.completionNotice.reward} tanga</h2>
            <button
              type="button"
              onClick={dismissCompletionNotice}
              className="mt-5 w-full rounded-xl bg-[#4CAF50] py-3 font-bold text-white"
            >
              Zo‘r
            </button>
          </section>
        </div>
      )}

      {selectedPackage && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <section className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Muz sotib olish</h2>
              <button type="button" onClick={() => setSelectedPackage(null)} aria-label="Yopish">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-[#6F6A62]">
              {selectedPackage.soni} ta muz, {selectedPackage.narx} tanga. Sotib olasizmi?
            </p>
            {purchaseError && <p role="alert" className="mt-3 text-sm text-red-700">{purchaseError}</p>}
            {balance !== undefined && balance < selectedPackage.narx && (
              <p className="mt-2 text-xs font-semibold text-red-600">Tanga yetarli emas</p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="flex-1 rounded-xl bg-[#F1F1F1] py-3 text-sm font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={purchasePending || balance === undefined || balance < selectedPackage.narx}
                onClick={confirmPurchase}
                className="flex-1 rounded-xl bg-[#E8B84B] py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {purchasePending ? 'Kutilmoqda…' : 'Sotib olish'}
              </button>
            </div>
          </section>
        </div>
      )}

      {sheet && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <section className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">{sheet === 'plan' ? 'Bugungi reja' : 'Muz zaxirasi'}</h2>
              <button type="button" onClick={() => setSheet('')} aria-label="Yopish">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[#6F6A62]">
              {sheet === 'plan'
                ? 'Har kuni kamida 15 daqiqa dars qiling va 20 tanga oling. 15 daqiqaga yetgan kunlaringiz kalendarda yashil bo‘lib belgilanadi.'
                : 'Muz darsga kira olmaydigan kuningizni himoya qiladi. Bir yoki bir necha kun darsga kira olmasangiz, qaytib kirganingizda muz avtomatik sarflanadi va joriy ko‘rsatgichingiz uzilmaydi. Muz faqat o‘tkazib yuborilgan kunlaringizni to‘liq qoplay olsa sarflanadi. Yetmasa muz saqlanib qoladi va ko‘rsatgich boshidan boshlanadi.'}
            </p>
            <button
              type="button"
              onClick={() => setSheet('')}
              className="mt-4 w-full rounded-xl bg-[#F1F1F1] py-3 text-sm font-bold"
            >
              Yopish
            </button>
          </section>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[400] -translate-x-1/2 rounded-full bg-[#2A2A2A] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
