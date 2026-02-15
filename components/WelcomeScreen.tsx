import React, { useState } from 'react';
import { ArrowRight, Sparkles, Moon, Languages, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface WelcomeScreenProps {
  onComplete: (name: string) => Promise<void>;
  onAdminLogin: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete, onAdminLogin, language, onLanguageChange }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (trimmedName === '@admin12') {
      onAdminLogin();
      setName('');
      return;
    }

    if (trimmedName) {
      setIsLoading(true);
      await onComplete(trimmedName);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 z-50 overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:border-lime-500/50 transition-all"
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">{language === 'en' ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/50">
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-4 bg-zinc-800/50 rounded-full mb-6 border border-zinc-700/50 shadow-inner">
               <Moon className="w-8 h-8 text-lime-400 fill-lime-400/20" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              {t.welcome}
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative group">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.enter_name}
                className="w-full bg-zinc-900/80 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 transition-all text-center text-lg font-medium"
                autoFocus
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-500/20 to-transparent opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 blur-xl -z-10" />
            </div>

            <button 
              type="submit"
              disabled={!name.trim() || isLoading}
              className="mt-2 w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{t.begin}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <Sparkles className="w-3 h-3" />
            <span>{t.design}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;