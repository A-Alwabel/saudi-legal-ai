'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import { LockOutlined, Brightness4, Brightness7 } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { authService } from '@/services/unifiedApiService';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useThemeMode } from '@/contexts/ThemeContext';
import { LanguageToggleSimple } from '@/components/common/LanguageToggle';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data.email, data.password);
      console.log('Login response:', response); // Debug log
      
      // Handle both response formats (data wrapper or direct)
      const userData = response.data?.user || (response as any).user;
      const userToken = response.data?.token || (response as any).token;

      // Store credentials in Redux
      dispatch(setCredentials({
        user: userData,
        token: userToken,
      }));

      // Store token in localStorage and cookie for persistence
      if (userToken) {
        localStorage.setItem('auth_token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set cookie for middleware authentication
        document.cookie = `auth_token=${userToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }

      toast.success(t('messages.loginSuccess'));
      
      // Use Next.js router for navigation
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        // Fallback to window.location if router doesn't work
        setTimeout(() => {
          window.location.href = `/${locale}/dashboard`;
        }, 1000);
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('messages.loginError'));
      toast.error(err.message || t('messages.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1 }}>
        <IconButton onClick={toggleDarkMode} sx={{ color: theme.palette.text.primary }}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <LanguageToggleSimple />
      </Box>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <LockOutlined sx={{ color: 'white', fontSize: 30 }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.login.title')}
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {t('auth.login.subtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              {...register('email', {
                required: t('auth.errors.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('auth.errors.emailInvalid'),
                },
              })}
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.login.email')}
              name="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <TextField
              {...register('password', {
                required: t('auth.errors.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('auth.errors.passwordMin'),
                },
              })}
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.login.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.login.submit')
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.login.demoCredentials')}:
              </Typography>
              <Typography variant="body2" color="primary">
                Email: demo@saudi-law.com
              </Typography>
              <Typography variant="body2" color="primary">
                Password: password123
              </Typography>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <MuiLink 
                component={Link} 
                href={`/${locale}/register`} 
                variant="body2"
              >
                {t('auth.login.noAccount')}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
