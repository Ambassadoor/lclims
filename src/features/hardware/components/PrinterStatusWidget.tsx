'use client';

import { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import CircleIcon from '@mui/icons-material/Circle';
import { usePrinterStatus } from '../hooks/usePrinterStatus';

export default function PrinterStatusWidget() {
  const { selectedPrinter, printerStatus, availablePrinters, isLoading, selectPrinter, refresh } =
    usePrinterStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  // Determine status color
  const getStatusColor = () => {
    if (!printerStatus) return 'default'; // Gray for unknown/offline
    return printerStatus.online ? 'success' : 'error'; // Green for online, red for offline
  };

  const getStatusText = () => {
    if (!printerStatus) return 'Unknown';
    return printerStatus.online ? 'Online' : 'Offline';
  };

  const getShortName = () => {
    if (!selectedPrinter) return 'No Printer';
    return selectedPrinter.replace('Brother ', '').replace('PT-', '');
  };

  return (
    <Chip
      icon={<PrintIcon />}
      label={
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={(e) => {
            // Only collapse if we're not leaving to interact with the select menu
            if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsExpanded(false);
            }
          }}
        >
          {/* Printer Name - Always visible */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {getShortName()}
          </Typography>

          {/* Expanded Details */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              overflow: 'hidden',
              maxWidth: isExpanded ? 500 : 0,
              opacity: isExpanded ? 1 : 0,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {/* Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: !printerStatus
                    ? 'text.disabled'
                    : printerStatus.online
                      ? 'success.main'
                      : 'error.main',
                }}
              />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {getStatusText()}
              </Typography>
            </Box>

            {/* Media Type */}
            {printerStatus?.online && printerStatus.mediaName && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  borderLeft: 1,
                  borderColor: 'divider',
                  pl: 1,
                  ml: 0.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {printerStatus.mediaName}
              </Typography>
            )}

            {/* Printer Selector Dropdown */}
            {availablePrinters.length > 1 && (
              <Select
                value={selectedPrinter || ''}
                onChange={(e) => selectPrinter(e.target.value)}
                onClose={() => setIsExpanded(false)}
                variant="standard"
                disabled={isLoading}
                sx={{
                  fontSize: '0.75rem',
                  minWidth: 100,
                  '& .MuiInput-input': {
                    py: 0,
                    pr: 3,
                  },
                  '&:before, &:after': {
                    display: 'none',
                  },
                  '& .MuiSelect-icon': {
                    right: 0,
                    fontSize: 16,
                  },
                }}
              >
                {availablePrinters.map((printer) => (
                  <MenuItem key={printer.name} value={printer.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography sx={{ flex: 1 }}>
                        {printer.name.replace('Brother ', '').replace('PT-', '')}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: printer.online ? 'success.main' : 'error.main',
                          fontSize: '0.7rem',
                        }}
                      >
                        {printer.online ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            )}

            {/* Refresh Button */}
            <Tooltip title="Refresh status">
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="small"
                sx={{
                  ml: 0.5,
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {isRefreshing ? (
                  <CircularProgress size={14} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
      color={getStatusColor()}
      sx={{
        height: 'auto',
        px: 1,
        py: 0.5,
        transition: 'all 0.3s ease-in-out',
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
}
