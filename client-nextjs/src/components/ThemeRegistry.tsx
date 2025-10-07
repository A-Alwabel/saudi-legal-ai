'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createModernTheme } from '@/theme/modernTheme';
import { NextAppDirEmotionCacheProvider } from './EmotionCache';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useThemeMode } from '@/contexts/ThemeContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { dir } = useTranslation();
  const { darkMode, isHydrated } = useThemeMode();
  
  // Always use light theme during SSR and initial hydration
  const theme = React.useMemo(
    () => createTheme(createModernTheme('light', dir)), // Force light theme for SSR consistency
    [dir]
  );

  // Client-side theme after hydration
  const clientTheme = React.useMemo(
    () => createTheme(createModernTheme(darkMode ? 'dark' : 'light', dir)),
    [dir, darkMode]
  );

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={isHydrated ? clientTheme : theme}>
        <CssBaseline />
        <div suppressHydrationWarning={true}>
          {children}
        </div>
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
