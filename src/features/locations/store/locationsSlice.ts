import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { Location, LocationNode } from '../types';
import { buildLocationTree } from '../utils/locationTreeBuilder';

interface LocationsState {
  items: Location[];
  tree: LocationNode[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  items: [],
  tree: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLocations = createAsyncThunk('locations/fetchLocations', async () => {
  const locations = await apiClient.get<Location[]>('locations');
  return locations;
});

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (
    location: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'sort_order'>,
    { getState }
  ) => {
    const state = getState() as { locations: LocationsState };
    const existingLocations = state.locations.items;

    // Generate next ID with 4-digit padding
    let nextId = 1;
    if (existingLocations.length > 0) {
      const maxId = Math.max(...existingLocations.map((loc) => parseInt(loc.id, 10)));
      nextId = maxId + 1;
    }
    const paddedId = nextId.toString().padStart(4, '0');

    // Calculate sort_order: find max sort_order among siblings + 1
    const siblings = existingLocations.filter((loc) => loc.parent_id === location.parent_id);
    const maxSortOrder =
      siblings.length > 0 ? Math.max(...siblings.map((loc) => loc.sort_order)) : -1;

    // Add timestamps and sort_order
    const now = new Date().toISOString();
    const locationWithId = {
      ...location,
      id: paddedId,
      sort_order: maxSortOrder + 1,
      created_at: now,
      updated_at: now,
    };

    const newLocation = await apiClient.post<Location>('locations', locationWithId);
    return newLocation;
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async (location: Location) => {
    // Update timestamp
    const locationWithTimestamp = {
      ...location,
      updated_at: new Date().toISOString(),
    };
    const updated = await apiClient.patch<Location>(
      `locations/${location.id}`,
      locationWithTimestamp
    );
    return updated;
  }
);

export const deleteLocation = createAsyncThunk('locations/deleteLocation', async (id: string) => {
  await apiClient.delete(`locations/${id}`);
  return id;
});

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for drag and drop reordering
    reorderLocations: (state, action: PayloadAction<{ id: string; sort_order: number }[]>) => {
      // Update sort_order for all affected locations
      action.payload.forEach(({ id, sort_order }) => {
        const location = state.items.find((loc) => loc.id === id);
        if (location) {
          location.sort_order = sort_order;
        }
      });
      // Rebuild tree with new order
      state.tree = buildLocationTree(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch locations
      .addCase(fetchLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.tree = buildLocationTree(action.payload);
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch locations';
      })
      // Create location
      .addCase(createLocation.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.tree = buildLocationTree(state.items);
      })
      // Update location
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.items.findIndex((loc) => loc.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.tree = buildLocationTree(state.items);
      })
      // Delete location
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.items = state.items.filter((loc) => loc.id !== action.payload);
        state.tree = buildLocationTree(state.items);
      });
  },
});

export const { setSelectedLocation, clearError, reorderLocations } = locationsSlice.actions;
export default locationsSlice.reducer;
