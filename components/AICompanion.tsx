import React, { useState } from 'react';
import { getSpiritualInsight } from '../services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AICompanionProps {
  language: Language;
}

const AICompanion: React.FC<AICompanionProps> = ({ language }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const handleGetInsight = async () => {
    setLoading(true);
    const text = await getSpiritualInsight(language);
    setInsight(text);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-12">
       <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 sm:p-10">
         <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
           <div className="flex-1">
             <div className="flex items-center gap-2 mb-3">
               <Sparkles className="w-5 h-5 text-lime-400" />
               <h3 className="text-lg font-semibold text-white">{t.ai_companion}</h3>
             </div>
             
             {insight ? (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <p className="text-xl sm:text-2xl font-light text-zinc-100 leading-relaxed italic">
                   "{insight}"
                 </p>
               </div>
             ) : (
               <p className="text-zinc-400 text-lg">
                 {t.ai_placeholder}
               </p>
             )}
           </div>

           <button
             onClick={handleGetInsight}
             disabled={loading}
             className="shrink-0 flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all border border-zinc-700 hover:border-lime-500/50 group"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:text-lime-400'}`} />
             <span>{loading ? t.reflecting : insight ? t.generate : t.generate}</span>
           </button>
         </div>
       </div>
    </div>
  );
};

export default AICompanion;