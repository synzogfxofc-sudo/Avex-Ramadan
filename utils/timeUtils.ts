import { EventType, PrayerTime, TimeRemaining } from '../types';

export const parseTime = (timeStr: string, baseDate: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getNextEvent = (schedule: PrayerTime[]): { type: EventType; time: Date; dayIndex: number } | null => {
  const now = new Date();
  
  // Look through today and tomorrow to find the very next event
  for (let i = 0; i < schedule.length; i++) {
    const day = schedule[i];
    const targetDate = new Date(); 
    // Ideally this should use day.date parsing, but keeping existing logic consistent:
    // We assume the schedule array starts from "Today" at index 0
    targetDate.setDate(targetDate.getDate() + i);

    // Map keys to types
    const events: { key: keyof PrayerTime, type: EventType }[] = [
      { key: 'sehri', type: EventType.SEHRI },
      { key: 'dhuhr', type: EventType.DHUHR },
      { key: 'asr', type: EventType.ASR },
      { key: 'iftar', type: EventType.IFTAR },
      { key: 'isha', type: EventType.ISHA },
    ];

    for (const event of events) {
      const timeStr = day[event.key] as string;
      const eventTime = parseTime(timeStr, targetDate);
      
      if (now < eventTime) {
        return { type: event.type, time: eventTime, dayIndex: i };
      }
    }
  }
  return null;
};

export const calculateTimeRemaining = (target: Date): TimeRemaining => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { hours, minutes, seconds, totalSeconds: Math.floor(diff / 1000) };
};

export const formatTimeDisplay = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '--:--';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};