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
} from '@mui/material';

interface ChemicalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: ChemicalFormData) => void;
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

  const handleChange =
    (field: keyof ChemicalFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = () => {
    if (onSave) {
      onSave(formData);
    }
    setFormData(INITIAL_FORM_DATA);
    onClose();
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>Add New Chemical</DialogTitle>
      <DialogContent>
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
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="L">L</MenuItem>
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
            helperText="Will populate from database"
          >
            <MenuItem value="">Select location...</MenuItem>
            <MenuItem value="Fridge A">Fridge A</MenuItem>
            <MenuItem value="Freezer B">Freezer B</MenuItem>
            <MenuItem value="Cabinet 1">Cabinet 1</MenuItem>
            <MenuItem value="Shelf 2">Shelf 2</MenuItem>
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Chemical
        </Button>
      </DialogActions>
    </Dialog>
  );
}
