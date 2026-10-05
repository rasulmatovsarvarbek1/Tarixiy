import React, { useState } from 'react';
import {
  Menu,
  Edit2,
  Share2,
  Calendar,
  Sparkles,
  Zap,
  Trophy,
  Clock,
  ChevronRight,
  ArrowLeft,
  User,
  Heart,
  Gift,
  Award,
  Crown,
  Moon,
  Globe,
  Bell,
  Info,
  CreditCard,
  Mail,
  X,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage({
  userData,
  onUpdateUserData,
  onLogout,
  currentPage: externalCurrentPage,
  setCurrentPage: setExternalCurrentPage,
}) {
  // Navigation stack state: 'main' | 'settings_menu' | 'edit_profile' | 'donate' | 'gifts' | 'send_gift' | 'empty_page'
  const [localCurrentPage, setLocalCurrentPage] = useState('main');
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : localCurrentPage;
  const setCurrentPage = (val) => {
    if (setExternalCurrentPage) setExternalCurrentPage(val);
    setLocalCurrentPage(val);
  };
  const [editProfileSource, setEditProfileSource] = useState('main'); // 'main' | 'settings_menu'
  const [emptyPageTitle, setEmptyPageTitle] = useState('');

  // Har bir sahifaga kirilganda sahifa avtomatik eng tepasiga ko'tariladi
  const navigateTo = (page, source = null) => {
    if (page === 'edit_profile' && source) {
      setEditProfileSource(source);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Toast / Alert notification
  const [toastMessage, setToastMessage] = useState('');

  // Tillarni tanlash modali
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("O'zbekcha");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Profil tahrirlash ma'lumotlari (Form state)
  const [profileForm, setProfileForm] = useState({
    firstName: userData?.fullName ? userData.fullName.split(' ')[0] : 'Akmalxon',
    lastName: userData?.fullName ? userData.fullName.split(' ').slice(1).join(' ') : 'Saidmurodov',
    username: 'user5251306',
    userId: '5251306',
    birthDate: '2005-04-12',
    gender: 'Erkak',
    phone: userData?.phone || '+998 90 771-02-91',
    email: 'akmalxon@gmail.com',
  });

  // Donat formasi holati
  const [donateName, setDonateName] = useState(profileForm.firstName + ' ' + profileForm.lastName);
  const [donateAmount, setDonateAmount] = useState('50000');
  const [donatePayment, setDonatePayment] = useState('payme');

  // Sovg'a formasi holati
  const [giftSender, setGiftSender] = useState(profileForm.firstName);
  const [giftReceiver, setGiftReceiver] = useState('');
  const [giftType, setGiftType] = useState('month'); // 'month' | 'year'
  const [giftPayment, setGiftPayment] = useState('payme');

  const languages = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
    if (onUpdateUserData) {
      onUpdateUserData({
        ...userData,
        fullName: fullName || userData?.fullName,
        phone: profileForm.phone,
      });
    }
    showToast('Profil maʼlumotlari saqlandi!');
    navigateTo(editProfileSource || 'main');
  };

  const openEmptyPage = (title) => {
    setEmptyPageTitle(title);
    navigateTo('empty_page');
  };

  /* ═══════════════════════════════════════════════════════════════
     1. TOAST XABARLAR UCHUN KOMPONENT
  ═══════════════════════════════════════════════════════════════ */
  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[300] bg-white text-[#0F172A] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E8B84B] shadow-2xl flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw]">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706] shrink-0" />
        <span className="text-xs sm:text-sm font-semibold truncate">{toastMessage}</span>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     TIL TANLASH MODALI (barcha sahifalarda ishlaydi)
  ═══════════════════════════════════════════════════════════════ */
  const renderLangModal = () => {
    if (!isLangModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-sm bg-white border-t sm:border border-[#E2E8F0] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">Ilova tilini tanlang</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsLangModalOpen(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setCurrentLang(l.name);
                  setIsLangModalOpen(false);
                  showToast(`Til o'zgartirildi: ${l.name}`);
                }}
                className={`w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                  currentLang === l.name
                    ? 'bg-[#FEF3C7] border-[#E8B84B] text-[#B4821A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B] hover:bg-[#F1F5F9]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">{l.flag}</span>
                  <span className="font-semibold text-xs sm:text-sm">{l.name}</span>
                </div>
                {currentLang === l.name && <Check className="w-4 h-4 text-[#B4821A]" />}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsLangModalOpen(false)}
            className="w-full py-2.5 sm:py-3 mt-3 rounded-xl bg-[#F1F5F9] text-[#1E293B] text-[11px] sm:text-xs font-bold hover:bg-[#E2E8F0] transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     2. BO'SH SAHIFA KOMPONENTI (Medallar, Premium, Display va h.k.)
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'empty_page') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigateTo('settings_menu')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] truncate">{emptyPageTitle}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] mb-4 shadow-sm">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1">{emptyPageTitle}</h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs">
            Ushbu sahifa hozirda ishlab chiqilmoqda. Tez orada to'liq ishga tushiriladi.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     3. PROFILNI TAHRIRLASH SAHIFASI (Edit Profile Page)
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'edit_profile') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}
        
        {/* Tepa navigatsiya */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo(editProfileSource || 'main')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Profilni tahrirlash</h1>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4">
          {/* Asosiy ma'lumotlar */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 space-y-3 sm:space-y-3.5 shadow-sm">
            <h3 className="text-[10px] sm:text-xs font-bold text-[#D97706] uppercase tracking-wider">
              Asosiy ma'lumotlar
            </h3>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Ism</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                placeholder="Ismingiz"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] focus:border-[#E8B84B] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Familiya / Tahallus</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Familiyangiz"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] focus:border-[#E8B84B] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Tug'ilgan sana</label>
              <input
                type="date"
                value={profileForm.birthDate}
                onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] focus:border-[#E8B84B] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1.5 font-medium">Jins</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {['Erkak', 'Ayol'].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, gender })}
                    className={`py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                      profileForm.gender === gender
                        ? 'bg-[#FEF3C7] border-[#E8B84B] text-[#B4821A]'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aloqa ma'lumotlari */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 space-y-3 sm:space-y-3.5 shadow-sm">
            <h3 className="text-[10px] sm:text-xs font-bold text-[#D97706] uppercase tracking-wider">
              Aloqa ma'lumotlari
            </h3>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Telefon raqam</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+998 90 123-45-67"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] focus:border-[#E8B84B] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">E-pochta</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="example@mail.com"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] focus:border-[#E8B84B] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition"
              />
            </div>
          </div>

          {/* Saqlash tugmasi */}
          <button
            type="submit"
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm sm:text-base shadow-lg shadow-[#E8B84B]/20 active:scale-[0.98] transition cursor-pointer"
          >
            Saqlash
          </button>
        </form>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     4. DONAT SAHIFASI
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'donate') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}

        {/* Tepa Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => setCurrentPage('settings_menu')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Donat</h1>
        </div>

        {/* Banner */}
        <div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-4 sm:mb-5 relative overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF3366 0%, #FF6B35 100%)' }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 sm:mb-3">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Qo'llab-quvvatlash</h2>
          <p className="text-[10px] sm:text-xs text-white/90 mt-1 sm:mt-1.5 leading-relaxed">
            "Tarixiy" loyihasini qo'llab-quvvatlang va ko'proq foydali darslar, viktorinalar va manbalar yaratishimizga yordam bering.
          </p>
        </div>

        {/* Form elementlari */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">To'liq ism</label>
            <input
              type="text"
              value={donateName}
              onChange={(e) => setDonateName(e.target.value)}
              placeholder="Ismingizni kiriting"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Hissa turi</label>
            <input
              type="text"
              defaultValue="Tarixiy ta'lim"
              readOnly
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Miqdor</label>
            <div className="relative">
              <input
                type="number"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] font-bold outline-none pr-14"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-[#64748B]">
                UZS
              </span>
            </div>
          </div>

          {/* Tezkor miqdorlar grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
            {[
              { val: '10000', label: '10 000 UZS', emoji: '😄' },
              { val: '20000', label: '20 000 UZS', emoji: '😊' },
              { val: '30000', label: '30 000 UZS', emoji: '🤗' },
              { val: '40000', label: '40 000 UZS', emoji: '😍' },
              { val: '50000', label: '50 000 UZS', emoji: '🤩' },
              { val: '100000', label: '100 000 UZS', emoji: '🤑' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setDonateAmount(item.val)}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                  donateAmount === item.val
                    ? 'bg-[#FEF3C7] border-[#E8B84B] text-[#B4821A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B] hover:border-[#CBD5E1]'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* To'lov turi */}
          <div className="pt-1 sm:pt-2">
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1.5 sm:mb-2 font-medium">To'lov turi</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setDonatePayment('payme');
                  showToast("Hozirda ta'mirlash ishlari olib borilmoqda");
                }}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer font-bold text-xs sm:text-sm ${
                  donatePayment === 'payme'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                }`}
              >
                <span>Pay</span><span className="text-[#0284C7]">me</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDonatePayment('click');
                  showToast("Hozirda ta'mirlash ishlari olib borilmoqda");
                }}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer font-bold text-xs sm:text-sm ${
                  donatePayment === 'click'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                }`}
              >
                <span>💠 CLICK</span>
              </button>
            </div>
          </div>

          {/* Qo'llab-quvvatlash button */}
          <button
            type="button"
            onClick={() => showToast("Hozirda ta'mirlash ishlari olib borilmoqda")}
            className="w-full py-3.5 sm:py-4 mt-1 sm:mt-2 rounded-2xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm sm:text-base shadow-lg shadow-[#E8B84B]/20 active:scale-[0.98] transition cursor-pointer"
          >
            Qo'llab-quvvatlash
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     5. PREMIUM SOVG'ALAR SAHIFASI
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'gifts') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}

        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigateTo('settings_menu')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Premium sovg'alar</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-4 sm:mb-5 shadow-sm">
            <Gift className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-wide mb-1.5 sm:mb-2">Bo'm-bo'sh</h2>
          <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs leading-relaxed mb-6 sm:mb-8">
            Tezroq sovg'a berib yaqinlaringizni xursand qiling
          </p>

          <button
            type="button"
            onClick={() => navigateTo('send_gift')}
            className="w-full max-w-xs py-3.5 sm:py-4 rounded-2xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm sm:text-base shadow-lg shadow-[#E8B84B]/20 active:scale-[0.98] transition cursor-pointer"
          >
            Sovg'a qilish
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     6. SOVG'A YUBORISH SAHIFASI
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'send_gift') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}

        {/* Tepa Header */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => navigateTo('gifts')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">"Premium" sovg'a</h1>
        </div>

        {/* Info banner */}
        <div className="p-3 sm:p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl sm:rounded-2xl flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706] shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-[#B45309]">Bu qanday ishlaydi?</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706]" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Sovg'a yuboruvchi</label>
            <input
              type="text"
              value={giftSender}
              onChange={(e) => setGiftSender(e.target.value)}
              placeholder="Ismingiz..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1 font-medium">Sovg'a qabul qilib oluvchi</label>
            <input
              type="text"
              value={giftReceiver}
              onChange={(e) => setGiftReceiver(e.target.value)}
              placeholder="Qabul qiluvchi..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] outline-none"
            />
          </div>

          {/* Sovg'ani tanlang */}
          <div className="pt-1">
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1.5 sm:mb-2 font-medium">Sovg'ani tanlang</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Oylik */}
              <button
                type="button"
                onClick={() => setGiftType('month')}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  giftType === 'month'
                    ? 'bg-[#ECFDF5] border-[#10B981] shadow-sm'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#D1FAE5] flex items-center justify-center mb-2 sm:mb-3">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-[#059669]" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#0F172A] block">Oylik premium</span>
                <span className="text-[10px] sm:text-xs font-black text-[#EA580C] mt-0.5 sm:mt-1 block">33 000 UZS</span>
              </button>

              {/* Yillik */}
              <button
                type="button"
                onClick={() => setGiftType('year')}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  giftType === 'year'
                    ? 'bg-[#FEF2F2] border-[#EF4444] shadow-sm'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FEE2E2] flex items-center justify-center mb-2 sm:mb-3">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-[#DC2626]" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#0F172A] block">Yillik premium</span>
                <span className="text-[10px] sm:text-xs font-black text-[#EA580C] mt-0.5 sm:mt-1 block">155 000 UZS</span>
              </button>
            </div>
          </div>

          {/* To'lov turi */}
          <div className="pt-1 sm:pt-2">
            <label className="text-[10px] sm:text-xs text-[#64748B] block mb-1.5 sm:mb-2 font-medium">To'lov turini tanlang</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setGiftPayment('payme');
                  showToast("Hozirda ta'mirlash ishlari olib borilmoqda");
                }}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer font-bold text-xs sm:text-sm ${
                  giftPayment === 'payme'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                }`}
              >
                <span>Pay</span><span className="text-[#0284C7]">me</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGiftPayment('click');
                  showToast("Hozirda ta'mirlash ishlari olib borilmoqda");
                }}
                className={`py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer font-bold text-xs sm:text-sm ${
                  giftPayment === 'click'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                }`}
              >
                <span>💠 CLICK</span>
              </button>
            </div>
          </div>

          {/* Sovg'a qilish button */}
          <button
            type="button"
            onClick={() => showToast("Hozirda ta'mirlash ishlari olib borilmoqda")}
            className="w-full py-3.5 sm:py-4 mt-2 sm:mt-3 rounded-2xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm sm:text-base shadow-lg shadow-[#E8B84B]/20 active:scale-[0.98] transition cursor-pointer"
          >
            Sovg'a qilish!
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     7. PROFIL TEPASIDAGI SOZLAMALAR (MENYU) SAHIFASI
  ═══════════════════════════════════════════════════════════════ */
  if (currentPage === 'settings_menu') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] px-4 sm:px-5 pt-10 sm:pt-12 pb-24 sm:pb-28 flex flex-col page-transition">
        {renderToast()}
        {renderLangModal()}

        {/* Tepa navigatsiya */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <button
            type="button"
            onClick={() => navigateTo('main')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">Sozlamalar va hisob</h1>
        </div>

        <div className="space-y-3 sm:space-y-4">
          
          {/* 1. Shaxsiy hisob guruhi */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1 text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Shaxsiy hisob
            </div>

            {/* Shaxsiy ma'lumotlar -> Edit profile ga o'tadi */}
            <button
              type="button"
              onClick={() => navigateTo('edit_profile', 'settings_menu')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#059669] shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Shaxsiy ma'lumotlar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Donat */}
            <button
              type="button"
              onClick={() => navigateTo('donate')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Donat</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Medallar / Bonuslarim */}
            <button
              type="button"
              onClick={() => openEmptyPage('Medallar va bonuslar')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#CFFAFE] flex items-center justify-center text-[#0891B2] shrink-0">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Bonuslarim / Medallar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Premium sovg'alar */}
            <button
              type="button"
              onClick={() => navigateTo('gifts')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Premium sovg'alar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Tanlovlar */}
            <button
              type="button"
              onClick={() => openEmptyPage('Tanlovlar')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Tanlovlar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>
          </div>

          {/* 2. Obuna guruhi */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1 text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Obuna
            </div>

            <button
              type="button"
              onClick={() => openEmptyPage('Premium Obuna')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Premium</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>
          </div>

          {/* 3. Sozlamalar guruhi */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1 text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Sozlamalar
            </div>

            {/* Displey sozlamalari */}
            <button
              type="button"
              onClick={() => openEmptyPage('Displey sozlamalari')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#059669] shrink-0">
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Displey sozlamalari</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Ilova tili — MODAL ochadi */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] shrink-0">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Ilova tili</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[10px] sm:text-xs font-semibold text-[#64748B]">{currentLang}</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8]" />
              </div>
            </button>

            {/* Bildirishnoma (Noma / Notifications) */}
            <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#E2E8F0]/80">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Noma (Bildirishnomalar)</span>
              </div>
              
              {/* Uiverse.io Switcher */}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                <div className="slider">
                  <div className="circle">
                    <svg
                      className="cross"
                      xmlSpace="preserve"
                      style={{ enableBackground: 'new 0 0 512 512' }}
                      viewBox="0 0 365.696 365.696"
                      height="6"
                      width="6"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <path
                          fill="currentColor"
                          d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
                        />
                      </g>
                    </svg>
                    <svg
                      className="checkmark"
                      xmlSpace="preserve"
                      style={{ enableBackground: 'new 0 0 512 512' }}
                      viewBox="0 0 24 24"
                      height="10"
                      width="10"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <path
                          fill="currentColor"
                          d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                        />
                      </g>
                    </svg>
                  </div>
                </div>
              </label>
            </div>

            {/* Ilova haqida */}
            <button
              type="button"
              onClick={() => openEmptyPage('Ilova haqida')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] shrink-0">
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Ilova haqida</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Tariflar */}
            <button
              type="button"
              onClick={() => openEmptyPage('Tariflar')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition border-b border-[#E2E8F0]/80 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Tariflar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>

            {/* Biz bilan bog'lanish */}
            <button
              type="button"
              onClick={() => openEmptyPage('Biz bilan bogʻlanish')}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between hover:bg-[#F1F5F9] active:bg-[#E2E8F0] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Biz bilan bog'lanish</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8] shrink-0" />
            </button>
          </div>

          {/* Chiqish (Logout) animatsiyali tugmasi */}
          <div className="pt-3 sm:pt-4 pb-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (onLogout) onLogout();
              }}
              className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
            >
              <div
                className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512" fill="white">
                  <path
                    d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                  />
                </svg>
              </div>
              <div
                className="absolute right-5 transform translate-x-full opacity-0 text-white text-base font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap"
              >
                Logout
              </div>
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     8. PROFIL ASOSIY SAHIFA
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white text-[#1E293B] pb-24 sm:pb-28 relative overflow-hidden page-transition">
      {renderToast()}
      {renderLangModal()}

      {/* ─── TEPADAGI HEADER ─── */}
      <div className="px-4 sm:px-5 pt-8 sm:pt-10 pb-3 sm:pb-4 flex items-center justify-between">
        <div className="w-9 sm:w-10" />
        <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-wide">Profil</h1>
        {/* Menyu / Sozlamalar ikonkasi */}
        <button
          type="button"
          onClick={() => navigateTo('settings_menu')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] active:scale-95 transition cursor-pointer shadow-sm"
          title="Menyu va sozlamalar"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ─── AVATAR VA PROFIL TAHRIRLASH TUGMASI ─── */}
      <div className="px-4 sm:px-5 pt-2 sm:pt-3 mb-4 sm:mb-5">
        <div className="flex items-center justify-between">
          
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#E8B84B] bg-[#FFFBEB] flex items-center justify-center overflow-hidden shadow-md shrink-0 select-none">
            <span className="text-xl sm:text-2xl font-black text-[#D97706] tracking-wider uppercase">
              {profileForm.firstName ? profileForm.firstName[0] : 'T'}
            </span>
          </div>

          {/* O'ng tarafdagi tugmalar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => navigateTo('edit_profile', 'main')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] sm:text-xs font-bold text-[#0F172A] transition active:scale-95 cursor-pointer shadow-sm"
            >
              Profil tahrirlash
            </button>
            <button
              type="button"
              onClick={() => showToast('Havola nusxalandi!')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#1E293B] transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Ism Familiya va ID */}
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight truncate">
              {profileForm.firstName} {profileForm.lastName}
            </h2>
            <button
              type="button"
              onClick={() => navigateTo('edit_profile', 'main')}
              className="text-[#64748B] hover:text-[#D97706] transition p-1 shrink-0"
              title="Ismni tahrirlash"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-[#64748B] font-semibold mt-0.5 sm:mt-1">
            ID: {profileForm.userId} &nbsp;|&nbsp; @{profileForm.username}
          </p>
        </div>
      </div>

      {/* ─── PREMIUM OLISH HAQIDA REKLAMA BANNERI ─── */}
      <div className="px-4 sm:px-5 mb-4 sm:mb-5">
        <div
          className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-md flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF8A00 100%)' }}
        >
          {/* Orqa fon doirasi */}
          <div className="absolute -right-6 -top-6 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Tarixiy Premium
              </h3>
              <p className="text-[10px] sm:text-[11px] text-white/90 mt-0.5 leading-snug truncate">
                O'zingiz uchun premium funksiyalarni kashf eting
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openEmptyPage('Premium Obuna')}
            className="relative z-10 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold transition shrink-0 cursor-pointer ml-2"
          >
            Premium &gt;
          </button>
        </div>
      </div>

      {/* ─── STATISTIKA KARTALARI ─── */}
      <div className="px-4 sm:px-5 grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        
        {/* 1. XP / Bilig hisobi */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] sm:text-[11px] font-semibold text-[#64748B]">Bilig hisobi / XP</span>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[9px] sm:text-xs font-black flex items-center justify-center">
              🪙
            </span>
            <span className="text-base sm:text-lg font-black text-[#0F172A]">340 XP</span>
          </div>
        </div>

        {/* 2. Umumiy mutolaa */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] sm:text-[11px] font-semibold text-[#64748B]">Umumiy mutolaa</span>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284C7]" />
            <span className="text-base sm:text-lg font-black text-[#0F172A]">2 soat</span>
          </div>
        </div>

        {/* 3. Marra reytingi */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-semibold text-[#64748B]">Marra reytingi</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-3.5 text-[#94A3B8]" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706]" />
            <span className="text-base sm:text-lg font-black text-[#0F172A]">#15</span>
          </div>
        </div>

        {/* 4. Oxirgi 7 kun */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-semibold text-[#64748B]">Oxirgi 7 kun</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-3.5 text-[#94A3B8]" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C3AED]" />
            <span className="text-base sm:text-lg font-black text-[#0F172A]">45 daq</span>
          </div>
        </div>

      </div>

    </div>
  );
}

