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
  Mail,
  Crown,
  Sparkles,
  Coins,
  Share2,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData';
import ShopPage from './ShopPage';


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

export default function HomePage({
  userData,
  onNavigateTab,
  activeSubPage: externalSubPage,
  setActiveSubPage: setExternalSubPage,
  userCoins = 16,
  setUserCoins,
}) {
  const [localSubPage, setLocalSubPage] = useState(null);
  const activeSubPage = externalSubPage !== undefined ? externalSubPage : localSubPage;
  const setActiveSubPage = (val) => {
    if (setExternalSubPage) setExternalSubPage(val);
    setLocalSubPage(val);
  };
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const [refStep, setRefStep] = useState(0);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  // Referal sahifasidagi 4 qadamli karusel avtomatik o'tishi (har 12 sekundda)
  useEffect(() => {
    if (activeSubPage !== 'referral-page' || showFriendsList) return;
    const timer = setInterval(() => {
      setRefStep((prev) => (prev + 1) % 4);
    }, 12000);
    return () => clearInterval(timer);
  }, [activeSubPage, showFriendsList]);

  // 4 ta karusel slayd har 6 sekundda chapga to'xtovsiz surilib o'tadi
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitionEnabled(true);
      setCarouselIndex((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleTransitionEnd = () => {
    // 4-slayddan keyin 1-slaydning kloniga o'tganda darhol transitionsiz 0-indeksga qaytarish
    if (carouselIndex >= 4) {
      setIsTransitionEnabled(false);
      setCarouselIndex(0);
    }
  };

  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: 'support', text: 'Assalomu Alaykum! Tarixiy ilovaga xush kelibsiz', time: '10:00' },
    { id: 2, from: 'support', text: 'Savollaringiz bo\'lsa, bemalol yozing. Sizga yordam berishdan xursandmiz!', time: '10:01' },
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

  const handleOpenShareSheet = () => {
    const shareData = {
      title: 'Tarixiy',
      text: "Tarixiy ilovasida tarix fanini biz bilan birga o'rganing! 10% chegirma oling.",
      url: `https://tarixiy.uz/ref/${referralCode}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        setIsShareSheetOpen(true);
      });
    } else {
      setIsShareSheetOpen(true);
    }
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
        text: 'Xabaringiz qabul qilindi! Tez orada javob beramiz.',
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
     SUB-PAGE: REFERAL HAVOLA (OQ FONLI ZAMONAVIY DIZAYN)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'referral-page') {
    // Agar "Do'stlar (3)" tugmasi bosilgan bo'lsa, 3 ta do'st ro'yxati sahifasi ko'rinadi
    if (showFriendsList) {
      return (
        <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-8 pb-20 flex flex-col page-transition">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setShowFriendsList(false)}
              className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center text-[#1E293B] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">Do'stlar ro'yxati</h1>
            <div className="w-9" />
          </div>

          {/* Umumiy statistika kartasi */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Jami taklif qilingan</p>
                <h3 className="text-[#0F172A] text-2xl font-black mt-0.5">3 ta do'st</h3>
              </div>
              <div className="text-right">
                <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Mukofot tangalar</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full mt-1">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 font-bold text-sm">+300 tanga</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 ta do'st ro'yxati */}
          <div className="flex-1 space-y-2.5">
            {[
              { id: 1, name: 'Sardor Aliyev', status: "Ro'yxatdan o'tgan", date: 'Kecha, 14:20', reward: '+100 tanga', avatar: 'S', color: '#3B82F6' },
              { id: 2, name: 'Jasur Rahimov', status: "Ro'yxatdan o'tgan", date: '3 kun oldin', reward: '+100 tanga', avatar: 'J', color: '#10B981' },
              { id: 3, name: 'Umid Karimov', status: "Ro'yxatdan o'tgan", date: '5 kun oldin', reward: '+100 tanga', avatar: 'U', color: '#8B5CF6' },
            ].map((friend) => (
              <div
                key={friend.id}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-sm shrink-0"
                    style={{ background: friend.color }}
                  >
                    {friend.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">{friend.name}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{friend.status} • {friend.date}</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold text-xs shrink-0">
                  {friend.reward}
                </div>
              </div>
            ))}
          </div>

          {/* Pastdagi ortga qaytish tugmasi */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setShowFriendsList(false)}
              className="w-full py-3.5 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95 text-[#1E293B] font-bold text-sm transition cursor-pointer"
            >
              Ortga qaytish
            </button>
          </div>
        </div>
      );
    }

    // Asosiy Referal sahifasi (Oq fonli toza dizayn)
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-8 pb-10 flex flex-col justify-between page-transition select-none">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveSubPage(null)}
              className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center text-[#1E293B] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-wide">
              Referal havola
            </h1>
            <div className="w-9" />
          </div>

          {/* ── TEPADAGI 4 QADAMLI KARUSEL KARTASI ── */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden min-h-[350px] flex flex-col justify-between">
            
            {/* 1-QADAM */}
            {refStep === 0 && (
              <div className="fade-in flex flex-col flex-1">
                <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold mb-3">
                  1-qadam
                </div>
                <h2 className="text-[#0F172A] font-extrabold text-[18px] sm:text-[20px] leading-tight mb-1.5">
                  Referral havolangizni ulashing
                </h2>
                <p className="text-[#64748B] text-xs leading-relaxed mb-4">
                  Havolangizni tarix fanini o'rganmoqchi bo'lgan do'stlaringizga yuboring.
                </p>

                {/* Vizual illyustratsiya bloki */}
                <div className="bg-white rounded-2xl p-4 flex items-center justify-between relative mt-auto border border-[#E2E8F0] shadow-sm">
                  {/* Link belgisi */}
                  <div className="w-11 h-11 rounded-full bg-[#EFF6FF] flex items-center justify-center shadow-sm text-[#2563EB] shrink-0 border border-blue-200">
                    <LinkIcon className="w-5 h-5" />
                  </div>

                  {/* Bog'lovchi chiziqlar */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2">
                    <div className="w-full border-t border-dashed border-[#CBD5E1]" />
                  </div>

                  {/* 3 ta do'st */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { initial: 'S', name: 'Sardor' },
                      { initial: 'J', name: 'Jasur' },
                      { initial: 'U', name: 'Umid' },
                    ].map((user, i) => (
                      <div
                        key={i}
                        className="bg-[#F8FAFC] rounded-full px-3 py-1 shadow-sm flex items-center gap-2 border border-[#E2E8F0]"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-bold flex items-center justify-center">
                          {user.initial}
                        </div>
                        <span className="text-[11px] font-bold text-[#0F172A]">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2-QADAM */}
            {refStep === 1 && (
              <div className="fade-in flex flex-col flex-1">
                <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold mb-3">
                  2-qadam
                </div>
                <h2 className="text-[#0F172A] font-extrabold text-[18px] sm:text-[20px] leading-tight mb-1.5">
                  Ular 10% chegirma olishadi
                </h2>
                <p className="text-[#64748B] text-xs leading-relaxed mb-4">
                  Sizning havolangiz orqali ro'yxatdan o'tgan do'stingiz 10% chegirma oladi.
                </p>

                {/* Vizual illyustratsiya: Chegirma kuponi */}
                <div className="bg-white rounded-2xl p-5 flex items-center justify-center relative mt-auto border border-[#E2E8F0] min-h-[140px] shadow-sm">
                  <div className="bg-[#EFF6FF] rounded-2xl p-4 shadow-sm border border-[#BFDBFE] flex flex-col items-center justify-center w-52 relative transform -rotate-1">
                    <div className="w-12 h-1 bg-[#93C5FD] rounded-full mb-2" />
                    <span className="text-[#2563EB] font-bold text-[11px] uppercase tracking-wider">
                      Chegirma
                    </span>
                    <span className="text-[#1D4ED8] font-black text-3xl tracking-tight">
                      10%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3-QADAM */}
            {refStep === 2 && (
              <div className="fade-in flex flex-col flex-1">
                <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold mb-3">
                  3-qadam
                </div>
                <h2 className="text-[#0F172A] font-extrabold text-[18px] sm:text-[20px] leading-tight mb-1.5">
                  Siz qo'shimcha 100 tanga olasiz.
                </h2>
                <p className="text-[#64748B] text-xs leading-relaxed mb-4">
                  Do'stingiz ilovani yuklab olgani uchun sizga tanga beramiz, shuningdek, u obuna olsa yana qo'shimcha tangaga ega bo'lasiz.
                </p>

                {/* Vizual illyustratsiya: +100 va oltin tangalar */}
                <div className="bg-white rounded-2xl p-4 flex items-center justify-center relative mt-auto border border-[#E2E8F0] min-h-[140px] shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[#2563EB] font-black text-5xl tracking-tight">
                      +100
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-100 shadow-md flex items-center justify-center font-black text-xs text-amber-900">
                        C
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-100 shadow-sm flex items-center justify-center font-black text-[10px] text-amber-900 ml-2">
                        C
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4-QADAM (SAVOLLAR) */}
            {refStep === 3 && (
              <div className="fade-in flex flex-col flex-1">
                <h2 className="text-[#0F172A] font-extrabold text-[19px] sm:text-[21px] leading-tight mb-3">
                  Savollaringiz bormi?
                </h2>

                <div className="space-y-2.5 mt-1">
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm">
                    <h4 className="text-[#0F172A] font-bold text-[13px]">Kimni taklif qilsam bo'ladi?</h4>
                    <p className="text-[#64748B] text-xs mt-1 leading-snug">
                      Faqat yangi foydalanuvchilar (ilgari ro'yxatdan o'tmagan).
                    </p>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm">
                    <h4 className="text-[#0F172A] font-bold text-[13px]">Havola ishlamayapti?</h4>
                    <p className="text-[#64748B] text-xs mt-1 leading-snug">
                      Havolani qayta jo'nating yoki ilovani yangilab qayta urinib ko'ring.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pastki 4 ta nuqta (Indikatorlar) */}
            <div className="flex items-center justify-center gap-1.5 pt-4 mt-auto">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Qadam ${idx + 1}`}
                  onClick={() => setRefStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    refStep === idx ? 'w-5 bg-[#2563EB]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                  }`}
                />
              ))}
            </div>

          </div>

          {/* ── DO'STLAR KARTASI (3 TA DO'ST) ── */}
          <div
            onClick={() => setShowFriendsList(true)}
            className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition shadow-sm mt-4 group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#0F172A] font-bold text-base">
                Do'stlar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-xl px-4 py-1 font-black text-base shadow-sm group-hover:bg-[#DBEAFE] transition">
                3
              </span>
              <ChevronRight className="w-5 h-5 text-[#64748B]" />
            </div>
          </div>

        </div>

        {/* ── PASTDAGI ASOSIY TUGMA (SHARE SHEET OCHADI) ── */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleOpenShareSheet}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}
          >
            <Share2 className="w-5 h-5" />
            <span>Havolani ulashish</span>
          </button>
        </div>

        {/* ── SHARE SHEET OYNA (MODAL) ── */}
        {isShareSheetOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0 sm:p-4 fade-in">
            <div className="bg-white border-t sm:border border-[#E2E8F0] rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl text-[#1E293B]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
                <h3 className="text-[#0F172A] font-bold text-base">Havolani ulashish</h3>
                <button
                  type="button"
                  onClick={() => setIsShareSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Havola ko'rinishi va nusxalash */}
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono text-[#0F172A] truncate min-w-0">
                  https://tarixiy.uz/ref/{referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                </button>
              </div>

              {/* Ulashish yo'llari */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://tarixiy.uz/ref/${referralCode}`)}&text=${encodeURIComponent("Tarixiy ilovasida tarix fanini birga o'rganing va 10% chegirma oling!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#DBEAFE] transition"
                >
                  <Send className="w-4 h-4 text-[#2563EB]" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Tarixiy ilovasida tarix fanini birga o'rganing: https://tarixiy.uz/ref/${referralCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#D1FAE5] transition"
                >
                  <Share2 className="w-4 h-4 text-[#059669]" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setIsShareSheetOpen(false)}
                className="w-full py-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition"
              >
                Yopish
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SUB-PAGE: MAGAZIN (GIFTLAR DO'KONI)
  ═══════════════════════════════════════════════════════════════ */
  if (activeSubPage === 'magazin') {
    return (
      <ShopPage
        userData={userData}
        userCoins={userCoins}
        onUpdateCoins={setUserCoins}
        onBack={() => setActiveSubPage(null)}
        onNavigateToLessons={() => {
          setActiveSubPage(null);
          onNavigateTab?.('lessons');
        }}
        onNavigateToReferral={() => {
          setActiveSubPage('referral-page');
          setShowFriendsList(false);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      />
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
          KOMPAKT KARUSEL (HAR 5 SEKUNDDA CHAPGA SURILIB O'TADI)
      ═══════════════════════════════════ */}
      <div className="px-4 sm:px-5 mb-4 sm:mb-5">
        <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-[#E2E8F0] bg-slate-900 select-none">
          
          {/* Gorizontal suriluvchi lenta (translateX) — Cheksiz oldinga silliq aylanish */}
          <div
            className={`flex ${isTransitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >

            {/* ── 1-SLAYD: VAZIFA BAJARIB TANGA OLING ── */}
            <div
              className="w-full shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between relative overflow-hidden h-[86px] sm:h-[92px]"
              style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative min-w-0 flex-1 mr-3">
                <h2 className="text-white font-extrabold text-[16px] sm:text-[18px] leading-tight">
                  Vazifa bajarib tanga oling
                </h2>
                <p className="text-white/80 text-[11px] sm:text-xs mt-0.5 leading-tight truncate">
                  Dars va testlarni bajarib darajangizni oshiring!
                </p>
              </div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 border border-white/20 shrink-0 shadow-inner">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#FDE047]" strokeWidth={2.3} />
              </div>
            </div>

            {/* ── 2-SLAYD: PREMIUM OBUNA REKLAMA (NARXSIZ) ── */}
            <div
              className="w-full shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between relative overflow-hidden h-[86px] sm:h-[92px]"
              style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)' }}
            >
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-400/10 pointer-events-none" />
              <div className="relative min-w-0 flex-1 mr-3">
                <div className="inline-flex items-center gap-1 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                  <Crown className="w-2.5 h-2.5" />
                  <span>Premium Obuna</span>
                </div>
                <h2 className="text-white font-bold text-[14px] sm:text-[15px] leading-tight mt-0.5">
                  Barcha dars va testlarni oching!
                </h2>
                <p className="text-white/80 text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate">
                  Cheksiz imkoniyatlar va maxsus materiallar
                </p>
              </div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/20 border border-amber-300/40 shrink-0 shadow-md">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" strokeWidth={2.2} />
              </div>
            </div>

            {/* ── 3-SLAYD: PROMO KOD ── */}
            <div
              className="w-full shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between relative overflow-hidden h-[86px] sm:h-[92px]"
              style={{ background: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #EA580C 100%)' }}
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative min-w-0 flex-1 mr-2">
                <div className="text-amber-200 text-[9px] font-bold uppercase tracking-wider">
                  Sizga 50% CHEGIRMA!
                </div>
                <div className="text-white font-black text-[13px] sm:text-[14px] leading-tight">
                  Birinchi oy: 150,000 UZS
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-white/85">Kod:</span>
                  <span className="px-1.5 py-0.2 bg-black/25 border border-white/20 rounded font-mono font-bold text-[10px] text-yellow-300">
                    TARIX50
                  </span>
                </div>
              </div>
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText?.('TARIX50');
                    setPromoCopied(true);
                    setTimeout(() => setPromoCopied(false), 2000);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white active:scale-95 text-[#B45309] font-bold text-[10px] sm:text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-amber-200"
                >
                  {promoCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Nusxalandi!</span>
                    </>
                  ) : (
                    <span>FOYDALANISH</span>
                  )}
                </button>
              </div>
            </div>

            {/* ── 4-SLAYD: DO'STLARNI TAKLIF QIL ── */}
            <div
              onClick={() => {
                setActiveSubPage('referral-page');
                setShowFriendsList(false);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="w-full shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between relative overflow-hidden h-[86px] sm:h-[92px] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)' }}
            >
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative min-w-0 flex-1 mr-2">
                <div className="text-white font-extrabold text-[13px] sm:text-[14px] leading-tight truncate">
                  DO'STLARNI TAKLIF QIL
                </div>
                <div className="text-teal-100 text-[10px] font-medium leading-tight mt-0.5">
                  Do'stlarni taklif qilib 100 tanga olasiz
                </div>
                <div className="inline-flex items-center text-emerald-200 font-bold text-[11px]">
                  <span>• Siz: +100 tanga olasiz</span>
                </div>
              </div>
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubPage('referral-page');
                    setShowFriendsList(false);
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  className="px-2 py-1.5 rounded-lg bg-white active:scale-95 text-[#0F766E] font-bold text-[10px] sm:text-[11px] shadow-sm transition-all cursor-pointer border border-teal-200"
                >
                  <span>DO'STLARNI TAKLIF QIL</span>
                </button>
              </div>
            </div>

            {/* ── 5-SLAYD (1-SLAYDNING KLONI: CHEKSIZ CHAPGA O'TISH UCHUN) ── */}
            <div
              className="w-full shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between relative overflow-hidden h-[86px] sm:h-[92px]"
              style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative min-w-0 flex-1 mr-3">
                <h2 className="text-white font-extrabold text-[16px] sm:text-[18px] leading-tight">
                  Vazifa bajarib tanga oling
                </h2>
                <p className="text-white/80 text-[11px] sm:text-xs mt-0.5 leading-tight truncate">
                  Dars va testlarni bajarib darajangizni oshiring!
                </p>
              </div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/15 border border-white/20 shrink-0 shadow-inner">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#FDE047]" strokeWidth={2.3} />
              </div>
            </div>

          </div>

          {/* ── INDIKATORLAR (4 TA NUQTA) ── */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
            {[0, 1, 2, 3].map((idx) => {
              const isActive = (carouselIndex % 4) === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Slayd ${idx + 1}`}
                  onClick={() => {
                    setIsTransitionEnabled(true);
                    setCarouselIndex(idx);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-4 bg-white shadow-sm' : 'w-1 bg-white/40 hover:bg-white/60'
                  }`}
                />
              );
            })}
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
            onClick={() => {
              setActiveSubPage('referral-page');
              setShowFriendsList(false);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
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
