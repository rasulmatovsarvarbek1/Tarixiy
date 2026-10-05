import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { giftsData } from '../data/giftsData';
import '../styles/giftAnimations.css';

export default function ShopPage({
  userData,
  userCoins = 16,
  onBack,
  onNavigateToLessons,
  onNavigateToReferral,
  onUpdateCoins
}) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [tappedId, setTappedId] = useState(null);
  const [purchasedId, setPurchasedId] = useState(null);

  const getInitials = (name = '') => {
    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  };

  const handleTap = (gift) => {
    // Tap animatsiyasi
    setTappedId(gift.id);
    setTimeout(() => setTappedId(null), 320);
    // Modal ochish
    setSelectedGift(gift);
    setPurchaseStatus(null);
  };

  const handleBuy = (gift) => {
    if (!gift) return;
    if (userCoins >= gift.price) {
      onUpdateCoins?.(userCoins - gift.price);
      setPurchasedId(gift.id);
      setPurchaseStatus('success');
      setTimeout(() => setPurchasedId(null), 1100);
      setTimeout(() => {
        setSelectedGift(null);
        setPurchaseStatus(null);
      }, 1800);
    } else {
      setPurchaseStatus('insufficient');
    }
  };

  const handleCloseModal = () => {
    setSelectedGift(null);
    setPurchaseStatus(null);
  };

  // Har bir rasm uchun qaysi animatsiya class ishlatilishini aniqlash
  const getImgClass = (gift) => {
    if (purchasedId === gift.id) return 'anim-purchased';
    if (tappedId === gift.id) return 'anim-tap-active';
    return gift.animClass || '';
  };

  const isNotEnough = selectedGift ? userCoins < selectedGift.price : false;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] flex flex-col select-none pb-12 relative">
      {/* ── YUQORI HEADER (FIXED) ── */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 pt-10 pb-3.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] hover:bg-[#F1F5F9] active:scale-95 transition cursor-pointer shadow-sm"
          aria-label="Orqaga"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] shadow-sm">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-amber-950 font-black text-[11px] shadow-sm border border-yellow-200">
              🪙
            </div>
            <span className="font-extrabold text-[#92400E] text-sm tracking-tight">
              {userCoins}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] border border-[#BFDBFE] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {getInitials(userData?.fullName || 'Jasur')}
          </div>
        </div>
      </header>

      {/* Header uchun bo'sh joy (spacer) */}
      <div className="h-[96px] w-full flex-shrink-0" />

      {/* ── SARLAVHA ── */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-[#0F172A] font-black text-2xl tracking-tight">Gift</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            O'zingizga ma'qul bo'lgan sovg'ani tanlang
          </p>
        </div>
        <span className="text-xs font-bold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
          {giftsData.length} ta
        </span>
      </div>

      {/* ── 2 TALIK GRID ── */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3.5">
          {giftsData.map((gift) => (
            <div
              key={gift.id}
              onClick={() => handleTap(gift)}
              className="group relative bg-white border-2 border-[#F1F5F9] hover:border-[#CBD5E1] rounded-3xl p-3 flex flex-col justify-between transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer active:scale-[0.98]"
            >
              {/* Rasm konteyneri */}
              <div className="relative w-full aspect-square bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] rounded-2xl p-3 flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                <img
                  src={gift.image}
                  alt={gift.title}
                  className={`w-full h-full object-contain drop-shadow-md ${getImgClass(gift)}`}
                  style={{ animationDelay: gift.animDelay || '0s' }}
                  loading="lazy"
                />
                {/* ↗ icon */}
                <div className="absolute bottom-2 right-2 w-7 h-7 rounded-xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] shadow-sm group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Narx */}
              <div className="pt-2.5 flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A]">
                  <span className="text-[13px]">🪙</span>
                  <span className="text-xs font-black text-[#92400E]">
                    {gift.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SHEET MODAL (Portal orqali ekran pastidan) ── */}
      {selectedGift && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
          {/* Orqa fon — ozgina shadow */}
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 pointer-events-auto"
          />

          {/* Pastdan chiqadigan oyna */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[430px] bg-white border-t border-[#E2E8F0] rounded-t-[32px] p-5 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.2)] text-[#1E293B] pointer-events-auto flex flex-col items-center"
            style={{ maxHeight: '75vh', animation: 'gift-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            {/* Drag bar + close */}
            <div className="w-full flex items-center justify-between relative mb-3">
              <div className="w-10 h-1 bg-[#CBD5E1] rounded-full mx-auto" />
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute right-0 top-0 w-7 h-7 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal ichidagi sovg'a rasmi — animatsiya bilan */}
            <div className="w-28 h-28 my-2 flex items-center justify-center">
              <img
                src={selectedGift.image}
                alt="Gift"
                className={`w-full h-full object-contain drop-shadow-xl ${
                  purchasedId === selectedGift.id ? 'anim-purchased' : (selectedGift.animClass || '')
                }`}
                style={{ animationDelay: selectedGift.animDelay || '0s' }}
              />
            </div>

            {/* Tavsif matni */}
            <p className="text-xs text-[#64748B] font-medium text-center mt-1 px-4 leading-relaxed">
              Bu hadyani sahifangizda namoyish qiling
            </p>

            {/* Status: Muvaffaqiyatli sotib olindi */}
            {purchaseStatus === 'success' && (
              <div className="w-full mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Hadya muvaffaqiyatli sotib olindi!</span>
              </div>
            )}

            {/* Status: Tanga yetarli emas */}
            {isNotEnough && (
              <div className="w-full mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Tanga yetarli emas</span>
                </div>
                <p className="text-[11.5px] text-amber-700/90 font-medium">
                  Tanga to'plash uchun darslikni ko'rishingiz mumkin
                </p>
              </div>
            )}

            {/* Asosiy tugma */}
            <div className="w-full mt-4">
              {isNotEnough ? (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    onNavigateToLessons?.();
                  }}
                  className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] bg-[#3B82F6] hover:bg-[#2563EB]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Darsni ko'rish</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBuy(selectedGift)}
                  disabled={purchaseStatus === 'success'}
                  className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] bg-[#3B82F6] hover:bg-[#2563EB]"
                >
                  <span>Hadya sotib olish:</span>
                  <span className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-black">
                    🪙 {selectedGift.price.toLocaleString()}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
