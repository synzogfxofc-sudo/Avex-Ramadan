import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrayerTime, NotificationSettings } from '../types';

// Project Details
const PROJECT_ID = 'qxrwolmqlikfsasnskmb';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cndvbG1xbGlrZnNhc25za21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDA0MjcsImV4cCI6MjA4NjY3NjQyN30.C-9en7Utf0v88cI-8IPHsVIheSCCu5ucDGUI8EcF34c';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

// Lazy initialize Supabase
const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseInstance;
};

export interface UserData {
  completedDays: number[];
  notificationSettings: NotificationSettings;
  tutorialCompleted: boolean;
}

export const DEFAULT_USER_DATA: UserData = {
  completedDays: [],
  notificationSettings: {
    sehri: true, dhuhr: true, asr: true, iftar: true, isha: true
  },
  tutorialCompleted: false
};

// --- Helpers ---

// 1. Get Global Schedule (Admin Updates)
export const fetchGlobalSchedule = async (): Promise<PrayerTime[] | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('schedules')
      .select('active_schedule')
      .order('id', { ascending: true }) // Assuming row 1 or latest
      .limit(1)
      .single();

    if (error) {
      console.warn("Supabase schedule fetch error (might be empty):", error.message);
      return null;
    }
    
    if (data && data.active_schedule && Array.isArray(data.active_schedule) && data.active_schedule.length > 0) {
      return data.active_schedule as PrayerTime[];
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch global schedule", e);
    return null;
  }
};

// 2. Update Global Schedule (Admin Action)
export const updateGlobalSchedule = async (schedule: PrayerTime[]): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    // We update the row with ID 1, or insert if missing
    const { error } = await supabase
      .from('schedules')
      .upsert({ id: 1, active_schedule: schedule, updated_at: new Date().toISOString() });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Failed to update global schedule", e);
    return false;
  }
};

// 3. Get User Profile
export const fetchUserProfile = async (username: string): Promise<UserData | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('data')
      .eq('username', username)
      .single();

    if (error) {
       if (error.code === 'PGRST116') {
         // Row not found
         return null; 
       }
       throw error;
    }

    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_USER_DATA, ...data.data };
  } catch (e) {
    console.error("Fetch profile error", e);
    return null;
  }
};

// 4. Create or Update User Profile
export const updateUserProfile = async (username: string, userData: UserData): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        username, 
        data: userData, 
        updated_at: new Date().toISOString() 
      });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Update profile error", e);
    return false;
  }
};