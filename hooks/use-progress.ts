import { useState, useCallback, useRef, useEffect } from 'react';

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  message: string;
  isActive: boolean;
}

export function useProgress(totalItems: number = 0) {
  const [progress, setProgress] = useState<ProgressState>({
    current: 0,
    total: totalItems,
    percentage: 0,
    message: '',
    isActive: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((total: number, message: string = 'Processing...') => {
    setProgress({
      current: 0,
      total,
      percentage: 0,
      message,
      isActive: true,
    });
  }, []);

  const update = useCallback((current: number, message?: string) => {
    setProgress((prev) => {
      const percentage = prev.total > 0 ? Math.round((current / prev.total) * 100) : 0;
      return {
        ...prev,
        current,
        percentage,
        message: message || prev.message,
      };
    });
  }, []);

  const increment = useCallback((message?: string) => {
    setProgress((prev) => {
      const current = prev.current + 1;
      const percentage = prev.total > 0 ? Math.round((current / prev.total) * 100) : 0;
      return {
        ...prev,
        current,
        percentage,
        message: message || prev.message,
      };
    });
  }, []);

  const complete = useCallback((message: string = 'Completed!') => {
    setProgress((prev) => ({
      ...prev,
      current: prev.total,
      percentage: 100,
      message,
      isActive: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setProgress({
      current: 0,
      total: 0,
      percentage: 0,
      message: '',
      isActive: false,
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const simulateProgress = useCallback((
    duration: number = 5000,
    message: string = 'Processing...'
  ) => {
    start(100, message);

    const steps = 100;
    const interval = duration / steps;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      update(current);

      if (current >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        complete();
      }
    }, interval);
  }, [start, update, complete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    progress,
    start,
    update,
    increment,
    complete,
    reset,
    simulateProgress,
  };
}
