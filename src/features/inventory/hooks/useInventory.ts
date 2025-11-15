import { useState, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Chemical } from '../types';
import { ChemicalFormData } from '../components/ChemicalFormDialog';

// Inventory feature - Custom hook for inventory operations
export function useInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = useCallback(
    async (data: ChemicalFormData, willPrintLabel: boolean = false): Promise<Chemical | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const newChemical = await inventoryService.createChemical(data, willPrintLabel);
        return newChemical;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create chemical';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<Chemical>): Promise<Chemical | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedChemical = await inventoryService.updateChemical(id, data);
        return updatedChemical;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update chemical';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await inventoryService.deleteChemical(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete chemical';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
}
