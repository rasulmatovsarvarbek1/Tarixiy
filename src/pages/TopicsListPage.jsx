import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  GraduationCap, 
  Clock, 
  Award, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { MOCK_WEEKS } from '../data/mockLessons';

export default function TopicsListPage({ userSelection, onSelectLesson, onBackToSelection }) {
  const [shakingCardId, setShakingCardId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Foydalanuvchi tanlagan sinf va yo'nalish sarlavhasi
  const gradeLabel = userSelection?.gradeLevel === 12 
    ? "Abituriyent" 
    : `${userSelection?.gradeLevel || 9}-sinf`;

  const trackLabel = userSelection?.track === 'national_certificate' 
    ? "Milliy Sertifikat" 
    : "Full Tarix";

  // Qulflangan yoki ochiq darsga bosilgandagi harakat
  const handleCardClick = (lesson) => {
    if (lesson.is_locked) {
      setShakingCardId(lesson.id);
      setToastMessage(`🔒 Ushbu dars avvalgi darslarni tugatgach ochiladi.`);
      
      setTimeout(() => {
        setShakingCardId(null);
      }, 400);

      setTimeout(() => {
        setToastMessage('');
      }, 2500);
      return;
    }

    // Ochiq kartaga bosilsa — placeholder dars sahifasiga o'tadi
    if (onSelectLesson) {
      onSelectLesson(lesson);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-10">
      
      {/* Yuqori boshqaruv va Sarlavha paneli */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              className="text-xs text-[#766753] hover:text-[#2C2114] flex items-center space-x-1.5 transition py-1 px-2 rounded-lg hover:bg-[#EFE7D8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sinfni o'zgartirish</span>
            </button>
          )}

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EFE7D8] border border-[#DEC8A5] text-[11px] font-semibold text-[#8C6C34]">
            <GraduationCap className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>{gradeLabel} • {trackLabel}</span>
          </div>
        </div>

        {/* Asosiy sahifa sarlavhasi */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2114] tracking-tight">
          O'quv Dasturi va Mavzular
        </h1>
        <p className="text-xs sm:text-sm text-[#766753] mt-1">
          Haftalik darslarni ketma-ket o'rganing va yakshanba kungi imtihonni topshiring.
        </p>
      </div>

      {/* Xabarnoma (Qulflangan dars bosilganda) */}
      {toastMessage && (
        <div className="mb-5 p-3 rounded-xl bg-[#FAF6EE] border border-[#C9A24B] text-xs text-[#8C6C34] flex items-center space-x-2 shadow-sm animate-shake">
          <AlertCircle className="w-4 h-4 text-[#C9A24B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Haftalar va Mavzular ro'yxati */}
      <div className="space-y-8">
        {MOCK_WEEKS.map((week) => (
          <section key={week.id} className="space-y-3">
            
            {/* Hafta sarlavhasi */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A24B]" />
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C2114]">
                  {week.title}
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6C34] uppercase tracking-wider">
                {week.week_number}-hafta
              </span>
            </div>

            {/* Hafta ichidagi dars kartalari */}
            <div className="space-y-2.5">
              {week.lessons.map((lesson) => {
                const isShaking = shakingCardId === lesson.id;
                const isOpen = !lesson.is_locked;
                const isExam = lesson.is_exam;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleCardClick(lesson)}
                    className={`p-4 rounded-xl border transition-all duration-200 select-none ${
                      isShaking ? 'animate-shake' : ''
                    } ${
                      isOpen
                        ? 'bg-[#EFE7D8] border-[#C9A24B] shadow-sm hover:border-[#B88F3B] hover:shadow-md cursor-pointer ring-1 ring-[#C9A24B]/30'
                        : 'bg-[#EFE7D8]/60 border-[#DEC8A5]/60 opacity-60 cursor-not-allowed hover:bg-[#EFE7D8]/70'
                    } ${
                      isExam && isOpen ? 'bg-gradient-to-r from-[#EFE7D8] to-[#E9DFC9]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Chap tomon: Kuni, ikonka va dars nomi */}
                      <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                        {/* Holat ikonka qutisi */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          lesson.status === 'completed'
                            ? 'bg-[#3F8F6F]/15 text-[#3F8F6F]'
                            : isOpen
                            ? 'bg-[#C9A24B] text-white shadow-sm'
                            : 'bg-[#DEC8A5]/50 text-[#8C6C34]'
                        }`}>
                          {lesson.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isOpen ? (
                            isExam ? <Award className="w-4 h-4" /> : <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#8C6C34]" />
                          )}
                        </div>

                        {/* Matnlar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-[11px] font-semibold mb-0.5">
                            <span className={isOpen ? 'text-[#8C6C34]' : 'text-[#8C6C34]/80'}>
                              {lesson.day_name} • {isExam ? "Yakuniy Imtihon" : `${lesson.day_of_week}-dars`}
                            </span>
                            <span className="text-[#DEC8A5]">•</span>
                            <span className="text-[#766753] font-normal flex items-center space-x-1">
                              <Clock className="w-3 h-3 inline mr-0.5" />
                              {lesson.estimated_minutes} daqiqa
                            </span>
                          </div>

                          <h3 className={`text-sm font-medium leading-snug line-clamp-2 ${
                            isOpen ? 'text-[#2C2114] font-semibold' : 'text-[#5A4D3E]'
                          }`}>
                            {lesson.title}
                          </h3>
                        </div>
                      </div>

                      {/* O'ng tomon: Holat belgisi / Tugma */}
                      <div className="shrink-0 flex items-center space-x-2">
                        {isOpen ? (
                          <div className="flex items-center space-x-1 text-xs font-semibold text-[#8C6C34] bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#DEC8A5]">
                            <span>Ochiq</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-xs text-[#8C6C34]/70 px-2 py-1">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </section>
        ))}
      </div>

    </div>
  );
}
