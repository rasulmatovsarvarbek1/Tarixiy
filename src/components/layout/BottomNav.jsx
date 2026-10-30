import React from 'react';
import { Home, BookOpen, Layers, UserRound } from 'lucide-react';
import { useLanguage } from '../../lib/language';

export default function BottomNav({ activeTab, onTabChange }) {
  const { t } = useLanguage();
  const navItems = [
    { id: 'home',      label: t('Bosh sahifa'), icon: Home },
    { id: 'lessons',   label: t('Darslar'),     icon: BookOpen },
    { id: 'resources', label: t('Resurslar'),   icon: Layers },
    { id: 'profile',   label: t('Profil'),      icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-[390px] z-[100]">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.14)] px-2 py-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`group relative flex flex-col items-center justify-center rounded-[22px] py-2.5 px-1 transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] text-white shadow-[0_12px_24px_rgba(79,70,229,0.35)]'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    style={{ width: 21, height: 21 }}
                    className={`transition-all duration-200 ${
                      isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.9]'
                    }`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                </div>
                <span
                  className={`mt-1 text-[10px] font-semibold tracking-tight transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
