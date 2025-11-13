'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { Box, Button, CircularProgress, Alert, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchChemicals } from '../store/inventorySlice';
import { inventoryColumns } from '../config/inventoryColumns';
import ChemicalFormDialog from './ChemicalFormDialog';
import EditConfirmDialog from './EditConfirmDialog';

export default function InventoryTable() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: chemicals, isLoading, error } = useAppSelector((state) => state.inventory);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Debounce the search query to reduce filtering operations
  const debouncedSearchQuery = useDebounce(localSearchQuery, 200);

  // Get the full data of selected rows
  const selectedChemicals = useMemo(() => {
    return chemicals.filter((chemical) => selectedRows.includes(chemical.ID));
  }, [chemicals, selectedRows]);

  // Fetch chemicals on mount
  useEffect(() => {
    dispatch(fetchChemicals());
  }, [dispatch]);

  // Reset pagination when search changes
  useEffect(() => {
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // Filter chemicals based on debounced search query - memoized for performance
  const filteredChemicals = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return chemicals;

    const query = debouncedSearchQuery.toLowerCase();
    return chemicals.filter((chemical) => {
      return (
        chemical.ID?.toLowerCase().includes(query) ||
        chemical.Name?.toLowerCase().includes(query) ||
        chemical.CAS?.toLowerCase().includes(query) ||
        chemical['Storage Location']?.toLowerCase().includes(query) ||
        chemical.Company?.toLowerCase().includes(query)
      );
    });
  }, [chemicals, debouncedSearchQuery]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading chemicals: {error}. Make sure json-server is running on port 8088.
      </Alert>
    );
  }

  // Show if we're filtering (search query exists but debounced hasn't caught up)
  const isFiltering = localSearchQuery !== debouncedSearchQuery;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search by name, ID, CAS, location, or company..."
          variant="outlined"
          size="small"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 500 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {isFiltering ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            disabled={selectedRows.length === 0 || selectedRows.length > 10}
            onClick={() => setEditDialogOpen(true)}
            title={selectedRows.length > 10 ? 'Maximum 10 items can be edited at once' : ''}
          >
            Edit {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Chemical
          </Button>
        </Box>
      </Box>

      {/* Add Chemical Dialog */}
      <ChemicalFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={(data) => {
          console.log('New chemical data:', data);
          // TODO: POST to API and refresh table
        }}
      />

      {/* Edit Confirmation Dialog */}
      <EditConfirmDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        selectedChemicals={selectedChemicals}
        selectedIds={selectedRows}
      />

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredChemicals}
          columns={inventoryColumns}
          getRowId={(row) => row.ID}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          onRowClick={(params) => {
            // Navigate to view page with the chemical ID
            router.push(`/inventory/view?ids=${params.row.ID}`);
          }}
          onRowSelectionModelChange={(newSelection) => {
            // newSelection.ids is a Set, convert to array
            const selectedIds = Array.from(newSelection.ids) as string[];
            setSelectedRows(selectedIds);
          }}
          // Performance optimizations
          density="compact"
          rowHeight={52}
          // disableColumnMenu
          // disableColumnSelector
          // disableDensitySelector
          loading={isFiltering}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>
    </Box>
  );
}
