import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import RegisterWizard from './components/auth/RegisterWizard';
import HomePage from './pages/HomePage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/layout/BottomNav';
import { dashboardData } from './data/dashboardData';
import AdminPage from './pages/AdminPage';
import { preloadAdminDataForSession } from './lib/lessons';
import { LanguageProvider } from './lib/language';
import Onboarding from './components/Onboarding';
import { supabase } from './lib/supabase';
import FaollikPage from './pages/FaollikPage';
import { preloadFaollikForSession, subscribeToFaollik, getFaollikSnapshot } from './lib/faollik';
import SplashScreen from './components/SplashScreen';

function isFaollikPath(pathname) {
  return pathname === '/faollik' || pathname === '/faollik/kalendar';
}

const APP_THEME_STORAGE_KEY = 'tarixiy:display-theme';
const APP_THEMES = ['system', 'light'];

function getInitialAppTheme() {
  try {
    const savedTheme = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
    return APP_THEMES.includes(savedTheme) ? savedTheme : 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    void preloadAdminDataForSession();
  }, []);

  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <LanguageProvider>
        {window.location.pathname.startsWith('/admin') ? <AdminPage /> : <AppEntry />}
      </LanguageProvider>
    </>
  );
}

function AppEntry() {
  const [entryState, setEntryState] = useState('checking');

  useEffect(() => {
    if (entryState !== 'checking') return undefined;
    let active = true;

    const resolveEntryState = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) {
            if (active) setEntryState('app');
            return;
          }
        }

        const onboardingSeen = window.localStorage.getItem('onboarding_seen') === '1';
        if (active) {
          setEntryState(onboardingSeen
            ? window.location.pathname === '/home' ? 'app' : 'register'
            : 'onboarding');
        }
      } catch (error) {
        console.error('Kirish holatini tekshirib bo‘lmadi:', error);
        if (!active) return;
        try {
          const onboardingSeen = window.localStorage.getItem('onboarding_seen') === '1';
          setEntryState(onboardingSeen
            ? window.location.pathname === '/home' ? 'app' : 'register'
            : 'onboarding');
        } catch (storageError) {
          console.error('Onboarding holatini o‘qib bo‘lmadi:', storageError);
          setEntryState('onboarding');
        }
      }
    };

    void resolveEntryState();
    return () => {
      active = false;
    };
  }, [entryState]);

  const finishOnboarding = () => {
    try {
      window.localStorage.setItem('onboarding_seen', '1');
    } catch (error) {
      console.error('Onboarding holatini saqlab bo‘lmadi:', error);
    }
    setEntryState('register');
  };

  if (entryState === 'checking') {
    return <main className="min-h-dvh bg-white" aria-busy="true" />;
  }
  if (entryState === 'onboarding') {
    return <Onboarding onComplete={finishOnboarding} />;
  }

  return <MainApp initialState={entryState} />;
}

