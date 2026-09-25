import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Video, 
  Volume2, 
  FileText, 
  Play, 
  Pause, 
  CheckCircle2, 
  Lock,
  Unlock,
  AlertCircle,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UnitDetailPage({ unit, progressState, onUpdateProgress, onBack }) {
  // Ketma-ketlik holati (Supabase user_progress jadvaliga mos struktura)
  // progressState: { video_completed: boolean, text_completed: boolean, audio_completed: boolean }
  const videoDone = Boolean(progressState?.video_completed);
  const textDone = Boolean(progressState?.text_completed);
  const audioDone = Boolean(progressState?.audio_completed);

  // Umumiy foiz: 0% -> 33% -> 66% -> 100%
  let totalPercent = 0;
  if (videoDone && textDone && audioDone) totalPercent = 100;
  else if (videoDone && textDone) totalPercent = 66;
  else if (videoDone) totalPercent = 33;

  // Qaysi qism ochiq/qulflangan:
  // 1. Video har doim ochiq
  // 2. Matn faqat video tugagach ochiladi
  // 3. Audio faqat matn tugagach ochiladi
  const isVideoUnlocked = true;
  const isTextUnlocked = videoDone;
  const isAudioUnlocked = videoDone && textDone;

  const [activeModal, setActiveModal] = useState(null); // 'video' | 'text' | 'audio' | null
  const [shakingCard, setShakingCard] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [simulatedVideoProgress, setSimulatedVideoProgress] = useState(0);

  // Qulflangan kartaga bosilganda xabar berish
  const handleLockedClick = (cardName, reason) => {
    setShakingCard(cardName);
    setToastMessage(`🔒 ${reason}`);
    setTimeout(() => setShakingCard(null), 400);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Video tugallanganda
  const handleCompleteVideo = () => {
    onUpdateProgress({
      ...progressState,
      video_completed: true
    });
    setActiveModal(null);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ['#E8B84B', '#3F8F6F'] });
  };

  // Matn tugallanganda
  const handleCompleteText = () => {
    onUpdateProgress({
      ...progressState,
      text_completed: true
    });
    setActiveModal(null);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ['#E8B84B', '#3F8F6F'] });
  };

  // Audio tugallanganda (Unit 100% bo'ladi)
  const handleCompleteAudio = () => {
    onUpdateProgress({
      ...progressState,
      audio_completed: true
    });
    setActiveModal(null);
    setIsPlayingAudio(false);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 }, colors: ['#E8B84B', '#3F8F6F', '#F0EAD6'] });
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0D1117] text-[#F0EAD6] pb-24 pt-4 px-4 flex flex-col justify-between">
      
      <div>
        {/* 1. Yuqori Navigatsiya Qatori (Orqaga qaytish va Unit sarlavhasi) */}
        <div className="flex items-center justify-between py-2 mb-6 border-b border-[#21262D]">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#F0EAD6] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h1 className="font-serif text-lg font-bold text-[#F0EAD6]">
              {unit?.unitNumber || "Unit 1.1"}
            </h1>
            <span className="text-[11px] font-mono text-[#8B93A1]">
              Umumiy jarayon: <strong className={totalPercent === 100 ? 'text-[#3F8F6F]' : 'text-[#E8B84B]'}>{totalPercent}%</strong>
            </span>
          </div>

          <div className="w-10" />
        </div>

        {/* Xabarnoma (Qulflangan qism bosilganda) */}
        {toastMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#161B22] border border-[#E8B84B] text-xs text-[#E8B84B] flex items-center space-x-2 shadow-lg animate-shake">
            <AlertCircle className="w-4 h-4 text-[#E8B84B] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sarlavha va Tavsif */}
        <div className="mb-6 px-1">
          <h2 className="font-serif text-xl font-bold text-[#F0EAD6] tracking-tight">
            {unit?.title || "Movarounnahr XIV asr o'rtalarida"}
          </h2>
          <p className="text-xs text-[#8B93A1] mt-1 leading-relaxed">
            Darslar qat'iy ketma-ketlikda o'rganiladi: avval <strong>Video</strong>, so'ng <strong>Matn</strong> va nihoyat <strong>Audio</strong>.
          </p>

          {/* Umumiy progress chizig'i */}
          <div className="h-1.5 w-full bg-[#161B22] border border-[#21262D] rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full transition-all duration-500 ${
                totalPercent === 100 ? 'bg-[#3F8F6F]' : 'bg-[#E8B84B]'
              }`}
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>

        {/* 2. UCHTA KATTA TUGMA (Bir xil karta foni #161B22, faqat holat rangi farqlanadi) */}
        <div className="space-y-4">
          
          {/* ================= 1. VIDEO TUGMASI ================= */}
          <div
            onClick={() => setActiveModal('video')}
            className={`w-full h-24 rounded-2xl bg-[#161B22] p-5 flex items-center justify-between cursor-pointer transition-all duration-200 border-2 select-none ${
              videoDone
                ? 'border-[#3F8F6F] text-[#F0EAD6] shadow-sm'
                : 'border-[#E8B84B] text-[#F0EAD6] shadow-gold-glow ring-2 ring-[#E8B84B]/20'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                videoDone ? 'bg-[#3F8F6F]/15 text-[#3F8F6F]' : 'bg-[#E8B84B]/15 text-[#E8B84B]'
              }`}>
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold block">
                  Video
                </span>
                <span className="text-[11px] text-[#8B93A1]">
                  {videoDone ? 'Ko\'rib chiqildi' : '1-qadam • Tomosha qiling'}
                </span>
              </div>
            </div>

            <div className="text-right">
              {videoDone ? (
                <div className="flex items-center space-x-1 text-[#3F8F6F] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100%</span>
                </div>
              ) : (
                <span className="font-mono text-xl font-extrabold text-[#E8B84B]">
                  0%
                </span>
              )}
            </div>
          </div>

          {/* ================= 2. MATN TUGMASI ================= */}
          <div
            onClick={() => {
              if (!isTextUnlocked) {
                handleLockedClick('text', "Matnni ochish uchun avval Videoni to'liq tomosha qiling!");
                return;
              }
              setActiveModal('text');
            }}
            className={`w-full h-24 rounded-2xl bg-[#161B22] p-5 flex items-center justify-between transition-all duration-200 border-2 select-none ${
              shakingCard === 'text' ? 'animate-shake' : ''
            } ${
              textDone
                ? 'border-[#3F8F6F] text-[#F0EAD6] cursor-pointer'
                : isTextUnlocked
                ? 'border-[#E8B84B] text-[#F0EAD6] cursor-pointer shadow-gold-glow ring-2 ring-[#E8B84B]/20'
                : 'border-[#21262D] opacity-50 cursor-not-allowed text-[#4A4F58]'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                textDone 
                  ? 'bg-[#3F8F6F]/15 text-[#3F8F6F]' 
                  : isTextUnlocked 
                  ? 'bg-[#E8B84B]/15 text-[#E8B84B]' 
                  : 'bg-[#21262D] text-[#4A4F58]'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className={`font-serif text-xl font-bold block ${!isTextUnlocked ? 'text-[#4A4F58]' : ''}`}>
                  Matn
                </span>
                <span className="text-[11px] text-[#8B93A1]">
                  {textDone 
                    ? 'O\'qib chiqildi' 
                    : isTextUnlocked 
                    ? '2-qadam • Tarixiy matn' 
                    : 'Qulflangan (Video kerak)'}
                </span>
              </div>
            </div>

            <div className="text-right">
              {textDone ? (
                <div className="flex items-center space-x-1 text-[#3F8F6F] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100%</span>
                </div>
              ) : isTextUnlocked ? (
                <span className="font-mono text-xl font-extrabold text-[#E8B84B]">
                  0%
                </span>
              ) : (
                <div className="flex items-center space-x-1 text-[#4A4F58]">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* ================= 3. AUDIO TUGMASI ================= */}
          <div
            onClick={() => {
              if (!isAudioUnlocked) {
                handleLockedClick('audio', "Audioni ochish uchun avval Matnni to'liq o'qib chiqing!");
                return;
              }
              setActiveModal('audio');
            }}
            className={`w-full h-24 rounded-2xl bg-[#161B22] p-5 flex items-center justify-between transition-all duration-200 border-2 select-none ${
              shakingCard === 'audio' ? 'animate-shake' : ''
            } ${
              audioDone
                ? 'border-[#3F8F6F] text-[#F0EAD6] cursor-pointer'
                : isAudioUnlocked
                ? 'border-[#E8B84B] text-[#F0EAD6] cursor-pointer shadow-gold-glow ring-2 ring-[#E8B84B]/20'
                : 'border-[#21262D] opacity-50 cursor-not-allowed text-[#4A4F58]'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                audioDone 
                  ? 'bg-[#3F8F6F]/15 text-[#3F8F6F]' 
                  : isAudioUnlocked 
                  ? 'bg-[#E8B84B]/15 text-[#E8B84B]' 
                  : 'bg-[#21262D] text-[#4A4F58]'
              }`}>
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <span className={`font-serif text-xl font-bold block ${!isAudioUnlocked ? 'text-[#4A4F58]' : ''}`}>
                  Audio
                </span>
                <span className="text-[11px] text-[#8B93A1]">
                  {audioDone 
                    ? 'Tinglab bo\'lindi' 
                    : isAudioUnlocked 
                    ? '3-qadam • Yakuniy audio' 
                    : 'Qulflangan (Matn kerak)'}
                </span>
              </div>
            </div>

            <div className="text-right">
              {audioDone ? (
                <div className="flex items-center space-x-1 text-[#3F8F6F] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100%</span>
                </div>
              ) : isAudioUnlocked ? (
                <span className="font-mono text-xl font-extrabold text-[#E8B84B]">
                  0%
                </span>
              ) : (
                <div className="flex items-center space-x-1 text-[#4A4F58]">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. MODALLAR: Video / Matn / Audio */}

      {/* --- VIDEO MODALI --- */}
      {activeModal === 'video' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#8B93A1] hover:text-[#F0EAD6] w-8 h-8 rounded-full bg-[#0D1117] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#E8B84B] mb-3">
              <Video className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-[#F0EAD6]">1-Qadam: Video Dars</h3>
            </div>

            {/* Simulyatsiya qilingan YouTube player */}
            <div className="aspect-video w-full rounded-xl bg-[#0D1117] border border-[#30363D] flex flex-col items-center justify-center p-4 text-center mb-4 relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-[#E8B84B] text-[#0D1117] flex items-center justify-center mb-2 shadow-lg cursor-pointer hover:scale-105 transition">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>
              <p className="text-xs text-[#8B93A1]">Amir Temur davlatining tashkil topishi (YouTube)</p>
              <span className="text-[10px] text-[#4A4F58] mt-1 font-mono">08:45 daqiqa</span>
            </div>

            <p className="text-xs text-[#8B93A1] leading-relaxed mb-6">
              📌 <strong>Qoida:</strong> Keyingi bosqich (Matn) ochilishi uchun videoni to'liq tomosha qilish kerak.
            </p>

            <button
              onClick={handleCompleteVideo}
              className="w-full py-3.5 rounded-xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0D1117] font-bold text-sm shadow-gold-glow flex items-center justify-center space-x-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Videoni to'liq ko'rdim (Matnni ochish)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- MATN MODALI --- */}
      {activeModal === 'text' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#8B93A1] hover:text-[#F0EAD6] w-8 h-8 rounded-full bg-[#0D1117] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#E8B84B] mb-3">
              <FileText className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-[#F0EAD6]">2-Qadam: Dars Matni</h3>
            </div>

            <div className="space-y-4 font-serif text-sm leading-relaxed text-[#F0EAD6] border-t border-[#30363D] pt-4 mb-6">
              <p>
                XIV asrning o'rtalarida Movarounnahr og'ir siyosiy va iqtisodiy inqirozni boshdan kechirayotgan edi. Mo'g'ul xonlarining zulmidan charchagan xalq ozodlikka intilardi.
              </p>
              <blockquote className="p-3 rounded-lg bg-[#0D1117] border-l-2 border-[#E8B84B] italic text-xs text-[#E8B84B]">
                "Davlat agar adolat qonunlariga tayanmasa, uning umri qisqa bo'lur. Adolat va insof bilan zabt etilmagan saltanat tezda zavol topgay." — Amir Temur
              </blockquote>
              <p>
                Shunday murakkab davrda Temur Tarag'ay bahodir o'g'li o'zining harbiy mahorati bilan tanilib, 1370-yilda Balx qurultoyida butun Movarounnahrning oliy amiri etib saylandi.
              </p>
            </div>

            <button
              onClick={handleCompleteText}
              className="w-full py-3.5 rounded-xl bg-[#E8B84B] hover:bg-[#D4A437] text-[#0D1117] font-bold text-sm shadow-gold-glow flex items-center justify-center space-x-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Matnni o'qib bo'ldim (Audioni ochish)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- AUDIO MODALI --- */}
      {activeModal === 'audio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveModal(null);
                setIsPlayingAudio(false);
              }}
              className="absolute top-4 right-4 text-[#8B93A1] hover:text-[#F0EAD6] w-8 h-8 rounded-full bg-[#0D1117] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#E8B84B] mb-3">
              <Volume2 className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-[#F0EAD6]">3-Qadam: Ovozli Dars</h3>
            </div>

            {/* Audio pleer */}
            <div className="p-5 rounded-xl bg-[#0D1117] border border-[#30363D] text-center space-y-4 mb-6">
              <p className="text-xs text-[#8B93A1]">Professional diktor talaffuzida audio yozuv</p>
              
              <div className="h-1.5 w-full bg-[#21262D] rounded-full overflow-hidden">
                <div className={`h-full ${isPlayingAudio ? 'bg-[#E8B84B] w-3/4 animate-pulse' : 'bg-[#E8B84B] w-1/4'}`} />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-[#8B93A1]">
                <span>02:15</span>
                <span>06:40</span>
              </div>

              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-12 h-12 rounded-full bg-[#E8B84B] hover:bg-[#D4A437] text-[#0D1117] flex items-center justify-center mx-auto shadow-md transition"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>
            </div>

            <button
              onClick={handleCompleteAudio}
              className="w-full py-3.5 rounded-xl bg-[#3F8F6F] hover:bg-[#347A5E] text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Audioni to'liq tingladim (Unitni 100% tugatish)</span>
            </button>
          </div>
        </div>
      )}

      {/* Pastki bo'shliq */}
      <div className="h-4" />

    </div>
  );
}
