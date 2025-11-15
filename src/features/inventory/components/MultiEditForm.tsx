'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  LinearProgress,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';
import { apiClient } from '@/lib/api/client';
import { usePrintLabel } from '@/features/hardware/hooks/usePrintLabel';
import {
  formatChemicalLabelData,
  getDefaultChemicalTemplate,
} from '@/features/hardware/utils/labelFormatter';

interface Chemical {
  ID: string;
  Name: string;
  CAS: string;
  'Unit of Measurement': string;
  'Storage Location': string;
  Status: string;
  Company: string;
  'Product #': string;
  'Max Volume': {
    Mass: number;
  };
  'Percent Remaining': string;
  'Group #'?: string;
  'Current Weight'?: number;
  'Initial Weight (g)'?: number;
  'Safety Data Sheet'?: string;
  Synonyms?: string;
  Density: {
    'Specific Gravity (g': { 'mL)'?: number };
  };
}

interface MultiEditFormProps {
  readOnly?: boolean;
}

export default function MultiEditForm({ readOnly = false }: MultiEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [printSuccess, setPrintSuccess] = useState(false);

  const {
    printLabel,
    isPrinting,
    error: printError,
  } = usePrintLabel({
    onSuccess: () => {
      setPrintSuccess(true);
    },
  });

  useEffect(() => {
    const fetchChemicals = async () => {
      const ids = searchParams.get('ids')?.split(',') || [];

      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all chemicals that match the IDs
        const allChemicals = await apiClient.get<Chemical[]>('inventory');
        const selected = allChemicals.filter((chem) => ids.includes(chem.ID));
        setChemicals(selected);
      } catch (err) {
        console.error('Failed to fetch chemicals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChemicals();
  }, [searchParams]);

  const currentChemical = chemicals[currentIndex];

  const handleNext = () => {
    if (currentIndex < chemicals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = () => {
    console.log('Saving chemical:', currentChemical);
    // TODO: PUT request to update chemical
  };

  const handlePrintLabel = async () => {
    if (!currentChemical) return;

    const labelData = formatChemicalLabelData(currentChemical);
    await printLabel({
      template: getDefaultChemicalTemplate(),
      data: labelData,
      copies: 1,
    });
  };

  const handleSaveAndNext = () => {
    handleSave();
    if (currentIndex < chemicals.length - 1) {
      handleNext();
    } else {
      router.push('/inventory');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading chemicals...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (chemicals.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No chemicals found to edit.</Typography>
        <Button onClick={() => router.push('/inventory')} sx={{ mt: 2 }}>
          Back to Inventory
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/inventory')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {readOnly ? 'View Chemicals' : 'Edit Chemicals'}
        </Typography>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Item {currentIndex + 1} of {chemicals.length}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / chemicals.length) * 100}
        />
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Read-only ID */}
          <TextField label="ID" value={currentChemical.ID} disabled fullWidth />

          {/* Name */}
          <TextField
            label="Chemical Name"
            required
            value={currentChemical.Name}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Name = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* CAS Number */}
          <TextField
            label="CAS Number"
            value={currentChemical.CAS || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].CAS = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* Company */}
          <TextField
            label="Company"
            value={currentChemical.Company || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Company = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* Product # */}
          <TextField
            label="Product #"
            value={currentChemical['Product #'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Product #'] = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* Group # */}
          <TextField
            label="Group #"
            value={currentChemical['Group #'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Group #'] = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* Max Volume and Unit - side by side */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Max Volume/Mass"
              type="number"
              required
              value={currentChemical['Max Volume']?.Mass || ''}
              onChange={(e) => {
                const updated = [...chemicals];
                if (!updated[currentIndex]['Max Volume']) {
                  updated[currentIndex]['Max Volume'] = { Mass: 0 };
                }
                updated[currentIndex]['Max Volume'].Mass = parseFloat(e.target.value) || 0;
                setChemicals(updated);
              }}
              disabled={readOnly}
              slotProps={{
                input: {
                  readOnly,
                },
              }}
              fullWidth
            />
            <TextField
              label="Unit of Measurement"
              select
              required
              value={currentChemical['Unit of Measurement'] || 'g'}
              onChange={(e) => {
                const updated = [...chemicals];
                updated[currentIndex]['Unit of Measurement'] = e.target.value;
                setChemicals(updated);
              }}
              disabled={readOnly}
              slotProps={{
                input: {
                  readOnly,
                },
              }}
              fullWidth
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
            type="number"
            value={currentChemical['Density']['Specific Gravity (g']['mL)'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Density']['Specific Gravity (g']['mL)'] =
                parseFloat(e.target.value) || undefined;
              setChemicals(updated);
            }}
            disabled={
              readOnly || !['mL', 'L'].includes(currentChemical['Unit of Measurement'] || '')
            }
            slotProps={{
              input: {
                readOnly,
              },
            }}
            helperText={
              ['mL', 'L'].includes(currentChemical['Unit of Measurement'] || '')
                ? 'Density in g/mL or g/L'
                : 'Only available for volume units (mL, L)'
            }
            fullWidth
          />

          {/* Current Weight and Initial Weight - side by side */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Current Weight"
              type="number"
              value={currentChemical['Current Weight'] || ''}
              onChange={(e) => {
                const updated = [...chemicals];
                updated[currentIndex]['Current Weight'] = parseFloat(e.target.value) || undefined;
                setChemicals(updated);
              }}
              disabled={readOnly}
              slotProps={{
                input: {
                  readOnly,
                },
              }}
              helperText="Current measured weight"
              fullWidth
            />
            <TextField
              label="Initial Weight"
              type="number"
              value={currentChemical['Initial Weight (g)'] || ''}
              onChange={(e) => {
                const updated = [...chemicals];
                updated[currentIndex]['Initial Weight (g)'] =
                  parseFloat(e.target.value) || undefined;
                setChemicals(updated);
              }}
              disabled={readOnly}
              slotProps={{
                input: {
                  readOnly,
                },
              }}
              helperText="Override required"
              fullWidth
            />
          </Box>

          {/* Percent Remaining / Fill % */}
          <TextField
            label="Fill % / Percent Remaining"
            value={currentChemical['Percent Remaining'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Percent Remaining'] = e.target.value;
              setChemicals(updated);
            }}
            helperText="Editable if Current/Initial Weight are null"
            disabled={
              readOnly ||
              !!currentChemical['Current Weight'] ||
              !!currentChemical['Initial Weight (g)']
            }
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          />

          {/* Storage Location - placeholder select */}
          <TextField
            label="Storage Location"
            select
            value={currentChemical['Storage Location'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Storage Location'] = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            helperText="Will populate from database"
            fullWidth
          >
            <MenuItem value="Fridge A">Fridge A</MenuItem>
            <MenuItem value="Freezer B">Freezer B</MenuItem>
            <MenuItem value="Cabinet 1">Cabinet 1</MenuItem>
            <MenuItem value="Shelf 2">Shelf 2</MenuItem>
          </TextField>

          {/* Status */}
          <TextField
            label="Status"
            select
            value={currentChemical.Status || 'Unopened'}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Status = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            fullWidth
          >
            <MenuItem value="Unopened">Unopened</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Empty">Empty</MenuItem>
            <MenuItem value="Disposed">Disposed</MenuItem>
          </TextField>

          {/* Safety Data Sheet - placeholder */}
          <TextField
            label="Safety Data Sheet"
            value={currentChemical['Safety Data Sheet'] || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Safety Data Sheet'] = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            helperText="Placeholder - will be drag & drop file uploader"
            fullWidth
          />

          {/* Synonyms */}
          <TextField
            label="Synonyms"
            multiline
            rows={2}
            value={currentChemical.Synonyms || ''}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Synonyms = e.target.value;
              setChemicals(updated);
            }}
            disabled={readOnly}
            slotProps={{
              input: {
                readOnly,
              },
            }}
            helperText="Alternative names, comma separated"
            fullWidth
          />
        </Box>

        {/* Print Button (for readOnly/view mode) */}
        {readOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintLabel}
              disabled={isPrinting}
            >
              {isPrinting ? 'Printing...' : 'Print Label'}
            </Button>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={handleSave}>
                Save
              </Button>
              <Button variant="contained" onClick={handleSaveAndNext}>
                {currentIndex < chemicals.length - 1 ? 'Save & Next' : 'Save & Finish'}
              </Button>
            </Box>
          )}

          <Button
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            disabled={currentIndex === chemicals.length - 1}
          >
            Next
          </Button>
        </Box>
      </Paper>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={printSuccess}
        autoHideDuration={3000}
        onClose={() => setPrintSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setPrintSuccess(false)}>
          Label printed successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!printError}
        autoHideDuration={5000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">Print failed: {printError}</Alert>
      </Snackbar>
    </Box>
  );
}
