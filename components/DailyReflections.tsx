import React, { useEffect, useState } from 'react';
import { getSpiritualInsight } from '../services/geminiService';
import { Quote, RotateCcw } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DailyReflectionsProps {
  language: Language;
}

const DailyReflections: React.FC<DailyReflectionsProps> = ({ language }) => {
  const [reflection, setReflection] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const t = TRANSLATIONS[language];

  const fetchReflection = async (force: boolean = false) => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`lumina_daily_reflection_${language}`);
    
    // Use cached reflection if available for the specific language
    if (!force && stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                setReflection(parsed.text);
                setLoading(false);
                return;
            }
        } catch (e) {
            // If parse fails, ignore and fetch new
        }
    }

    setLoading(true);
    const text = await getSpiritualInsight(language);
    setReflection(text);
    localStorage.setItem(`lumina_daily_reflection_${language}`, JSON.stringify({ date: today, text }));
    setLoading(false);
  };

  useEffect(() => {
    fetchReflection();
  }, [language]); // Refetch if language changes

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4 sm:px-0">
        <div className="relative group">
            {/* Decorative background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center backdrop-blur-sm">
                <div className="mb-6 p-3 bg-lime-500/10 rounded-full text-lime-400">
                    <Quote className="w-6 h-6 fill-current" />
                </div>

                <div className="min-h-[100px] flex items-center justify-center w-full">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 text-zinc-500 animate-pulse">
                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-lime-500 rounded-full animate-spin"/>
                            <span className="text-sm tracking-wide">{t.reflecting}</span>
                        </div>
                    ) : (
                        <blockquote className="text-xl sm:text-2xl font-serif text-zinc-100 leading-relaxed max-w-2xl mx-auto italic">
                            "{reflection}"
                        </blockquote>
                    )}
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-zinc-800 w-full justify-center">
                     <button 
                        onClick={() => fetchReflection(true)}
                        className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider group/btn"
                     >
                        <RotateCcw className="w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500" />
                        {t.refresh}
                     </button>
                     <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                     <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                        {t.daily_wisdom}
                     </span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DailyReflections;