import React from 'react';
import { Home, BookOpen, MoreHorizontal, UserRound } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'home',    label: 'Bosh sahifa', icon: Home },
    { id: 'lessons', label: 'Darslar',     icon: BookOpen },
    { id: 'more',    label: "Ko'proq",     icon: MoreHorizontal },
    { id: 'profile', label: 'Profil',      icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0C0F18]/95 backdrop-blur-lg border-t sm:border-x border-[#1E2638] pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-3 z-[100] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <div className="w-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center min-w-[64px] py-1 select-none active:scale-90 transition-transform duration-150"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-[#E8B84B]/15 scale-105' : 'bg-transparent'
                }`}
              >
                <Icon
                  style={{ width: 22, height: 22 }}
                  className={`transition-colors ${isActive ? 'text-[#E8B84B]' : 'text-[#4A5568]'}`}
                  fill={isActive ? '#E8B84B' : 'none'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span
                className={`mt-0.5 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#E8B84B]' : 'text-[#4A5568]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
