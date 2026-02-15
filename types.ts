export interface PrayerTime {
  date: string;
  sehri: string; // Fajr
  dhuhr: string;
  asr: string;
  iftar: string; // Maghrib
  isha: string;
  day: number;
}

export type Language = 'en' | 'bn';

export interface Dua {
  title: string;
  titleBn: string;
  arabic: string;
  transliteration: string;
  translation: string;
  translationBn: string;
}

export enum EventType {
  SEHRI = 'Sehri',
  DHUHR = 'Dhuhr',
  ASR = 'Asr',
  IFTAR = 'Iftar',
  ISHA = 'Isha',
  NONE = 'None'
}

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export type PrayerKey = 'sehri' | 'dhuhr' | 'asr' | 'iftar' | 'isha';

export interface NotificationSettings {
  sehri: boolean;
  dhuhr: boolean;
  asr: boolean;
  iftar: boolean;
  isha: boolean;
}