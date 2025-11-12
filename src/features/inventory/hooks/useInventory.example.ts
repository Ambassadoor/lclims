// Example: Using Redux in inventory components
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setItems,
  addItem,
  updateItem,
  deleteItem,
  setLoading,
  setError,
} from '../store/inventorySlice';
import type { Chemical, ChemicalFormData } from '../types';

export function useInventory() {
  const dispatch = useAppDispatch();
  const { items, selectedItem, isLoading, error, searchQuery } = useAppSelector(
    (state) => state.inventory
  );

  // Fetch items from API
  const fetchItems = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/chemicals');
      const data = await response.json();
      dispatch(setItems(data));
    } catch (err) {
      dispatch(setError('Failed to fetch items'));
    }
  };

  // Create new item
  const createItem = async (formData: ChemicalFormData) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/chemicals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newItem = await response.json();
      dispatch(addItem(newItem));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError('Failed to create item'));
    }
  };

  // Update existing item
  const updateItemById = async (id: string, formData: ChemicalFormData) => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(`/api/chemicals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const updatedItem = await response.json();
      dispatch(updateItem(updatedItem));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError('Failed to update item'));
    }
  };

  // Delete item
  const deleteItemById = async (id: string) => {
    dispatch(setLoading(true));
    try {
      await fetch(`/api/chemicals/${id}`, { method: 'DELETE' });
      dispatch(deleteItem(id));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError('Failed to delete item'));
    }
  };

  // Filtered items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    items: filteredItems,
    selectedItem,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem: updateItemById,
    deleteItem: deleteItemById,
  };
}
