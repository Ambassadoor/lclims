'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createLocation, updateLocation } from '../store/locationsSlice';
import { Location, LocationNode, LocationType, TemperatureType, VentilationType } from '../types';

interface LocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  location?: LocationNode | null;
  parentLocation?: LocationNode | null;
}

interface LocationFormData {
  name: string;
  type: LocationType;
  parent_id: string | null;
  temperature?: TemperatureType;
  ventilation?: VentilationType;
  restrictions: string[];
  notes: string;
  is_active: boolean;
}

const LOCATION_TYPES: LocationType[] = [
  'room',
  'cabinet',
  'shelf',
  'fridge',
  'freezer',
  'hood',
  'bench',
  'drawer',
];
const TEMPERATURE_TYPES: TemperatureType[] = ['ambient', 'cold', 'frozen'];
const VENTILATION_TYPES: VentilationType[] = ['standard', 'fume_hood', 'vented_cabinet'];
const RESTRICTION_OPTIONS = [
  'flammables_only',
  'acids_only',
  'bases_only',
  'no_oxidizers',
  'no_water_reactive',
];

const getInitialFormData = (
  location?: LocationNode | null,
  parentLocation?: LocationNode | null
): LocationFormData => {
  if (location) {
    return {
      name: location.name,
      type: location.type,
      parent_id: location.parent_id,
      temperature: location.temperature || 'ambient',
      ventilation: location.ventilation || 'standard',
      restrictions: location.restrictions || [],
      notes: location.notes || '',
      is_active: location.is_active,
    };
  }

  if (parentLocation) {
    return {
      name: '',
      type: 'cabinet',
      parent_id: parentLocation.id,
      temperature: parentLocation.temperature || 'ambient',
      ventilation: parentLocation.ventilation || 'standard',
      restrictions: [],
      notes: '',
      is_active: true,
    };
  }

  return {
    name: '',
    type: 'room',
    parent_id: null,
    temperature: 'ambient',
    ventilation: 'standard',
    restrictions: [],
    notes: '',
    is_active: true,
  };
};

export default function LocationFormDialog({
  open,
  onClose,
  location,
  parentLocation,
}: LocationFormDialogProps) {
  const dispatch = useAppDispatch();
  const locationsState = useAppSelector((state) => state.locations);
  const locationsList: Location[] = locationsState.items;

  const [formData, setFormData] = useState<LocationFormData>(() =>
    getInitialFormData(location, parentLocation)
  );

  const handleChange =
    (field: keyof LocationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleRestrictionToggle = (restriction: string) => {
    const newRestrictions = formData.restrictions.includes(restriction)
      ? formData.restrictions.filter((r) => r !== restriction)
      : [...formData.restrictions, restriction];
    setFormData({ ...formData, restrictions: newRestrictions });
  };

  const handleSubmit = async () => {
    const locationData: Omit<Location, 'id'> | Location = location
      ? { ...formData, id: location.id }
      : formData;

    try {
      if (location) {
        await dispatch(updateLocation(locationData as Location)).unwrap();
      } else {
        await dispatch(createLocation(locationData as Omit<Location, 'id'>)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{location ? 'Edit Location' : 'Add New Location'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Name */}
          <TextField
            label="Location Name"
            required
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            placeholder="e.g., Room 415, Cabinet A, Top Shelf"
          />

          {/* Type */}
          <TextField
            label="Type"
            select
            required
            value={formData.type}
            onChange={handleChange('type')}
            disabled={!!location}
            helperText={
              location
                ? 'Cannot change type of existing location'
                : parentLocation
                  ? 'Adding child to: ' + parentLocation.name
                  : ''
            }
            fullWidth
          >
            {LOCATION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          {/* Parent Location */}
          {!location && formData.type !== 'room' && (
            <TextField
              label="Parent Location"
              select
              value={formData.parent_id || ''}
              onChange={handleChange('parent_id')}
              disabled={!!parentLocation}
              helperText={
                parentLocation ? 'Parent is pre-selected' : 'Optional: Select a parent location'
              }
              fullWidth
            >
              <MenuItem value="">None (Top Level)</MenuItem>
              {locationsList.map((loc: Location, index: number) => (
                <MenuItem key={`${loc.id}-${index}`} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Temperature */}
          <TextField
            label="Temperature"
            select
            value={formData.temperature}
            onChange={handleChange('temperature')}
            fullWidth
          >
            {TEMPERATURE_TYPES.map((temp) => (
              <MenuItem key={temp} value={temp}>
                {temp.charAt(0).toUpperCase() + temp.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          {/* Ventilation */}
          <TextField
            label="Ventilation"
            select
            value={formData.ventilation}
            onChange={handleChange('ventilation')}
            fullWidth
          >
            {VENTILATION_TYPES.map((vent) => (
              <MenuItem key={vent} value={vent}>
                {vent.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </MenuItem>
            ))}
          </TextField>

          {/* Restrictions */}
          <Box>
            <TextField
              label="Safety Restrictions"
              value=""
              InputProps={{ readOnly: true }}
              helperText="Select applicable restrictions"
              fullWidth
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {RESTRICTION_OPTIONS.map((restriction) => (
                <Chip
                  key={restriction}
                  label={restriction.replace(/_/g, ' ')}
                  onClick={() => handleRestrictionToggle(restriction)}
                  color={formData.restrictions.includes(restriction) ? 'primary' : 'default'}
                  variant={formData.restrictions.includes(restriction) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          {/* Notes */}
          <TextField
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Additional information about this location..."
            fullWidth
          />

          {/* Active Status */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name.trim()}>
          {location ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
