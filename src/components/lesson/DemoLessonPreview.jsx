import React, { useState } from 'react';
import { 
  Star, 
  Clock, 
  Mic, 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  Headphones, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  X,
  Volume2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoLessonPreview({ onBackToRegister }) {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizTimer, setQuizTimer] = useState(20);

  // Duolingo savoli
  const question = {
    questionText: "Amir Temur qaysi yilda butun Movarounnahrning yagona hukmdori (Amiri) deb e'lon qilingan?",
    options: [
      { id: 'A', text: "1336-yilda (Xo'ja Ilg'orda tavallud topganida)" },
      { id: 'B', text: "1370-yilda (Balx qurultoyida)" },
      { id: 'C', text: "1365-yilda (Loy jangidan so'ng)" },
      { id: 'D', text: "1380-yilda (Xurosonga birinchi yurishida)" },
    ],
    correctOption: 'B',
    explanation: "1370-yilning bahorida Balx shahrida chaqirilgan qurultoyda Amir Temur Movarounnahrning oliy hukmdori deb e'lon qilindi va Samarqandni poytaxt etib tanladi."
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerChecked(true);
    if (selectedOption === question.correctOption) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A24B', '#3F8F6F', '#ffffff']
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-between pb-28 pt-4 px-4 sm:px-6 relative">
      
      {/* Kichik orqaga qaytish tugmasi (navigatsiya uchun) */}
      {onBackToRegister && (
        <button
          onClick={onBackToRegister}
          className="self-start text-xs text-gray-500 hover:text-gray-300 flex items-center space-x-1 mb-2 px-2 py-1 rounded transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ro'yxatdan o'tishga qaytish</span>
        </button>
      )}

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        
        {/* 1. Muqova Rasmi (1-rasmdagi kitob muqovasi uslubida) */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl mb-5 relative border border-neutral-800 group">
          <img 
            src="/amir_temur_cover.jpg" 
            alt="Amir Temur muqovasi" 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {/* Rasm ustidagi sarlavha effekti (1-rasmdagi 'ANDISHA VA G'URUR' kabi) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col items-center justify-center p-4 text-center">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider uppercase drop-shadow-md text-[#F7F5F0]">
              Amir Temur
            </span>
            <span className="text-xs tracking-widest text-[#E5D2A6] uppercase mt-1 drop-shadow">
              Buyuk Sohibqiron
            </span>
          </div>
        </div>

        {/* 2. Sarlavha va Muallif */}
        <h1 className="text-2xl font-bold tracking-tight text-white text-center">
          Amir Temur va Temuriylar
        </h1>
        <p className="text-sm text-neutral-400 text-center mt-1 font-medium">
          O'zbekiston tarixi • 9-sinf
        </p>

        {/* 3. Ko'rsatkichlar qatori (1-rasmdagi: Reyting | Davomiyligi | Ovoz | Sinf) */}
        <div className="w-full grid grid-cols-4 py-4 my-5 border-y border-neutral-800/80 text-center">
          <div className="border-r border-neutral-800">
            <span className="text-[11px] text-neutral-400 block font-normal">Reyting</span>
            <div className="flex items-center justify-center space-x-1 mt-1 font-bold text-sm text-white">
              <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
              <span>4.9</span>
            </div>
          </div>

          <div className="border-r border-neutral-800">
            <span className="text-[11px] text-neutral-400 block font-normal">Davomiyligi</span>
            <div className="flex items-center justify-center space-x-1 mt-1 font-bold text-sm text-white">
              <Clock className="w-3.5 h-3.5 text-neutral-300" />
              <span>15:37</span>
            </div>
          </div>

          <div className="border-r border-neutral-800">
            <span className="text-[11px] text-neutral-400 block font-normal">Ovoz</span>
            <div className="flex items-center justify-center space-x-1 mt-1 font-bold text-xs text-white truncate px-1">
              <Mic className="w-3 h-3 text-neutral-300 shrink-0" />
              <span className="truncate">Otabek R.</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 block font-normal">Daraja</span>
            <div className="flex items-center justify-center space-x-1 mt-1 font-bold text-xs text-white">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-300" />
              <span>9-Sinf</span>
            </div>
          </div>
        </div>

        {/* 4. "Idrok" Banner Kartasi (1-rasmdagi o'q tugmali interaktiv blok) */}
        <div 
          onClick={() => setShowQuizModal(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1A1829] via-[#1F2338] to-[#141B2D] border border-neutral-800 hover:border-neutral-700 cursor-pointer flex items-center justify-between transition-all group shadow-lg mb-6"
        >
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
              <span>Idrok</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A24B]/20 text-[#C9A24B] font-semibold uppercase">
                Test
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mavzu bo'yicha savollaringiz bormi? (Duolingo sinovi)
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#27263F] group-hover:bg-[#343354] flex items-center justify-center text-white transition">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* 5. "Mavzu haqida" (1-rasmdagi "Kitob haqida" bo'limi) */}
        <div className="w-full text-left space-y-3 mb-6">
          <h2 className="text-xl font-bold text-white">
            Mavzu haqida
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed font-normal">
            XIV asrning 60-yillarida Movarounnahrda og'ir siyosiy parokandalik hukm surayotgan edi. 
            Mo'g'ul xonlarining zulmidan charchagan xalq ozodlik va barqarorlikka intilardi. 
            Shunday davrda Amir Temur o'zining jasorati, harbiy salohiyati va adolatli tadbirkorligi 
            bilan o'lkani birlashtirishga kirishdi. 1370-yilda Balx qurultoyida u butun Movarounnahrning 
            oliy hukmdori deb e'lon qilindi va Samarqand poytaxt etib belgilandi.
          </p>
        </div>

        {/* Audio pleyer bar (agar audio yoqilgan bo'lsa) */}
        {isPlayingAudio && (
          <div className="w-full mb-6 p-4 rounded-xl bg-[#141C28] border border-[#2D3A50] animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#C9A24B] font-semibold flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio dars ijro etilmoqda...</span>
              </span>
              <span className="text-xs font-mono text-gray-400">03:45 / 15:37</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#C9A24B] w-[25%]" />
            </div>
          </div>
        )}

      </div>

      {/* 6. Pastki Mahkamlangan Tugmalar (1-rasmdagi [E-kitob] va [Audiokitob] kabi) */}
      <div className="fixed bottom-0 inset-x-0 bg-black/90 backdrop-blur-md border-t border-neutral-800/80 py-3.5 px-4 z-40">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* E-darslik tugmasi (Ko'k tusda) */}
          <button 
            onClick={() => window.scrollTo({ top: 350, behavior: 'smooth' })}
            className="py-3 px-4 rounded-xl bg-[#4A72E8] hover:bg-[#3D64D6] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-[#4A72E8]/20"
          >
            <BookOpen className="w-4 h-4" />
            <span>E-darslik</span>
          </button>

          {/* Audio dars tugmasi (To'q sariq tusda) */}
          <button 
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="py-3 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-[#FF6A00]/20"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pauza</span>
              </>
            ) : (
              <>
                <Headphones className="w-4 h-4" />
                <span>Audiokitob</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7. "Idrok" Bosilganda ochiladigan Duolingo Test Modali */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A2332] border border-[#2D3A50] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleIn">
            
            {/* Modal yopish */}
            <button 
              onClick={() => setShowQuizModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-[#C9A24B]/15 text-[#C9A24B] text-xs font-bold uppercase">
                Idrok • Duolingo Sinovi
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+20 XP</span>
              </span>
            </div>

            <h3 className="font-serif text-lg font-bold text-white mb-4">
              {question.questionText}
            </h3>

            {/* Variantlar */}
            <div className="space-y-2.5 mb-5">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === question.correctOption;

                let optClass = "bg-[#141C28] border-neutral-700 text-neutral-200 hover:border-[#C9A24B]";
                if (isAnswerChecked) {
                  if (isCorrect) {
                    optClass = "bg-[#3F8F6F]/20 border-[#3F8F6F] text-white";
                  } else if (isSelected && !isCorrect) {
                    optClass = "bg-[#C15B4A]/20 border-[#C15B4A] text-white";
                  }
                } else if (isSelected) {
                  optClass = "bg-[#C9A24B]/20 border-[#C9A24B] text-white";
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-medium transition ${optClass}`}
                  >
                    <span>{opt.text}</span>
                    {isAnswerChecked && isCorrect && <CheckCircle className="w-4 h-4 text-[#3F8F6F]" />}
                    {isAnswerChecked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-[#C15B4A]" />}
                  </button>
                );
              })}
            </div>

            {isAnswerChecked && (
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 mb-4">
                <strong className="text-white">Tushuntirish: </strong>
                {question.explanation}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {!isAnswerChecked ? (
                <button
                  disabled={!selectedOption}
                  onClick={handleCheckAnswer}
                  className="py-2.5 px-5 bg-[#C9A24B] hover:bg-[#B88F3B] disabled:opacity-50 text-[#1A2332] font-semibold text-xs rounded-xl shadow transition"
                >
                  Tekshirish
                </button>
              ) : (
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="py-2.5 px-5 bg-[#3F8F6F] hover:bg-[#347A5E] text-white font-semibold text-xs rounded-xl shadow transition"
                >
                  Tushundim
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
