export type AIModel = 'claude' | 'gemini';

export interface Prompt {
  id: string;
  name: string;
  content: string;
  aiModel: AIModel;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptInput {
  name: string;
  content: string;
  aiModel: AIModel;
}

export interface UpdatePromptInput {
  name?: string;
  content?: string;
  aiModel?: AIModel;
}
