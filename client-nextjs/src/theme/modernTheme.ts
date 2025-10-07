import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Palette } from '@mui/material/styles/createPalette';

// Modern Saudi-inspired color palette
const saudiGreen = {
  50: '#e8f5f0',
  100: '#c5e4da',
  200: '#9fd3c1',
  300: '#78c1a8',
  400: '#5bb395',
  500: '#3da582', // Main Saudi green
  600: '#369574',
  700: '#2d8363',
  800: '#247153',
  900: '#155835',
};

const saudiGold = {
  50: '#fef9e7',
  100: '#fcf0c3',
  200: '#fae69b',
  300: '#f7dc73',
  400: '#f5d554',
  500: '#f3cd35', // Saudi gold
  600: '#e5bd2f',
  700: '#d5a827',
  800: '#c5931f',
  900: '#ad7011',
};

const neutrals = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Arabic typography settings
const arabicFonts = [
  'Noto Sans Arabic',
  'Cairo',
  'Amiri',
  'Tajawal',
  'Almarai',
  'system-ui',
  '-apple-system',
].join(',');

const englishFonts = [
  'Inter',
  'Roboto',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

// Create theme function
export const createModernTheme = (mode: 'light' | 'dark', direction: 'ltr' | 'rtl'): ThemeOptions => {
  const isRTL = direction === 'rtl';
  const isDark = mode === 'dark';

  return {
    direction,
    palette: {
      mode,
      primary: {
        main: saudiGreen[500],
        light: saudiGreen[300],
        dark: saudiGreen[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: saudiGold[500],
        light: saudiGold[300],
        dark: saudiGold[700],
        contrastText: '#000000',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      background: {
        default: isDark ? '#0a0e27' : '#fafbfc',
        paper: isDark ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#1e293b',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? '#334155' : '#e2e8f0',
      grey: neutrals,
    },
    typography: {
      fontFamily: isRTL ? arabicFonts : englishFonts,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: isRTL ? '0' : '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: isRTL ? '0' : '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 400,
      },
      overline: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    spacing: 8,
    shadows: isDark ? [
      'none',
      '0px 1px 3px rgba(0, 0, 0, 0.4)',
      '0px 2px 6px rgba(0, 0, 0, 0.4)',
      '0px 4px 12px rgba(0, 0, 0, 0.4)',
      '0px 6px 18px rgba(0, 0, 0, 0.4)',
      '0px 8px 24px rgba(0, 0, 0, 0.4)',
      '0px 12px 36px rgba(0, 0, 0, 0.4)',
      '0px 16px 48px rgba(0, 0, 0, 0.4)',
      '0px 24px 60px rgba(0, 0, 0, 0.4)',
      '0px 32px 72px rgba(0, 0, 0, 0.4)',
      '0px 40px 84px rgba(0, 0, 0, 0.4)',
      '0px 48px 96px rgba(0, 0, 0, 0.4)',
      '0px 56px 108px rgba(0, 0, 0, 0.4)',
      '0px 64px 120px rgba(0, 0, 0, 0.4)',
      '0px 72px 132px rgba(0, 0, 0, 0.4)',
      '0px 80px 144px rgba(0, 0, 0, 0.4)',
      '0px 88px 156px rgba(0, 0, 0, 0.4)',
      '0px 96px 168px rgba(0, 0, 0, 0.4)',
      '0px 104px 180px rgba(0, 0, 0, 0.4)',
      '0px 112px 192px rgba(0, 0, 0, 0.4)',
      '0px 120px 204px rgba(0, 0, 0, 0.4)',
      '0px 128px 216px rgba(0, 0, 0, 0.4)',
      '0px 136px 228px rgba(0, 0, 0, 0.4)',
      '0px 144px 240px rgba(0, 0, 0, 0.4)',
      '0px 152px 252px rgba(0, 0, 0, 0.4)',
    ] : [
      'none',
      '0px 1px 3px rgba(16, 24, 40, 0.1)',
      '0px 2px 6px rgba(16, 24, 40, 0.1)',
      '0px 4px 12px rgba(16, 24, 40, 0.12)',
      '0px 6px 18px rgba(16, 24, 40, 0.12)',
      '0px 8px 24px rgba(16, 24, 40, 0.14)',
      '0px 12px 36px rgba(16, 24, 40, 0.14)',
      '0px 16px 48px rgba(16, 24, 40, 0.16)',
      '0px 24px 60px rgba(16, 24, 40, 0.16)',
      '0px 32px 72px rgba(16, 24, 40, 0.18)',
      '0px 40px 84px rgba(16, 24, 40, 0.18)',
      '0px 48px 96px rgba(16, 24, 40, 0.2)',
      '0px 56px 108px rgba(16, 24, 40, 0.2)',
      '0px 64px 120px rgba(16, 24, 40, 0.22)',
      '0px 72px 132px rgba(16, 24, 40, 0.22)',
      '0px 80px 144px rgba(16, 24, 40, 0.24)',
      '0px 88px 156px rgba(16, 24, 40, 0.24)',
      '0px 96px 168px rgba(16, 24, 40, 0.26)',
      '0px 104px 180px rgba(16, 24, 40, 0.26)',
      '0px 112px 192px rgba(16, 24, 40, 0.28)',
      '0px 120px 204px rgba(16, 24, 40, 0.28)',
      '0px 128px 216px rgba(16, 24, 40, 0.3)',
      '0px 136px 228px rgba(16, 24, 40, 0.3)',
      '0px 144px 240px rgba(16, 24, 40, 0.32)',
      '0px 152px 252px rgba(16, 24, 40, 0.32)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#475569 #334155' : '#cbd5e1 #f1f5f9',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#334155' : '#f1f5f9',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDark ? '#475569' : '#cbd5e1',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: isDark ? '#64748b' : '#94a3b8',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '0.95rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark 
                ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
                : '0 8px 25px rgba(16, 24, 40, 0.15)',
            },
          },
          contained: {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 4px 12px rgba(16, 24, 40, 0.1)',
            '&:hover': {
              boxShadow: isDark 
                ? '0 8px 25px rgba(0, 0, 0, 0.35)' 
                : '0 8px 25px rgba(16, 24, 40, 0.2)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: isDark 
              ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
              : '0 4px 20px rgba(16, 24, 40, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark 
                ? '0 12px 40px rgba(0, 0, 0, 0.35)' 
                : '0 12px 40px rgba(16, 24, 40, 0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark 
              ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
              : '0 2px 8px rgba(16, 24, 40, 0.06)',
          },
          elevation2: {
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 4px 12px rgba(16, 24, 40, 0.08)',
          },
          elevation3: {
            boxShadow: isDark 
              ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
              : '0 6px 16px rgba(16, 24, 40, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#64748b' : '#94a3b8',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 500,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            '&.MuiChip-filled': {
              background: isDark 
                ? 'linear-gradient(135deg, #334155, #475569)' 
                : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(20px)',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              transform: 'translateX(4px)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              borderLeft: `3px solid ${saudiGreen[500]}`,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#64748b',
            color: isDark ? '#f1f5f9' : '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: 8,
            boxShadow: isDark 
              ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
              : '0 8px 25px rgba(16, 24, 40, 0.15)',
          },
          arrow: {
            color: isDark ? '#1e293b' : '#64748b',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid',
            '&.MuiAlert-filledSuccess': {
              backgroundColor: saudiGreen[500],
            },
            '&.MuiAlert-filledWarning': {
              backgroundColor: saudiGold[500],
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          },
        },
      },
    },
  };
};

// Export default themes
export const lightTheme = createTheme(createModernTheme('light', 'ltr'));
export const darkTheme = createTheme(createModernTheme('dark', 'ltr'));
export const lightRTLTheme = createTheme(createModernTheme('light', 'rtl'));
export const darkRTLTheme = createTheme(createModernTheme('dark', 'rtl'));
