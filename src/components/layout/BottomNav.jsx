import React from 'react';
import { Home, BookOpen, Layers, UserRound } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'home',      label: 'Bosh sahifa', icon: Home },
    { id: 'lessons',   label: 'Darslar',     icon: BookOpen },
    { id: 'resources', label: 'Resurslar',   icon: Layers },
    { id: 'profile',   label: 'Profil',      icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/92 backdrop-blur-xl border-t border-[#E2E8F0] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 z-[100] shadow-[0_-8px_25px_rgba(0,0,0,0.06)]">
      <div className="w-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className="group relative flex flex-col items-center justify-center min-w-[68px] py-1 select-none active:scale-90 transition-all duration-200 cursor-pointer"
            >
              <div
                className={`relative w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-[#E8B84B]/20 text-[#B4821A] scale-105 shadow-sm'
                    : 'bg-transparent text-[#8B98AD] group-hover:text-[#475569] group-hover:bg-[#F1F5F9]/70'
                }`}
              >
                <Icon
                  style={{ width: 22, height: 22 }}
                  className={`transition-all duration-300 ${
                    isActive ? 'text-[#C99218] stroke-[2.3]' : 'text-[#8B98AD] stroke-[1.8]'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span
                className={`mt-1 text-[10.5px] tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-[#B4821A]'
                    : 'font-medium text-[#8B98AD] group-hover:text-[#475569]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#D4921A]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
