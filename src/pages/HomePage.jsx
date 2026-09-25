import React, { useMemo, useState } from 'react';
import {
  Search,
  MessageCircle,
  Bell,
  ArrowUpRight,
  BookOpen,
  Flame,
  Trophy,
  ClipboardList,
  Zap,
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData';

/* ─── Skill progress bars (Uzunchoq kapsulalar) ─── */
const SKILLS = [
  { key: 'mavzu', label: 'MAVZU', color: '#00D2FF', pct: 100 },
  { key: 'test', label: 'TEST', color: '#FF5555', pct: 0 },
  { key: 'oqish', label: "O'QISH", color: '#FFA024', pct: 0 },
  { key: 'sanalar', label: 'SANALAR', color: '#E2E628', pct: 100 },
  { key: 'tahlil', label: 'TAHLIL', color: '#39FF24', pct: 100 },
];

/* ─── Dashboard cards ─── */
const CARDS = [
  {
    id: 1,
    title: 'Bugungi dars',
    subtitle: "1-Bo'lim: Qadimgi davr",
    tag: 'Boshlash',
    gradient: 'linear-gradient(135deg, #1E90FF 0%, #1560BD 100%)',
    glow: 'rgba(30,144,255,0.25)',
    Icon: BookOpen,
    stats: [
      { label: "O'tilgan", value: '3' },
      { label: 'Qolgan', value: '12' },
      { label: 'XP', value: '340' },
    ],
  },
  {
    id: 2,
    title: 'Ketma-ketlik',
    subtitle: '7 kun davom etmoqda',
    tag: 'Davom et',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #C0392B 100%)',
    glow: 'rgba(255,107,53,0.25)',
    Icon: Flame,
    stats: [
      { label: 'Uzilmagan', value: '7 kun' },
      { label: 'Rekord', value: '14 kun' },
    ],
  },
  {
    id: 3,
    title: 'Reyting',
    subtitle: "Siz #15-o'rinda",
    tag: "Ko'rish",
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)',
    glow: 'rgba(155,89,182,0.25)',
    Icon: Trophy,
    stats: [
      { label: "O'rin", value: '#15' },
      { label: 'Ball', value: '340' },
    ],
  },
  {
    id: 4,
    title: 'Haftalik imtihon',
    subtitle: 'Yakshanba',
    tag: '2 kun qoldi',
    gradient: 'linear-gradient(135deg, #1ABC9C 0%, #148F77 100%)',
    glow: 'rgba(26,188,156,0.25)',
    Icon: ClipboardList,
    stats: [
      { label: 'Qoldi', value: '2 kun' },
      { label: 'Mavzu', value: '15' },
    ],
  },
];

