import React, { useState } from 'react';
import RegisterWizard from './components/auth/RegisterWizard';
import HomePage from './pages/HomePage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
                  onNavigateTab={handleTabChange}
                />
              )}

              {activeTab === 'lessons' && <RoadmapPage />}

              {(activeTab === 'resources' || activeTab === 'more') && <ResourcesPage />}

              {activeTab === 'profile' && (
                <ProfilePage
                  userData={userData}
                  onUpdateUserData={setUserData}
                  onLogout={() => {
                    setAppState('register');
                    setActiveTab('home');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              )}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </>
        )}
      </div>
    </div>
  );
}
