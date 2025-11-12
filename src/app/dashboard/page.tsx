import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Chemicals', value: '0', icon: <InventoryIcon />, color: '#2563eb' },
    { label: 'Storage Locations', value: '0', icon: <LocationOnIcon />, color: '#7c3aed' },
    { label: 'Recent Transactions', value: '0', icon: <HistoryIcon />, color: '#10b981' },
    { label: 'Expiring Soon', value: '0', icon: <WarningIcon />, color: '#f59e0b' },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
        }}
      >
        {stats.map((stat) => (
          <Box key={stat.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Typography color="text.secondary">No recent activity to display.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
