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
  MenuItem,
  IconButton,
  useTheme,
} from '@mui/material';
import { PersonAdd, Brightness4, Brightness7 } from '@mui/icons-material';
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

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  lawFirmId: string;
}

export default function RegisterPage() {
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
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);
      console.log('Register response:', response); // Debug log
      
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

      toast.success(t('messages.registerSuccess'));
      
      // Use Next.js router for navigation
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        // Fallback to window.location if router doesn't work
        setTimeout(() => {
          window.location.href = `/${locale}/dashboard`;
        }, 1000);
      }, 500);
      
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || t('messages.registerError'));
      toast.error(err.message || t('messages.registerError'));
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
          marginTop: 4,
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
            <PersonAdd sx={{ color: 'white', fontSize: 30 }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            {t('auth.register.title')}
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {t('auth.register.subtitle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              {...register('name', {
                required: t('auth.errors.nameRequired'),
                minLength: {
                  value: 2,
                  message: t('auth.errors.nameMin'),
                },
              })}
              margin="normal"
              required
              fullWidth
              id="name"
              label={t('auth.register.name')}
              name="name"
              autoComplete="name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
            />

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
              label={t('auth.register.email')}
              name="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <TextField
              {...register('lawFirmId', {
                required: t('auth.errors.lawFirmRequired'),
              })}
              margin="normal"
              required
              fullWidth
              select
              id="lawFirmId"
              label={t('auth.register.lawFirm')}
              name="lawFirmId"
              error={!!errors.lawFirmId}
              helperText={errors.lawFirmId?.message}
              disabled={isLoading}
              defaultValue=""
            >
              <MenuItem value="1">مكتب المحاماة السعودي / Saudi Law Firm</MenuItem>
              <MenuItem value="2">مكتب الاستشارات القانونية / Legal Consultations Office</MenuItem>
              <MenuItem value="3">مكتب المحاماة الدولي / International Law Firm</MenuItem>
            </TextField>

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
              label={t('auth.register.password')}
              type="password"
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
            />

            <TextField
              {...register('confirmPassword', {
                required: t('auth.errors.passwordRequired'),
                validate: (value) =>
                  value === password || t('auth.errors.passwordMismatch'),
              })}
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.register.confirmPassword')}
              type="password"
              id="confirmPassword"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
                t('auth.register.submit')
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href={`/${locale}/login`} passHref>
                <MuiLink variant="body2">
                  {t('auth.register.hasAccount')}
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
