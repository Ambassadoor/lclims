// Inventory feature Redux slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
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

// Async thunk for fetching chemicals
export const fetchChemicals = createAsyncThunk(
  'inventory/fetchChemicals',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get<Chemical[]>('inventory?_sort=ID&_order=desc');
      return data;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch chemicals');
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchChemicals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChemicals.fulfilled, (state, action) => {
        state.isLoading = false;
        // Sort numerically by ID (CHEM-XXXX)
        state.items = action.payload.sort((a, b) => {
          const numA = parseInt(a.ID.replace('CHEM-', ''), 10) || 0;
          const numB = parseInt(b.ID.replace('CHEM-', ''), 10) || 0;
          return numB - numA; // Descending order
        });
        state.error = null;
      })
      .addCase(fetchChemicals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
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
