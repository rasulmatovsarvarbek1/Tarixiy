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
import QuizPage from './pages/QuizPage';
import {
  clearHighlightsCache,
  ensureHighlightAuthListener,
  migrateLegacyHighlights,
  loadAll,
} from './lib/highlights';

const PENDING_SELECTION_KEY = 'tarixiy:pending-selection';
const ONBOARDING_SEEN_KEY = 'onboarding_seen';

function clearStudentCaches() {
  const keys = [
    PENDING_SELECTION_KEY,
    'roadmap:progress',
    'roadmap:unlocked',
    'roadmap:completed',
    'roadmap:last-read-level',
    'tarixiy:daily-quiz:attempts',
    'tarixiy_current_user',
  ];
  keys.forEach((key) => window.localStorage.removeItem(key));
  clearHighlightsCache();
}

function getPendingSelection() {
  try {
    const saved = window.localStorage.getItem(PENDING_SELECTION_KEY);
    if (!saved) return null;
    const selection = JSON.parse(saved);
    if (selection?.yonalish === 'dtm') return { sinf: null, yonalish: 'dtm' };
    if (selection?.yonalish === 'maktab' && [6, 7, 8, 9, 10, 11].includes(selection.sinf)) {
      return { sinf: selection.sinf, yonalish: 'maktab' };
    }
    return null;
  } catch (error) {
    console.error('Saqlangan sinf tanlovini o‘qib bo‘lmadi:', error);
    return null;
  }
}

function removePendingSelection() {
  window.localStorage.removeItem(PENDING_SELECTION_KEY);
}

function navigateToHome() {
  if (window.location.pathname !== '/home') {
    window.history.replaceState(null, '', '/home');
  }
}

function navigateToEntry() {
  if (window.location.pathname !== '/') {
    window.history.replaceState(null, '', '/');
  }
}

