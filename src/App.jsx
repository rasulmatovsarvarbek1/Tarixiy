import React, { useState } from 'react';
import RegisterWizard from './components/auth/RegisterWizard';
import HomePage from './pages/HomePage';
import RoadmapPage from './pages/RoadmapPage';
import PlaceholderTabPage from './pages/PlaceholderTabPage';
import BottomNav from './components/layout/BottomNav';
import { dashboardData } from './data/dashboardData';

export default function App() {
  const [appState, setAppState] = useState('register');
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState({
    fullName: dashboardData.userName,
    phone: '+998 90 123-45-67',
    gradeLevel: 7,
    track: 'full_history',
  });

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    setAppState('app');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex justify-center selection:bg-[#E8B84B] selection:text-[#0D1117]">
      {/* ── ASOSIY SMARTFON KONTEYNERI (Desktopda ham, mobilda ham telefon formati) ── */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#0C0F18] relative shadow-[0_0_60px_rgba(0,0,0,0.85)] sm:border-x border-[#1E2638]/60 flex flex-col overflow-x-hidden">
        {appState === 'register' && (
          <div className="min-h-screen bg-[#0C0F18] flex flex-col justify-center items-center p-4 page-transition">
            <RegisterWizard onComplete={handleRegistrationComplete} />
          </div>
        )}

        {appState === 'app' && (
          <>
            <main key={activeTab} className="flex-1 page-transition pb-20">
              {activeTab === 'home' && (
                <HomePage
                  userData={userData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'lessons' && <RoadmapPage />}

              {activeTab === 'more' && (
                <PlaceholderTabPage
                  title="Ko'proq"
                  description="Qo'shimcha imkoniyatlar va sozlamalar hozircha tayyorlanmoqda."
                />
              )}

              {activeTab === 'profile' && (
                <PlaceholderTabPage
                  title="Profil"
                  description={`${userData?.fullName || dashboardData.userName} • ${
                    userData?.gradeLevel ? `${userData.gradeLevel}-sinf` : dashboardData.classLevel
                  }`}
                />
              )}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </>
        )}
      </div>
    </div>
  );
}
