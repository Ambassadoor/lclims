import { useState, useCallback } from 'react';
import { printerService, type PrintOptions, type PrintResult } from '../services/printerService';

interface UsePrintLabelOptions {
  onSuccess?: (result: PrintResult) => void;
  onError?: (error: string) => void;
}

export function usePrintLabel(options?: UsePrintLabelOptions) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printLabel = useCallback(
    async (printOptions: PrintOptions) => {
      setIsPrinting(true);
      setError(null);

      try {
        const result = await printerService.print(printOptions);

        if (result.success) {
          options?.onSuccess?.(result);
        } else {
          const errorMsg = result.message || 'Print failed';
          setError(errorMsg);
          options?.onError?.(errorMsg);
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      } finally {
        setIsPrinting(false);
      }
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    printLabel,
    isPrinting,
    error,
    clearError,
  };
}