function userDataFromProfile(profile) {
  return {
    fullName: profile?.ism || dashboardData.userName,
    phone: '',
    gradeLevel: profile?.sinf || 9,
    track: profile?.yonalish === 'dtm' ? 'national_certificate' : 'full_history',
  };
}

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
  const [entryMessage, setEntryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionUserId, setSelectionUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    let active = true;
    const resolveEntryState = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) {
            void migrateLegacyHighlights()
              .catch(() => {})
              .finally(() => { void loadAll().catch(() => {}); });
            navigateToHome();
            if (active) {
              setUserData((current) => current || userDataFromProfile(null));
              setEntryState('app');
            }
            return;
          }
        }

        const onboardingSeen = window.localStorage.getItem(ONBOARDING_SEEN_KEY) === '1';
        if (active) setEntryState(onboardingSeen ? 'register' : 'onboarding');
      } catch (error) {
        console.error('Kirish holatini tekshirib bo‘lmadi:', error);
        if (!active) return;
        setEntryMessage('Sessiyani tekshirib bo‘lmadi. Qayta kirib ko‘ring.');
        setEntryState('register');
      }
    };

    void resolveEntryState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    ensureHighlightAuthListener();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || ((event === 'TOKEN_REFRESHED' || event === 'USER_DELETED') && !session)) {
        clearStudentCaches();
        setUserData(null);
        setSelectionUserId(null);
        setEntryMessage(loggingOutRef.current ? '' : 'Sessiya tugadi. Davom etish uchun yangi kod kiriting.');
        navigateToEntry();
        setEntryState('register');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const finishOnboarding = () => {
    try {
      window.localStorage.setItem(ONBOARDING_SEEN_KEY, '1');
    } catch (error) {
      console.error('Onboarding holatini saqlab bo‘lmadi:', error);
    }
    setEntryState('selection');
  };

  const startLogin = () => {
    try {
      window.localStorage.setItem(ONBOARDING_SEEN_KEY, '1');
    } catch (error) {
      console.error('Onboarding holatini saqlab bo‘lmadi:', error);
    }
    setEntryMessage('');
    setEntryState('register');
  };

  const finishSelection = (selection) => {
    try {
      window.localStorage.setItem(PENDING_SELECTION_KEY, JSON.stringify(selection));
    } catch (error) {
      console.error('Sinf tanlovini saqlab bo‘lmadi:', error);
      setEntryMessage('Tanlovni telefonda saqlab bo‘lmadi. Qayta urinib ko‘ring.');
      return;
    }
    setEntryMessage('');
    setEntryState('register');
  };

  const updateProfileSelection = async (userId, selection) => {
    const { error } = await supabase
      .from('profillar')
      .update({ sinf: selection.sinf, yonalish: selection.yonalish })
      .eq('user_id', userId);
    if (error) throw error;
    removePendingSelection();
    navigateToHome();
    setUserData((current) => ({
      ...(current || userDataFromProfile(null)),
      gradeLevel: selection.sinf || 9,
      track: selection.yonalish === 'dtm' ? 'national_certificate' : 'full_history',
    }));
    setSelectionUserId(null);
    setEntryMessage('');
    setEntryState('app');
  };

  const handleSelectionAfterLogin = async (selection) => {
    if (!selectionUserId) return;
    setIsSubmitting(true);
    try {
      await updateProfileSelection(selectionUserId, selection);
    } catch (error) {
      console.error('Profil tanlovini saqlab bo‘lmadi:', error);
      setEntryMessage('Tanlovni saqlab bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (code) => {
    if (!supabase) {
      setEntryMessage('Supabase ulanishi sozlanmagan.');
      return;
    }
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
    if (!supabaseUrl) {
      setEntryMessage('Supabase ulanishi sozlanmagan.');
      return;
    }

    setIsSubmitting(true);
    setEntryMessage('');
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/kirish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(anonKey ? { apikey: anonKey } : {}),
        },
        body: JSON.stringify({ kod: code }),
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Kod noto‘g‘ri yoki eskirgan. Botdan yangi kod oling');
        }
        if (response.status === 429) {
          throw new Error('Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.');
        }
        throw new Error(payload?.xato || 'Kodni tekshirib bo‘lmadi. Qayta urinib ko‘ring.');
      }
      if (!payload?.token_hash || !payload?.type) {
        throw new Error(payload?.xato || 'Kodni tekshirib bo‘lmadi. Yangi kod oling.');
      }

      let { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: payload.token_hash,
        type: payload.type,
      });
      if (verifyError && payload.type !== 'email') {
        const retry = await supabase.auth.verifyOtp({
          token_hash: payload.token_hash,
          type: 'email',
        });
        authData = retry.data;
        verifyError = retry.error;
      }
      if (verifyError) throw verifyError;
      const currentUserId = authData.session?.user?.id || authData.user?.id;
      if (!currentUserId) throw new Error('Kirish sessiyasi yaratilmadi. Yangi kod olib qayta urinib ko‘ring.');

      const { data: profile, error: profileError } = await supabase
        .from('profillar')
        .select('sinf, yonalish, ism')
        .maybeSingle();
      if (profileError) throw profileError;

      if (!profile) {
        removePendingSelection();
        setUserData(userDataFromProfile(null));
        navigateToHome();
        setEntryState('app');
        return;
      }

      setUserData(userDataFromProfile(profile));
      if (profile.yonalish) {
        removePendingSelection();
        navigateToHome();
        setEntryState('app');
        return;
      }

      const pendingSelection = getPendingSelection();
      if (pendingSelection) {
        setSelectionUserId(currentUserId);
        setEntryState('selection');
        await updateProfileSelection(currentUserId, pendingSelection);
        return;
      }

      setSelectionUserId(currentUserId);
      setEntryState('selection');
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Internetga ulanib qayta urinib ko‘ring'
        : error?.message || 'Kirish amalga oshmadi. Qayta urinib ko‘ring.';
      setEntryMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) {
      throw new Error('Supabase ulanishi sozlanmagan.');
    }
    loggingOutRef.current = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearStudentCaches();
      navigateToEntry();
      setUserData(null);
      setSelectionUserId(null);
      setEntryMessage('');
      setEntryState('register');
    } catch (error) {
      console.error('Hisobdan chiqib bo‘lmadi:', error);
      throw new Error('Hisobdan chiqib bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      loggingOutRef.current = false;
    }
  };

  if (entryState === 'checking') {
    return <main className="min-h-dvh bg-white" aria-busy="true" />;
  }
  if (entryState === 'onboarding') {
    return <Onboarding onComplete={finishOnboarding} onLogin={startLogin} />;
  }
  if (entryState === 'selection') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 page-transition">
        <RegisterWizard
          mode="selection"
          initialSelection={getPendingSelection() || undefined}
          error={entryMessage}
          busy={isSubmitting}
          onSelectionComplete={selectionUserId
            ? handleSelectionAfterLogin
            : finishSelection}
        />
      </div>
    );
  }
  if (entryState === 'register') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 page-transition">
        <RegisterWizard
          error={entryMessage}
          busy={isSubmitting}
          onSubmitCode={handleCodeSubmit}
        />
      </div>
    );
  }

  return <MainApp
    userData={userData || userDataFromProfile(null)}
    onLogout={handleLogout}
  />;
}

