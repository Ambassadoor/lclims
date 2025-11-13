import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { Location, LocationNode } from '../types';

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

// Build tree structure from flat location list
const buildLocationTree = (locations: Location[]): LocationNode[] => {
  const locationMap = new Map<string, LocationNode>();
  const roots: LocationNode[] = [];

  // First pass: create nodes
  locations.forEach((location) => {
    locationMap.set(location.id, {
      ...location,
      children: [],
      full_path: location.name,
      depth: 0,
    });
  });

  // Second pass: build hierarchy
  locations.forEach((location) => {
    const node = locationMap.get(location.id)!;

    if (location.parent_id) {
      const parent = locationMap.get(location.parent_id);
      if (parent) {
        parent.children.push(node);
        node.full_path = `${parent.full_path} / ${node.name}`;
        node.depth = parent.depth + 1;
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};

// Async thunks
export const fetchLocations = createAsyncThunk('locations/fetchLocations', async () => {
  const locations = await apiClient.get<Location[]>('locations');
  return locations;
});

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (location: Omit<Location, 'id'>) => {
    const newLocation = await apiClient.post<Location>('locations', location);
    return newLocation;
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async (location: Location) => {
    const updated = await apiClient.put<Location>(`locations/${location.id}`, location);
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

export const { setSelectedLocation, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
