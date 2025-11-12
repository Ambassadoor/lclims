'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Mock data
const mockChemicals = [
  {
    id: '1',
    name: 'Sodium Chloride',
    casNumber: '7647-14-5',
    quantity: 500,
    unit: 'g',
    location: 'Cabinet A-1',
    expirationDate: '2025-12-31',
    status: 'In Stock',
  },
  {
    id: '2',
    name: 'Ethanol',
    casNumber: '64-17-5',
    quantity: 2.5,
    unit: 'L',
    location: 'Flammables Cabinet',
    expirationDate: '2024-06-15',
    status: 'Low Stock',
  },
  {
    id: '3',
    name: 'Hydrochloric Acid',
    casNumber: '7647-01-0',
    quantity: 1,
    unit: 'L',
    location: 'Acid Cabinet',
    expirationDate: '2026-03-20',
    status: 'In Stock',
  },
  {
    id: '4',
    name: 'Acetone',
    casNumber: '67-64-1',
    quantity: 0.25,
    unit: 'L',
    location: 'Flammables Cabinet',
    expirationDate: '2024-01-10',
    status: 'Expired',
  },
  {
    id: '5',
    name: 'Sodium Hydroxide',
    casNumber: '1310-73-2',
    quantity: 250,
    unit: 'g',
    location: 'Cabinet B-3',
    expirationDate: '2025-09-30',
    status: 'In Stock',
  },
];

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Chemical Name',
    width: 200,
    flex: 1,
  },
  {
    field: 'casNumber',
    headerName: 'CAS Number',
    width: 130,
  },
  {
    field: 'quantity',
    headerName: 'Quantity',
    width: 100,
    renderCell: (params) => `${params.row.quantity} ${params.row.unit}`,
  },
  {
    field: 'location',
    headerName: 'Location',
    width: 180,
  },
  {
    field: 'expirationDate',
    headerName: 'Expiration Date',
    width: 130,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const color =
        params.value === 'In Stock'
          ? 'success'
          : params.value === 'Low Stock'
            ? 'warning'
            : 'error';
      return <Chip label={params.value} color={color} size="small" />;
    },
  },
];

export default function InventoryTable() {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Chemical
        </Button>
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={mockChemicals}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
