import React, { useState } from 'react';
import { DAILY_DUAS, TRANSLATIONS } from '../constants';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Language } from '../types';

interface DuaSectionProps {
  language: Language;
}

const DuaSection: React.FC<DuaSectionProps> = ({ language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = TRANSLATIONS[language];

  const nextDua = () => setCurrentIndex((prev) => (prev + 1) % DAILY_DUAS.length);
  const prevDua = () => setCurrentIndex((prev) => (prev - 1 + DAILY_DUAS.length) % DAILY_DUAS.length);

  const currentDua = DAILY_DUAS[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4 sm:px-0">
      <div className="flex items-center justify-center gap-2 mb-8 text-zinc-400">
        <BookOpen className="w-5 h-5" />
        <span className="uppercase tracking-widest text-sm font-medium">{t.daily_prayers}</span>
      </div>

      <div className="relative bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-sm">
        <div className="absolute top-1/2 left-4 -translate-y-1/2">
          <button onClick={prevDua} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
          <button onClick={nextDua} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-lime-400 font-medium mb-6 text-sm sm:text-base uppercase tracking-wider">
             {language === 'bn' ? currentDua.titleBn : currentDua.title}
          </h3>
          
          <p className="text-2xl sm:text-4xl font-bold text-white mb-6 font-serif leading-loose" style={{fontFamily: "'Amiri', serif"}}>
            {currentDua.arabic}
          </p>
          
          <p className="text-zinc-400 italic mb-4 text-lg">
            {currentDua.transliteration}
          </p>
          
          <p className="text-zinc-300 font-light">
            "{language === 'bn' ? currentDua.translationBn : currentDua.translation}"
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {DAILY_DUAS.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-lime-500 w-6' : 'bg-zinc-700'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuaSection;