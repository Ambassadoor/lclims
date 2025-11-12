import { Container, Typography, Card, CardContent } from '@mui/material';

export default function LocationsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Storage Locations
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Manage your lab's storage locations. Add, edit, and organize where chemicals are stored.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