function MainApp({ userData: initialUserData, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubPage, setHomeSubPage] = useState(null);
  const [activityPath, setActivityPath] = useState(() => (
    isFaollikPath(window.location.pathname) ? window.location.pathname : null
  ));
  const [quizPath, setQuizPath] = useState(() => window.location.pathname === '/quiz');
  const activityPathRef = useRef(activityPath);
  const resumeReaderRef = useRef(null);
  const [profileSubPage, setProfileSubPage] = useState('main');
  const faollikSnapshot = useSyncExternalStore(subscribeToFaollik, getFaollikSnapshot, getFaollikSnapshot);
  const [userCoins, setUserCoins] = useState(16);
  const currentCoins = faollikSnapshot.holat?.tanga !== undefined ? Number(faollikSnapshot.holat.tanga) : userCoins;
  const [userData, setUserData] = useState(initialUserData);
  const [appTheme, setAppTheme] = useState(getInitialAppTheme);

  useEffect(() => {
    void preloadFaollikForSession();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname === '/quiz') {
        setQuizPath(true);
        activityPathRef.current = null;
        setActivityPath(null);
        setActiveTab('home');
        setHomeSubPage(null);
        return;
      }
      setQuizPath(false);
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
  const prevTabRef = useRef(activeTab);
  const homeEnterFromLeftRef = useRef(false);

  if (prevTabRef.current !== activeTab) {
    homeEnterFromLeftRef.current = prevTabRef.current === 'profile' && activeTab === 'home';
    prevTabRef.current = activeTab;
  }

  // Tab yoki sub-page almashganda scrollni eng tepaga qaytarish (bir sahifaning scrolli boshqasiga ta'sir qilmasligi uchun)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab, homeSubPage, profileSubPage, activityPath, quizPath]);

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
    setQuizPath(false);
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

  const navigateQuiz = () => {
    if (window.location.pathname !== '/quiz') {
      window.history.pushState(null, '', '/quiz');
    }
    setQuizPath(true);
    activityPathRef.current = null;
    setActivityPath(null);
    setActiveTab('home');
    setHomeSubPage(null);
  };

  const leaveQuiz = () => {
    if (window.location.pathname === '/quiz') {
      window.history.replaceState(null, '', '/home');
    }
    setQuizPath(false);
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
  const shouldHideBottomNav = isLessonOpen || quizPath;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex justify-center selection:bg-[#E8B84B] selection:text-[#0D1117]">
      {/* ── ASOSIY SMARTFON KONTEYNERI ── */}
      <div className="w-full max-w-[430px] min-h-screen bg-white relative shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:border-x border-[#E2E8F0] flex flex-col overflow-x-hidden">

        {/* APP — barcha sahifalar mounted bo'lib turadi, faqat ko'rinishi o'zgaradi */}
        <>
            <main ref={scrollContainerRef} className={`flex-1 ${shouldHideBottomNav ? 'pb-0' : 'pb-20'} bg-white relative overflow-y-auto`}>

              {/* HOME */}
              <div key={`home-${activeTab}`} style={{ display: activeTab === 'home' && !activityPath && !quizPath ? 'block' : 'none' }} className={`page-transition book-page${homeEnterFromLeftRef.current ? ' page-transition-back' : ''}`}>
                <HomePage
                  userData={userData}
                  onNavigateTab={handleTabChange}
                  activeSubPage={homeSubPage}
                  setActiveSubPage={setHomeSubPage}
                  userCoins={currentCoins}
                  setUserCoins={setUserCoins}
                  onNavigateActivity={navigateActivity}
                  onNavigateQuiz={navigateQuiz}
                  onNavigatePremium={() => {
                    setActiveTab('profile');
                    setProfileSubPage('premium');
                  }}
                />
              </div>

              {/* LESSONS */}
              <div key={`lessons-${activeTab}`} style={{ display: activeTab === 'lessons' && !activityPath && !quizPath ? 'block' : 'none' }} className="page-transition book-page">
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
              <div key={`resources-${activeTab}`} style={{ display: !activityPath && !quizPath && (activeTab === 'resources' || activeTab === 'more') ? 'block' : 'none' }} className="page-transition book-page">
                <ResourcesPage />
              </div>

              {/* PROFILE */}
              <div key={`profile-${activeTab}`} style={{ display: activeTab === 'profile' && !activityPath && !quizPath ? 'block' : 'none' }} className="page-transition book-page">
                <ProfilePage
                  userData={userData}
                  onUpdateUserData={setUserData}
                  currentPage={profileSubPage}
                  setCurrentPage={setProfileSubPage}
                  appTheme={appTheme}
                  onAppThemeChange={setAppTheme}
                  onLogout={onLogout}
                />
              </div>

              {activityPath && !quizPath && (
                <FaollikPage
                  route={activityPath}
                  onNavigate={navigateActivity}
                  onContinueReading={continueReading}
                />
              )}

              {quizPath && <QuizPage onNavigateHome={leaveQuiz} />}

            </main>

            {!shouldHideBottomNav && (
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            )}
        </>
      </div>
    </div>
  );
}
