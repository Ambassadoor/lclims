import { Location, LocationNode } from '../types';

/**
 * Build a hierarchical tree structure from a flat list of locations
 * Sorts children by sort_order at each level
 */
export const buildLocationTree = (locations: Location[]): LocationNode[] => {
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

  // Third pass: sort children by sort_order
  const sortChildren = (nodes: LocationNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };
  sortChildren(roots);

  return roots;
};