function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function HomePage({ userData }) {
  const [query, setQuery] = useState('');

  const fullName = useMemo(() => {
    return userData?.fullName?.trim() || dashboardData.userName;
  }, [userData]);

  const firstName = fullName.split(' ')[0];
  const classLevel = userData?.gradeLevel
    ? `${userData.gradeLevel}-sinf`
    : dashboardData.classLevel;
  const initials = getInitials(fullName);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] text-white pb-28">

      {/* ═══════════════════════════════════
          HEADER — to'liq qora, bir xil bg
      ═══════════════════════════════════ */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          {/* Chap: avatar + ism */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-[#E8B84B]/60 bg-[#E8B84B]/15 flex items-center justify-center shrink-0">
              <span className="text-[#E8B84B] font-bold text-[16px] leading-none">
                {initials}
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-[18px] leading-5">
                Salom, {firstName}!
              </p>
              <p className="text-[#5A6478] text-[12px] mt-0.5">{classLevel}</p>
            </div>
          </div>

          {/* O'ng: xabar + qo'ng'iroq */}
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Xabarlar"
              className="w-10 h-10 rounded-full bg-[#161C28] border border-[#252D3D] flex items-center justify-center hover:bg-[#1E2638] transition-colors"
            >
              <MessageCircle style={{ width: 18, height: 18 }} className="text-[#7A8499]" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Bildirishnomalar"
              className="w-10 h-10 rounded-full bg-[#161C28] border border-[#252D3D] flex items-center justify-center hover:bg-[#1E2638] transition-colors"
            >
              <Bell style={{ width: 18, height: 18 }} className="text-[#7A8499]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════
          QIDIRUV
      ═══════════════════════════════════ */}
      <div className="px-5 mb-5">
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Mavzular bo'ylab qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-11 rounded-2xl bg-[#161C28] border border-[#252D3D] px-4 text-sm text-white placeholder:text-[#3D4860] outline-none focus:border-[#E8B84B]/50 focus:ring-1 focus:ring-[#E8B84B]/20 transition"
          />
          <button
            type="button"
            aria-label="Qidirish"
            className="w-11 h-11 rounded-2xl bg-[#E8B84B] flex items-center justify-center shrink-0 hover:bg-[#D4A437] transition-colors"
          >
            <Search style={{ width: 18, height: 18 }} className="text-[#0C0F18]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════
          SKILL BARS (Uzunchoq Kapsulalar)
      ═══════════════════════════════════ */}
      <div className="px-5 mb-6">
        <div className="bg-[#141824] border border-[#1E2536] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex gap-2 sm:gap-3 justify-between items-end">
            {SKILLS.map((s) => (
              <div key={s.key} className="flex-1 flex flex-col items-center">
                {/* 1. Foiz yozuvi (100%, 0%, 0%, 100%, 100%) */}
                <span className="text-[14px] sm:text-[16px] font-extrabold text-white tracking-tight mb-2.5 select-none">
                  {s.pct}%
                </span>

                {/* 2. Uzunchoq to'rtburchak kapsula (Oblong pill slot) */}
                <div className="w-full max-w-[52px] h-[95px] sm:h-[105px] rounded-[13px] bg-[#1E222D] p-1 flex flex-col justify-end border border-[#151822] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)] overflow-hidden">
                  {s.pct > 0 ? (
                    <div
                      className="w-full rounded-[9px] transition-all duration-700 shadow-sm"
                      style={{
                        height: `${s.pct}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  ) : null}
                </div>

                {/* 3. Skill label (VOCABULARY / MAVZU va boshqalar) */}
                <span className="text-[9px] sm:text-[10px] font-extrabold text-white tracking-wider text-center uppercase mt-3 leading-tight select-none">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          XP BANNER
      ═══════════════════════════════════ */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2A5298 0%, #1E3A5F 100%)' }}
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative">
            <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1">
              Haftalik maqsad
            </p>
            <p className="text-white font-bold text-[20px] leading-6">
              1000 XP ishlang
            </p>
            <div className="mt-2 h-1.5 w-40 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8B84B] rounded-full" style={{ width: '34%' }} />
            </div>
            <p className="text-white/50 text-[11px] mt-1">340 / 1000 XP</p>
          </div>

          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8B84B]/20 border border-[#E8B84B]/30">
            <Zap style={{ width: 28, height: 28 }} className="text-[#E8B84B]" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          GRADIENT CARDS — to'liq kenglik
      ═══════════════════════════════════ */}
      <div className="px-5 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-bold text-[17px]">Bo'limlar</h2>
          <button type="button" className="text-[#5A6478] text-[13px] hover:text-white transition-colors">
            Hammasi
          </button>
        </div>

        {CARDS.map((card) => {
          const Icon = card.Icon;
          return (
            <button
              key={card.id}
              type="button"
              className="w-full rounded-2xl p-5 text-left relative overflow-hidden active:scale-[0.98] transition-transform"
              style={{
                background: card.gradient,
                boxShadow: `0 8px 32px ${card.glow}`,
              }}
            >
              {/* Orqa fon doirasi */}
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-10 -bottom-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

              {/* Arrow top right */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpRight style={{ width: 16, height: 16 }} className="text-white" />
              </div>

              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Icon style={{ width: 22, height: 22 }} className="text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[20px] leading-5">{card.title}</h3>
                  <p className="text-white/70 text-[12px] mt-1">{card.subtitle}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="relative flex items-center gap-5 pt-3 border-t border-white/20">
                {card.stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-white/60 text-[10px]">{s.label}:</span>
                    <span className="text-white font-bold text-[15px]">{s.value}</span>
                  </div>
                ))}
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold">
                    {card.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
