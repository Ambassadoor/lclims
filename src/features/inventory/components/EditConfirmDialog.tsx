'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Alert,
} from '@mui/material';

interface Chemical {
  id: string;
  Name: string;
  'Storage Location': string;
}

interface EditConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  selectedChemicals: Chemical[];
  selectedIds: string[];
}

export default function EditConfirmDialog({
  open,
  onClose,
  selectedChemicals,
  selectedIds,
}: EditConfirmDialogProps) {
  const router = useRouter();

  const handleConfirm = () => {
    const ids = selectedIds.join(',');
    router.push(`/inventory/edit?ids=${ids}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Edit</DialogTitle>
      <DialogContent>
        {selectedChemicals.length > 10 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have selected {selectedChemicals.length} items. Please select 10 or fewer items to
            edit at once.
          </Alert>
        ) : (
          <Typography variant="body1" gutterBottom>
            You have selected {selectedChemicals.length} item
            {selectedChemicals.length !== 1 ? 's' : ''} for editing:
          </Typography>
        )}
        <List dense sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
          {selectedChemicals.map((chemical) => (
            <ListItem key={chemical.id}>
              <ListItemText
                primary={chemical.Name}
                secondary={`ID: ${chemical.id} | Location: ${chemical['Storage Location']}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={selectedChemicals.length > 10}
        >
          Confirm & Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
