import { Dua, PrayerTime, Language } from './types';

// Generating a mock 30-day schedule relative to a fixed start for demonstration
export const generateRamadanSchedule = (): PrayerTime[] => {
  const schedule: PrayerTime[] = [];
  const startDate = new Date();
  
  // Set start of Ramadan to today for demo purposes
  startDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Mock times
    const sehriMinute = 30 - (i % 15);
    const iftarMinute = 30 + (i % 15);
    
    const sehri = `04:${sehriMinute.toString().padStart(2, '0')}`;
    const dhuhr = `13:${(15 + (i % 5)).toString().padStart(2, '0')}`;
    const asr = `16:${(30 + (i % 5)).toString().padStart(2, '0')}`;
    const iftar = `18:${iftarMinute.toString().padStart(2, '0')}`;
    const isha = `20:${(15 + (i % 5)).toString().padStart(2, '0')}`;

    schedule.push({
      day: i + 1,
      date: date.toDateString(),
      sehri,
      dhuhr,
      asr,
      iftar,
      isha
    });
  }
  return schedule;
};

export const DAILY_DUAS: Dua[] = [
  {
    title: "Dua for Fasting (Sehri)",
    titleBn: "রোজার নিয়ত (সেহরি)",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    transliteration: "Wa bisawmi ghadinn nawaiytu min shahri ramadan",
    translation: "I intend to keep the fast for tomorrow in the month of Ramadan.",
    translationBn: "আমি আগামীকাল পবিত্র রমজান মাসের রোজা রাখার নিয়ত করলাম।"
  },
  {
    title: "Dua for Breaking Fast (Iftar)",
    titleBn: "ইফতারের দোয়া",
    arabic: "اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ",
    transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizq-ika -aftartu",
    translation: "O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance.",
    translationBn: "হে আল্লাহ! আমি তোমারই সন্তুষ্টির জন্য রোজা রেখেছি, তোমার ওপর ঈমান এনেছি, তোমার ওপর ভরসা করেছি এবং তোমারই দেওয়া রিজিক দিয়ে ইফতার করছি।"
  },
  {
    title: "Dua for the First 10 Days (Mercy)",
    titleBn: "প্রথম ১০ দিনের দোয়া (রহমত)",
    arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ",
    transliteration: "Rabbighfir warham wa anta khairur raahimeen",
    translation: "O My Lord, forgive me and have mercy on me, You are the best of the Merciful.",
    translationBn: "হে আমার রব! আমাকে ক্ষমা করুন এবং আমার প্রতি রহমত বর্ষণ করুন। আপনিই তো সর্বশ্রেষ্ঠ দয়ালু।"
  }
];

