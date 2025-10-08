'use client';

import React from 'react';
import { Card, CardProps, styled, alpha } from '@mui/material';

const StyledGlassCard = styled(Card)<{ glassvariant?: 'default' | 'primary' | 'secondary' }>(
  ({ theme, glassvariant = 'default' }) => ({
    background: theme.palette.mode === 'dark'
      ? `${alpha(theme.palette.background.paper, 0.8)}`
      : `${alpha(theme.palette.background.paper, 0.9)}`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    borderRadius: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: glassvariant === 'primary' 
        ? `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`
        : glassvariant === 'secondary'
        ? `linear-gradient(90deg, transparent, ${theme.palette.secondary.main}, transparent)`
        : `linear-gradient(90deg, transparent, ${alpha(theme.palette.text.primary, 0.1)}, transparent)`,
    },

    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 20px 60px ${alpha('#000000', 0.4)}`
        : `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
      
      '&::before': {
        background: glassvariant === 'primary' 
          ? `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`
          : glassvariant === 'secondary'
          ? `linear-gradient(90deg, transparent, ${theme.palette.secondary.light}, transparent)`
          : `linear-gradient(90deg, transparent, ${alpha(theme.palette.text.primary, 0.2)}, transparent)`,
      },
    },

    ...(glassvariant === 'primary' && {
      background: theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.1)})`,
    }),

    ...(glassvariant === 'secondary' && {
      background: theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.2)}, ${alpha(theme.palette.secondary.main, 0.1)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
    }),
  })
);

interface GlassCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'default' | 'primary' | 'secondary';
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default', 
  children, 
  ...props 
}) => {
  return (
    <StyledGlassCard
      glassvariant={variant}
      {...props}
    >
      {children}
    </StyledGlassCard>
  );
};
