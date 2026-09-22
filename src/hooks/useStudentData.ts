import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseStudentDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Lightweight, memory-safe data-fetching hook for student portal APIs.
 * Prevents duplicate in-flight requests, request loops, and memory leaks on unmount.
 */
export function useStudentData<T>(
  endpoint: string | null,
  options?: { enabled?: boolean }
): UseStudentDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) {
      setIsLoading(false);
      return;
    }

    // Cancel existing in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        credentials: 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        let errMsg = `Request failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {
          // Response was not JSON
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An unexpected error occurred while loading data.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