export const TRANSLATIONS = {
  en: {
    welcome: "Welcome to Avex Ramadan",
    subtitle: "Your personalized Ramadan companion.",
    enter_name: "What should we call you?",
    begin: "Begin Journey",
    design: "Designed by Tahsin Rijon",
    smart_island: "Smart Island",
    smart_island_desc: "Your always-on companion. Shows the current prayer time and a live countdown.",
    qibla: "Qibla Finder",
    qibla_desc: "Find the direction of the Kaaba instantly.",
    timer: "Main Countdown",
    timer_desc: "A beautiful countdown to your next prayer or Iftar/Sehri event.",
    schedule: "Full Schedule",
    schedule_desc: "View the complete 30-day Ramadan timetable here.",
    alerts: "Prayer Notifications",
    alerts_desc: "Never miss a prayer. Toggle bells to receive alerts.",
    tracker: "Fasting Tracker",
    tracker_desc: "Track your progress! Tap a day to mark it as complete.",
    ai: "AI Companion",
    ai_desc: "Ask our AI companion for a personalized spiritual insight.",
    reflection: "Daily Wisdom",
    reflection_desc: "A new spiritual quote appears here every day.",
    duas: "Daily Duas",
    duas_desc: "Read essential Duas for fasting and breaking fast.",
    today_schedule: "Today's Schedule",
    next_prayer_in: "Next Prayer in",
    loading: "Loading schedule...",
    upcoming: "Upcoming",
    days_of_fasting: "Days of Fasting",
    completed: "Completed",
    day: "Day",
    prayer_schedule: "Prayer Schedule",
    view_full: "View Full Schedule",
    show_less: "Show Less",
    prayer_alerts: "Prayer Alerts",
    get_notified: "Get notified for daily prayers.",
    enable_notif: "Enable Notifications",
    ai_companion: "AI Spiritual Companion",
    ai_placeholder: "Need a moment of reflection?",
    generate: "Generate Insight",
    reflecting: "Reflecting...",
    refresh: "Refresh Reflection",
    daily_wisdom: "Daily Wisdom",
    daily_prayers: "Daily Prayers",
    switch_user: "Switch User",
    replay_tutorial: "Replay Tutorial",
    sehri: "Sehri",
    dhuhr: "Dhuhr",
    asr: "Asr",
    iftar: "Iftar",
    isha: "Isha",
    fajr_label: "Fajr",
    maghrib_label: "Maghrib",
    sehri_label: "Sehri (Fajr)",
    iftar_label: "Iftar (Maghrib)",
    its_time: "It's time for",
    dismiss: "Tap to Dismiss",
    qibla_error_loc: "Location access required.",
    qibla_error_support: "Geolocation not supported.",
    qibla_retry: "Retry",
    qibla_allow: "Allow access to compass.",
    qibla_enable: "Enable Compass",
    qibla_align: "Align the arrow with the marker.",
    bearing: "BEARING",
    from_north: "from North",
    ramadan_coming: "Ramadan Coming Soon",
    ramadan_begins_in: "Ramadan Begins In"
  },
  bn: {
    welcome: "Avex Ramadan-এ স্বাগতম",
    subtitle: "আপনার ব্যক্তিগত রমজান সঙ্গী।",
    enter_name: "আমরা আপনাকে কি বলে ডাকব?",
    begin: "যাত্রা শুরু করুন",
    design: "ডিজাইন করেছেন তাহসিন রিজন",
    smart_island: "স্মার্ট আইল্যান্ড",
    smart_island_desc: "আপনার সার্বক্ষণিক সঙ্গী। বর্তমান নামাজের সময় এবং লাইভ কাউন্টডাউন দেখুন।",
    qibla: "কিবলা ফাইন্ডার",
    qibla_desc: "মুহূর্তেই কাবার দিক নির্ণয় করুন।",
    timer: "প্রধান কাউন্টডাউন",
    timer_desc: "আপনার পরবর্তী নামাজ বা ইফতার/সেহরির সুন্দর কাউন্টডাউন।",
    schedule: "সম্পূর্ণ সময়সূচী",
    schedule_desc: "পুরো ৩০ দিনের রমজানের সময়সূচী এখানে দেখুন।",
    alerts: "নামাজের নোটিফিকেশন",
    alerts_desc: "নামাজ মিস করবেন না। এলার্ম চালু করতে বেল আইকনে ট্যাপ করুন।",
    tracker: "রোজা ট্র্যাকার",
    tracker_desc: "আপনার অগ্রগতি দেখুন! দিন সম্পন্ন হলে টিক চিহ্ন দিন।",
    ai: "এআই সঙ্গী",
    ai_desc: "আধ্যাত্মিক পরামর্শ বা হাদিসের জন্য আমাদের এআই সঙ্গীকে জিজ্ঞাসা করুন।",
    reflection: "দিনের বাণী",
    reflection_desc: "প্রতিদিন এখানে একটি নতুন ইসলামিক বাণী বা চিন্তা আসবে।",
    duas: "প্রতিদিনের দোয়া",
    duas_desc: "রোজা রাখা এবং ভাঙার প্রয়োজনীয় দোয়াগুলো পড়ুন।",
    today_schedule: "আজকের সময়সূচী",
    next_prayer_in: "পরবর্তী নামাজ",
    loading: "সময়সূচী লোড হচ্ছে...",
    upcoming: "পরবর্তী",
    days_of_fasting: "রোজার দিনগুলো",
    completed: "সম্পন্ন",
    day: "দিন",
    prayer_schedule: "নামাজের সময়সূচী",
    view_full: "সম্পূর্ণ সময়সূচী দেখুন",
    show_less: "কম দেখুন",
    prayer_alerts: "নামাজের এলার্ম",
    get_notified: "প্রতিদিনের নামাজের জন্য নোটিফিকেশন পান।",
    enable_notif: "নোটিফিকেশন চালু করুন",
    ai_companion: "এআই আধ্যাত্মিক সঙ্গী",
    ai_placeholder: "একটি চিন্তাশীল মুহূর্ত প্রয়োজন?",
    generate: "নতুন বাণী",
    reflecting: "ভাবছে...",
    refresh: "রিফ্রেশ করুন",
    daily_wisdom: "দিনের বাণী",
    daily_prayers: "প্রয়োজনীয় দোয়া",
    switch_user: "ব্যবহারকারী পরিবর্তন",
    replay_tutorial: "টিউটোরিয়াল দেখুন",
    sehri: "সেহরি",
    dhuhr: "জোহর",
    asr: "আসর",
    iftar: "ইফতার",
    isha: "ইশা",
    fajr_label: "ফজর",
    maghrib_label: "মাগরিব",
    sehri_label: "সেহরি (ফজর)",
    iftar_label: "ইফতার (মাগরিব)",
    its_time: "এখন সময়",
    dismiss: "বন্ধ করতে ট্যাপ করুন",
    qibla_error_loc: "অবস্থান অ্যাক্সেস প্রয়োজন।",
    qibla_error_support: "জিওলোকেশন সমর্থিত নয়।",
    qibla_retry: "পুনরায় চেষ্টা করুন",
    qibla_allow: "কম্পাস অ্যাক্সেস দিন।",
    qibla_enable: "কম্পাস চালু করুন",
    qibla_align: "তীরটি মার্কারের সাথে মিলান।",
    bearing: "বেয়ারিং",
    from_north: "উত্তর থেকে",
    ramadan_coming: "রমজান আসছে",
    ramadan_begins_in: "রোজা শুরু হতে বাকি"
  }
};