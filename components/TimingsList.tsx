import React, { useState } from 'react';
import { PrayerTime, Language } from '../types';
import { Calendar, Sunrise, Sunset, ChevronDown, ChevronUp } from 'lucide-react';
import { formatTo12Hour } from '../utils/timeUtils';
import { TRANSLATIONS } from '../constants';

interface TimingsListProps {
  schedule: PrayerTime[];
  today: PrayerTime | undefined;
  language: Language;
  isPreRamadan: boolean;
}

const TimingsList: React.FC<TimingsListProps> = ({ schedule, today, language, isPreRamadan }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = TRANSLATIONS[language];

  if (!today) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-12">
      <div className="flex items-center gap-2 mb-6 px-4 sm:px-0">
        <Calendar className="w-5 h-5 text-lime-400" />
        <h3 className="text-lg font-semibold text-white">{t.prayer_schedule}</h3>
      </div>

      {/* Today's Card */}
      <div className="mx-4 sm:mx-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden group shadow-2xl shadow-black/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-lime-500/10 transition-all duration-700 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
             <div className="flex items-center gap-2 mb-2">
               <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
               <span className="text-lime-400 font-medium text-xs tracking-widest uppercase">{t.today_schedule}</span>
             </div>
             <h4 className="text-3xl font-bold text-white mb-1">
                 {language === 'bn' 
                    ? new Date(today.date).toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'long'})
                    : today.date
                 }
             </h4>
             {!isPreRamadan && <span className="text-zinc-500">{t.day} {today.day}</span>}
             {isPreRamadan && <span className="text-zinc-500">{t.daily_prayers}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="flex-1 sm:w-40 bg-zinc-800/30 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/50 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <Sunrise className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-0.5">{isPreRamadan ? t.fajr_label : t.sehri}</span>
                  <span className="text-xl font-bold text-white font-mono">{formatTo12Hour(today.sehri)}</span>
                </div>
             </div>

             <div className="flex-1 sm:w-40 bg-zinc-800/30 backdrop-blur-md rounded-2xl p-4 border border-zinc-700/50 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Sunset className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-0.5">{isPreRamadan ? t.maghrib_label : t.iftar}</span>
                  <span className="text-xl font-bold text-white font-mono">{formatTo12Hour(today.iftar)}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Schedule List - Only show if schedule has data and we probably aren't in strict pre-ramadan mode where list might be confusing? 
          Actually, showing the upcoming schedule is fine, but maybe collapsed by default.
      */}
      {schedule.length > 0 && (
        <div className="mx-4 sm:mx-0 bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 p-5 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-1 pl-2">{t.day}</div>
            <div className="col-span-1">Date</div>
            <div className="text-center">{t.sehri}</div>
            <div className="text-center">{t.iftar}</div>
            </div>

            {/* Scrollable Content */}
            <div className={`overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-[240px]'}`}>
            {schedule.map((day, idx) => (
                <div 
                key={idx}
                className={`grid grid-cols-4 p-4 sm:p-5 items-center border-b border-zinc-800/50 hover:bg-white/5 transition-colors group ${idx === 0 ? 'bg-lime-500/5' : ''}`}
                >
                <div className="col-span-1 pl-2 flex items-center gap-3">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${idx === 0 ? 'bg-lime-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'}`}>
                    {day.day}
                    </span>
                </div>
                <div className={`col-span-1 text-xs sm:text-sm ${idx === 0 ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                    {language === 'bn' 
                        ? new Date(day.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short'})
                        : day.date.split(' ').slice(0, 3).join(' ')
                    }
                </div>
                <div className={`text-center font-mono text-sm ${idx === 0 ? 'text-white' : 'text-zinc-400'}`}>
                    {formatTo12Hour(day.sehri)}
                </div>
                <div className={`text-center font-mono text-sm ${idx === 0 ? 'text-white' : 'text-zinc-400'}`}>
                    {formatTo12Hour(day.iftar)}
                </div>
                </div>
            ))}
            </div>

            {/* Footer / Toggle */}
            <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors uppercase tracking-widest bg-zinc-900/50"
            >
            {isExpanded ? (
                <>
                {t.show_less} <ChevronUp className="w-4 h-4" />
                </>
            ) : (
                <>
                {t.view_full} <ChevronDown className="w-4 h-4" />
                </>
            )}
            </button>
        </div>
      )}
    </div>
  );
};

export default TimingsList;