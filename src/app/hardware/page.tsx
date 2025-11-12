import { Container, Typography, Box, Card, CardContent, CardHeader } from '@mui/material';

export default function HardwarePage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Hardware Integration
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        <Card>
          <CardHeader title="Barcode Scanner" />
          <CardContent>
            <Typography color="text.secondary">
              Scan barcodes to quickly lookup and manage inventory items.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Scale Reader" />
          <CardContent>
            <Typography color="text.secondary">
              Connect to USB scale to capture weight measurements during transactions.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Label Printer" />
          <CardContent>
            <Typography color="text.secondary">
              Print barcode labels for new items and storage locations.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
