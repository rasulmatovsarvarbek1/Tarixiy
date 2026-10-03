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
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex justify-center selection:bg-[#E8B84B] selection:text-[#0D1117]">
      {/* ── ASOSIY SMARTFON KONTEYNERI (Desktopda ham, mobilda ham telefon formati) ── */}
      <div className="w-full max-w-[430px] min-h-screen bg-white relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:border-x border-[#E2E8F0] flex flex-col overflow-x-hidden">
        {appState === 'register' && (
          <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 page-transition">
            <RegisterWizard onComplete={handleRegistrationComplete} />
          </div>
        )}

        {appState === 'app' && (
          <>
            <main key={activeTab} className="flex-1 page-transition pb-20 bg-white">
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
