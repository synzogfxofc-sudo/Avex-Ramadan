import { GoogleGenAI } from "@google/genai";
import { Language, PrayerTime } from "../types";

// Helper to safely get the API instance
// We initialize this inside functions to prevent top-level crashes on Vercel/Netlify
// if process.env is undefined during module loading.
const getAIClient = () => {
  // Safe access to process.env for browser environments
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
    ? process.env.API_KEY 
    : '';
  
  return new GoogleGenAI({ apiKey });
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
    const prompt = `
      You are a data extraction assistant. I will provide raw text containing a Ramadan calendar schedule. 
      Your task is to extract the prayer times and return them as a valid JSON array.
      
      The input text might be unstructured, from a PDF, Excel, or website copy-paste.
      
      Required JSON Structure for each object in the array:
      - day: number (1 to 30)
      - date: string (Format: "Thu Feb 27 2025" or similar readable date string. Try to infer the year if missing, assume current/upcoming Ramadan).
      - sehri: string (Format: "HH:MM" in 24-hour format. This corresponds to Fajr end or Sehri end).
      - dhuhr: string (Format: "HH:MM" in 24-hour format).
      - asr: string (Format: "HH:MM" in 24-hour format).
      - iftar: string (Format: "HH:MM" in 24-hour format. This corresponds to Maghrib).
      - isha: string (Format: "HH:MM" in 24-hour format).

      Rules:
      1. If specific prayers (Dhuhr, Asr, Isha) are missing in the text, estimate them logically based on Sehri/Iftar or leave them as empty strings "", but Sehri and Iftar are MANDATORY.
      2. Convert all times to 24-hour format (e.g., 04:30, 18:45).
      3. Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
      
      Input Text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("No data returned from AI");
    
    return JSON.parse(jsonText) as PrayerTime[];
  } catch (error) {
    console.error("AI Parse Error:", error);
    throw new Error("Failed to parse schedule. Please ensure the text contains dates and times.");
  }
};