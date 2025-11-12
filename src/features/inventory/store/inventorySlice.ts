// Inventory feature Redux slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Chemical } from '../types';

interface InventoryState {
  items: Chemical[];
  selectedItem: Chemical | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  searchQuery: '',
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Chemical[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addItem: (state, action: PayloadAction<Chemical>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<Chemical>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setSelectedItem: (state, action: PayloadAction<Chemical | null>) => {
      state.selectedItem = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  deleteItem,
  setSelectedItem,
  setLoading,
  setError,
  setSearchQuery,
} = inventorySlice.actions;

export default inventorySlice.reducer;
