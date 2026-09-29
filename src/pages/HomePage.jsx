import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Flame,
  Trophy,
  ClipboardList,
  Zap,
  Users,
  ShoppingBag,
  Bookmark,
  ArrowLeft,
  Copy,
  Check,
  X,
  Gift
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData';

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
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullName = useMemo(() => {
    return userData?.fullName?.trim() || dashboardData.userName;
  }, [userData]);

  const firstName = fullName.split(' ')[0];
  const classLevel = userData?.gradeLevel
    ? `${userData.gradeLevel}-sinf`
    : dashboardData.classLevel;
  const initials = getInitials(fullName);

  const referralCode = 'TARIXIY-' + (userData?.fullName ? '77102' : '52513');

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText?.(`https://tarixiy.uz/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: MAGAZIN (Hozircha bo'sh sahifa)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'magazin') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] text-white px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141A29] border border-[#1E2638] flex items-center justify-center text-white active:scale-95 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white">Magazin</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#141A29] border border-[#1E2638] flex items-center justify-center text-[#E8B84B] mb-4 shadow-lg">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">Magazin</h2>
          <p className="text-[11px] sm:text-xs text-[#5A6478] max-w-xs">
            Magazin bo'limi hozirda tayyorlanmoqda. Tez orada yangi mahsulotlar va buyumlar qo'shiladi.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: SAQLANGAN (Hozircha bo'sh sahifa)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'saqlangan') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] text-white px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141A29] border border-[#1E2638] flex items-center justify-center text-white active:scale-95 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white">Saqlangan</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#141A29] border border-[#1E2638] flex items-center justify-center text-[#38BDF8] mb-4 shadow-lg">
            <Bookmark className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">Saqlangan mavzular</h2>
          <p className="text-[11px] sm:text-xs text-[#5A6478] max-w-xs">
            Hozircha hech qanday dars yoki manba saqlanmagan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] text-white pb-24 sm:pb-28">

      {/* ═══════════════════════════════════
          HEADER — Tarixiy
      ═══════════════════════════════════ */}
      <header className="px-4 sm:px-5 pt-10 sm:pt-12 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-[20px] sm:text-[22px]">Tarixiy</h1>

          {/* O'ng: xabar + qo'ng'iroq (Uiverse.io) */}
          <div className="flex items-center gap-0">
            {/* Inbox button */}
            <button type="button" aria-label="Xabarlar" className="inbox-btn">
              <svg viewBox="0 0 512 512" height="16" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
                ></path>
              </svg>
            </button>
            {/* Bell button */}
            <button type="button" aria-label="Bildirishnomalar" className="notif-bell-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                  fill="currentColor"
                  d="M20 17h2v2H2v-2h2v-7a8 8 0 1 1 16 0v7zm-2 0v-7a6 6 0 1 0-12 0v7h12zm-9 4h6v2H9v-2z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════
          XP BANNER (tepada)
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 mb-4 sm:mb-5">
        <div
          className="rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2A5298 0%, #1E3A5F 100%)' }}
        >
          <div className="absolute -right-6 -top-6 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative min-w-0 flex-1 mr-3">
            <p className="text-white/70 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1">
              Haftalik maqsad
            </p>
            <p className="text-white font-bold text-[17px] sm:text-[20px] leading-5 sm:leading-6">
              1000 XP ishlang
            </p>
            <div className="mt-2 h-1.5 w-full max-w-[160px] bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8B84B] rounded-full" style={{ width: '34%' }} />
            </div>
            <p className="text-white/50 text-[10px] sm:text-[11px] mt-1">340 / 1000 XP</p>
          </div>

          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 shrink-0">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#E8B84B]" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          3 TA ASOSIY TUGMA (pastda)
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 mb-5 sm:mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          
          {/* 1. Referal (Do'st taklif qilish) */}
          <button
            type="button"
            onClick={() => setIsReferralModalOpen(true)}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#141A29] hover:bg-[#1C2438] border border-[#1E2638] hover:border-[#E8B84B]/40 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-md group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FF9800]/15 border border-[#FF9800]/30 flex items-center justify-center mb-1.5 sm:mb-2 text-[#FF9800] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white leading-tight">Referal</span>
          </button>

          {/* 2. Magazin */}
          <button
            type="button"
            onClick={() => {
              setActiveSubPage('magazin');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#141A29] hover:bg-[#1C2438] border border-[#1E2638] hover:border-[#E8B84B]/40 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-md group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#E8B84B]/15 border border-[#E8B84B]/30 flex items-center justify-center mb-1.5 sm:mb-2 text-[#E8B84B] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white leading-tight">Magazin</span>
          </button>

          {/* 3. Saqlangan */}
          <button
            type="button"
            onClick={() => {
              setActiveSubPage('saqlangan');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#141A29] hover:bg-[#1C2438] border border-[#1E2638] hover:border-[#E8B84B]/40 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-md group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center mb-1.5 sm:mb-2 text-[#38BDF8] group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white leading-tight">Saqlangan</span>
          </button>

        </div>
      </div>

      {/* ═══════════════════════════════════
          GRADIENT CARDS — to'liq kenglik
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
          <h2 className="text-white font-bold text-[15px] sm:text-[17px]">Bo'limlar</h2>
          <button type="button" className="text-[#5A6478] text-[12px] sm:text-[13px] hover:text-white transition-colors cursor-pointer">
            Hammasi
          </button>
        </div>

        {CARDS.map((card) => {
          const Icon = card.Icon;
          return (
            <button
              key={card.id}
              type="button"
              className="w-full rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
              style={{
                background: card.gradient,
                boxShadow: `0 6px 24px ${card.glow}`,
              }}
            >
              {/* Orqa fon doirasi */}
              <div className="absolute -right-6 -top-6 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-8 sm:right-10 -bottom-8 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 pointer-events-none" />

              {/* Arrow top right */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>

              {/* Icon + Title */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 relative">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-white" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[17px] sm:text-[20px] leading-5 truncate">{card.title}</h3>
                  <p className="text-white/70 text-[11px] sm:text-[12px] mt-0.5 sm:mt-1 truncate">{card.subtitle}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="relative flex items-center gap-3 sm:gap-5 pt-2.5 sm:pt-3 border-t border-white/20">
                {card.stats.map((s, i) => (
                  <div key={i} className="flex flex-col min-w-0">
                    <span className="text-white/60 text-[9px] sm:text-[10px]">{s.label}:</span>
                    <span className="text-white font-bold text-[13px] sm:text-[15px]">{s.value}</span>
                  </div>
                ))}
                <div className="ml-auto shrink-0">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-bold">
                    {card.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════
          MODAL: REFERAL (DO'ST TAKLIF QILISH)
      ═══════════════════════════════════════ */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-[#131826] border-t sm:border border-[#1E2638] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#FF9800]/20 flex items-center justify-center text-[#FF9800]">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Do'st taklif qilish</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E2638] flex items-center justify-center text-[#7A8499] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-[#8B98AD] leading-relaxed mb-4 sm:mb-5">
              Do'stlaringizga o'z taklif havolangizni yuboring. Ular ro'yxatdan o'tganda ikkingizga ham <strong className="text-[#E8B84B]">+100 XP</strong> beriladi!
            </p>

            {/* Havola nusxalash qatori */}
            <div className="p-2.5 sm:p-3 bg-[#0C0F18] border border-[#1E2638] rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-semibold text-white truncate min-w-0">
                https://tarixiy.uz/ref/{referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] text-[10px] sm:text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(false)}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#1E2638] text-white text-[11px] sm:text-xs font-bold hover:bg-[#283248] transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
