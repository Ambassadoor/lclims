# Redux Setup Guide for LIMS

## Overview

Redux is set up using Redux Toolkit (the official, recommended way) with TypeScript support.

## Installation

```bash
npm install @reduxjs/toolkit react-redux
```

## File Structure

```
src/
├── lib/
│   └── store/
│       ├── store.ts          # Main store configuration
│       ├── hooks.ts          # Typed hooks (useAppDispatch, useAppSelector)
│       └── ReduxProvider.tsx # Client-side provider component
│
├── features/
│   ├── auth/
│   │   └── store/
│   │       └── authSlice.ts  # Auth state slice
│   │
│   └── inventory/
│       └── store/
│           └── inventorySlice.ts  # Inventory state slice
```

## Key Changes Made

### 1. Root Layout (`src/app/layout.tsx`)

Wrapped the app with `ReduxProvider`:

```tsx
<ReduxProvider>
  <ThemeProvider>
    <AppLayout>{children}</AppLayout>
  </ThemeProvider>
</ReduxProvider>
```

**Note:** ReduxProvider must be a Client Component ('use client'), but it wraps everything so all child components can access Redux.

### 2. Store Configuration (`src/lib/store/store.ts`)

- Combines all feature slices
- Exports typed `RootState` and `AppDispatch`

### 3. Typed Hooks (`src/lib/store/hooks.ts`)

Instead of using plain `useDispatch` and `useSelector`, use:

- `useAppDispatch()` - Typed dispatch
- `useAppSelector()` - Typed selector

### 4. Feature Slices

Each feature has its own slice:

- **authSlice**: User authentication state
- **inventorySlice**: Chemical inventory state

## Usage Examples

### In a Component:

```tsx
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setItems } from '@/features/inventory/store/inventorySlice';

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.inventory.items);
  const isLoading = useAppSelector((state) => state.inventory.isLoading);

  const loadItems = async () => {
    const response = await fetch('/api/chemicals');
    const data = await response.json();
    dispatch(setItems(data));
  };

  return (
    <div>
      {isLoading ? 'Loading...' : items.map((item) => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

### In a Custom Hook:

```tsx
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/features/auth/store/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const signIn = (userData) => dispatch(setUser(userData));
  const signOut = () => dispatch(clearUser());

  return { user, isAuthenticated, signIn, signOut };
}
```

## Adding New Slices

1. **Create slice file:** `src/features/[feature]/store/[feature]Slice.ts`
2. **Import in store:** Add to `src/lib/store/store.ts`
3. **Use in components:** Import actions and use hooks

Example for a new "locations" slice:

```tsx
// 1. Create src/features/locations/store/locationsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const locationsSlice = createSlice({
  name: 'locations',
  initialState: { items: [] },
  reducers: {
    setLocations: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const { setLocations } = locationsSlice.actions;
export default locationsSlice.reducer;

// 2. Add to store.ts
import locationsReducer from '@/features/locations/store/locationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    locations: locationsReducer, // ← Add here
  },
});
```

## Benefits of Redux Toolkit

1. **Less Boilerplate**: Automatic action creators
2. **Immer Integration**: Mutate state directly in reducers (uses Immer under the hood)
3. **TypeScript Support**: Full type safety
4. **DevTools**: Automatic Redux DevTools integration
5. **Best Practices**: Built-in middleware and recommended patterns

## When to Use Redux vs React State

**Use Redux for:**

- Global state (user auth, app settings)
- State shared across many components
- State that needs to persist across navigation
- Complex state logic

**Use React State (useState) for:**

- Local component state (form inputs, toggles)
- UI state (modals, dropdowns)
- State that doesn't need to be shared

## Alternative: If You Don't Need Redux

If Redux feels like overkill, consider:

- **React Context** - For simple global state
- **Zustand** - Lighter alternative to Redux
- **TanStack Query** - For server state (better for API data)

Your auth and inventory hooks could work with Context instead of Redux if you prefer a simpler approach!
