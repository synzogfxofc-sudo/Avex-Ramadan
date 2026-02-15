import React, { useEffect, useState, useRef } from 'react';
import { generateRamadanSchedule, TRANSLATIONS } from './constants';
import { getNextEvent } from './utils/timeUtils';
import { EventType, PrayerTime, NotificationSettings, Language } from './types';
import DynamicIsland from './components/DynamicIsland';
import HeroTimer from './components/HeroTimer';
import Tracker from './components/Tracker';
import DuaSection from './components/DuaSection';
import AICompanion from './components/AICompanion';
import TimingsList from './components/TimingsList';
import DailyReflections from './components/DailyReflections';
import PrayerAlerts from './components/PrayerAlerts';
import QiblaFinder from './components/QiblaFinder';
import WelcomeScreen from './components/WelcomeScreen';
import TutorialOverlay, { TutorialStep } from './components/TutorialOverlay';
import AdminPanel from './components/AdminPanel';
import { Compass, Languages, Lock, MapPin, CalendarDays, Loader2, LogOut } from 'lucide-react';
import { 
  fetchGlobalSchedule, 
  fetchUserProfile, 
  updateGlobalSchedule, 
  updateUserProfile, 
  DEFAULT_USER_DATA, 
  UserData 
} from './services/supabaseClient';

