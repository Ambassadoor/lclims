import { useState, useCallback } from 'react';

/**
 * Custom hook for managing location tree expand/collapse state
 */
export const useLocationTree = () => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const expandLocation = useCallback((id: string) => {
    setExpanded((prev) => new Set(prev).add(id));
  }, []);

  const collapseLocation = useCallback((id: string) => {
    setExpanded((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.delete(id);
      return newExpanded;
    });
  }, []);

  return {
    expanded,
    toggleExpand,
    expandLocation,
    collapseLocation,
  };
};
