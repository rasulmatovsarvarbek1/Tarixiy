import React, { useState } from 'react';
import { Lock, Sparkles, AlertCircle, CheckCircle2, Shield, Compass, Landmark, Trophy, DoorClosed, KeyRound, Sparkle } from 'lucide-react';

// 5-sinfdan 11-sinfgacha jami 7 ta sinf ma'lumotlari (har birida 10 tadan dars = jami 70 Level)
const GRADES_CONFIG = [
  { grade: 5, name: "5-sinf", title: "Qadimgi Dunyo Tarixi", range: [1, 10], color: "#D4921A" },
  { grade: 6, name: "6-sinf", title: "Ilk O'rta Asrlar", range: [11, 20], color: "#3B82F6" },
  { grade: 7, name: "7-sinf", title: "Temuriylar Saltanati", range: [21, 30], color: "#10B981" },
  { grade: 8, name: "8-sinf", title: "Uch Xonlik Davri", range: [31, 40], color: "#8B5CF6" },
  { grade: 9, name: "9-sinf", title: "Jadidchilik va Mustamlakachilik", range: [41, 50], color: "#F59E0B" },
  { grade: 10, name: "10-sinf", title: "Sovet Davri Tarixi", range: [51, 60], color: "#EC4899" },
  { grade: 11, name: "11-sinf", title: "Mustaqil O'zbekiston", range: [61, 70], color: "#06B6D4" },
];

