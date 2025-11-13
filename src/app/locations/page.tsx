import { Container } from '@mui/material';
import LocationManager from '@/features/locations/components/LocationManager';

export default function LocationsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <LocationManager />
    </Container>
  );
}
