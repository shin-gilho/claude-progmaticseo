import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, CreatePromptInput, UpdatePromptInput } from '@/types/prompt';

export function usePrompts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createPrompt = async (data: CreatePromptInput): Promise<Prompt | null> => {
    setIsLoading(true);
    setError(null);

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
      router.refresh();
      return prompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrompt = async (id: string, data: UpdatePromptInput): Promise<Prompt | null> => {
    setIsLoading(true);
    setError(null);

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
      router.refresh();
      return prompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      router.refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrompts = async (): Promise<Prompt[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts');

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const prompts = await response.json();
      return prompts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    fetchPrompts,
  };
}
