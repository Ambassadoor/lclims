import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';

export const inventoryColumns: GridColDef[] = [
  {
    field: 'ID',
    headerName: 'ID',
    width: 120,
    sortComparator: (v1, v2) => {
      // Extract numeric part from ID (e.g., "CHEM-1101" -> 1101)
      const num1 = parseInt(String(v1).replace(/\D/g, ''), 10) || 0;
      const num2 = parseInt(String(v2).replace(/\D/g, ''), 10) || 0;
      return num1 - num2;
    },
  },
  {
    field: 'Name',
    headerName: 'Chemical Name',
    width: 300,
    flex: 1,
  },
  {
    field: 'Storage Location',
    headerName: 'Location',
    width: 180,
  },
  {
    field: 'Group #',
    headerName: 'Group',
    width: 75,
  },
  {
    field: 'CAS',
    headerName: 'CAS Number',
    width: 130,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 120,
    valueGetter: (value, row) => {
      let mass = row['Max Volume']['Mass'];
      let unit = row['Unit of Measurement'];

      if (mass >= 1000) {
        mass = mass / 1000;
        unit = unit === 'mL' ? 'L' : 'kg';
      } else if (mass < 1) {
        mass = mass * 1000;
        unit = 'mg';
      }
      if (!mass && !unit) return 'N/A';
      return `${mass ? mass : '0'} ${unit || 'g'}`;
    },
  },
  {
    field: 'Company',
    headerName: 'Company',
    width: 150,
  },
  {
    field: 'Status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
      const status = params.value || 'Unknown';
      const color =
        status === 'Unopened' ? 'success' : status.includes('Open') ? 'warning' : 'default';
      return <Chip label={status} color={color} size="small" />;
    },
  },
  {
    field: 'Percent Remaining',
    headerName: 'Remaining',
    width: 110,
  },
];
