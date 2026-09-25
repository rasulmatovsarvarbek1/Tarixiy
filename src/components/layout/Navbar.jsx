import React from 'react';
import { Sparkles, Shield, BookOpen, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser }) {
  return (
    <header className="sticky top-0 z-50 bg-[#141C28]/90 backdrop-blur-md border-b border-[#2A374D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('register')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A24B] to-[#9E7B2F] p-0.5 flex items-center justify-center shadow-lg shadow-[#C9A24B]/10">
            <div className="w-full h-full bg-[#1A2332] rounded-[10px] flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-[#C9A24B]">T</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight text-[#F7F5F0]">
                TARIXIY
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#C9A24B]/20 text-[#C9A24B] border border-[#C9A24B]/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] hidden sm:block">Interaktiv Tarix Ta'limi</p>
          </div>
        </div>

        {/* View Switcher (1-bosqichni qulay ko'rish uchun) */}
        <div className="flex items-center bg-[#1A2332] p-1 rounded-xl border border-[#2A374D]">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-[#C9A24B] text-[#1A2332] font-semibold shadow'
                : 'text-[#A0A0A0] hover:text-[#F7F5F0]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ro'yxatdan o'tish</span>
          </button>
          
          <button
            onClick={() => setActiveTab('demo-lesson')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'demo-lesson'
                ? 'bg-[#C9A24B] text-[#1A2332] font-semibold shadow'
                : 'text-[#A0A0A0] hover:text-[#F7F5F0]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mavzu namunasi</span>
          </button>
        </div>

        {/* 3-kunlik bepul sinov ko'rsatkichi yoki profil */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#3F8F6F]/10 border border-[#3F8F6F]/30 text-[#3F8F6F] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#3F8F6F]" />
            <span>3 Kun Bepul Sinov</span>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#2A374D]">
              <div className="w-8 h-8 rounded-full bg-[#C9A24B]/20 border border-[#C9A24B] flex items-center justify-center text-xs font-bold text-[#C9A24B]">
                {currentUser.full_name?.charAt(0) || 'O'}
              </div>
              <span className="text-xs font-medium text-[#F7F5F0] hidden lg:inline">
                {currentUser.full_name?.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