// 70 ta Level darslari
const LEVELS_DATA = [
  // ──── 5-SINF (1 - 10 Level) ────
  { id: 1, grade: 5, title: "1 Level", topic: "Qadimgi davr va ilk odamlar", progress: 20, isLocked: false },
  { id: 2, grade: 5, title: "2 Level", topic: "Zardushtiylik va Avesto", progress: 0, isLocked: true },
  { id: 3, grade: 5, title: "3 Level", topic: "Qadimgi Baqtriya va Sug'd", progress: 0, isLocked: true },
  { id: 4, grade: 5, title: "4 Level", topic: "Iskandar Zulqarnayn yurishi", progress: 0, isLocked: true },
  { id: 5, grade: 5, title: "5 Level", topic: "Salavkiylar saltanati", progress: 0, isLocked: true },
  { id: 6, grade: 5, title: "6 Level", topic: "Yunon-Baqtriya podsholigi", progress: 0, isLocked: true },
  { id: 7, grade: 5, title: "7 Level", topic: "Qang' davlati madaniyati", progress: 0, isLocked: true },
  { id: 8, grade: 5, title: "8 Level", topic: "Kushon imperiyasi yuksalishi", progress: 0, isLocked: true },
  { id: 9, grade: 5, title: "9 Level", topic: "Eftaliylar va Qadimgi Xorazm", progress: 0, isLocked: true },
  { id: 10, grade: 5, title: "10 Level", topic: "5-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 6-SINF (11 - 20 Level) ────
  { id: 11, grade: 6, title: "11 Level", topic: "Buyuk Turk xoqonligi", progress: 0, isLocked: true },
  { id: 12, grade: 6, title: "12 Level", topic: "Arab xalifaligi va Movarounnahr", progress: 0, isLocked: true },
  { id: 13, grade: 6, title: "13 Level", topic: "Muqanna va Abu Muslim qo'zg'oloni", progress: 0, isLocked: true },
  { id: 14, grade: 6, title: "14 Level", topic: "Tohiriylar va Somoniylar davlati", progress: 0, isLocked: true },
  { id: 15, grade: 6, title: "15 Level", topic: "Qoraxoniylar va G'aznaviylar", progress: 0, isLocked: true },
  { id: 16, grade: 6, title: "16 Level", topic: "Buyuk Saljuqiylar imperiyasi", progress: 0, isLocked: true },
  { id: 17, grade: 6, title: "17 Level", topic: "Xorazmshohlar qudrati", progress: 0, isLocked: true },
  { id: 18, grade: 6, title: "18 Level", topic: "Mo'g'ullar istilosi va Jaloliddin", progress: 0, isLocked: true },
  { id: 19, grade: 6, title: "19 Level", topic: "Chig'atoy ulusi davri", progress: 0, isLocked: true },
  { id: 20, grade: 6, title: "20 Level", topic: "6-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 7-SINF (21 - 30 Level) ────
  { id: 21, grade: 7, title: "21 Level", topic: "Amir Temur davlatining yuksalishi", progress: 0, isLocked: true },
  { id: 22, grade: 7, title: "22 Level", topic: "Sohibqironning harbiy yurishlari", progress: 0, isLocked: true },
  { id: 23, grade: 7, title: "23 Level", topic: "Mirzo Ulug'bek va Samarqand akademiyasi", progress: 0, isLocked: true },
  { id: 24, grade: 7, title: "24 Level", topic: "Alisher Navoiy va Hirot madaniyati", progress: 0, isLocked: true },
  { id: 25, grade: 7, title: "25 Level", topic: "Zahiriddin Muhammad Bobur hayoti", progress: 0, isLocked: true },
  { id: 26, grade: 7, title: "26 Level", topic: "Buyuk Boburiylar imperiyasi", progress: 0, isLocked: true },
  { id: 27, grade: 7, title: "27 Level", topic: "Shayboniylar sulolasi hukmronligi", progress: 0, isLocked: true },
  { id: 28, grade: 7, title: "28 Level", topic: "Ashtarxoniylar davri siyosati", progress: 0, isLocked: true },
  { id: 29, grade: 7, title: "29 Level", topic: "O'rta asrlarda ilm-fan va me'morlik", progress: 0, isLocked: true },
  { id: 30, grade: 7, title: "30 Level", topic: "7-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 8-SINF (31 - 40 Level) ────
  { id: 31, grade: 8, title: "31 Level", topic: "Buxoro amirligi tashkil topishi", progress: 0, isLocked: true },
  { id: 32, grade: 8, title: "32 Level", topic: "Xiva xonligi va Qo'ng'irotlar", progress: 0, isLocked: true },
  { id: 33, grade: 8, title: "33 Level", topic: "Qo'qon xonligi yuksalishi", progress: 0, isLocked: true },
  { id: 34, grade: 8, title: "34 Level", topic: "Xonliklararo munosabatlar va savdo", progress: 0, isLocked: true },
  { id: 35, grade: 8, title: "35 Level", topic: "Madaniy hayot, adabiyot va san'at", progress: 0, isLocked: true },
  { id: 36, grade: 8, title: "36 Level", topic: "Xonliklarda ijtimoiy tuzum", progress: 0, isLocked: true },
  { id: 37, grade: 8, title: "37 Level", topic: "Tashqi aloqalar va elchiliklar", progress: 0, isLocked: true },
  { id: 38, grade: 8, title: "38 Level", topic: "Xalq harakatlari va qo'zg'olonlar", progress: 0, isLocked: true },
  { id: 39, grade: 8, title: "39 Level", topic: "XIX asr o'rtalarida madaniyat", progress: 0, isLocked: true },
  { id: 40, grade: 8, title: "40 Level", topic: "8-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 9-SINF (41 - 50 Level) ────
  { id: 41, grade: 9, title: "41 Level", topic: "Chor Rossiyasining bosqini", progress: 0, isLocked: true },
  { id: 42, grade: 9, title: "42 Level", topic: "Turkiston general-gubernatorligi", progress: 0, isLocked: true },
  { id: 43, grade: 9, title: "43 Level", topic: "1898 va 1916-yilgi qo'zg'olonlar", progress: 0, isLocked: true },
  { id: 44, grade: 9, title: "44 Level", topic: "Jadidchilik harakatining tug'ilishi", progress: 0, isLocked: true },
  { id: 45, grade: 9, title: "45 Level", topic: "Mahmudxo'ja Behbudiy va matbuot", progress: 0, isLocked: true },
  { id: 46, grade: 9, title: "46 Level", topic: "Munavvarqori va usuli jadid", progress: 0, isLocked: true },
  { id: 47, grade: 9, title: "47 Level", topic: "Turkiston Muxtoriyati (1917)", progress: 0, isLocked: true },
  { id: 48, grade: 9, title: "48 Level", topic: "BXSR va XXSR respublikalari", progress: 0, isLocked: true },
  { id: 49, grade: 9, title: "49 Level", topic: "Milliy istiqlol fidoyilari", progress: 0, isLocked: true },
  { id: 50, grade: 9, title: "50 Level", topic: "9-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 10-SINF (51 - 60 Level) ────
  { id: 51, grade: 10, title: "51 Level", topic: "Sovet hokimiyati o'rnatilishi", progress: 0, isLocked: true },
  { id: 52, grade: 10, title: "52 Level", topic: "O'zbekiston SSR tashkil topishi (1924)", progress: 0, isLocked: true },
  { id: 53, grade: 10, title: "53 Level", topic: "Qatag'on davri va qurbonlari (1937-1938)", progress: 0, isLocked: true },
  { id: 54, grade: 10, title: "54 Level", topic: "Ikkinchi jahon urushida jasorat", progress: 0, isLocked: true },
  { id: 55, grade: 10, title: "55 Level", topic: "Urushdan keyingi tiklanish yillari", progress: 0, isLocked: true },
  { id: 56, grade: 10, title: "56 Level", topic: "Paxta yakkahokimligi va 'Paxta ishi'", progress: 0, isLocked: true },
  { id: 57, grade: 10, title: "57 Level", topic: "Orol fojiasi va ekologiya", progress: 0, isLocked: true },
  { id: 58, grade: 10, title: "58 Level", topic: "Milliy o'zlikni anglash jarayoni", progress: 0, isLocked: true },
  { id: 59, grade: 10, title: "59 Level", topic: "Davlat tili to'g'risidagi qonun (1989)", progress: 0, isLocked: true },
  { id: 60, grade: 10, title: "60 Level", topic: "10-sinf Yakuniy Sinov", progress: 0, isLocked: true, isExam: true },

  // ──── 11-SINF (61 - 70 Level) ────
  { id: 61, grade: 11, title: "61 Level", topic: "O'zbekiston Mustaqilligi (1991)", progress: 0, isLocked: true },
  { id: 62, grade: 11, title: "62 Level", topic: "Konstitutsiya va davlat ramzlari", progress: 0, isLocked: true },
  { id: 63, grade: 11, title: "63 Level", topic: "Milliy valyuta - So'm joriy etilishi", progress: 0, isLocked: true },
  { id: 64, grade: 11, title: "64 Level", topic: "BMT va xalqaro tashkilotlar", progress: 0, isLocked: true },
  { id: 65, grade: 11, title: "65 Level", topic: "Buyuk Ipak yo'lining qayta tiklanishi", progress: 0, isLocked: true },
  { id: 66, grade: 11, title: "66 Level", topic: "Ta'lim, sport va yoshlar siyosati", progress: 0, isLocked: true },
  { id: 67, grade: 11, title: "67 Level", topic: "Madaniy meros va ziyorat turizmi", progress: 0, isLocked: true },
  { id: 68, grade: 11, title: "68 Level", topic: "Yangi O'zbekiston taraqqiyot strategiyasi", progress: 0, isLocked: true },
  { id: 69, grade: 11, title: "69 Level", topic: "Uchinchi Renessans poydevori", progress: 0, isLocked: true },
  { id: 70, grade: 11, title: "70 Level", topic: "11-sinf Katta Bitiruv Imtihoni", progress: 0, isLocked: true, isExam: true },
];

// SVG 4-burchakli yulduz (#FFD800)
function GoldenStar({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FFD800"
      className={`shrink-0 drop-shadow-[0_0_8px_rgba(255,216,0,0.6)] ${className}`}
    >
      <path d="M12 0 L14.5 8.5 L24 12 L14.5 15.5 L12 24 L9.5 15.5 L0 12 L9.5 8.5 Z" />
    </svg>
  );
}

// SVG Yumshoq bulutlar guruhi (#93B7FF)
function CloudCluster({ className = "" }) {
  return (
    <svg width="76" height="42" viewBox="0 0 76 42" fill="none" className={className}>
      <ellipse cx="28" cy="24" rx="20" ry="14" fill="#88B0FA" opacity="0.9" />
      <ellipse cx="50" cy="20" rx="22" ry="16" fill="#A4C4FF" opacity="0.95" />
      <circle cx="36" cy="14" r="14" fill="#BBD4FF" />
      <ellipse cx="64" cy="26" rx="10" ry="8" fill="#88B0FA" opacity="0.8" />
    </svg>
  );
}

// Qadimiy Sharqona Eshik / Darvoza (Class Gateway Portal)
function ClassGatePortal({ gradeNumber, gradeTitle, isUnlocked = false }) {
  return (
    <div className="relative my-8 min-[360px]:my-10 px-1 min-[360px]:px-2 flex flex-col items-center select-none w-full">
      {/* Nurlar va nur taralishi */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD800]/10 via-transparent to-transparent blur-xl pointer-events-none" />

      {/* Eshik / Ark konteyneri */}
      <div className="relative w-full max-w-[305px] min-[360px]:max-w-[340px] bg-gradient-to-b from-[#1C2333]/95 to-[#121622]/95 border-2 border-[#D4921A]/70 rounded-2xl min-[360px]:rounded-3xl pt-6 min-[360px]:pt-7 pb-3.5 min-[360px]:pb-4 px-3 min-[360px]:px-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,146,26,0.25)] flex flex-col items-center">

        {/* Yuqori Ark Naqshi (Oriental Crown) - Darvoza ustida, hech narsa uni to'sib qo'ymaydi */}
        <div className="absolute -top-4 min-[360px]:-top-5 z-20 px-3.5 min-[360px]:px-5 py-1 min-[360px]:py-1.5 rounded-full bg-gradient-to-r from-[#8A5507] via-[#D4921A] to-[#8A5507] border-2 border-[#FFE885] shadow-[0_6px_20px_rgba(212,146,26,0.7)] flex items-center gap-1.5 min-[360px]:gap-2">
          <Sparkles className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-white animate-spin shrink-0" style={{ animationDuration: '4s' }} />
          <span className="text-[11px] min-[360px]:text-[13px] font-extrabold uppercase tracking-wider text-white drop-shadow whitespace-nowrap">
            {gradeNumber}-sinf Darvozasi
          </span>
          <Sparkles className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-white animate-spin shrink-0" style={{ animationDuration: '4s' }} />
        </div>

        {/* Ark / Eshik grafikasi (SVG Sharqona Qasr Eshigi) */}
        <div className="relative w-full flex flex-col items-center justify-center mt-1">
          <svg width="220" height="95" viewBox="0 0 220 95" fill="none" className="drop-shadow-lg max-w-[190px] min-[360px]:max-w-[220px] w-full h-auto">
            {/* Tashqi arka devori */}
            <path
              d="M 20 95 L 20 50 Q 20 15, 110 8 Q 200 15, 200 50 L 200 95 Z"
              fill="#161B26"
              stroke="#D4921A"
              strokeWidth="2.5"
            />
            {/* Ichki qadimiy yog'och eshik */}
            <path
              d="M 38 95 L 38 52 Q 38 24, 110 18 Q 182 24, 182 52 L 182 95 Z"
              fill="#261A0E"
              stroke="#8A5507"
              strokeWidth="2"
            />
            {/* Eshik bo'linmasi (ikkita qanot) */}
            <line x1="110" y1="18" x2="110" y2="95" stroke="#8A5507" strokeWidth="2.5" strokeDasharray="3 3" />

            {/* Eshik halqalari / dastaklari */}
            <circle cx="95" cy="62" r="6" stroke="#FFD800" strokeWidth="2" fill="#3D2914" />
            <circle cx="125" cy="62" r="6" stroke="#FFD800" strokeWidth="2" fill="#3D2914" />

            {/* Naqshlar */}
            <path d="M 60 76 Q 110 58, 160 76" stroke="#D4921A" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
            <path d="M 60 44 Q 110 28, 160 44" stroke="#D4921A" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
          </svg>

          {/* Markaziy mavzu nishoni - Sal pastroqqa tushirilgan va markazlashgan */}
          <div className="absolute top-[44px] min-[360px]:top-[48px] z-10 flex items-center justify-center">
            <div className="px-2.5 min-[360px]:px-3.5 py-1 min-[360px]:py-1.5 rounded-lg min-[360px]:rounded-xl bg-[#0C0F18]/95 border border-[#FFD800]/70 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-1.5 backdrop-blur-md">
              <DoorClosed className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#FFD800] shrink-0" />
              <span className="text-[10px] min-[360px]:text-[11px] font-bold text-white tracking-wide whitespace-nowrap">
                {gradeTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Burchak bezaklari */}
        <div className="absolute top-2 left-2 text-[#D4921A] text-xs">✦</div>
        <div className="absolute top-2 right-2 text-[#D4921A] text-xs">✦</div>
      </div>
    </div>
  );
}

export default function RoadmapPage({ onNavigate }) {
  const [toast, setToast] = useState(null);
  const [shakingId, setShakingId] = useState(null);

  const handleCardClick = (level) => {
    if (level.isLocked) {
      setShakingId(level.id);
      setToast(`🔒 "${level.title}: ${level.topic}" qulflangan. Avval 1 Level darsini yakunlang!`);
      setTimeout(() => setShakingId(null), 500);
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast(`✨ "${level.title}: ${level.topic}" ochildi! Darsni boshlashingiz mumkin.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="text-[#1E293B] relative select-none pb-28 w-full overflow-x-hidden bg-white">

      {/* ── FIXED FROZEN BACKGROUND IMAGE (Telefon ramkasi ichida qoladi) ── */}
      <img
        src="/roadmap_bg.jpg"
        alt=""
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-screen object-cover z-0 pointer-events-none select-none opacity-80"
      />
      {/* Light overlay for clean readability */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-screen bg-white/40 backdrop-blur-[1px] z-[1] pointer-events-none" />

      {/* Scrollable content sits above fixed bg */}
      <div className="relative z-10 w-full">

        {/* ─── YUQORI SARLAVHA: Darslar + Yulduz & Tanga ─── */}
        <header className="sticky top-0 z-40 bg-white/92 backdrop-blur-md border-b border-[#E2E8F0] py-3 min-[360px]:py-3.5 px-3 min-[360px]:px-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] min-[360px]:text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight truncate">
              Darslar
            </h1>

            {/* O'ng tomon: Yulduz (Top Reyting) + Tanga (Magazin) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Oq Yulduz → Top Reyting */}
              <button
                type="button"
                onClick={() => onNavigate?.('ranking')}
                className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-2.5 py-1.5 transition-all active:scale-95 cursor-pointer group shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 drop-shadow-[0_0_4px_rgba(255,184,0,0.5)] group-hover:scale-110 transition-transform">
                  <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6z" fill="#FFB800" />
                </svg>
                <span className="text-[13px] font-bold text-[#1E293B]">116</span>
              </button>

              {/* Sariq Tanga → Magazin */}
              <button
                type="button"
                onClick={() => onNavigate?.('magazin')}
                className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-2.5 py-1.5 transition-all active:scale-95 cursor-pointer group shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 group-hover:scale-110 transition-transform">
                  <circle cx="12" cy="12" r="10" fill="#FFB800" />
                  <circle cx="12" cy="12" r="7.5" fill="#E6A200" />
                  <circle cx="12" cy="12" r="6" fill="#FFD54F" />
                  <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
                </svg>
                <span className="text-[13px] font-bold text-[#1E293B]">16</span>
              </button>
            </div>
          </div>
        </header>

        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] z-50 p-3 min-[360px]:p-3.5 rounded-2xl bg-white border border-[#3B82F6]/50 text-[12px] min-[360px]:text-[13px] text-[#0F172A] shadow-2xl flex items-center gap-2.5 animate-bounce">
            <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="leading-snug font-medium">{toast}</span>
          </div>
        )}

        {/* ─── QUEST PATH CONTAINER ─── */}
        <main className="px-2 min-[360px]:px-3 pt-4 min-[360px]:pt-5 relative">

          {/* 1-10 Level dan oldin yo'lak tepasidagi 5-SINF SARLAVHASI / ESHIGI */}
          <div className="mb-6 min-[360px]:mb-8">
            <div className="relative w-full max-w-[305px] min-[360px]:max-w-[340px] mx-auto bg-gradient-to-r from-[#D4921A]/20 via-[#D4921A]/40 to-[#D4921A]/20 border-2 border-[#D4921A] rounded-2xl py-2.5 min-[360px]:py-3 px-3 min-[360px]:px-4 shadow-[0_4px_25px_rgba(212,146,26,0.3)] text-center">
              <div className="flex items-center justify-center gap-1.5 min-[360px]:gap-2">
                <Sparkles className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#FFD800] shrink-0" />
                <h2 className="text-[14px] min-[360px]:text-[16px] sm:text-[17px] font-extrabold text-white tracking-wide uppercase drop-shadow">
                  5-sinf • Qadimgi Dunyo
                </h2>
                <Sparkles className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#FFD800] shrink-0" />
              </div>
              <p className="text-[10.5px] min-[360px]:text-[11px] font-medium text-white/75 mt-0.5">
                1-bosqich: 1 Level — 10 Level
              </p>
            </div>
          </div>

          {/* 1 Level ustidagi to'g'ri qaratilgan "Sizning darsingiz shu yerda" ko'rsatkichi */}
          <div className="relative mb-2 pl-2 min-[360px]:pl-4 flex flex-col items-start z-30">
            <div className="flex items-center gap-1.5 min-[360px]:gap-2 bg-[#222634] border border-[#353B4F] text-white px-2.5 min-[360px]:px-3.5 py-1 min-[360px]:py-1.5 rounded-xl shadow-2xl animate-bounce">
              <span className="text-[11px] min-[360px]:text-[12px] font-bold tracking-wide whitespace-nowrap text-white">
                Sizning darsingiz shu yerda
              </span>
              <div className="w-2 h-2 rounded-full bg-[#0080FF] animate-ping shrink-0" />
            </div>
            {/* Pastga qaratilgan kichik ko'rsatkich nayzasi */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#222634] ml-6 min-[360px]:ml-8 -mt-0.5" />
          </div>

          {/* 70 ta Level darslarining zigzag yo'li */}
          <div className="space-y-10 min-[360px]:space-y-12 relative pt-2">
            {LEVELS_DATA.map((level, index) => {
              const isLeft = index % 2 === 0;
              const isShaking = shakingId === level.id;
              const isOpen = !level.isLocked;
              const nextLevel = LEVELS_DATA[index + 1];

              const isEndOfGrade = level.id % 10 === 0 && level.id < 70;
              const nextGradeConfig = isEndOfGrade ? GRADES_CONFIG.find(g => g.grade === (level.grade + 1)) : null;

              return (
                <div key={level.id} className="relative">

                  {/* ── KARTA SATRI ── */}
                  <div className={`flex items-center ${isLeft ? 'justify-start pl-1 min-[360px]:pl-3 sm:pl-4' : 'justify-end pr-1 min-[360px]:pr-3 sm:pr-4'}`}>

                    {/* 3D Duolingo uslubidagi Karta */}
                    <div
                      onClick={() => handleCardClick(level)}
                      className={`relative w-[138px] h-[138px] min-[360px]:w-[148px] min-[360px]:h-[148px] min-[390px]:w-[155px] min-[390px]:h-[155px] sm:w-[160px] sm:h-[160px] rounded-[22px] min-[360px]:rounded-[26px] p-3 min-[360px]:p-4 flex flex-col justify-between cursor-pointer transition-all duration-150 select-none group shrink-0 ${isShaking ? 'animate-shake' : ''
                        } ${isOpen
                          ? 'bg-gradient-to-b from-[#D4921A] to-[#B8760A] border-b-[6px] min-[360px]:border-b-[8px] border-[#8A5507] shadow-[0_12px_28px_rgba(180,110,10,0.5)] active:translate-y-1 active:border-b-[3px]'
                          : 'bg-[#1A1C24] border-b-[6px] min-[360px]:border-b-[8px] border-[#111318] shadow-[0_8px_18px_rgba(0,0,0,0.7)] active:translate-y-1 active:border-b-[3px] hover:bg-[#1E2028]'
                        }`}
                    >
                      {/* Yuqori qism: Foiz va Qulf belgisi */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[21px] min-[360px]:text-[24px] font-extrabold leading-none tracking-tight ${isOpen ? 'text-white' : 'text-white/80'
                          }`}>
                          {level.progress}%
                        </span>
                        {level.isLocked ? (
                          <div className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 rounded-full bg-[#181A24] flex items-center justify-center text-white/50">
                            <Lock className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                            <Sparkles className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
                          </div>
                        )}
                      </div>

                      {/* Pastki qism: Level raqami va Tarixiy mavzusi */}
                      <div>
                        <h3 className="text-[17px] min-[360px]:text-[19px] font-extrabold text-white leading-tight">
                          {level.title}
                        </h3>
                        <p className={`text-[10px] min-[360px]:text-[11px] font-medium mt-0.5 truncate ${isOpen ? 'text-white/85' : 'text-white/40'
                          }`}>
                          {level.topic}
                        </p>
                      </div>

                      {/* Inner highlight effekti (Yuqori yaltirash chizig'i) */}
                      <div className="absolute top-1.5 inset-x-4 h-[3px] rounded-full bg-white/25 pointer-events-none" />
                    </div>

                    {/* Karta yonidagi bezaklar (Yulduzlar & Bulutlar) */}
                    <div className={`absolute pointer-events-none ${isLeft
                      ? 'left-[145px] min-[360px]:left-[162px] min-[390px]:left-[178px]'
                      : 'right-[145px] min-[360px]:right-[162px] min-[390px]:right-[178px]'
                      }`}>
                      {index % 3 === 0 && (
                        <div className="flex items-center gap-2 min-[360px]:gap-3">
                          <CloudCluster className="transform scale-75 min-[360px]:scale-90" />
                          <GoldenStar size={18} className="animate-pulse min-[360px]:w-[22px] min-[360px]:h-[22px]" />
                        </div>
                      )}
                      {index % 3 === 1 && (
                        <div className="flex flex-col gap-1.5 min-[360px]:gap-2 pt-1">
                          <GoldenStar size={22} className="transform rotate-12 min-[360px]:w-[26px] min-[360px]:h-[26px]" />
                          <GoldenStar size={14} className="transform -rotate-12 ml-3 min-[360px]:ml-4 min-[360px]:w-[16px] min-[360px]:h-[16px]" />
                        </div>
                      )}
                      {index % 3 === 2 && (
                        <div className="flex items-center gap-1.5 min-[360px]:gap-2">
                          <GoldenStar size={16} className="min-[360px]:w-[20px] min-[360px]:h-[20px]" />
                          <CloudCluster className="transform scale-65 min-[360px]:scale-75 opacity-80" />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── BOG'LOVCHI CHIZIQLI YO'L (DASHED PATH) ── */}
                  {nextLevel && !isEndOfGrade && (
                    <div className="w-full h-11 min-[360px]:h-12 relative pointer-events-none my-1 flex justify-center">
                      <svg
                        width="100%"
                        height="56"
                        viewBox="0 0 340 56"
                        fill="none"
                        className="overflow-visible"
                      >
                        {isLeft ? (
                          /* Chapdagi kartadan o'ngdagi kartaga o'tish */
                          <path
                            d="M 80 0 C 80 35, 260 20, 260 56"
                            stroke="#FFD800"
                            strokeWidth="4.5"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                          />
                        ) : (
                          /* O'ngdagi kartadan chapdagi kartaga o'tish */
                          <path
                            d="M 260 0 C 260 35, 80 20, 80 56"
                            stroke="#FFD800"
                            strokeWidth="4.5"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>

                      {/* Chiziq o'rtasidagi yulduzcha */}
                      <div className="absolute top-2.5 min-[360px]:top-3 inset-x-0 flex justify-center pointer-events-none">
                        <GoldenStar size={index % 2 === 0 ? 16 : 20} className="opacity-90" />
                      </div>
                    </div>
                  )}

                  {/* ── 10, 20, 30, 40, 50, 60 LEVELDAN KEYIN YO'L USTIDAGI ESHIK / DARVOZA (GATE) ── */}
                  {isEndOfGrade && nextGradeConfig && (
                    <div className="my-3 min-[360px]:my-4 w-full">
                      {/* Kartadan eshikka tushuvchi sariq yo'l */}
                      <div className="w-full h-9 min-[360px]:h-10 relative pointer-events-none flex justify-center">
                        <svg width="100%" height="45" viewBox="0 0 340 45" fill="none">
                          <path
                            d={isLeft ? "M 80 0 C 80 25, 170 15, 170 45" : "M 260 0 C 260 25, 170 15, 170 45"}
                            stroke="#FFD800"
                            strokeWidth="4.5"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute top-1.5 inset-x-0 flex justify-center">
                          <GoldenStar size={18} />
                        </div>
                      </div>

                      {/* Sharqona Kirish Eshigi (Portal) */}
                      <ClassGatePortal
                        gradeNumber={nextGradeConfig.grade}
                        gradeTitle={nextGradeConfig.title}
                        isUnlocked={false}
                      />

                      {/* Eshikdan keyingi 1-kartaga ulovchi sariq yo'l */}
                      <div className="w-full h-9 min-[360px]:h-10 relative pointer-events-none flex justify-center">
                        <svg width="100%" height="45" viewBox="0 0 340 45" fill="none">
                          <path
                            d={(index + 1) % 2 === 0 ? "M 170 0 C 170 25, 80 20, 80 45" : "M 170 0 C 170 25, 260 20, 260 45"}
                            stroke="#FFD800"
                            strokeWidth="4.5"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute top-1.5 inset-x-0 flex justify-center">
                          <GoldenStar size={18} />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* ─── 70-LEVELDAN KEYINGI YAKUNIY BITIRUV QASRI (GRAND FINALE PORTAL) ─── */}
          <div className="mt-14 min-[360px]:mt-16 pt-7 min-[360px]:pt-8 pb-10 min-[360px]:pb-12 text-center border-t-2 border-[#D4921A]/40 flex flex-col items-center px-2">
            <div className="w-16 h-16 min-[360px]:w-20 min-[360px]:h-20 rounded-2xl min-[360px]:rounded-3xl bg-gradient-to-tr from-[#D4921A] to-[#FFE066] p-0.5 shadow-[0_0_30px_rgba(212,146,26,0.6)] mb-3 min-[360px]:mb-4 animate-pulse">
              <div className="w-full h-full bg-[#121622] rounded-[18px] min-[360px]:rounded-[22px] flex items-center justify-center text-3xl min-[360px]:text-4xl">
                👑
              </div>
            </div>
            <h4 className="text-[17px] min-[360px]:text-[19px] font-extrabold text-[#FFD800] mb-1">
              Katta Tarixiy G'alaba & Sertifikat
            </h4>
            <p className="text-[12px] min-[360px]:text-[13px] text-white/70 max-w-[290px] min-[360px]:max-w-xs leading-relaxed">
              70 ta Levelni to'liq yakunlab, 5-sinfdan 11-sinfgacha bo'lgan barcha tarixiy bilimlarni mukammal egallang va maxsus Sertifikatga ega bo'ling!
            </p>
          </div>

        </main>

      </div> {/* end scrollable content */}

    </div>
  );
}


