import { useState, useCallback } from "react";

interface UseApiCallResult<T, TArgs extends unknown[]> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: TArgs) => Promise<T | undefined>;
  reset: () => void;
}

export const useApiCall = <T = unknown, TArgs extends unknown[] = unknown[]>(
  apiFunction: (...args: TArgs) => Promise<T>,
): UseApiCallResult<T, TArgs> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("API call failed:", err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
};
