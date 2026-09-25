import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Clock,
  RotateCcw,
  BookOpen,
  Award,
  CheckCircle2,
  Info,
  GraduationCap,
  PartyPopper,
} from 'lucide-react';
import { registerUser } from '../../lib/supabaseClient';

/* ─── Input uslumi ─── */
const inputClass =
  'w-full pl-10 pr-4 py-3 bg-[#0C0F18] border border-[#1E2638] focus:border-[#E8B84B] rounded-xl text-sm text-white placeholder-[#3D4860] focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/20 transition';

/* ─── Card uslumi ─── */
const CARD = 'bg-[#131826] border border-[#1E2638] rounded-2xl p-5 min-[360px]:p-6 sm:p-8 shadow-xl w-full max-w-md mx-auto page-transition';

export default function RegisterWizard({ onComplete }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+998 ',
    gradeLevel: 9,
    track: 'full_history',
  });

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+998')) value = '+998 ';
    const numbers = value.replace(/\D/g, '').substring(3);
    let formatted = '+998 ';
    if (numbers.length > 0) formatted += numbers.substring(0, 2);
    if (numbers.length >= 3) formatted += ' ' + numbers.substring(2, 5);
    if (numbers.length >= 6) formatted += '-' + numbers.substring(5, 7);
    if (numbers.length >= 8) formatted += '-' + numbers.substring(7, 9);
    setFormData({ ...formData, phone: formatted });
    setErrorMsg('');
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setErrorMsg("Iltimos, ism va familiyangizni to'liq kiriting!");
      return;
    }
    const cleanNumbers = formData.phone.replace(/\D/g, '');
    if (cleanNumbers.length !== 12) {
      setErrorMsg("Iltimos, telefon raqamingizni to'liq kiriting!");
      return;
    }
    setErrorMsg('');
    setStep(2);
    setTimer(60);
    setTimerActive(true);
    setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < otp.length - 1) otpInputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpInputsRef.current[index - 1]?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length < 4) { setErrorMsg("Iltimos, 4 xonali SMS kodni kiriting!"); return; }
    setIsVerifying(true);
    setErrorMsg('');
    setTimeout(() => { setIsVerifying(false); setStep(3); }, 400);
  };

  const resendCode = () => {
    setTimer(60);
    setTimerActive(true);
    setOtp(['', '', '', '']);
    otpInputsRef.current[0]?.focus();
  };

  /* ─── Progress chiziq ─── */
  const stepPercent = { 1: 33, 2: 66, 3: 100, 4: 100 };

  return (
    <div className="w-full max-w-md mx-auto px-2 min-[360px]:px-4">

      {/* ─── Progress bar ─── */}
      {step <= 3 && (
        <div className="mb-5 min-[360px]:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#5A6478] font-semibold">{step}/3-bosqich</span>
            <span className="text-[11px] text-[#E8B84B] font-semibold">{stepPercent[step]}%</span>
          </div>
          <div className="h-1.5 bg-[#1E2638] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8B84B] rounded-full transition-all duration-500"
              style={{ width: `${stepPercent[step]}%` }}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          1-BOSQICH: ISM VA TELEFON
      ═══════════════════════════════════════ */}
      {step === 1 && (
        <div key="step-1" className={CARD}>
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-[#E8B84B]/10 border border-[#E8B84B]/30 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-[#E8B84B]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              O'quvchi Ro'yxatdan O'tishi
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6478] leading-relaxed">
              Tarixni zerikmasdan, Duolingo uslubidagi o'yinlar va qiziqarli darslar bilan o'rganing
            </p>
          </div>

          <form onSubmit={handleStep1Submit} className="space-y-4">
            {/* Ism */}
            <div>
              <label className="block text-xs font-semibold text-[#8B93A1] mb-2">
                Ism va Familiyangiz
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3D4860]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Komilov"
                  value={formData.fullName}
                  onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrorMsg(''); }}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-semibold text-[#8B93A1] mb-2">
                Telefon raqamingiz
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3D4860]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+998"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#3D4860]">
                SMS tasdiqlash kodi ushbu raqamga yuboriladi
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 mt-2 bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition duration-200 active:scale-[0.99]"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════
          2-BOSQICH: SMS KOD
      ═══════════════════════════════════════ */}
      {step === 2 && (
        <div key="step-2" className={CARD}>
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-white mb-1">
              SMS Kodni Kiriting
            </h2>
            <p className="text-xs text-[#5A6478]">
              Tasdiqlash kodi yuborildi:{' '}
              <span className="font-mono font-semibold text-[#E8B84B]">{formData.phone}</span>
            </p>
          </div>

          {/* OTP boxes (100% moslashuvchan, hech qachon chetga chiqmaydi) */}
          <div className="flex justify-center gap-2 min-[360px]:gap-3 mb-5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpInputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-11 h-14 min-[360px]:w-13 min-[360px]:h-15 sm:w-14 sm:h-16 text-center text-xl min-[360px]:text-2xl font-bold font-mono bg-[#0C0F18] border-2 border-[#1E2638] focus:border-[#E8B84B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/20 transition"
              />
            ))}
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 bg-[#E8B84B]/10 border border-[#E8B84B]/20 rounded-xl px-3 py-2.5 mb-4">
            <Info className="w-3.5 h-3.5 text-[#E8B84B] shrink-0" />
            <p className="text-xs text-[#5A6478]">
              Sinov uchun istalgan kod:{' '}
              <span className="font-mono font-bold text-[#E8B84B]">1 2 3 4</span>
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center justify-between text-xs mb-6 px-1">
            <div className="flex items-center gap-1 text-[#5A6478]">
              <Clock className="w-3.5 h-3.5 text-[#E8B84B]" />
              <span>{timer > 0 ? `${timer} soniya` : 'Vaqt tugadi'}</span>
            </div>
            <button
              type="button"
              disabled={timer > 0}
              onClick={resendCode}
              className={`flex items-center gap-1 font-semibold ${
                timer === 0 ? 'text-[#E8B84B] hover:underline cursor-pointer' : 'text-[#2A3040] cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Kodni qayta yuborish</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3 bg-[#0C0F18] text-[#5A6478] hover:text-white border border-[#1E2638] rounded-xl text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isVerifying}
              onClick={handleVerifyOtp}
              className="flex-1 py-3.5 px-4 bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              <span>{isVerifying ? 'Tekshirilmoqda...' : 'Tasdiqlash'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          3-BOSQICH: SINF VA YO'NALISH
      ═══════════════════════════════════════ */}
      {step === 3 && (
        <div key="step-3" className={CARD}>
          <div className="text-center mb-5">
            <h2 className="font-serif text-2xl font-bold text-white">
              Sinf va O'quv Yo'nalishi
            </h2>
          </div>

          {/* Sinf (2 ta tartibli qator: 5-8 va 9-11) */}
          <div className="mb-5 space-y-2">
            <div className="grid grid-cols-4 gap-2">
              {[5, 6, 7, 8].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradeLevel: grade })}
                  className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all duration-150 select-none ${
                    formData.gradeLevel === grade
                      ? 'bg-[#E8B84B] text-[#0C0F18] border-[#E8B84B] shadow-[0_0_15px_rgba(232,184,75,0.35)] scale-[1.02]'
                      : 'bg-[#0C0F18] text-[#8B93A1] border-[#1E2638] hover:border-[#E8B84B]/50 hover:text-white active:scale-95'
                  }`}
                >
                  {grade}-sinf
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[9, 10, 11].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, gradeLevel: grade })}
                  className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all duration-150 select-none ${
                    formData.gradeLevel === grade
                      ? 'bg-[#E8B84B] text-[#0C0F18] border-[#E8B84B] shadow-[0_0_15px_rgba(232,184,75,0.35)] scale-[1.02]'
                      : 'bg-[#0C0F18] text-[#8B93A1] border-[#1E2638] hover:border-[#E8B84B]/50 hover:text-white active:scale-95'
                  }`}
                >
                  {grade}-sinf
                </button>
              ))}
            </div>
          </div>

          {/* Yo'nalish */}
          <div className="mb-6 space-y-3">
            {/* Full Tarix */}
            <div
              onClick={() => setFormData({ ...formData, track: 'full_history' })}
              className={`p-3.5 min-[360px]:p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                formData.track === 'full_history'
                  ? 'bg-[#E8B84B]/10 border-[#E8B84B] shadow-[0_0_15px_rgba(232,184,75,0.15)]'
                  : 'bg-[#0C0F18] border-[#1E2638] hover:border-[#2A3040]'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${formData.track === 'full_history' ? 'bg-[#E8B84B] text-[#0C0F18]' : 'bg-[#1E2638] text-[#5A6478]'}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Full Tarix</h4>
                  {formData.track === 'full_history' && <CheckCircle2 className="w-4 h-4 text-[#E8B84B] shrink-0" />}
                </div>
                <p className="text-[11px] text-[#5A6478] mt-0.5 truncate">O'zbekiston va Jahon tarixi</p>
              </div>
            </div>

            {/* Milliy Sertifikat */}
            <div
              onClick={() => setFormData({ ...formData, track: 'national_certificate' })}
              className={`p-3.5 min-[360px]:p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                formData.track === 'national_certificate'
                  ? 'bg-[#E8B84B]/10 border-[#E8B84B] shadow-[0_0_15px_rgba(232,184,75,0.15)]'
                  : 'bg-[#0C0F18] border-[#1E2638] hover:border-[#2A3040]'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${formData.track === 'national_certificate' ? 'bg-[#E8B84B] text-[#0C0F18]' : 'bg-[#1E2638] text-[#5A6478]'}`}>
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Milliy Sertifikat</h4>
                  {formData.track === 'national_certificate' && <CheckCircle2 className="w-4 h-4 text-[#E8B84B] shrink-0" />}
                </div>
                <p className="text-[11px] text-[#5A6478] mt-0.5 truncate">BMBA / DTM sertifikat</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-3 bg-[#0C0F18] text-[#5A6478] hover:text-white border border-[#1E2638] rounded-xl text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 py-3.5 px-4 bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
            >
              <span>Yakunlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          4-BOSQICH: XUSH KELIBSIZ
      ═══════════════════════════════════════ */}
      {step === 4 && (
        <div key="step-4" className={`${CARD} text-center`}>
          <div className="w-20 h-20 rounded-full bg-[#E8B84B]/15 border-2 border-[#E8B84B]/40 flex items-center justify-center mx-auto mb-5">
            <PartyPopper className="w-9 h-9 text-[#E8B84B]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
            Xush Kelibsiz, {formData.fullName.split(' ')[0]}!
          </h2>
          <p className="text-sm text-[#5A6478] leading-relaxed mb-6">
            Ro'yxatdan o'tish muvaffaqiyatli yakunlandi. Endi tarix darslarini boshlashingiz mumkin.
          </p>

          {/* Ma'lumotlar */}
          <div className="bg-[#0C0F18] border border-[#1E2638] rounded-xl p-4 mb-6 text-left space-y-3">
            {[
              { Icon: User, label: 'Ism va Familiya', value: formData.fullName },
              { Icon: GraduationCap, label: 'Sinf darajasi', value: `${formData.gradeLevel}-sinf` },
              {
                Icon: formData.track === 'full_history' ? BookOpen : Award,
                label: "O'quv yo'nalishi",
                value: formData.track === 'full_history' ? 'Full Tarix' : 'Milliy Sertifikat',
              },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8B84B]/10 border border-[#E8B84B]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#E8B84B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#3D4860]">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onComplete && onComplete(formData)}
            className="w-full py-3.5 px-4 bg-[#E8B84B] hover:bg-[#D4A437] text-[#0C0F18] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <span>Bosh Sahifaga O'tish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
