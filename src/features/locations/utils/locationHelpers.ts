import { Location as StorageLocation } from '../types';

/**
 * Find all descendants of a location recursively
 * Used for cascade delete operations
 */
export const getAllDescendants = (
  locationId: string,
  allLocations: StorageLocation[]
): StorageLocation[] => {
  const descendants: StorageLocation[] = [];
  const queue = [locationId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allLocations.filter((loc) => loc.parent_id === currentId);
    descendants.push(...children);
    queue.push(...children.map((child) => child.id));
  }

  return descendants;
};