function MainApp({ initialState }) {
  const [appState, setAppState] = useState(initialState);
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubPage, setHomeSubPage] = useState(null);
  const [activityPath, setActivityPath] = useState(() => (
    isFaollikPath(window.location.pathname) ? window.location.pathname : null
  ));
  const activityPathRef = useRef(activityPath);
  const resumeReaderRef = useRef(null);
  const [profileSubPage, setProfileSubPage] = useState('main');
  const faollikSnapshot = useSyncExternalStore(subscribeToFaollik, getFaollikSnapshot, getFaollikSnapshot);
  const [userCoins, setUserCoins] = useState(16);
  const currentCoins = faollikSnapshot.holat?.tanga !== undefined ? Number(faollikSnapshot.holat.tanga) : userCoins;
  const [userData, setUserData] = useState({
    fullName: dashboardData.userName,
    phone: '+998 90 123-45-67',
    gradeLevel: 7,
    track: 'full_history',
  });
  const [appTheme, setAppTheme] = useState(getInitialAppTheme);

  useEffect(() => {
    if (appState === 'app') void preloadFaollikForSession();
  }, [appState]);

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (isFaollikPath(pathname)) {
        activityPathRef.current = pathname;
        setActivityPath(pathname);
      } else if (activityPathRef.current) {
        activityPathRef.current = null;
        setActivityPath(null);
        setActiveTab('home');
        setHomeSubPage(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.appTheme = appTheme;
    try {
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, appTheme);
    } catch {
      // Theme remains active for this session when storage is unavailable.
    }
  }, [appTheme]);

  const scrollContainerRef = useRef(null);

  // Tab yoki sub-page almashganda scrollni eng tepaga qaytarish (bir sahifaning scrolli boshqasiga ta'sir qilmasligi uchun)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab, homeSubPage, profileSubPage, activityPath]);

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    setAppState('app');
    setActiveTab('home');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setHomeSubPage(null);
    setProfileSubPage('main');
    setIsLessonOpen(false);
    if (activityPathRef.current) {
      activityPathRef.current = null;
      setActivityPath(null);
      if (window.location.pathname !== '/home') {
        window.history.pushState(null, '', '/home');
      }
    }
  };

  const navigateActivity = (path) => {
    const nextPath = isFaollikPath(path) ? path : null;
    const destination = nextPath || '/home';
    if (window.location.pathname !== destination) {
      window.history.pushState({ activityPath: nextPath }, '', destination);
    }
    activityPathRef.current = nextPath;
    setActivityPath(nextPath);
    setActiveTab('home');
    setHomeSubPage(null);
  };

  const continueReading = () => {
    navigateActivity('/home');
    setActiveTab('lessons');
    resumeReaderRef.current?.();
  };

  const [isLessonOpen, setIsLessonOpen] = useState(false);

  // Faqat darslik o'qilayotganda (BookReader) pastdagi navbar yashiriladi.
  // Boshqa barcha sahifalar va bo'limlarda navbar DOIMO ko'rinadi!
  const shouldHideBottomNav = isLessonOpen;

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
              <div key={`home-${activeTab}`} style={{ display: activeTab === 'home' && !activityPath ? 'block' : 'none' }} className="page-transition book-page">
                <HomePage
                  userData={userData}
                  onNavigateTab={handleTabChange}
                  activeSubPage={homeSubPage}
                  setActiveSubPage={setHomeSubPage}
                  userCoins={currentCoins}
                  setUserCoins={setUserCoins}
                  onNavigateActivity={navigateActivity}
                  onNavigatePremium={() => {
                    setActiveTab('profile');
                    setProfileSubPage('premium');
                  }}
                />
              </div>

              {/* LESSONS */}
              <div key={`lessons-${activeTab}`} style={{ display: activeTab === 'lessons' && !activityPath ? 'block' : 'none' }} className="page-transition book-page">
                <RoadmapPage
                  onLevelOpenChange={setIsLessonOpen}
                  resumeActionRef={resumeReaderRef}
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
              <div key={`resources-${activeTab}`} style={{ display: !activityPath && (activeTab === 'resources' || activeTab === 'more') ? 'block' : 'none' }} className="page-transition book-page">
                <ResourcesPage />
              </div>

              {/* PROFILE */}
              <div key={`profile-${activeTab}`} style={{ display: activeTab === 'profile' && !activityPath ? 'block' : 'none' }} className="page-transition book-page">
                <ProfilePage
                  userData={userData}
                  onUpdateUserData={setUserData}
                  currentPage={profileSubPage}
                  setCurrentPage={setProfileSubPage}
                  appTheme={appTheme}
                  onAppThemeChange={setAppTheme}
                  onLogout={() => {
                    setAppState('register');
                    setActiveTab('home');
                    setHomeSubPage(null);
                    setProfileSubPage('main');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              </div>

              {activityPath && (
                <FaollikPage
                  route={activityPath}
                  onNavigate={navigateActivity}
                  onContinueReading={continueReading}
                />
              )}

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
