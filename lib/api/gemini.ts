import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt } from '@/lib/security/encryption';
import { formatDiseaseCode } from '@/lib/utils/disease-code';

export interface GeminiOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_OPTIONS: GeminiOptions = {
  model: 'gemini-2.5-flash',
  maxTokens: 8192,
  temperature: 0.3,
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
      responseMimeType: 'application/json',
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

export function buildPromptWithKeyword(
  basePrompt: string,
  keyword: string,
  additionalContext?: Record<string, string>
): string {
  // Format disease code for SEO optimization
  const formatted = formatDiseaseCode(keyword);

  let prompt = basePrompt;

  // Replace {{keyword}} with original format (backward compatible)
  prompt = prompt.replace(/\{\{keyword\}\}/gi, formatted.original);

  // Replace {{keyword_normalized}} with SEO-friendly version (no dots)
  prompt = prompt.replace(/\{\{keyword_normalized\}\}/gi, formatted.normalized);

  // Replace {{keyword_display}} with content format (e.g., K529(K52.9))
  prompt = prompt.replace(/\{\{keyword_display\}\}/gi, formatted.display);

  // Replace {{키워드}} (Korean alias)
  prompt = prompt.replace(/\{\{키워드\}\}/g, formatted.original);

  // Replace {{disease_code}} (common alias, backward compatible)
  prompt = prompt.replace(/\{\{disease_code\}\}/gi, formatted.original);

  // Replace additional context variables
  if (additionalContext) {
    for (const [key, value] of Object.entries(additionalContext)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      prompt = prompt.replace(regex, value);
    }
  }

  return prompt;
}
