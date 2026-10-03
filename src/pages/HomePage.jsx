import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  Trophy,
  Send,
  Image,
  Smile,
  Bell,
  Mail
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
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: 'support', text: 'Assalomu Alaykum! Tarixiy ilovaga xush kelibsiz 🎉', time: '10:00' },
    { id: 2, from: 'support', text: 'Savollaringiz bo\'lsa, bemalol yozing. Sizga yordam berishdan xursandmiz! 😊', time: '10:01' },
  ]);
  const chatEndRef = useRef(null);

  const fullName = useMemo(() => {
    return userData?.fullName?.trim() || dashboardData.userName;
  }, [userData]);

  const referralCode = 'TARIXIY-' + (userData?.fullName ? '77102' : '52513');

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText?.(`https://tarixiy.uz/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    setChatMessages(prev => [...prev, { id: Date.now(), from: 'user', text: chatMessage.trim(), time }]);
    setChatMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'support',
        text: 'Xabaringiz qabul qilindi! Tez orada javob beramiz ✅',
        time
      }]);
    }, 1200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeSubPage]);

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: SUHBATLAR RO'YXATI
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'suhbatlar') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col page-transition">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-10 pb-3 bg-white border-b border-[#E2E8F0] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="flex items-center gap-1.5 text-[#1E40AF] text-sm font-semibold active:opacity-60 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Ortga
          </button>
          <h1 className="text-[#0F172A] font-bold text-lg">Suhbatlar</h1>
          <div className="w-16" />
        </div>

        {/* Chat list */}
        <div className="flex-1 px-0">
          {/* Support Service item */}
          <button
            type="button"
            onClick={() => setActiveSubPage('support-chat')}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition cursor-pointer border-b border-[#E2E8F0]"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md">
              S
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[#0F172A] font-semibold text-[15px] truncate">Support Service</p>
                <p className="text-[#94A3B8] text-xs shrink-0 ml-2">10:00</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#64748B] text-sm truncate">
                  Assalomu Alaykum! Tarixiy ilovaga xush...
                </p>
                {/* Unread badge */}
                <span className="ml-2 w-5 h-5 rounded-full bg-[#1E40AF] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  1
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: SUPPORT CHAT
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'support-chat') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#F0F2F5] text-[#1E293B] flex flex-col page-transition" style={{height:'100dvh'}}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-10 pb-3 bg-white border-b border-[#E2E8F0] shrink-0 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSubPage('suhbatlar')}
            className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white font-black text-base shrink-0 shadow-md">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#0F172A] text-sm leading-tight">Support Service</p>
            <p className="text-[11px] text-[#22C55E] font-medium">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{paddingBottom:'80px'}}>
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.from === 'support' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white font-black text-xs shrink-0 shadow">
                  S
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                msg.from === 'user'
                  ? 'bg-[#1E40AF] text-white rounded-br-sm'
                  : 'bg-white text-[#0F172A] rounded-bl-sm border border-[#E2E8F0]'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${
                  msg.from === 'user' ? 'text-white/60' : 'text-[#94A3B8]'
                }`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none" style={{zIndex:50}}>
          <div className="w-full max-w-[430px] pointer-events-auto">
            <div className="bg-white border-t border-[#E2E8F0] px-3 py-3 flex items-center gap-2 shadow-lg">
              {/* Sticker */}
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#3B82F6] hover:bg-[#EFF6FF] transition shrink-0 cursor-pointer">
                <Smile className="w-5 h-5" />
              </button>
              {/* Input */}
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Xabar yozing..."
                className="flex-1 bg-[#F1F5F9] rounded-full px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none border border-transparent focus:border-[#3B82F6] transition"
              />
              {/* Image */}
              <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#3B82F6] hover:bg-[#EFF6FF] transition shrink-0 cursor-pointer">
                <Image className="w-5 h-5" />
              </button>
              {/* Send */}
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-full bg-[#1E40AF] flex items-center justify-center text-white active:scale-90 transition shrink-0 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: REFERAL (BELL ICON)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'referral-page') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 pb-24 flex flex-col page-transition">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveSubPage(null)}
            className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-[#0F172A]">Do'stni taklif qilish</h1>
        </div>

        {/* Banner */}
        <div className="rounded-3xl p-6 mb-6 text-center relative overflow-hidden shadow-xl" style={{background:'linear-gradient(135deg,#FFB800 0%,#E8B84B 100%)'}}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Gift className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-white font-black text-xl mb-1">100 tanga mukofot!</h2>
          <p className="text-white/90 text-sm leading-relaxed">
            Do'stlaringizni taklif qilib<br/>
            <strong>100 tanga</strong> mukofot oling!
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {[
            { num: '1', text: "Havolangizni do'stingizga yuboring", color: '#3B82F6' },
            { num: '2', text: "Do'stingiz ro'yxatdan o'tsin", color: '#10B981' },
            { num: '3', text: 'Ikkingizga ham 100 tanga beriladi! 🎉', color: '#F59E0B' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{background: step.color}}>
                {step.num}
              </div>
              <p className="text-sm text-[#1E293B] font-medium">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-semibold text-[#0F172A] truncate min-w-0">
            tarixiy.uz/ref/{referralCode}
          </span>
          <button
            type="button"
            onClick={handleCopyReferral}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95"
            style={{background:'linear-gradient(135deg,#FFB800,#E8B84B)'}}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
          </button>
        </div>

        <button
          type="button"
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-[0.98] cursor-pointer transition"
          style={{background:'linear-gradient(135deg,#1E40AF,#3B82F6)'}}
        >
          Ulashish 🚀
        </button>
      </div>
    );
  }

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
          <div className="flex items-center gap-1">
            {/* Support Chat button */}
            <button
              type="button"
              aria-label="Xabarlar"
              onClick={() => {
                setActiveSubPage('suhbatlar');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F1F5F9] active:scale-90 transition cursor-pointer text-[#475569]"
            >
              <Mail className="w-5 h-5" />
              {/* Yangi xabar belgisi */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
            </button>
            {/* Referral / Bell button */}
            <button
              type="button"
              aria-label="Bildirishnomalar"
              onClick={() => {
                setActiveSubPage('referral-page');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F1F5F9] active:scale-90 transition cursor-pointer text-[#475569]"
            >
              <Bell className="w-5 h-5" />
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
