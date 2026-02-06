import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  htmlContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useTemplates() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTemplate = useCallback(
    async (data: { name: string; description: string; htmlContent: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create template');
        }

        const template = await response.json();
        router.push('/templates');
        return template;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create template';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const updateTemplate = useCallback(
    async (id: string, data: { name: string; description: string; htmlContent: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/templates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update template');
        }

        const template = await response.json();
        router.push('/templates');
        return template;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update template';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const deleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete template');
      }

      router.refresh();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const templates = await response.json();
      return templates as Template[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTemplates,
    isLoading,
    error,
  };
}