const ESTIMATED_RAMADAN_START = new Date('2025-03-02T00:00:00');

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(true); // Initial loading state
  
  // Schedule state
  const [schedule, setSchedule] = useState<PrayerTime[]>([]);
  const [todayPrayers, setTodayPrayers] = useState<PrayerTime | undefined>(undefined);
  const [isCustomSchedule, setIsCustomSchedule] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  
  // Pre-Ramadan Logic
  const [isPreRamadan, setIsPreRamadan] = useState(false);
  const [ramadanStart, setRamadanStart] = useState<Date | null>(null);

  // User Data State
  const [nextEvent, setNextEvent] = useState<{ type: EventType; time: Date; dayIndex: number } | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_USER_DATA.notificationSettings);
  
  // UI State
  const [triggerAlert, setTriggerAlert] = useState(false);
  const [showQibla, setShowQibla] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // --- Initialization & Data Fetching ---

  const initApp = async () => {
    // 1. Load Language
    const savedLang = localStorage.getItem('lumina_language') as Language;
    if (savedLang) setLanguage(savedLang);

    // 2. Fetch Global Schedule (Supabase)
    setIsLoadingSchedule(true);
    const globalSchedule = await fetchGlobalSchedule();
    
    if (globalSchedule) {
      setSchedule(globalSchedule);
      setIsCustomSchedule(true);
      setIsLoadingSchedule(false);
    } else {
      // Fallback to API
      await fetchDhakaTimes();
    }

    // 3. Check for existing session (User Login)
    const storedUser = localStorage.getItem('lumina_username');
    if (storedUser) {
      await handleLogin(storedUser);
    } else {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const fetchDhakaTimes = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const response = await fetch(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=Dhaka&country=Bangladesh&method=1&school=1`);
      const data = await response.json();
      
      if (data.code === 200 && Array.isArray(data.data)) {
        const formatted: PrayerTime[] = data.data.map((d: any, index: number) => ({
          day: index + 1,
          date: d.date.readable,
          sehri: d.timings.Fajr.split(' ')[0],
          dhuhr: d.timings.Dhuhr.split(' ')[0],
          asr: d.timings.Asr.split(' ')[0],
          iftar: d.timings.Maghrib.split(' ')[0],
          isha: d.timings.Isha.split(' ')[0]
        }));
        setSchedule(formatted);
        setIsCustomSchedule(false);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (e) {
      console.error("Failed to fetch Dhaka times, falling back to generator", e);
      setSchedule(generateRamadanSchedule());
      setIsCustomSchedule(false);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const fetchLiveToday = async () => {
      try {
        const date = new Date();
        const strDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`; 
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${strDate}?city=Dhaka&country=Bangladesh&method=1&school=1`);
        const data = await response.json();
        if(data.code === 200) {
            const t = data.data.timings;
            setTodayPrayers({
                day: 0, 
                date: data.data.date.readable,
                sehri: t.Fajr.split(' ')[0],
                dhuhr: t.Dhuhr.split(' ')[0],
                asr: t.Asr.split(' ')[0],
                iftar: t.Maghrib.split(' ')[0],
                isha: t.Isha.split(' ')[0]
            });
        }
      } catch(e) { console.error("Live today fetch failed", e); }
  };

  // --- Logic for Modes (Pre-Ramadan vs Ramadan) ---

  useEffect(() => {
      if (isCustomSchedule && schedule.length > 0) {
          const now = new Date();
          const firstDay = new Date(schedule[0].date);
          const nowMidnight = new Date(now.setHours(0,0,0,0));
          const firstDayMidnight = new Date(firstDay.setHours(0,0,0,0));

          if (nowMidnight < firstDayMidnight) {
              setIsPreRamadan(true);
              setRamadanStart(firstDay);
              fetchLiveToday();
          } else {
              setIsPreRamadan(false);
              setRamadanStart(null);
              
              const todayStr = new Date().toDateString();
              const found = schedule.find(d => {
                  const sDate = new Date(d.date);
                  return !isNaN(sDate.getTime()) && sDate.toDateString() === todayStr;
              });
              if (found) setTodayPrayers(found);
              else fetchLiveToday(); 
          }
      } else {
          // Live Mode
          const now = new Date();
          const isPastEstimatedStart = now >= ESTIMATED_RAMADAN_START;
          
          if (isPastEstimatedStart) {
             setIsPreRamadan(true);
             setRamadanStart(null); 
          } else {
             setIsPreRamadan(true);
             setRamadanStart(ESTIMATED_RAMADAN_START);
          }

          if (schedule.length > 0) {
              const todayDate = now.getDate();
              const found = schedule.find(d => d.day === todayDate);
              if (found) setTodayPrayers(found);
          }
      }
  }, [schedule, isCustomSchedule]);


  // --- User Actions & Persistence ---

  const handleLogin = async (name: string) => {
    setIsLoggingIn(true);
    try {
      const profile = await fetchUserProfile(name);
      
      if (profile) {
        // Restore existing user data
        setCompletedDays(profile.completedDays || []);
        setNotificationSettings(profile.notificationSettings || DEFAULT_USER_DATA.notificationSettings);
        if (!profile.tutorialCompleted) {
           setTimeout(() => setShowTutorial(true), 1000);
        }
      } else {
        // Create new user (or just use defaults locally first, will save on first interaction)
        setCompletedDays([]);
        setNotificationSettings(DEFAULT_USER_DATA.notificationSettings);
        // Save initial profile
        await updateUserProfile(name, DEFAULT_USER_DATA);
        setTimeout(() => setShowTutorial(true), 1000);
      }
      
      setUserName(name);
      localStorage.setItem('lumina_username', name);
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setUserName(null);
    localStorage.removeItem('lumina_username');
  };

  const syncUserData = async (updates: Partial<UserData>) => {
    if (!userName) return;
    
    // Construct current full state
    const currentData: UserData = {
      completedDays,
      notificationSettings,
      tutorialCompleted: !showTutorial // Approximation
    };
    
    const newData = { ...currentData, ...updates };
    await updateUserProfile(userName, newData);
  };

  const toggleDay = (day: number) => {
    if (!userName) return;
    const newDays = completedDays.includes(day) 
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
      
    setCompletedDays(newDays);
    syncUserData({ completedDays: newDays });
  };

  const updateSettings = (newSettings: NotificationSettings) => {
    if (!userName) return;
    setNotificationSettings(newSettings);
    syncUserData({ notificationSettings: newSettings });
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    syncUserData({ tutorialCompleted: true });
  };

  const handleUpdateSchedule = async (newSchedule: PrayerTime[]) => {
    if (newSchedule.length === 0) {
      // Revert to API -> We basically update global schedule to be empty or null?
      // For now, let's just clear our local view and maybe clear DB or leave it?
      // Assuming clearing DB allows falling back to API.
      await updateGlobalSchedule([]); // Save empty array
      fetchDhakaTimes();
    } else {
      setSchedule(newSchedule);
      setIsCustomSchedule(true);
      // Persist to Supabase
      await updateGlobalSchedule(newSchedule);
    }
  };

  // --- Other Handlers ---

  const toggleLanguage = (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem('lumina_language', lang);
  };

  const handleAdminLogin = () => {
    setShowAdmin(true);
    setIsAdminBypass(true);
  };

  // Next Event Logic
  useEffect(() => {
    if (!userName || !todayPrayers) return; 
    const listToScan = schedule.length > 0 ? schedule : [todayPrayers];
    const event = getNextEvent(listToScan);
    setNextEvent(event);
    
    if (event) {
      const now = new Date();
      const diff = event.time.getTime() - now.getTime();
      if (diff >= 0 && diff < 1000 && !triggerAlert) {
        setTriggerAlert(true);
      }
    }
  }, [schedule, todayPrayers, triggerAlert, userName]);

  const t = TRANSLATIONS[language];
  
  // Tutorial Data
  const tutorialSteps: TutorialStep[] = [
    { targetId: 'dynamic-island', title: t.smart_island, description: t.smart_island_desc },
    { targetId: 'qibla-btn', title: t.qibla, description: t.qibla_desc },
    { targetId: 'hero-timer', title: t.timer, description: t.timer_desc },
    { targetId: 'schedule-list', title: t.schedule, description: t.schedule_desc },
    { targetId: 'prayer-alerts', title: t.alerts, description: t.alerts_desc },
    { targetId: 'tracker-section', title: t.tracker, description: t.tracker_desc },
    { targetId: 'ai-companion', title: t.ai, description: t.ai_desc },
    { targetId: 'daily-reflection', title: t.reflection, description: t.reflection_desc },
    { targetId: 'dua-section', title: t.duas, description: t.duas_desc }
  ];

  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => {
          setShowAdmin(false);
          setIsAdminBypass(false);
        }}
        currentSchedule={schedule}
        onUpdateSchedule={handleUpdateSchedule}
        bypassAuth={isAdminBypass}
      />
      
      {!userName ? (
        <WelcomeScreen 
          onComplete={handleLogin} 
          onAdminLogin={handleAdminLogin}
          language={language} 
          onLanguageChange={toggleLanguage} 
        />
      ) : (
        <div className="min-h-screen bg-black text-white selection:bg-lime-500/30 relative animate-in fade-in duration-700">
          <DynamicIsland 
            nextEvent={nextEvent} 
            triggerAlert={triggerAlert} 
            todaySchedule={todayPrayers}
            onAlertDismiss={() => setTriggerAlert(false)}
            language={language}
            isPreRamadan={isPreRamadan}
          />
          
          {/* Controls Container */}
          <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
            <button 
              onClick={() => toggleLanguage(language === 'en' ? 'bn' : 'en')}
              className="p-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-xl"
            >
              <Languages className="w-5 h-5" />
            </button>

            <button 
              id="qibla-btn"
              onClick={() => setShowQibla(true)}
              className="p-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full text-zinc-400 hover:text-lime-400 hover:border-lime-500/50 transition-all shadow-xl"
              title="Qibla Finder"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          <QiblaFinder isOpen={showQibla} onClose={() => setShowQibla(false)} language={language} />
          
          <TutorialOverlay 
            steps={tutorialSteps} 
            isActive={showTutorial} 
            onComplete={completeTutorial}
            onSkip={completeTutorial}
          />

          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="flex flex-col items-center gap-2 mb-8 animate-in slide-in-from-top-4 duration-1000 delay-300">
              <span className="text-zinc-500 text-sm font-medium">Assalamu Alaikum, <span className="text-white">{userName}</span></span>
              
              <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 ${isCustomSchedule ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {isCustomSchedule ? (
                  <><CalendarDays className="w-3 h-3" /> Custom Ramadan Calendar</>
                ) : (
                  <><MapPin className="w-3 h-3" /> Dhaka, BD (Live)</>
                )}
              </div>
            </div>

            {isLoadingSchedule ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm animate-pulse">Syncing Time...</p>
               </div>
            ) : (
              <>
                <div id="hero-timer">
                  <HeroTimer 
                    nextEvent={nextEvent} 
                    language={language} 
                    isPreRamadan={isPreRamadan}
                    ramadanStart={ramadanStart}
                  />
                </div>
                
                <div id="schedule-list">
                  <TimingsList 
                    schedule={schedule} 
                    today={todayPrayers} 
                    language={language} 
                    isPreRamadan={isPreRamadan}
                  />
                </div>

                <div id="prayer-alerts">
                  <PrayerAlerts 
                    today={todayPrayers} 
                    settings={notificationSettings} 
                    onUpdateSettings={updateSettings} 
                    language={language}
                  />
                </div>
                
                {!isPreRamadan && (
                  <div id="tracker-section" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Tracker completedDays={completedDays} onToggleDay={toggleDay} language={language} />
                  </div>
                )}
                
                <div id="ai-companion">
                  <AICompanion language={language} />
                </div>
                
                <div id="daily-reflection">
                  <DailyReflections language={language} />
                </div>
                
                <div id="dua-section">
                  <DuaSection language={language} />
                </div>
              </>
            )}

            <footer className="mt-20 text-center text-zinc-600 text-sm pb-8">
              <p>© 2025 Avex Ramadan. {t.design}.</p>
              <div className="mt-4 flex flex-col gap-2 items-center">
                 <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                  <LogOut className="w-3 h-3" /> {t.switch_user}
                </button>
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowTutorial(true)} className="text-xs text-lime-500 hover:text-lime-400 transition-colors">
                    {t.replay_tutorial}
                  </button>
                  <button onClick={() => setShowAdmin(true)} className="text-zinc-700 hover:text-zinc-400 transition-colors" title="Admin Panel">
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </footer>
          </main>
        </div>
      )}
    </>
  );
};

export default App;