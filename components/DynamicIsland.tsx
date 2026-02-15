import React, { useEffect, useState, useRef } from 'react';
import { EventType, PrayerTime, Language } from '../types';
import { calculateTimeRemaining, formatTo12Hour } from '../utils/timeUtils';
import { TRANSLATIONS } from '../constants';
import { Sunrise, Sunset, BellRing, Calendar, Sun, Moon } from 'lucide-react';

interface DynamicIslandProps {
  nextEvent: { type: EventType; time: Date } | null;
  triggerAlert: boolean;
  todaySchedule: PrayerTime | undefined;
  onAlertDismiss: () => void;
  language: Language;
  isPreRamadan: boolean;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ nextEvent, triggerAlert, todaySchedule, onAlertDismiss, language, isPreRamadan }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remaining, setRemaining] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);
  
  const t = TRANSLATIONS[language];

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (nextEvent) {
        const r = calculateTimeRemaining(nextEvent.time);
        setRemaining(`${r.hours.toString().padStart(2, '0')}:${r.minutes.toString().padStart(2, '0')}:${r.seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  // Handle Alert Trigger
  useEffect(() => {
    if (triggerAlert) {
      setIsAlerting(true);
      setExpanded(true);
      playAlertSound();
      
      const soundTimeout = setTimeout(() => {
        stopAlertSound();
      }, 5000);

      return () => {
        clearTimeout(soundTimeout);
        stopAlertSound();
      };
    }
  }, [triggerAlert]);

  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      
      oscillatorRef.current = osc;
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const stopAlertSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
  };

  const handleInteraction = () => {
    if (isAlerting) {
      stopAlertSound();
      setIsAlerting(false);
      setExpanded(false);
      onAlertDismiss();
    } else {
      setExpanded(!expanded);
    }
  };

  // Helper to translate event type
  const getTranslatedType = (type: EventType | undefined) => {
      if (!type) return '';
      switch (type) {
          case EventType.SEHRI: return isPreRamadan ? t.fajr_label : t.sehri;
          case EventType.DHUHR: return t.dhuhr;
          case EventType.ASR: return t.asr;
          case EventType.IFTAR: return isPreRamadan ? t.maghrib_label : t.iftar;
          case EventType.ISHA: return t.isha;
          default: return type;
      }
  };

  const getIcon = (type: EventType | undefined) => {
    switch (type) {
      case EventType.SEHRI: return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case EventType.IFTAR: return <Sunset className="w-3.5 h-3.5 text-indigo-400" />;
      case EventType.DHUHR: return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
      case EventType.ASR: return <Sun className="w-3.5 h-3.5 text-orange-400" />;
      case EventType.ISHA: return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      default: return <div className="w-2 h-2 rounded-full bg-lime-500" />;
    }
  };
  
  const expandedHeight = isAlerting ? 'h-[160px]' : 'h-auto min-h-[280px]';
  const expandedWidth = 'w-[340px]';
  
  // Format Date for Bengali if needed
  const formattedDate = language === 'bn' 
    ? currentTime.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'short' })
    : currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

  return (
    <div id="dynamic-island" className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div 
        className={`
          pointer-events-auto cursor-pointer
          bg-black/90 backdrop-blur-xl border border-zinc-800 shadow-2xl 
          rounded-[2.5rem] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          flex flex-col items-center overflow-hidden
          ${isAlerting ? 'shadow-lime-500/40 border-lime-500/50 animate-pulse-slow' : 'shadow-black/50 hover:border-zinc-700'}
          ${expanded ? `${expandedWidth} ${expandedHeight}` : 'w-[220px] h-[44px] hover:scale-[1.02]'}
        `}
        onClick={handleInteraction}
      >
        {/* Collapsed State */}
        <div 
          className={`
            absolute top-0 w-full h-[44px] flex items-center justify-between px-6 
            transition-all duration-300 delay-100
            ${expanded ? 'opacity-0 translate-y-[-10px] pointer-events-none' : 'opacity-100 translate-y-0'}
          `}
        >
          <div className="flex items-center gap-2">
            {getIcon(nextEvent?.type)}
            <span className="text-[11px] font-semibold text-zinc-300 tracking-wider uppercase">
              {getTranslatedType(nextEvent?.type) || 'AVEX'}
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-white/90">
             {remaining || currentTime.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true})}
          </span>
        </div>

        {/* Expanded Content */}
        <div 
          className={`
            w-full h-full flex flex-col p-6
            transition-all duration-500 ease-out
            ${expanded ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-[10px] pointer-events-none'}
          `}
        >
           {isAlerting ? (
             <div className="flex flex-col items-center justify-center h-full space-y-3">
               <div className="p-3 bg-lime-500/20 rounded-full animate-bounce">
                  <BellRing className="w-8 h-8 text-lime-400" />
               </div>
               <div className="text-center">
                  <div className="text-lime-400 text-xl font-bold tracking-tight">
                    {t.its_time} {getTranslatedType(nextEvent?.type)}
                  </div>
                  <div className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">
                    {t.dismiss}
                  </div>
               </div>
             </div>
           ) : (
             <div className="flex flex-col w-full h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                   <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-semibold text-white">{t.today_schedule}</span>
                   </div>
                   <span className="text-xs text-zinc-500 font-mono">
                      {formattedDate}
                   </span>
                </div>

                {/* Schedule List */}
                <div className="flex flex-col gap-2 flex-grow">
                   {todaySchedule ? (
                      [
                        { label: isPreRamadan ? t.fajr_label : t.sehri, time: todaySchedule.sehri, type: EventType.SEHRI },
                        { label: t.dhuhr, time: todaySchedule.dhuhr, type: EventType.DHUHR },
                        { label: t.asr, time: todaySchedule.asr, type: EventType.ASR },
                        { label: isPreRamadan ? t.maghrib_label : t.iftar, time: todaySchedule.iftar, type: EventType.IFTAR },
                        { label: t.isha, time: todaySchedule.isha, type: EventType.ISHA },
                      ].map((item, idx) => {
                         const isNext = nextEvent?.type === item.type;
                         return (
                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${isNext ? 'bg-lime-500/10 border border-lime-500/20' : 'hover:bg-zinc-800/50'}`}>
                               <div className="flex items-center gap-3">
                                  {getIcon(item.type)}
                                  <span className={`text-xs font-medium ${isNext ? 'text-lime-400' : 'text-zinc-400'}`}>
                                    {item.label}
                                  </span>
                               </div>
                               <span className={`text-xs font-mono font-bold ${isNext ? 'text-white' : 'text-zinc-500'}`}>
                                 {formatTo12Hour(item.time)}
                               </span>
                            </div>
                         )
                      })
                   ) : (
                     <p className="text-center text-zinc-500 text-xs">{t.loading}</p>
                   )}
                </div>
                
                {/* Countdown Footer */}
                 <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.next_prayer_in}</span>
                    <span className="text-sm font-mono font-bold text-white">
                      {remaining || '--:--:--'}
                    </span>
                 </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DynamicIsland;