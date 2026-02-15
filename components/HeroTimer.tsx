import React, { useEffect, useState } from 'react';
import { EventType, Language } from '../types';
import { Moon, Sun, CloudSun, Star, Clock, CalendarDays } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { calculateTimeRemaining } from '../utils/timeUtils';

interface HeroTimerProps {
  nextEvent: { type: EventType; time: Date } | null;
  language: Language;
  isPreRamadan: boolean;
  ramadanStart: Date | null;
}

const HeroTimer: React.FC<HeroTimerProps> = ({ nextEvent, language, isPreRamadan, ramadanStart }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ramadanCountdown, setRamadanCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (isPreRamadan && ramadanStart) {
        const diff = ramadanStart.getTime() - now.getTime();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setRamadanCountdown({ days, hours, minutes, seconds });
        } else {
            setRamadanCountdown(null);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPreRamadan, ramadanStart]);

  const getTranslatedType = (type: EventType) => {
    switch (type) {
        case EventType.SEHRI: return isPreRamadan ? t.fajr_label : t.sehri;
        case EventType.DHUHR: return t.dhuhr;
        case EventType.ASR: return t.asr;
        case EventType.IFTAR: return isPreRamadan ? t.maghrib_label : t.iftar;
        case EventType.ISHA: return t.isha;
        default: return type;
    }
  };

  const getEventLabel = (type: EventType) => {
     return `${t.upcoming}: ${getTranslatedType(type)}`;
  };

  const getIcon = (type: EventType | undefined) => {
    switch (type) {
      case EventType.SEHRI: return <Sun className="w-4 h-4 text-amber-400" />;
      case EventType.IFTAR: return <Moon className="w-4 h-4 text-indigo-400" />;
      case EventType.ISHA: return <Star className="w-4 h-4 text-blue-400" />;
      case EventType.DHUHR:
      case EventType.ASR: return <CloudSun className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-lime-400" />;
    }
  };

  const dateString = language === 'bn'
    ? currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Pre-Ramadan Special UI
  if (isPreRamadan && ramadanCountdown) {
      return (
        <div className="relative w-full py-16 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -z-10 animate-pulse-slow pointer-events-none" />
          
          <div className="flex flex-col items-center gap-4 mb-8">
             <div className="p-3 bg-lime-500/10 rounded-2xl border border-lime-500/20">
                <CalendarDays className="w-8 h-8 text-lime-400" />
             </div>
             <h2 className="text-xl sm:text-2xl font-medium text-zinc-300 tracking-wider uppercase">
                {t.ramadan_begins_in}
             </h2>
          </div>

          <div className="grid grid-cols-4 gap-4 sm:gap-8 text-center font-mono text-white select-none">
             <div className="flex flex-col items-center">
                 <span className="text-4xl sm:text-6xl font-bold">{ramadanCountdown.days}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Days</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-4xl sm:text-6xl font-bold">{ramadanCountdown.hours}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Hours</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-4xl sm:text-6xl font-bold">{ramadanCountdown.minutes}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Mins</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-4xl sm:text-6xl font-bold text-lime-400">{ramadanCountdown.seconds}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Secs</span>
             </div>
          </div>
          
          <div className="mt-10 text-zinc-500 text-sm">
             {dateString}
          </div>
        </div>
      );
  }

  // Normal Clock UI
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return (
    <div className="relative w-full py-16 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow pointer-events-none" />

      {/* Date Display */}
      <div className="mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
         <h2 className="text-zinc-400 text-sm sm:text-base font-medium uppercase tracking-[0.2em]">
            {dateString}
         </h2>
      </div>

      {/* Digital Clock Display */}
      <div className="flex items-baseline space-x-2 sm:space-x-4 font-mono text-white select-none relative z-10">
        <div className="flex flex-col items-center">
          <span className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            {displayHours.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="text-4xl sm:text-7xl md:text-8xl font-bold text-zinc-600 -translate-y-4 sm:-translate-y-8 animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            {minutes.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex flex-col justify-end h-[60px] sm:h-[90px] md:h-[110px] ml-2 sm:ml-4">
           <span className="text-xl sm:text-3xl font-bold text-zinc-500 mb-1 sm:mb-2">{ampm}</span>
           <span className="text-xl sm:text-3xl font-bold text-lime-400">
              {seconds.toString().padStart(2, '0')}
           </span>
        </div>
      </div>

      {/* Next Event Pill */}
      {nextEvent && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-3 px-5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full backdrop-blur-md shadow-lg shadow-black/20 hover:border-lime-500/30 transition-colors">
            {getIcon(nextEvent.type)}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
                {getEventLabel(nextEvent.type)}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-sm font-bold text-white font-mono">
                {nextEvent.time.toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true})}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroTimer;