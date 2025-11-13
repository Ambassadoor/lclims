'use client';

import { useState } from 'react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteLocation } from '../store/locationsSlice';
import { LocationNode } from '../types';
import { useLocations, useLocationTree, useLocationDragDrop } from '../hooks';
import { getAllDescendants } from '../utils/locationHelpers';
import { getLocationIcon, getTemperatureColor } from '../utils/locationIconHelpers';
import LocationFormDialog from './LocationFormDialog';
import SortableLocationItem from './SortableLocationItem';

export default function LocationManager() {
  const dispatch = useAppDispatch();
  const { tree, locations, isLoading, error } = useLocations();
  const { expanded, toggleExpand, expandLocation } = useLocationTree();
  const { handleDragEnd } = useLocationDragDrop();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationNode | null>(null);
  const [parentLocation, setParentLocation] = useState<LocationNode | null>(null);

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
      expandLocation(parentIdToExpand);
    }
  };

  const handleEditLocation = (location: LocationNode) => {
    setEditingLocation(location);
    setParentLocation(null);
    setFormDialogOpen(true);
  };

  const handleDeleteLocation = async (id: string, locationName: string) => {
    // Find all descendants that will be deleted
    const descendants = getAllDescendants(id, locations);

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
                <SortableLocationItem id={node.id}>
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
                </SortableLocationItem>
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
