'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchChemicals } from '../store/inventorySlice';
import { getInventoryColumns } from '../config/inventoryColumns';
import { Chemical } from '../types';
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
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Generate columns based on edit mode
  const columns = useMemo(() => getInventoryColumns(isEditMode), [isEditMode]);

  // Handle inline cell edits
  const handleProcessRowUpdate = async (newRow: Chemical, oldRow: Chemical) => {
    try {
      // TODO: Replace with actual API call
      console.log('Updating row:', { newRow, oldRow });
      // await apiClient.put(`inventory/${newRow.ID}`, newRow);

      // For now, just return the new row to update the UI
      return newRow;
    } catch (error) {
      console.error('Error updating row:', error);
      // Return old row to revert changes on error
      return oldRow;
    }
  };

  const handleProcessRowUpdateError = (error: Error) => {
    console.error('Error processing row update:', error);
    // Could show a toast notification here
  };

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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={isEditMode ? 'Disable inline editing' : 'Enable inline editing'}>
            <ToggleButton
              value="edit"
              selected={isEditMode}
              onChange={() => setIsEditMode(!isEditMode)}
              size="small"
              sx={{ px: 2 }}
            >
              {isEditMode ? <EditNoteIcon /> : <VisibilityIcon />}
              <Box component="span" sx={{ ml: 1, fontSize: '0.875rem' }}>
                {isEditMode ? 'Editing' : 'View Only'}
              </Box>
            </ToggleButton>
          </Tooltip>
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
          columns={columns}
          getRowId={(row) => row.ID}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          onRowClick={(params, event) => {
            // Don't navigate when clicking on editable cells or checkboxes
            const target = event.target as HTMLElement;
            const isEditableCell = target.closest('.MuiDataGrid-cell--editable');
            const isCheckbox = target.closest('.MuiCheckbox-root');

            if (!isEditableCell && !isCheckbox && !isEditMode) {
              router.push(`/inventory/view?ids=${params.row.ID}`);
            }
          }}
          onRowSelectionModelChange={(newSelection) => {
            // newSelection.ids is a Set, convert to array
            const selectedIds = Array.from(newSelection.ids) as string[];
            setSelectedRows(selectedIds);
          }}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
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
              cursor: isEditMode ? 'default' : 'pointer',
            },
            '& .MuiDataGrid-cell--editable': {
              bgcolor: isEditMode ? 'action.hover' : 'transparent',
              '&:hover': {
                bgcolor: isEditMode ? 'action.selected' : 'action.hover',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
