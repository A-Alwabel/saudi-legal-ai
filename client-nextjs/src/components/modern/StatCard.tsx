'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  alpha,
  useTheme,
  styled,
} from '@mui/material';
import { TrendingUp, TrendingDown, MoreVert } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

const StyledStatCard = styled(GlassCard)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 56,
  height: 56,
  borderRadius: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
    backdropFilter: 'blur(10px)',
  },
}));

const TrendIndicator = styled(Box)<{ trend: 'up' | 'down' | 'neutral' }>(({ theme, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: trend === 'up' 
    ? alpha(theme.palette.success.main, 0.1)
    : trend === 'down'
    ? alpha(theme.palette.error.main, 0.1)
    : alpha(theme.palette.text.secondary, 0.1),
  color: trend === 'up' 
    ? theme.palette.success.main
    : trend === 'down'
    ? theme.palette.error.main
    : theme.palette.text.secondary,
}));

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
  subtitle,
  onClick,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 14 }} />;
      case 'down':
        return <TrendingDown sx={{ fontSize: 14 }} />;
      default:
        return null;
    }
  };

  return (
    <StyledStatCard
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          '& .stat-card-actions': {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <IconContainer
            sx={{
              color: color || theme.palette.primary.main,
              '& svg': {
                fontSize: 28,
                zIndex: 1,
                position: 'relative',
              },
            }}
          >
            {icon}
          </IconContainer>
          
          <IconButton
            size="small"
            className="stat-card-actions"
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s ease',
              color: 'text.secondary',
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        <Box>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: color 
                ? `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            >
              {value}
            </motion.span>
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, mb: trend ? 1 : 0 }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          )}

          {trend && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <TrendIndicator trend={trend.direction}>
                {getTrendIcon()}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>
                  {trend.label}
                </Typography>
              </TrendIndicator>
            </motion.div>
          )}
        </Box>
      </CardContent>
    </StyledStatCard>
  );
};
