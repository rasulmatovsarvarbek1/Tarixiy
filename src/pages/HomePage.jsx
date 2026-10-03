import React, { useMemo, useState } from 'react';
import {
  Zap,
  Users,
  ShoppingBag,
  Bookmark,
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Check,
  X,
  Gift,
  CheckCircle2,
  Calendar as CalendarIcon,
  Flame,
  Lock,
  Target,
  CalendarDays,
  Medal,
  Trophy
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData';

const FOUR_BUTTONS = [
  {
    id: 'quiz',
    title: 'QUIZ TEST',
    IconComponent: Target,
    gradient: 'linear-gradient(135deg, #1E90FF 0%, #1560BD 100%)',
    glow: 'rgba(30, 144, 255, 0.35)',
    textColor: '#FFFFFF',
    path: '/quiz',
  },
  {
    id: 'calendar',
    title: 'CALENDAR',
    IconComponent: CalendarDays,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
    textColor: '#FFFFFF',
    path: '/calendar',
  },
  {
    id: 'medals',
    title: 'MEDALLAR',
    IconComponent: Medal,
    gradient: 'linear-gradient(135deg, #FFB800 0%, #E69D00 100%)',
    glow: 'rgba(255, 184, 0, 0.35)',
    textColor: '#1A1A1A',
    path: '/medals',
  },
  {
    id: 'ranking',
    title: 'TOP REYTING',
    IconComponent: Trophy,
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)',
    glow: 'rgba(155, 89, 182, 0.35)',
    textColor: '#FFFFFF',
    path: '/ranking',
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

  const referralCode = 'TARIXIY-' + (userData?.fullName ? '77102' : '52513');

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText?.(`https://tarixiy.uz/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: MAGAZIN
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'magazin') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Magazin</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-4 shadow-sm">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">Magazin</h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs">
            Magazin bo'limi hozirda tayyorlanmoqda. Tez orada yangi mahsulotlar va buyumlar qo'shiladi.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: SAQLANGAN
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'saqlangan') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Saqlangan</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] mb-4 shadow-sm">
            <Bookmark className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">Saqlangan mavzular</h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs">
            Hozircha hech qanday dars yoki manba saqlanmagan.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: 4 BUTTON (QUIZ / CALENDAR / MEDALS / RANKING)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === '/quiz' || activeSubPage === '/calendar' || activeSubPage === '/medals' || activeSubPage === '/ranking') {
    const currentBtn = FOUR_BUTTONS.find((b) => b.path === activeSubPage);
    const BtnIcon = currentBtn?.IconComponent;
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-8 sm:pt-10 pb-24 sm:pb-28 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">{currentBtn?.title}</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 shadow-sm"
               style={{ color: currentBtn?.textColor === '#1A1A1A' ? '#D97706' : currentBtn?.glow?.replace('0.35', '1') }}
          >
            {BtnIcon && <BtnIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">{currentBtn?.title}</h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs">
            Bu bo'lim hozirda tayyorlanmoqda. Tez orada yangi kontent qo'shiladi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSubPage(null)}
          className="mt-4 w-full py-3.5 rounded-xl text-white font-bold text-sm transition shadow-lg active:scale-98 cursor-pointer"
          style={{ background: currentBtn?.gradient }}
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     BOSH SAHIFA (MAIN HOME VIEW)
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] pb-24 sm:pb-28">

      {/* ═══════════════════════════════════
          HEADER — Tarixiy
      ═══════════════════════════════════ */}
      <header className="px-4 sm:px-5 pt-8 sm:pt-10 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[#0F172A] font-extrabold text-[22px] sm:text-[24px] tracking-tight">Tarixiy</h1>

          {/* O'ng: xabar + qo'ng'iroq */}
          <div className="flex items-center gap-0">
            {/* Inbox button */}
            <button
              type="button"
              aria-label="Xabarlar"
              onClick={() => setIsReferralModalOpen(true)}
              className="inbox-btn cursor-pointer"
            >
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
          className="rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between relative overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}
        >
          <div className="absolute -right-6 -top-6 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative min-w-0 flex-1 mr-3">
            <p className="text-white/80 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1">
              Haftalik maqsad
            </p>
            <p className="text-white font-bold text-[17px] sm:text-[20px] leading-5 sm:leading-6">
              1000 XP ishlang
            </p>
            <div className="mt-2 h-1.5 w-full max-w-[160px] bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '34%' }} />
            </div>
            <p className="text-white/75 text-[10px] sm:text-[11px] mt-1 font-medium">340 / 1000 XP</p>
          </div>

          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/20 shrink-0 shadow-inner">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#FDE047]" strokeWidth={2.3} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          3 TA ASOSIY TUGMA (Referal, Magazin, Saqlangan)
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 mb-5 sm:mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          
          {/* 1. Referal (Do'st taklif qilish) */}
          <button
            type="button"
            onClick={() => setIsReferralModalOpen(true)}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#D4AF37]/50 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-sm group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center mb-1.5 sm:mb-2 text-[#EA580C] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#1E293B] leading-tight">Referal</span>
          </button>

          {/* 2. Magazin */}
          <button
            type="button"
            onClick={() => {
              setActiveSubPage('magazin');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#D4AF37]/50 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-sm group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center mb-1.5 sm:mb-2 text-[#D97706] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#1E293B] leading-tight">Magazin</span>
          </button>

          {/* 3. Saqlangan */}
          <button
            type="button"
            onClick={() => {
              setActiveSubPage('saqlangan');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="py-3 sm:py-4 px-2 sm:px-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#D4AF37]/50 active:scale-95 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-sm group"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center mb-1.5 sm:mb-2 text-[#0284C7] group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#1E293B] leading-tight">Saqlangan</span>
          </button>

        </div>
      </div>

      {/* ═══════════════════════════════════
          4 TA BUTTON (KATTA VA CHIROYLI DIZAYN)
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 space-y-3.5 sm:space-y-4">
        {FOUR_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => {
              setActiveSubPage(btn.path);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="w-full min-h-[95px] sm:min-h-[105px] rounded-3xl p-5 sm:p-6 text-left relative overflow-hidden flex items-center justify-between transition-all duration-200 active:scale-[0.98] cursor-pointer group shadow-lg"
            style={{
              background: btn.gradient,
              color: btn.textColor,
              boxShadow: `0 8px 24px ${btn.glow}`,
            }}
          >
            {/* Orqa fon doiralari (estetik dizayn) */}
            <div className="absolute -right-6 -top-6 w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-white/15 pointer-events-none" />
            <div className="absolute right-12 -bottom-8 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white/15 pointer-events-none" />

            {/* Chap tomon: Katta Icon + Faqat Button Nomi */}
            <div className="flex items-center gap-4 relative z-10 min-w-0">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner"
                style={{
                  backgroundColor: btn.textColor === '#1A1A1A' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <btn.IconComponent className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
              </div>
              <h3 className="font-black text-[18px] sm:text-[21px] tracking-wide uppercase truncate select-none">
                {btn.title}
              </h3>
            </div>

            {/* O'ng tomon: [↗] belgi */}
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative z-10 transition-transform group-hover:scale-105 group-hover:translate-x-0.5"
              style={{
                backgroundColor: btn.textColor === '#1A1A1A' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
            </div>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════
          MODAL: REFERAL (DO'ST TAKLIF QILISH)
      ═══════════════════════════════════ */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-white border-t sm:border border-[#E2E8F0] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Do'st taklif qilish</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed mb-4 sm:mb-5">
              Do'stlaringizga o'z taklif havolangizni yuboring. Ular ro'yxatdan o'tganda ikkingizga ham <strong className="text-[#D97706]">+100 XP</strong> beriladi!
            </p>

            {/* Havola nusxalash qatori */}
            <div className="p-2.5 sm:p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-semibold text-[#0F172A] truncate min-w-0">
                https://tarixiy.uz/ref/{referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] text-[10px] sm:text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(false)}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#F1F5F9] text-[#1E293B] text-[11px] sm:text-xs font-bold hover:bg-[#E2E8F0] transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
