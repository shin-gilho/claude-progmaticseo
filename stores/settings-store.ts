import { create } from 'zustand';
import type { Settings, UpdateSettingsInput } from '@/types';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  testWordPressConnection: () => Promise<boolean>;
  clearError: () => void;
  clearTestResult: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  isTesting: false,
  testResult: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        if (response.status === 404) {
          // No settings yet
          set({ settings: null, isLoading: false });
          return;
        }
        throw new Error('Failed to fetch settings');
      }
      const settings = await response.json();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  updateSettings: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const settings = await response.json();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },

  testWordPressConnection: async () => {
    set({ isTesting: true, testResult: null });
    try {
      const response = await fetch('/api/wordpress/connect', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        set({
          isTesting: false,
          testResult: { success: true, message: 'WordPress connection successful!' },
        });
        return true;
      } else {
        set({
          isTesting: false,
          testResult: { success: false, message: result.error || 'Connection failed' },
        });
        return false;
      }
    } catch (error) {
      set({
        isTesting: false,
        testResult: {
          success: false,
          message: error instanceof Error ? error.message : 'Connection test failed',
        },
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  clearTestResult: () => set({ testResult: null }),
}));
