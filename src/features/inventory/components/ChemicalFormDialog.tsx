'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useInventory } from '../hooks/useInventory';
import { usePrintLabel } from '@/features/hardware/hooks/usePrintLabel';
import { formatChemicalLabelData } from '@/features/hardware/utils/labelFormatter';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchLocations } from '@/features/locations/store/locationsSlice';

interface ChemicalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void; // Callback after successful save (no data needed, will refresh from parent)
}

export interface ChemicalFormData {
  name: string;
  cas: string;
  storageLocation: string;
  company: string;
  productNumber: string;
  groupNumber: string;
  maxVolume: string;
  unit: string;
  densitySpecificGravity: string;
  currentWeight: string;
  initialWeight: string;
  percentRemaining: string;
  status: string;
  safetyDataSheet: string;
  synonyms: string;
  dateReceived: string;
}

const INITIAL_FORM_DATA: ChemicalFormData = {
  name: '',
  cas: '',
  storageLocation: '',
  company: '',
  productNumber: '',
  groupNumber: '',
  maxVolume: '',
  unit: 'g',
  densitySpecificGravity: '',
  currentWeight: '',
  initialWeight: '',
  percentRemaining: '100',
  status: 'Unopened',
  safetyDataSheet: '',
  synonyms: '',
  dateReceived: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
};

export default function ChemicalFormDialog({ open, onClose, onSave }: ChemicalFormDialogProps) {
  const [formData, setFormData] = useState<ChemicalFormData>(INITIAL_FORM_DATA);
  const [printLabel, setPrintLabel] = useState(true); // Default to true
  const [saveError, setSaveError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { items: locations } = useAppSelector((state) => state.locations);
  const { createItem, isLoading: isSaving, error: inventoryError } = useInventory();
  const { printLabel: print, isPrinting, error: printError } = usePrintLabel();

  // Fetch locations on mount
  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  // Build location paths for dropdown
  const locationPaths = useMemo(() => {
    const locationMap = new Map();
    locations.forEach((loc) => {
      locationMap.set(loc.id, loc);
    });

    return locations
      .map((loc) => {
        const buildPath = (location: typeof loc): string => {
          if (!location.parent_id) {
            return location.name;
          }
          const parent = locationMap.get(location.parent_id);
          return parent ? `${buildPath(parent)} / ${location.name}` : location.name;
        };
        return buildPath(loc);
      })
      .sort();
  }, [locations]);

  const handleChange =
    (field: keyof ChemicalFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async () => {
    setSaveError(null);

    // Create the chemical (pass printLabel flag to set Labeled field correctly)
    const newChemical = await createItem(formData, printLabel);

    if (!newChemical) {
      setSaveError(inventoryError || 'Failed to create chemical');
      return;
    }

    // If print checkbox is checked, print the label
    if (printLabel) {
      try {
        const labelData = formatChemicalLabelData(
          newChemical as Parameters<typeof formatChemicalLabelData>[0]
        );
        await print({
          template: 'ChemicalQRCodes.lbx',
          data: labelData,
        });
      } catch (err) {
        console.error('Print error:', err);
        // Don't block the dialog close on print error, user can reprint later
      }
    }

    // Success! Notify parent first (to trigger refresh), then close
    if (onSave) {
      onSave();
    }

    // Reset form and close
    setFormData(INITIAL_FORM_DATA);
    setPrintLabel(true);
    onClose();
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setPrintLabel(true);
    setSaveError(null);
    onClose();
  };

  const isProcessing = isSaving || isPrinting;

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>Add New Chemical</DialogTitle>
      <DialogContent>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
        {printError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Label print failed: {printError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Name and CAS */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Chemical Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange('name')}
              sx={{ flex: 2 }}
            />
            <TextField
              label="CAS Number"
              fullWidth
              value={formData.cas}
              onChange={handleChange('cas')}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Company and Product # */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Company"
              fullWidth
              value={formData.company}
              onChange={handleChange('company')}
            />
            <TextField
              label="Product #"
              fullWidth
              value={formData.productNumber}
              onChange={handleChange('productNumber')}
            />
          </Box>

          {/* Group # */}
          <TextField
            label="Group #"
            fullWidth
            value={formData.groupNumber}
            onChange={handleChange('groupNumber')}
          />

          {/* Max Volume and Unit */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Max Volume/Mass"
              fullWidth
              type="number"
              required
              value={formData.maxVolume}
              onChange={handleChange('maxVolume')}
            />
            <TextField
              label="Unit of Measurement"
              fullWidth
              select
              required
              value={formData.unit}
              onChange={handleChange('unit')}
            >
              <MenuItem value="g">g</MenuItem>
              <MenuItem value="mL">mL</MenuItem>
            </TextField>
          </Box>

          {/* Density/Specific Gravity - only for volume units */}
          <TextField
            label="Density/Specific Gravity"
            fullWidth
            type="number"
            value={formData.densitySpecificGravity}
            onChange={handleChange('densitySpecificGravity')}
            disabled={!['mL', 'L'].includes(formData.unit)}
            helperText={
              ['mL', 'L'].includes(formData.unit)
                ? 'Density in g/mL or g/L'
                : 'Only available for volume units (mL, L)'
            }
          />

          {/* Current Weight and Initial Weight */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Current Weight"
              fullWidth
              type="number"
              value={formData.currentWeight}
              onChange={handleChange('currentWeight')}
              helperText="Current measured weight"
            />
            <TextField
              label="Initial Weight"
              fullWidth
              type="number"
              value={formData.initialWeight}
              onChange={handleChange('initialWeight')}
              helperText="Override required"
            />
          </Box>

          {/* Percent Remaining */}
          <TextField
            label="Fill % / Percent Remaining"
            fullWidth
            value={formData.percentRemaining}
            onChange={handleChange('percentRemaining')}
            helperText="Editable if Current/Initial Weight are empty"
            disabled={!!formData.currentWeight || !!formData.initialWeight}
          />

          {/* Storage Location */}
          <TextField
            label="Storage Location"
            fullWidth
            select
            required
            value={formData.storageLocation}
            onChange={handleChange('storageLocation')}
            helperText="Select from available locations"
          >
            <MenuItem value="">Select location...</MenuItem>
            {locationPaths.map((path) => (
              <MenuItem key={path} value={path}>
                {path}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Received */}
          <TextField
            label="Date Received"
            fullWidth
            type="date"
            value={formData.dateReceived}
            onChange={handleChange('dateReceived')}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          {/* Status */}
          <TextField
            label="Status"
            fullWidth
            select
            required
            value={formData.status}
            onChange={handleChange('status')}
          >
            <MenuItem value="Unopened">Unopened</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Empty">Empty</MenuItem>
            <MenuItem value="Disposed">Disposed</MenuItem>
          </TextField>

          {/* Safety Data Sheet */}
          <TextField
            label="Safety Data Sheet"
            fullWidth
            value={formData.safetyDataSheet}
            onChange={handleChange('safetyDataSheet')}
            helperText="Placeholder - will be drag & drop file uploader"
          />

          {/* Synonyms */}
          <TextField
            label="Synonyms"
            fullWidth
            multiline
            rows={2}
            value={formData.synonyms}
            onChange={handleChange('synonyms')}
            helperText="Alternative names, comma separated"
          />

          {/* Print Label Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={printLabel}
                onChange={(e) => setPrintLabel(e.target.checked)}
                color="primary"
              />
            }
            label="Print label after saving"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit" disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? 'Saving...' : isPrinting ? 'Printing...' : 'Add Chemical'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
