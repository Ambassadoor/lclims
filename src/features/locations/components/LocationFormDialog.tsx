'use client';

import { useState, useRef, useEffect } from 'react';
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
  Typography,
  Checkbox,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createLocation, updateLocation } from '../store/locationsSlice';
import { Location, LocationNode } from '../types';
import {
  LOCATION_TYPES,
  TEMPERATURE_TYPES,
  VENTILATION_TYPES,
  RESTRICTION_OPTIONS,
} from '../config/locationFormConfig';
import { getInitialFormData, LocationFormData } from '../utils/locationFormHelpers';

interface LocationFormDialogProps {
  open: boolean;
  onClose: (parentIdToExpand?: string | null) => void;
  location?: LocationNode | null;
  parentLocation?: LocationNode | null;
}

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

  const [createMultiple, setCreateMultiple] = useState(false);
  const [quantity, setQuantity] = useState(3);
  const [startNumber, setStartNumber] = useState(1);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus name input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Generate preview names for multi-create
  const previewNames =
    createMultiple && formData.name.trim()
      ? Array.from(
          { length: Math.min(quantity, 3) },
          (_, i) => `${formData.name} ${startNumber + i}`
        )
      : [];

  const remainingCount = quantity > 3 ? quantity - 3 : 0;

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
    try {
      if (location) {
        // Edit mode - single update
        const locationData = { ...formData, id: location.id, sort_order: location.sort_order };
        await dispatch(updateLocation(locationData as Location)).unwrap();
        onClose();
      } else if (createMultiple) {
        // Multi-create mode
        const baseData: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'sort_order'> =
          formData;

        for (let i = 0; i < quantity; i++) {
          const numberedName = `${formData.name} ${startNumber + i}`;
          await dispatch(createLocation({ ...baseData, name: numberedName })).unwrap();
        }

        onClose(formData.parent_id);
      } else {
        // Single create mode
        await dispatch(createLocation(formData)).unwrap();
        onClose(formData.parent_id);
      }
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
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
            inputRef={nameInputRef}
          />

          {/* Multi-create option (only for new locations) */}
          {!location && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createMultiple}
                    onChange={(e) => setCreateMultiple(e.target.checked)}
                  />
                }
                label="Create multiple locations"
              />

              {createMultiple && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))
                      }
                      slotProps={{
                        htmlInput: { min: 1, max: 50 },
                      }}
                      sx={{ width: 120 }}
                    />
                    <TextField
                      label="Start Number"
                      type="number"
                      value={startNumber}
                      onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      slotProps={{
                        htmlInput: { min: 1 },
                      }}
                      sx={{ width: 140 }}
                    />
                  </Box>

                  {previewNames.length > 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Preview:
                      </Typography>
                      <Typography variant="body2">
                        {previewNames.join(', ')}
                        {remainingCount > 0 && ` ...and ${remainingCount} more`}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Type */}
          <TextField
            label="Type"
            select
            required
            value={formData.type}
            onChange={handleChange('type')}
            helperText={parentLocation ? 'Adding child to: ' + parentLocation.name : ''}
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Safety Restrictions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name.trim()}>
          {location ? 'Update' : createMultiple ? `Create ${quantity}` : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
