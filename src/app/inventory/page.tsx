import { Container, Typography } from '@mui/material';
import InventoryTable from '@/features/inventory/components/InventoryTable';

export default function InventoryPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Chemical Inventory
      </Typography>

      <InventoryTable />
    </Container>
  );
}
