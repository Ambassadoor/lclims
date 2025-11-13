'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScienceIcon from '@mui/icons-material/Science';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchLocations, deleteLocation, updateLocation, reorderLocations } from '../store/locationsSlice';
import { Location as StorageLocation, LocationNode, LocationType } from '../types';
import LocationFormDialog from './LocationFormDialog';

// Icon mapping for different location types
const getLocationIcon = (type: LocationType) => {
  switch (type) {
    case 'room':
      return <MeetingRoomIcon fontSize="small" />;
    case 'fridge':
      return <KitchenIcon fontSize="small" />;
    case 'freezer':
      return <AcUnitIcon fontSize="small" />;
    case 'cabinet':
    case 'shelf':
    case 'drawer':
      return <DashboardIcon fontSize="small" />;
    case 'hood':
    case 'bench':
      return <ScienceIcon fontSize="small" />;
    default:
      return <DashboardIcon fontSize="small" />;
  }
};

// Color coding for temperature
const getTemperatureColor = (
  temperature?: 'ambient' | 'cold' | 'frozen'
): 'default' | 'info' | 'primary' => {
  switch (temperature) {
    case 'cold':
      return 'info';
    case 'frozen':
      return 'primary';
    default:
      return 'default';
  }
};

// Sortable wrapper for drag and drop
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
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

// Helper to find all descendants of a location
const getAllDescendants = (
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

export default function LocationManager() {
  const dispatch = useAppDispatch();
  const { tree, items, isLoading, error } = useAppSelector((state) => state.locations);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationNode | null>(null);
  const [parentLocation, setParentLocation] = useState<LocationNode | null>(null);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddLocation = (parent?: LocationNode) => {
    setParentLocation(parent || null);
    setEditingLocation(null);
    setFormDialogOpen(true);
  };

  const handleFormClose = (parentIdToExpand?: string | null) => {
    setFormDialogOpen(false);
    setEditingLocation(null);
    setParentLocation(null);

    // Auto-expand parent if a child was just added
    if (parentIdToExpand) {
      setExpanded((prev) => new Set(prev).add(parentIdToExpand));
    }
  };

  const handleEditLocation = (location: LocationNode) => {
    setEditingLocation(location);
    setParentLocation(null);
    setFormDialogOpen(true);
  };

  const handleDeleteLocation = async (id: string, locationName: string) => {
    // Find all descendants that will be deleted
    const descendants = getAllDescendants(id, items);

    let confirmMessage = `Are you sure you want to delete "${locationName}"?`;
    if (descendants.length > 0) {
      confirmMessage += `\n\nThis will also delete ${descendants.length} child location${descendants.length > 1 ? 's' : ''}:\n${descendants
        .slice(0, 5)
        .map((d) => '• ' + d.name)
        .join('\n')}`;
      if (descendants.length > 5) {
        confirmMessage += `\n...and ${descendants.length - 5} more`;
      }
    }

    if (confirm(confirmMessage)) {
      try {
        // Delete all descendants first (bottom-up)
        for (const descendant of descendants.reverse()) {
          await dispatch(deleteLocation(descendant.id)).unwrap();
        }
        // Then delete the parent
        await dispatch(deleteLocation(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleDragEnd = async (event: DragEndEvent, siblings: LocationNode[]) => {
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
  };

  const renderTree = (nodes: LocationNode[], depth = 0) => {
    const items = nodes.map((node) => node.id);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleDragEnd(event, nodes)}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {nodes.map((node) => {
            const isExpanded = expanded.has(node.id);
            const hasChildren = node.children.length > 0;

            return (
              <Box key={node.id}>
                <SortableItem id={node.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      pl: depth * 3,
                      borderLeft: depth > 0 ? 1 : 0,
                      borderColor: 'divider',
                      flex: 1,
                    }}
                  >
                    <ListItemButton onClick={() => hasChildren && toggleExpand(node.id)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {hasChildren ? (
                          isExpanded ? (
                            <ExpandMoreIcon />
                          ) : (
                            <ChevronRightIcon />
                          )
                        ) : (
                          <Box sx={{ width: 24 }} />
                        )}
                      </ListItemIcon>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getLocationIcon(node.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {node.name}
                            </Typography>
                            <Chip
                              label={node.type}
                              size="small"
                              color={getTemperatureColor(node.temperature)}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            {node.temperature && node.temperature !== 'ambient' && (
                              <Chip
                                label={node.temperature}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => handleAddLocation(node)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditLocation(node)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLocation(node.id, node.name)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </SortableItem>
                {hasChildren && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {renderTree(node.children, depth + 1)}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </SortableContext>
      </DndContext>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading locations: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Storage Locations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddLocation()}>
          Add Room
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        {tree.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No locations found. Add a room to get started.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>{renderTree(tree)}</List>
        )}
      </Paper>

      <LocationFormDialog
        key={`${formDialogOpen}-${editingLocation?.id || 'new'}-${parentLocation?.id || 'root'}`}
        open={formDialogOpen}
        onClose={handleFormClose}
        location={editingLocation}
        parentLocation={parentLocation}
      />
    </Box>
  );
}
