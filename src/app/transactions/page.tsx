import { Container, Typography, Card, CardContent } from '@mui/material';

export default function TransactionsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Transaction History
      </Typography>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            View and track all chemical check-ins, check-outs, moves, and disposals.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
