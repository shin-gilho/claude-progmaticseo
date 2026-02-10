import { create } from 'zustand';
import { Prompt, CreatePromptInput, UpdatePromptInput } from '@/types/prompt';

interface PromptStore {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;

  fetchPrompts: () => Promise<void>;
  selectPrompt: (prompt: Prompt | null) => void;
  createPrompt: (data: CreatePromptInput) => Promise<Prompt | null>;
  updatePrompt: (id: string, data: UpdatePromptInput) => Promise<Prompt | null>;
  deletePrompt: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  selectedPrompt: null,
  isLoading: false,
  error: null,

  fetchPrompts: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/prompts');

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const prompts = await response.json();
      set({ prompts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
    }
  },

  selectPrompt: (prompt) => {
    set({ selectedPrompt: prompt });
  },

  createPrompt: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prompt');
      }

      const prompt = await response.json();
      set((state) => ({
        prompts: [prompt, ...state.prompts],
        isLoading: false,
      }));

      return prompt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updatePrompt: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      const prompt = await response.json();
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? prompt : p)),
        isLoading: false,
      }));

      return prompt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deletePrompt: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      set((state) => ({
        prompts: state.prompts.filter((p) => p.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
