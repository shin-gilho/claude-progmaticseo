import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt } from '@/lib/security/encryption';

export interface GeminiOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_OPTIONS: GeminiOptions = {
  model: 'gemini-1.5-flash',
  maxTokens: 4096,
  temperature: 0.7,
};

export async function generateWithGemini(
  prompt: string,
  encryptedApiKey: string,
  options: GeminiOptions = {}
): Promise<string> {
  const apiKey = decrypt(encryptedApiKey);
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: mergedOptions.model!,
    generationConfig: {
      maxOutputTokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text content in Gemini response');
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('401') || error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your settings.');
      }
    }
    throw error;
  }
}
