import React from 'react';
import { ArrowLeft, BookOpen, Clock, Sparkles } from 'lucide-react';

export default function LessonPlaceholderPage({ lesson, onBack }) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
      <div className="bg-[#FAF6EE] border border-[#DECBB0] rounded-2xl p-8 shadow-sand-card">
        
        <div className="w-14 h-14 rounded-2xl bg-[#EFE7D8] border border-[#DEC8A5] flex items-center justify-center mx-auto mb-4 text-[#C9A24B]">
          <BookOpen className="w-7 h-7" />
        </div>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EFE7D8] border border-[#DEC8A5] text-[11px] font-semibold text-[#8C6C34] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
          <span>{lesson?.day_name || '1-dars'} • {lesson?.estimated_minutes || 15} daqiqa</span>
        </span>

        <h2 className="font-serif text-xl font-bold text-[#2C2114] mb-3">
          {lesson?.title || "Dars mavzusi"}
        </h2>

        <div className="p-4 rounded-xl bg-[#F5F0E8] border border-[#DECBB0] text-xs text-[#766753] leading-relaxed mb-6">
          📌 <strong>Dars sahifasi (placeholder):</strong><br />
          Ushbu darsning video, audio, matn va Duolingo uslubidagi interaktiv test tizimi keyingi bosqichda to'liq ulanadi.
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 px-4 bg-[#C9A24B] hover:bg-[#B88F3B] text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mavzular ro'yxatiga qaytish</span>
        </button>

      </div>
    </div>
  );
}
