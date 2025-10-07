'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Container,
  Fade,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Gavel,
  AttachMoney,
  Assessment,
  Schedule,
  AutoAwesome,
  Description,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsService } from '@/services/analyticsService';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { StatCard } from '@/components/modern/StatCard';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';

// Enhanced chart colors for modern theme
const CHART_COLORS = ['#3da582', '#f3cd35', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

// Mock data for demonstration - will be translated dynamically
const getMonthlyData = (t: (key: string) => string) => [
  { month: t('months.january'), cases: 24, revenue: 45000, clients: 12 },
  { month: t('months.february'), cases: 31, revenue: 52000, clients: 15 },
  { month: t('months.march'), cases: 28, revenue: 48000, clients: 14 },
  { month: t('months.april'), cases: 35, revenue: 65000, clients: 18 },
  { month: t('months.may'), cases: 42, revenue: 78000, clients: 22 },
  { month: t('months.june'), cases: 38, revenue: 72000, clients: 20 },
];

const getCaseTypeData = (t: (key: string) => string) => [
  { name: t('caseTypes.commercial'), value: 35, color: CHART_COLORS[0] },
  { name: t('caseTypes.labor'), value: 25, color: CHART_COLORS[1] },
  { name: t('caseTypes.family'), value: 20, color: CHART_COLORS[2] },
  { name: t('caseTypes.criminal'), value: 15, color: CHART_COLORS[3] },
  { name: t('caseTypes.realEstate'), value: 5, color: CHART_COLORS[4] },
];

const getRecentActivities = (t: (key: string) => string) => [
  { id: 1, type: 'case', title: t('activities.newCommercialCase'), time: t('time.twoHoursAgo'), status: 'new' },
  { id: 2, type: 'document', title: t('activities.documentUploaded'), time: t('time.threeHoursAgo'), status: 'completed' },
  { id: 3, type: 'client', title: t('activities.newClientRegistered'), time: t('time.fiveHoursAgo'), status: 'pending' },
  { id: 4, type: 'consultation', title: t('activities.aiConsultationCompleted'), time: t('time.oneDayAgo'), status: 'completed' },
];

export default function ModernDashboardPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalytics({
        totalCases: 156,
        activeCases: 42,
        totalClients: 87,
        totalRevenue: 425000,
        monthlyGrowth: 12.5,
        clientGrowth: 8.3,
        revenueGrowth: 15.7,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner 
          message={t('messages.loading')}
          variant="pulse"
          size="large"
        />
      </Container>
    );
  }

  const statCards = [
    {
      title: t('dashboard.stats.totalCases'),
      value: analytics?.totalCases || 0,
      icon: <Gavel />,
      color: theme.palette.primary.main,
      trend: {
        value: analytics?.monthlyGrowth || 0,
        label: t('dashboard.growth.monthly'),
        direction: 'up' as const,
      },
    },
    {
      title: t('dashboard.stats.activeCases'),
      value: analytics?.activeCases || 0,
      icon: <Assessment />,
      color: theme.palette.secondary.main,
      trend: {
        value: 5.2,
        label: t('dashboard.growth.weekly'),
        direction: 'up' as const,
      },
    },
    {
      title: t('dashboard.stats.clients'),
      value: analytics?.totalClients || 0,
      icon: <People />,
      color: theme.palette.success.main,
      trend: {
        value: analytics?.clientGrowth || 0,
        label: t('dashboard.growth.clients'),
        direction: 'up' as const,
      },
    },
    {
      title: t('dashboard.stats.revenue'),
      value: `${analytics?.totalRevenue?.toLocaleString(isRTL ? 'ar-SA' : 'en-US') || 0} ${t('currency.sar')}`,
      icon: <AttachMoney />,
      color: theme.palette.warning.main,
      trend: {
        value: analytics?.revenueGrowth || 0,
        label: t('dashboard.growth.revenue'),
        direction: 'up' as const,
      },
    },
  ];

  const monthlyData = getMonthlyData(t);
  const caseTypeData = getCaseTypeData(t);
  const recentActivities = getRecentActivities(t);

  // Custom formatters for better Arabic/RTL support
  const formatTooltip = (value: any, name: string) => {
    if (name === 'cases') return [value, t('dashboard.charts.dataLabels.cases')];
    if (name === 'revenue') return [`${value?.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} ${t('currency.sar')}`, t('dashboard.charts.dataLabels.revenue')];
    if (name === 'clients') return [value, t('dashboard.charts.dataLabels.clients')];
    return [value, name];
  };

  const formatLegend = (value: string) => {
    if (value === 'cases') return t('dashboard.charts.dataLabels.cases');
    if (value === 'revenue') return t('dashboard.charts.dataLabels.revenue');
    if (value === 'clients') return t('dashboard.charts.dataLabels.clients');
    return value;
  };

  const formatPieLabel = ({ name, percent }: any) => {
    const percentage = (percent * 100).toFixed(0);
    // Better spacing and formatting for Arabic text
    return isRTL ? `%${percentage} ${name}` : `${name} ${percentage}%`;
  };

  // Optimized label function for faster rendering (no useMemo to avoid hooks violation)
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, fill }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + (isRTL ? 45 : 25); // Optimized distance
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);
    const label = isRTL ? `%${percentage} ${name}` : `${name} ${percentage}%`;

    return (
      <text
        x={x}
        y={y}
        fill={fill} // Use the slice color directly from Recharts
        textAnchor={isRTL ? "middle" : (x > cx ? 'start' : 'end')}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fontFamily={isRTL ? 'Noto Sans Arabic' : 'Inter'}
        stroke="white"
        strokeWidth="1"
        paintOrder="stroke fill"
      >
        {label}
      </text>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('dashboard.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              {t('dashboard.subtitle')}
            </Typography>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <StatCard {...card} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Monthly Statistics */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <GlassCard variant="primary">
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {t('dashboard.charts.monthlyStats')}
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="month" 
                          stroke={theme.palette.text.secondary}
                          fontSize={12}
                          tick={{ fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter' }}
                        />
                        <YAxis 
                          stroke={theme.palette.text.secondary} 
                          fontSize={12}
                          tick={{ fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter' }}
                        />
                        <Tooltip 
                          formatter={formatTooltip}
                          labelStyle={{ 
                            fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 12,
                            boxShadow: theme.shadows[4],
                            fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cases"
                          stroke={theme.palette.primary.main}
                          fillOpacity={1}
                          fill="url(#colorCases)"
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={theme.palette.secondary.main}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={3}
                        />
                        <Legend 
                          formatter={formatLegend}
                          wrapperStyle={{ 
                            fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter',
                            direction: isRTL ? 'rtl' : 'ltr'
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>

          {/* Case Types Pie Chart */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <GlassCard variant="secondary">
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {t('dashboard.charts.caseTypes')}
                  </Typography>
                  <Box sx={{ height: isRTL ? 420 : 380, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={caseTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={isRTL ? 50 : 60}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                          label={renderCustomLabel}
                          labelLine={false}
                        >
                          {caseTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            const total = caseTypeData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            const formattedValue = isRTL 
                              ? `%${percentage} (${value})`
                              : `${value} (${percentage}%)`;
                            return [formattedValue, name];
                          }}
                          labelStyle={{ 
                            fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter',
                            direction: isRTL ? 'rtl' : 'ltr',
                            fontSize: 14,
                            fontWeight: 600
                          }}
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 12,
                            boxShadow: theme.shadows[4],
                            fontFamily: isRTL ? 'Noto Sans Arabic' : 'Inter',
                            direction: isRTL ? 'rtl' : 'ltr',
                            fontSize: 13,
                            padding: 12
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('dashboard.charts.recentActivity')}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentActivities.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      '&:hover': {
                        backgroundColor: `${theme.palette.action.hover}`,
                        borderRadius: 2,
                        mx: -1,
                        px: 1,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${theme.palette.primary.main}20`,
                        mr: 2,
                      }}
                    >
                      {activity.type === 'case' && <Gavel sx={{ color: theme.palette.primary.main }} />}
                      {activity.type === 'document' && <Description sx={{ color: theme.palette.success.main }} />}
                      {activity.type === 'client' && <People sx={{ color: theme.palette.warning.main }} />}
                      {activity.type === 'consultation' && <AutoAwesome sx={{ color: theme.palette.secondary.main }} />}
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: activity.status === 'completed' 
                          ? `${theme.palette.success.main}20`
                          : activity.status === 'pending'
                          ? `${theme.palette.warning.main}20`
                          : `${theme.palette.info.main}20`,
                        color: activity.status === 'completed' 
                          ? theme.palette.success.main
                          : activity.status === 'pending'
                          ? theme.palette.warning.main
                          : theme.palette.info.main,
                      }}
                    >
                      {t(`status.${activity.status}`)}
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
            </Box>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Container>
  );
}