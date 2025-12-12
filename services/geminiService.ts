import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export interface TranslationResult {
  audioData: string | null; // Base64 PCM
  translatedText: string;
}

/**
 * Translates text from one language to another.
 * Returns only text (no audio).
 */
export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<string | null> {
  try {
    const ai = getAiClient();
    const translationPrompt = `Translate the following text into ${targetLanguage}. Output ONLY the translated text. Text: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: translationPrompt,
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("Translation Error:", error);
    return null;
  }
}

/**
 * Generates speech audio from text using Gemini TTS.
 */
export async function generateSpeech(
  text: string,
  voiceName: string = "Fenrir" // Fenrir, Puck, Kore, Zephyr
): Promise<string | null> {
  try {
    const ai = getAiClient();
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      },
    });

    const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0];
    if (audioPart && audioPart.inlineData && audioPart.inlineData.data) {
      return audioPart.inlineData.data;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

/**
 * Translates text and optionally generates audio.
 */
export async function translateAndSpeak(
  text: string,
  targetLanguage: Language,
  shouldGenerateAudio: boolean = true
): Promise<TranslationResult | null> {
  try {
    // Step 1: Translate
    const translatedText = await translateText(text, targetLanguage);
    if (!translatedText) throw new Error("Translation failed");

    // Step 2: Audio (Optional)
    let audioData = null;
    if (shouldGenerateAudio) {
       audioData = await generateSpeech(translatedText);
    }

    return {
      translatedText,
      audioData
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    return null;
  }
}

/**
 * Simulates a remote user replying to the conversation.
 * 1. Generates a text response in the REMOTE user's language.
 */
export async function generateConversationReply(
  lastMessage: string,
  personaName: string,
  personaLanguage: Language
): Promise<string | null> {
  try {
    const ai = getAiClient();
    const prompt = `
      You are roleplaying as ${personaName}, a person who speaks ${personaLanguage}.
      The user just said: "${lastMessage}".
      Reply naturally to the user in ${personaLanguage}.
      Keep the reply short, casual, and conversational (1-2 sentences max).
      Output ONLY the reply text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("Reply Generation Error:", error);
    return null;
  }
}