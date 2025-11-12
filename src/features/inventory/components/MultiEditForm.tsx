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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { apiClient } from '@/lib/api/client';

interface Chemical {
  ID: string;
  Name: string;
  CAS: string;
  'Unit of Measurement': string;
  'Storage Location': string;
  Status: string;
  Company: string;
  'Product #': string;
  'Max Volume/Mass': number;
  'Percent Remaining': string;
}

export default function MultiEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
          Edit Chemicals
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
          <TextField label="ID" value={currentChemical.ID} disabled fullWidth />

          <TextField
            label="Chemical Name"
            value={currentChemical.Name}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Name = e.target.value;
              setChemicals(updated);
            }}
            fullWidth
          />

          <TextField
            label="CAS Number"
            value={currentChemical.CAS}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].CAS = e.target.value;
              setChemicals(updated);
            }}
            fullWidth
          />

          <TextField
            label="Storage Location"
            value={currentChemical['Storage Location']}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex]['Storage Location'] = e.target.value;
              setChemicals(updated);
            }}
            fullWidth
          />

          <TextField
            label="Company"
            value={currentChemical.Company}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Company = e.target.value;
              setChemicals(updated);
            }}
            fullWidth
          />

          <TextField
            label="Status"
            select
            value={currentChemical.Status}
            onChange={(e) => {
              const updated = [...chemicals];
              updated[currentIndex].Status = e.target.value;
              setChemicals(updated);
            }}
            fullWidth
          >
            <MenuItem value="Unopened">Unopened</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Empty">Empty</MenuItem>
          </TextField>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleSave}>
              Save
            </Button>
            <Button variant="contained" onClick={handleSaveAndNext}>
              {currentIndex < chemicals.length - 1 ? 'Save & Next' : 'Save & Finish'}
            </Button>
          </Box>

          <Button
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            disabled={currentIndex === chemicals.length - 1}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
