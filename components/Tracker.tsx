import React from 'react';
import { Check } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface TrackerProps {
  completedDays: number[];
  onToggleDay: (day: number) => void;
  language: Language;
}

const Tracker: React.FC<TrackerProps> = ({ completedDays, onToggleDay, language }) => {
  const t = TRANSLATIONS[language];
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-zinc-800/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">{t.days_of_fasting}</h2>
        <div className="text-zinc-400 text-sm">
          {completedDays.length} / 30 {t.completed}
        </div>
      </div>
      
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3 sm:gap-4">
        {Array.from({ length: 30 }).map((_, idx) => {
          const day = idx + 1;
          const isCompleted = completedDays.includes(day);
          
          return (
            <button
              key={day}
              onClick={() => onToggleDay(day)}
              className={`
                relative group flex flex-col items-center justify-center aspect-square rounded-2xl
                transition-all duration-300 border
                ${isCompleted 
                  ? 'bg-lime-500 border-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.3)] scale-100' 
                  : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-lime-500/30 hover:scale-105'
                }
              `}
            >
              <span className={`text-xs font-medium mb-1 transition-colors ${isCompleted ? 'text-black' : 'text-zinc-400'}`}>
                {t.day}
              </span>
              <span className={`text-xl font-bold transition-colors ${isCompleted ? 'text-black' : 'text-white'}`}>
                {day}
              </span>
              
              {isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center bg-lime-500 rounded-2xl animate-[blob_0.3s_ease-out]">
                   <Check className="w-8 h-8 text-black" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tracker;