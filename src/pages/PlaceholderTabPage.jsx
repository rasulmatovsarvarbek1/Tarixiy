import React from 'react';
import { useLanguage } from '../lib/language';

export default function PlaceholderTabPage({ title, description }) {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0C0F18] px-5 pt-16 pb-28 flex items-start">
      <div className="w-full rounded-2xl bg-[#131826] border border-[#1E2638] p-6 text-center shadow-sm mt-8">
        <h2 className="text-xl font-bold text-white">{t(title)}</h2>
        <p className="mt-2 text-sm text-[#5A6478] leading-relaxed">{t(description)}</p>
        <p className="mt-4 text-xs font-semibold text-[#E8B84B]">{t('Tez orada')}</p>
      </div>
    </div>
  );
}
