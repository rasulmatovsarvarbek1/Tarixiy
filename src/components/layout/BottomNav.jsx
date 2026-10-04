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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#E2E8F0] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="w-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className="group relative flex flex-col items-center justify-center min-w-[68px] py-1 select-none active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <div className="relative w-12 h-8 rounded-full flex items-center justify-center bg-transparent transition-all duration-200">
                <Icon
                  style={{ width: 22, height: 22 }}
                  className={`transition-all duration-200 ${
                    isActive
                      ? 'text-black stroke-[2.4] scale-105'
                      : 'text-[#475569] group-hover:text-black stroke-[1.8]'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span
                className={`mt-0.5 text-[11px] tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-black'
                    : 'font-medium text-[#64748B] group-hover:text-black'
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

