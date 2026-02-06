import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  wpSiteUrl: string;
  wpUsername: string;
  wpPassword?: string;
  claudeApiKey?: string;
  geminiApiKey?: string;
  defaultAiModel: string;
  batchSize: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
      return data as Settings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (data: Partial<Settings>) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updated = await response.json();
      setSettings(updated);
      return updated as Settings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const testWordPressConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/wordpress/connect', {
        method: 'POST',
      });

      const result = await response.json();
      setTestResult(result);
      return result;
    } catch (err) {
      const result = {
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed'
      };
      setTestResult(result);
      return result;
    } finally {
      setIsTesting(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    isTesting,
    error,
    testResult,
    fetchSettings,
    saveSettings,
    testWordPressConnection,
  };
}
