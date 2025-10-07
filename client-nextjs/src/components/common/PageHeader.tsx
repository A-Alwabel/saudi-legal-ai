'use client';

import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  useTheme,
} from '@mui/material';
import {
  NavigateNext,
  Home,
  Add,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/modern/AnimatedButton';

interface BreadcrumbItem {
  label: string;
  labelAr?: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: {
    label: string;
    labelAr?: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryActions?: Array<{
    label: string;
    labelAr?: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  }>;
  locale?: 'en' | 'ar';
}

export default function PageHeader({
  title,
  titleAr,
  subtitle,
  subtitleAr,
  breadcrumbs = [],
  primaryAction,
  secondaryActions = [],
  locale = 'en',
}: PageHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const isRTL = locale === 'ar';

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/dashboard');
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            {isRTL ? 'الرئيسية' : 'Home'}
          </Link>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">
                {isRTL ? crumb.labelAr || crumb.label : crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                href={crumb.path || '#'}
                onClick={(e) => {
                  e.preventDefault();
                  if (crumb.path) handleNavigate(crumb.path);
                }}
                sx={{
                  cursor: crumb.path ? 'pointer' : 'default',
                  '&:hover': crumb.path ? {
                    textDecoration: 'underline',
                  } : {},
                }}
              >
                {isRTL ? crumb.labelAr || crumb.label : crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: subtitle ? 1 : 0,
            }}
          >
            {isRTL ? titleAr || title : title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {isRTL ? subtitleAr || subtitle : subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {(primaryAction || secondaryActions.length > 0) && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outlined'}
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{ minWidth: 120 }}
              >
                {isRTL ? action.labelAr || action.label : action.label}
              </Button>
            ))}
            {primaryAction && (
              <AnimatedButton
                variant="contained"
                startIcon={primaryAction.icon || <Add />}
                onClick={primaryAction.onClick}
                sx={{ minWidth: 140 }}
              >
                {isRTL ? primaryAction.labelAr || primaryAction.label : primaryAction.label}
              </AnimatedButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
