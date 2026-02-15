import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { PrayerTime, NotificationSettings, PrayerKey, Language } from '../types';
import { formatTo12Hour } from '../utils/timeUtils';
import { TRANSLATIONS } from '../constants';

interface PrayerAlertsProps {
  today: PrayerTime | undefined;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  language: Language;
}

const PrayerAlerts: React.FC<PrayerAlertsProps> = ({ today, settings, onUpdateSettings, language }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const togglePrayer = (key: PrayerKey) => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const prayers: { key: PrayerKey; label: string; time: string }[] = [
    { key: 'sehri', label: t.fajr_label, time: today?.sehri ? formatTo12Hour(today.sehri) : '--:--' },
    { key: 'dhuhr', label: t.dhuhr, time: today?.dhuhr ? formatTo12Hour(today.dhuhr) : '--:--' },
    { key: 'asr', label: t.asr, time: today?.asr ? formatTo12Hour(today.asr) : '--:--' },
    { key: 'iftar', label: t.maghrib_label, time: today?.iftar ? formatTo12Hour(today.iftar) : '--:--' },
    { key: 'isha', label: t.isha, time: today?.isha ? formatTo12Hour(today.isha) : '--:--' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-0">
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-lime-400" />
              <h3 className="text-lg font-semibold text-white">{t.prayer_alerts}</h3>
            </div>
            <p className="text-sm text-zinc-400">
              {t.get_notified}
            </p>
          </div>
          
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black text-sm font-semibold rounded-full transition-colors flex items-center gap-2"
            >
              {t.enable_notif}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {prayers.map((prayer) => {
            const isActive = settings[prayer.key];
            
            return (
              <button
                key={prayer.key}
                onClick={() => togglePrayer(prayer.key)}
                className={`
                  relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 group
                  ${isActive 
                    ? 'bg-zinc-800/80 border-lime-500/50 shadow-[0_0_15px_-3px_rgba(163,230,53,0.15)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }
                `}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-lime-400' : 'text-zinc-500'}`}>
                    {prayer.label}
                  </span>
                  <div className={`
                    w-4 h-4 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-lime-500' : 'bg-zinc-800'}
                  `}>
                    {isActive && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                  </div>
                </div>
                
                <span className={`text-xl font-mono font-bold ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                  {prayer.time}
                </span>

                {isActive && (
                   <div className="absolute inset-0 border-2 border-lime-500/20 rounded-2xl pointer-events-none animate-pulse-slow"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrayerAlerts;