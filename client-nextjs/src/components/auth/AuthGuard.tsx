'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from '@/i18n/TranslationProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = [
    `/${locale}`,
    `/${locale}/login`,
    `/${locale}/register`,
    `/${locale}/forgot-password`,
    `/${locale}/reset-password`,
  ];

  useEffect(() => {
    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // Small delay to check auth status
    const timer = setTimeout(() => {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and not on public route
        router.push(`/${locale}/login`);
      } else if (isAuthenticated && (pathname === `/${locale}/login` || pathname === `/${locale}/register`)) {
        // Redirect to dashboard if authenticated and on login/register page
        router.push(`/${locale}/dashboard`);
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname, router, locale]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={48} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          {t('messages.loading')}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}