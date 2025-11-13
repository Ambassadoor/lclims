'use client';

import { Box, IconButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SortableLocationItemProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Wrapper component that makes a location item draggable and sortable
 * Used with @dnd-kit for drag and drop reordering
 */
export default function SortableLocationItem({ id, children }: SortableLocationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 0.5 }}>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        {children}
      </Box>
    </Box>
  );
}
