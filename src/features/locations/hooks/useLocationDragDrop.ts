import { useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { useAppDispatch } from '@/lib/store/hooks';
import { updateLocation, reorderLocations, fetchLocations } from '../store/locationsSlice';
import { LocationNode } from '../types';

/**
 * Custom hook for handling drag and drop reordering of locations
 * Implements optimistic updates for smooth UX
 */
export const useLocationDragDrop = () => {
  const dispatch = useAppDispatch();

  const handleDragEnd = useCallback(
    async (event: DragEndEvent, siblings: LocationNode[]) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = siblings.findIndex((loc) => loc.id === active.id);
        const newIndex = siblings.findIndex((loc) => loc.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Reorder siblings array
          const reordered = [...siblings];
          const [moved] = reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, moved);

          // Prepare updates for locations that need new sort_order
          const updates = reordered
            .map((loc, i) => (loc.sort_order !== i ? { ...loc, sort_order: i } : null))
            .filter((loc) => loc !== null);

          if (updates.length > 0) {
            // Optimistic update - immediately update UI
            dispatch(
              reorderLocations(updates.map((loc) => ({ id: loc!.id, sort_order: loc!.sort_order })))
            );

            // Fire API calls in background (don't await)
            Promise.all(updates.map((loc) => dispatch(updateLocation(loc!)).unwrap())).catch(
              (error) => {
                console.error('Failed to update location order:', error);
                // On error, refresh to ensure consistency
                dispatch(fetchLocations());
              }
            );
          }
        }
      }
    },
    [dispatch]
  );

  return { handleDragEnd };
};
