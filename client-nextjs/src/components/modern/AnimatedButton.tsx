'use client';

import React from 'react';
import { Button, ButtonProps, styled, alpha } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';

const StyledAnimatedButton = styled(Button)<{ customvariant?: 'gradient' }>(
  ({ theme, customvariant }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
    fontWeight: 600,
    textTransform: 'none',
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
      transition: 'left 0.5s ease',
    },

    '&:hover::before': {
      left: '100%',
    },

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 8px 30px ${alpha('#000000', 0.3)}`
        : `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
    },

    '&:active': {
      transform: 'translateY(0)',
    },

    ...(customvariant === 'gradient' && {
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      color: theme.palette.primary.contrastText,
      border: 'none',
      
      '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
      },
    }),
  })
);

const MotionButton = motion.create(StyledAnimatedButton);

interface AnimatedButtonProps extends Omit<ButtonProps, 'ref'>, MotionProps {
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  loading = false,
  icon,
  disabled,
  ...props 
}) => {
  return (
    <MotionButton
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      startIcon={loading ? undefined : icon}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 20,
            height: 20,
            border: '2px solid currentColor',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            marginRight: 8,
          }}
        />
      ) : null}
      {children}
    </MotionButton>
  );
};
