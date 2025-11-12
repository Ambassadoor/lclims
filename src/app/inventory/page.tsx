import { Container, Typography, Card, CardContent } from '@mui/material';

export default function InventoryPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Chemical Inventory
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Inventory table will be displayed here. Add chemicals, search, filter, and manage your
            lab inventory.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
