'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import EmotionRegistry from './registry';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry options={{ key: 'mui' }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </EmotionRegistry>
  );
}
