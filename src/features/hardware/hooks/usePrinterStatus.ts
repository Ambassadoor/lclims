import { useState, useEffect, useCallback } from 'react';
import { printerService } from '../services/printerService';
import type { Printer } from '../types';

const STORAGE_KEY = 'selectedPrinter';
const POLL_INTERVAL = 30000; // 30 seconds

export function usePrinterStatus() {
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [printerStatus, setPrinterStatus] = useState<Printer | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load available printers
  const loadPrinters = useCallback(async () => {
    try {
      const printers = await printerService.getPrinters();
      setAvailablePrinters(printers);

      // Auto-select first printer if none selected
      if (!selectedPrinter && printers.length > 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const printerToSelect = stored || printers[0].name;
        setSelectedPrinter(printerToSelect);
      }
    } catch (error) {
      console.error('Failed to load printers:', error);
    }
  }, [selectedPrinter]);

  // Load status for selected printer
  const loadStatus = useCallback(async () => {
    if (!selectedPrinter) {
      setPrinterStatus(null);
      return;
    }

    try {
      const status = await printerService.getPrinterStatus(selectedPrinter);
      setPrinterStatus(status);
    } catch (error) {
      console.error('Failed to load printer status:', error);
      setPrinterStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrinter]);

  // Change selected printer
  const selectPrinter = useCallback((printerName: string) => {
    setSelectedPrinter(printerName);
    localStorage.setItem(STORAGE_KEY, printerName);
  }, []);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadPrinters();
    await loadStatus();
  }, [loadPrinters, loadStatus]);

  // Initial load
  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  // Load status when printer changes
  useEffect(() => {
    loadStatus();
  }, [selectedPrinter, loadStatus]);

  // Poll for status updates
  useEffect(() => {
    if (!selectedPrinter) return;

    const interval = setInterval(() => {
      loadPrinters(); // Refresh all printer statuses for dropdown
      loadStatus(); // Refresh selected printer status
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedPrinter, loadPrinters, loadStatus]);

  return {
    selectedPrinter,
    printerStatus,
    availablePrinters,
    isLoading,
    selectPrinter,
    refresh,
  };
}
