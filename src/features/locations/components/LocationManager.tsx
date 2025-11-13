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
import { fetchLocations, deleteLocation } from '../store/locationsSlice';
import { LocationNode, LocationType } from '../types';
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

export default function LocationManager() {
  const dispatch = useAppDispatch();
  const { tree, isLoading, error } = useAppSelector((state) => state.locations);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationNode | null>(null);
  const [parentLocation, setParentLocation] = useState<LocationNode | null>(null);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

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

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
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

  const renderTree = (nodes: LocationNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = node.children.length > 0;

      return (
        <Box key={node.id}>
          <ListItem
            disablePadding
            sx={{
              pl: depth * 3,
              borderLeft: depth > 0 ? 1 : 0,
              borderColor: 'divider',
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
              <ListItemIcon sx={{ minWidth: 36 }}>{getLocationIcon(node.type)}</ListItemIcon>
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
                  onClick={() => handleDeleteLocation(node.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderTree(node.children, depth + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
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
