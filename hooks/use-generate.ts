import { useState, useCallback } from 'react';

export interface GenerateParams {
  templateId: string;
  customPrompt: string;
  aiModel: 'claude' | 'gemini';
  keywords: string[];
  publishToWp: boolean;
}

export interface GenerateResult {
  success: boolean;
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  results: Array<{
    keyword: string;
    success: boolean;
    postId?: string;
    wpUrl?: string;
    error?: string;
  }>;
}

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setProgress(100);
        return data as GenerateResult;
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate content';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    progress,
    error,
    result,
  };
}
