import React, { useState, useEffect, useRef } from 'react';
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
  const [homeSubPage, setHomeSubPage] = useState(null);
  const [profileSubPage, setProfileSubPage] = useState('main');
  const [userCoins, setUserCoins] = useState(16);
  const [userData, setUserData] = useState({
    fullName: dashboardData.userName,
    phone: '+998 90 123-45-67',
    gradeLevel: 7,
    track: 'full_history',
  });

  const scrollContainerRef = useRef(null);

  // Tab yoki sub-page almashganda scrollni eng tepaga qaytarish (bir sahifaning scrolli boshqasiga ta'sir qilmasligi uchun)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab, homeSubPage, profileSubPage]);

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    setAppState('app');
    setActiveTab('home');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      // Agar pastdagi home tugmasi bosilsa, sub-page yopiladi
      setHomeSubPage(null);
    } else if (tab === 'profile') {
      // Agar pastdagi profil tugmasi bosilsa, asosiy profil sahifasiga qaytadi
      setProfileSubPage('main');
    }
  };

  // Faqat asosiy 4 ta sahifada (Bosh sahifa, Darslar, Resurslar, Profil) pastdagi navbar ko'rinadi.
  // Har qanday sub-page (magazin, quiz, medals, ranking, profil sozlamalari, donat va h.k.) ochilganda navbar YASHIRILADI!
  const isHomeSubPage = activeTab === 'home' && homeSubPage !== null;
  const isProfileSubPage = activeTab === 'profile' && profileSubPage !== 'main';
  const shouldHideBottomNav = isHomeSubPage || isProfileSubPage;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex justify-center selection:bg-[#E8B84B] selection:text-[#0D1117]">
      {/* ── ASOSIY SMARTFON KONTEYNERI ── */}
      <div className="w-full max-w-[430px] min-h-screen bg-white relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:border-x border-[#E2E8F0] flex flex-col overflow-x-hidden">

        {/* REGISTER */}
        {appState === 'register' && (
          <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 page-transition">
            <RegisterWizard onComplete={handleRegistrationComplete} />
          </div>
        )}

        {/* APP — barcha sahifalar mounted bo'lib turadi, faqat ko'rinishi o'zgaradi */}
        {appState === 'app' && (
          <>
            <main ref={scrollContainerRef} className={`flex-1 ${shouldHideBottomNav ? 'pb-0' : 'pb-20'} bg-white relative overflow-y-auto`}>

              {/* HOME */}
              <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
                <HomePage
                  userData={userData}
                  onNavigateTab={handleTabChange}
                  activeSubPage={homeSubPage}
                  setActiveSubPage={setHomeSubPage}
                  userCoins={userCoins}
                  setUserCoins={setUserCoins}
                />
              </div>

              {/* LESSONS */}
              <div style={{ display: activeTab === 'lessons' ? 'block' : 'none' }}>
                <RoadmapPage
                  onNavigate={(dest) => {
                    if (dest === 'magazin') {
                      setActiveTab('home');
                      setHomeSubPage('magazin');
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    } else if (dest === 'ranking') {
                      setActiveTab('home');
                      setHomeSubPage('/ranking');
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }
                  }}
                />
              </div>

              {/* RESOURCES / MORE */}
              <div style={{ display: (activeTab === 'resources' || activeTab === 'more') ? 'block' : 'none' }}>
                <ResourcesPage />
              </div>

              {/* PROFILE */}
              <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
                <ProfilePage
                  userData={userData}
                  onUpdateUserData={setUserData}
                  currentPage={profileSubPage}
                  setCurrentPage={setProfileSubPage}
                  onLogout={() => {
                    setAppState('register');
                    setActiveTab('home');
                    setHomeSubPage(null);
                    setProfileSubPage('main');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              </div>

            </main>

            {!shouldHideBottomNav && (
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
