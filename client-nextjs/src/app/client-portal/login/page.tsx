'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Container,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  Language,
  Person,
  Business,
  Description,
  Receipt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { clientPortalApi } from '../../../services/unifiedApiService';

export default function ClientPortalLoginPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = t('validation.email.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.email.invalid');
    }

    if (!formData.password) {
      errors.password = t('validation.password.required');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use auth API for login
      const response = await fetch('/api/client-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(res => res.json());
      
      if (response.success) {
        // Store client token and data
        localStorage.setItem('clientToken', response.data.token);
        localStorage.setItem('clientData', JSON.stringify(response.data.client));
        
        router.push('/client-portal/dashboard');
      } else {
        setError(response.message || t('auth.login.failed'));
      }
    } catch (error: any) {
      setError(error.message || t('auth.login.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                  {t('clientPortal.login.title')}
                </Typography>
                <IconButton onClick={toggleLanguage} color="primary">
                  <Language />
                </IconButton>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {t('clientPortal.login.subtitle')}
              </Typography>
              
              {/* Client Portal Features */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('clientPortal.login.features')}:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <Chip icon={<Person />} label={t('clientPortal.features.cases')} size="small" />
                  <Chip icon={<Description />} label={t('clientPortal.features.documents')} size="small" />
                  <Chip icon={<Receipt />} label={t('clientPortal.features.invoices')} size="small" />
                </Box>
              </Box>
            </Box>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                label={t('clientPortal.login.email')}
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!formErrors.email}
                helperText={formErrors.email}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('clientPortal.login.password')}
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {isLoading ? t('common.loading') : t('clientPortal.login.button')}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('clientPortal.login.or')}
                </Typography>
              </Divider>

              {/* Links */}
              <Box sx={{ textAlign: 'center', space: 2 }}>
                <Link
                  href="/client-portal/forgot-password"
                  variant="body2"
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {t('clientPortal.login.forgotPassword')}
                </Link>
                
                <Typography variant="body2" color="text.secondary">
                  {t('clientPortal.login.needHelp')}{' '}
                  <Link
                    href="/contact"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {t('clientPortal.login.contactSupport')}
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* Back to Main Site */}
            <Divider sx={{ my: 4 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('clientPortal.login.lawyerAccess')}
              </Typography>
              <Button
                variant="outlined"
                href="/auth/login"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {t('clientPortal.login.lawyerPortal')}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
}
