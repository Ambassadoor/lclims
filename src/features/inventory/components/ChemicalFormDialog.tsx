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
  status: string;
  massOrVolume: string;
  unit: string;
  groupNumber: string;
}

const INITIAL_FORM_DATA: ChemicalFormData = {
  name: '',
  cas: '',
  storageLocation: '',
  company: '',
  status: 'Unopened',
  massOrVolume: '',
  unit: 'g',
  groupNumber: '',
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Storage Location"
              fullWidth
              required
              value={formData.storageLocation}
              onChange={handleChange('storageLocation')}
            />
            <TextField
              label="Company"
              fullWidth
              value={formData.company}
              onChange={handleChange('company')}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Mass/Volume"
              fullWidth
              type="number"
              required
              value={formData.massOrVolume}
              onChange={handleChange('massOrVolume')}
            />
            <TextField
              label="Unit"
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
            <TextField
              label="Group Number"
              fullWidth
              value={formData.groupNumber}
              onChange={handleChange('groupNumber')}
            />
          </Box>
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
          </TextField>
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
