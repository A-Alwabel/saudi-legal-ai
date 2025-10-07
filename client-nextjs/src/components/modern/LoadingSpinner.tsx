'use client';

import React from 'react';
import { Box, CircularProgress, Typography, alpha, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledLoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const PulsingDot = styled(motion.div)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  margin: '0 4px',
}));

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'جاري التحميل...',
  variant = 'spinner',
  size = 'medium',
  fullScreen = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {[0, 1, 2].map((index) => (
              <PulsingDot
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </Box>
        );

      case 'pulse':
        return (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ marginBottom: 16 }}
          >
            <Box
              sx={{
                width: getSize(),
                height: getSize(),
                borderRadius: '50%',
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            />
          </motion.div>
        );

      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ marginBottom: 16 }}
          >
            <CircularProgress
              size={getSize()}
              thickness={3}
              sx={{
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          </motion.div>
        );
    }
  };

  const content = (
    <StyledLoadingContainer>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderSpinner()}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ fontWeight: 500 }}
          >
            {message}
          </Typography>
        </motion.div>
      </motion.div>
    </StyledLoadingContainer>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      </Box>
    );
  }

  return content;
};
