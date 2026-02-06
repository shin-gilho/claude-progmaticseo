import Anthropic from '@anthropic-ai/sdk';
import { decrypt } from '@/lib/security/encryption';

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_OPTIONS: ClaudeOptions = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
};

export async function generateWithClaude(
  prompt: string,
  encryptedApiKey: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const apiKey = decrypt(encryptedApiKey);
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const client = new Anthropic({
    apiKey,
  });

  try {
    const response = await client.messages.create({
      model: mergedOptions.model!,
      max_tokens: mergedOptions.maxTokens!,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textBlock.text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        throw new Error('Claude API rate limit exceeded. Please try again later.');
      }
      if (error.status === 401) {
        throw new Error('Invalid Claude API key. Please check your settings.');
      }
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw error;
  }
}

export function buildPromptWithKeyword(
  basePrompt: string,
  keyword: string,
  additionalContext?: Record<string, string>
): string {
  // Replace {{keyword}} (English)
  let prompt = basePrompt.replace(/\{\{keyword\}\}/gi, keyword);

  // Replace {{키워드}} (Korean)
  prompt = prompt.replace(/\{\{키워드\}\}/g, keyword);

  // Replace {{disease_code}} (common alias)
  prompt = prompt.replace(/\{\{disease_code\}\}/gi, keyword);

  if (additionalContext) {
    for (const [key, value] of Object.entries(additionalContext)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      prompt = prompt.replace(regex, value);
    }
  }

  return prompt;
}
