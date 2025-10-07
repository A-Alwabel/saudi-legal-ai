'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Gavel,
  Description,
  Receipt,
  Payment,
  Person,
  Business,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { clientPortalApi } from '../../../services/unifiedApiService';

interface DashboardData {
  statistics: {
    totalCases: number;
    activeCases: number;
    closedCases: number;
    totalDocuments: number;
    totalInvoices: number;
    outstandingInvoices: number;
    totalPayments: number;
  };
  recentCases: any[];
  recentDocuments: any[];
  recentInvoices: any[];
  recentPayments: any[];
}

export default function ClientPortalDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    // Check if client is logged in
    const token = localStorage.getItem('clientToken');
    const client = localStorage.getItem('clientData');
    
    if (!token || !client) {
      router.push('/client-portal/login');
      return;
    }

    setClientData(JSON.parse(client));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await clientPortalApi.getDashboard();
      setDashboardData(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'closed':
      case 'paid': return 'success';
      case 'in_progress':
      case 'sent': return 'info';
      case 'pending': return 'warning';
      case 'overdue':
      case 'cancelled': return 'error';
      case 'new': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'closed':
      case 'paid': return <CheckCircle fontSize="small" />;
      case 'in_progress':
      case 'sent': return <Schedule fontSize="small" />;
      case 'pending': return <Warning fontSize="small" />;
      case 'overdue': return <Warning fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('clientPortal.dashboard.welcome')}, {clientData?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('clientPortal.dashboard.subtitle')}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.statistics.totalCases || 0}
                    </Typography>
                    <Typography variant="body2">
                      {t('clientPortal.dashboard.stats.totalCases')}
                    </Typography>
                  </Box>
                  <Gavel sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.statistics.activeCases || 0}
                    </Typography>
                    <Typography variant="body2">
                      {t('clientPortal.dashboard.stats.activeCases')}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.statistics.totalDocuments || 0}
                    </Typography>
                    <Typography variant="body2">
                      {t('clientPortal.dashboard.stats.documents')}
                    </Typography>
                  </Box>
                  <Description sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {dashboardData?.statistics.outstandingInvoices || 0}
                    </Typography>
                    <Typography variant="body2">
                      {t('clientPortal.dashboard.stats.outstandingInvoices')}
                    </Typography>
                  </Box>
                  <Receipt sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Content Sections */}
      <Grid container spacing={3}>
        {/* Recent Cases */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {t('clientPortal.dashboard.recentCases')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/client-portal/cases')}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
              <List>
                {dashboardData?.recentCases?.slice(0, 5).map((caseItem, index) => (
                  <ListItem key={caseItem.id || index} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Gavel fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={caseItem.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {caseItem.description?.substring(0, 60)}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              icon={getStatusIcon(caseItem.status)}
                              label={t(`cases.status.${caseItem.status}`) || caseItem.status}
                              size="small"
                              color={getStatusColor(caseItem.status)}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {caseItem.startDate ? new Date(caseItem.startDate).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => router.push(`/client-portal/cases/${caseItem.id}`)}
                    >
                      {t('common.view')}
                    </Button>
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText
                      primary={t('clientPortal.dashboard.noCases')}
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {t('clientPortal.dashboard.recentDocuments')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/client-portal/documents')}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
              <List>
                {dashboardData?.recentDocuments?.slice(0, 5).map((document, index) => (
                  <ListItem key={document.id || index} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <Description fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={document.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {document.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : ''}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => router.push(`/client-portal/documents/${document.id}`)}
                    >
                      {t('common.view')}
                    </Button>
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText
                      primary={t('clientPortal.dashboard.noDocuments')}
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {t('clientPortal.dashboard.recentInvoices')}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/client-portal/invoices')}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
              <List>
                {dashboardData?.recentInvoices?.slice(0, 5).map((invoice, index) => (
                  <ListItem key={invoice.id || index} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Receipt fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={invoice.invoiceNumber}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {invoice.totalAmount?.toLocaleString()} SAR
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              icon={getStatusIcon(invoice.status)}
                              label={t(`invoices.status.${invoice.status}`) || invoice.status}
                              size="small"
                              color={getStatusColor(invoice.status)}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => router.push(`/client-portal/invoices/${invoice.id}`)}
                    >
                      {t('common.view')}
                    </Button>
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText
                      primary={t('clientPortal.dashboard.noInvoices')}
                      sx={{ textAlign: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {t('clientPortal.dashboard.quickActions')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Gavel />}
                    onClick={() => router.push('/client-portal/cases')}
                    sx={{ py: 1.5, textTransform: 'none' }}
                  >
                    {t('clientPortal.dashboard.actions.viewCases')}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={() => router.push('/client-portal/documents')}
                    sx={{ py: 1.5, textTransform: 'none' }}
                  >
                    {t('clientPortal.dashboard.actions.viewDocuments')}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => router.push('/client-portal/invoices')}
                    sx={{ py: 1.5, textTransform: 'none' }}
                  >
                    {t('clientPortal.dashboard.actions.viewInvoices')}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => router.push('/client-portal/consultation-request')}
                    sx={{ py: 1.5, textTransform: 'none' }}
                  >
                    {t('clientPortal.dashboard.actions.requestConsultation')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
