import type { AIModel } from './prompt';

export interface Settings {
  id: string;
  wpSiteUrl: string;
  wpUsername: string;
  wpPassword: string; // Encrypted
  claudeApiKey: string | null; // Encrypted
  geminiApiKey: string | null; // Encrypted
  defaultAiModel: AIModel;
  batchSize: number;
  updatedAt: Date;
}

export interface UpdateSettingsInput {
  wpSiteUrl?: string;
  wpUsername?: string;
  wpPassword?: string;
  claudeApiKey?: string;
  geminiApiKey?: string;
  defaultAiModel?: AIModel;
  batchSize?: number;
}
