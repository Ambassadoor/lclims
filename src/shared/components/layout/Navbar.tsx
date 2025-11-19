'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import Person from '@mui/icons-material/Person';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import PrinterStatusWidget from '@/features/hardware/components/PrinterStatusWidget';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ callbackUrl: '/api/auth/signin' });
  };

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 0, fontWeight: 700, mr: 4 }}>
          Lipscomb Chemistry & Biochemistry
        </Typography>

        <Typography variant="body2" sx={{ flexGrow: 1, opacity: 0.8 }}>
          Laboratory Inventory Management System
        </Typography>

        {/* Printer Status Widget */}
        <PrinterStatusWidget />

        <Box sx={{ ml: 2 }}>
          {status === 'loading' ? (
            <IconButton size="large" color="inherit" disabled>
              <AccountCircle />
            </IconButton>
          ) : session ? (
            <>
              <IconButton
                size="large"
                aria-label="account menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ p: 0.5 }}
              >
                <Avatar
                  alt={session.user?.name || 'User'}
                  src={session.user?.image || undefined}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {session.user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {session.user?.email}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                    {session.user?.role?.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton size="large" aria-label="sign in" onClick={handleSignIn} color="inherit">
              <AccountCircle />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
