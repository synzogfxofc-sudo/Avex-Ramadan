import { GoogleGenAI } from "@google/genai";
import { Language, PrayerTime } from "../types";

// Helper to safely get the API instance
// We initialize this inside functions to prevent top-level crashes
const getAIClient = () => {
  // Safe access to process.env for browser environments
  const envKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
    ? process.env.API_KEY 
    : '';
    
  // Fallback to the hardcoded key if the environment variable polyfill doesn't work as expected
  const apiKey = envKey || 'AIzaSyA65rIwRWJjU9dDJv27prIVq5fCb6RqYBM';
  
  if (!apiKey) {
    console.warn("API Key is missing. Ensure process.env.API_KEY is available.");
  }

  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key_to_prevent_crash' });
};

export const getSpiritualInsight = async (lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = 'gemini-3-flash-preview';
    const prompt = lang === 'bn' 
      ? "রমজান এবং আত্মশুদ্ধি সম্পর্কে একটি ছোট, অনুপ্রেরণামূলক ইসলামিক উক্তি বা উপদেশ দিন (৩০ শব্দের মধ্যে)। বাংলা ভাষায় লিখুন।"
      : "Generate a short, inspiring, and modern spiritual quote or reflection specifically for Ramadan. Keep it under 30 words. Focus on patience, gratitude, or self-improvement.";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const defaultText = lang === 'bn' 
      ? "ধৈর্যই হলো তৃপ্তির চাবিকাঠি। রমজান আমাদের সংযম শেখায়।"
      : "Ramadan is the month to visit the poor, the sick, and the needy - to share their sorrows and to alleviate their suffering.";

    return response.text?.trim() || defaultText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'bn' ? "ধৈর্য ধরুন, আল্লাহ ধৈর্যশীলদের সাথে আছেন।" : "Patience is the key to contentment.";
  }
};

export const parseCalendarText = async (text: string): Promise<PrayerTime[]> => {
  try {
    const ai = getAIClient();
    const model = 'gemini-3-flash-preview';
    
    // Improved Prompt to handle Bengali and structure better
    const prompt = `
      You are an advanced data extraction assistant.
      The user has pasted text representing a Ramadan Calendar schedule.
      It might be in English or Bengali (Bangla). The text could be unstructured.

      YOUR TASK:
      1. Extract the schedule rows (Day, Date, Sehri Time, Iftar Time, etc.).
      2. Convert any Bengali numerals (০-৯) to English numerals (0-9).
      3. Return a clean JSON array.

      REQUIRED JSON STRUCTURE:
      [
        {
          "day": 1,
          "date": "Fri Mar 01 2025", 
          "sehri": "04:55",
          "dhuhr": "12:15", 
          "asr": "15:30",
          "iftar": "18:05",
          "isha": "19:20"
        }
      ]

      RULES:
      - Date: Try to infer the full date. If year is missing, assume current/upcoming Ramadan (e.g., 2025). Format: "Fri Mar 01 2025".
      - Times: Must be in 24-hour format (HH:MM). Example: 04:30, 18:15.
      - "Sehri" corresponds to Fajr End/Sehri End.
      - "Iftar" corresponds to Maghrib Start.
      - If Dhuhr/Asr/Isha are missing, leave them as empty strings "" or estimate them if the text implies a standard gap. Sehri and Iftar are MANDATORY.
      - Return ONLY the JSON array. Do not include markdown code blocks.

      INPUT TEXT:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    // Clean up potential markdown if responseMimeType didn't catch it
    let jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");
    
    // Remove markdown code blocks if present (e.g., ```json ... ```)
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    // Try parsing
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e) {
        throw new Error("AI returned invalid JSON format.");
    }
    
    if (!Array.isArray(parsed)) {
      throw new Error("AI returned invalid structure (not an array)");
    }
    
    return parsed as PrayerTime[];

  } catch (error: any) {
    console.error("AI Parse Error:", error);
    
    let errorMessage = "Failed to parse schedule.";
    
    if (error.message) {
      if (error.message.includes("API_KEY")) errorMessage = "API Key Invalid or Missing.";
      else if (error.message.includes("403")) errorMessage = "API Key Permission Denied (403).";
      else if (error.message.includes("400")) errorMessage = "Bad Request to AI Model (400).";
      else if (error.message.includes("JSON")) errorMessage = "AI returned invalid data format.";
      else errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};