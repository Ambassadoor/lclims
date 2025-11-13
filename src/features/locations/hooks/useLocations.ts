import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchLocations } from '../store/locationsSlice';

/**
 * Custom hook for accessing locations data and related operations
 * Similar pattern to useInventory
 */
export const useLocations = () => {
  const dispatch = useAppDispatch();
  const { items, tree, selectedLocation, isLoading, error } = useAppSelector(
    (state) => state.locations
  );

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  return {
    locations: items,
    tree,
    selectedLocation,
    isLoading,
    error,
  };
};
