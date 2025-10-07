'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/material';
import {
  Add,
  Payment as PaymentIcon,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Pending,
  Cancel,
  TrendingUp,
  AttachMoney,
  Receipt,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { paymentAPI } from '@/services/unifiedApiService';

interface Payment {
  _id: string;
  invoiceId: any;
  clientId: any;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
}

export default function PaymentsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAll({ limit: 100 });
      setPayments(response || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await paymentAPI.create({
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date().toISOString(),
        status: 'pending',
      });
      setDialogOpen(false);
      loadPayments();
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Pending />;
      case 'failed': return <Cancel />;
      default: return <PaymentIcon />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard />;
      case 'bank_transfer': return <AccountBalance />;
      case 'cash': return <AttachMoney />;
      case 'check': return <Receipt />;
      default: return <PaymentIcon />;
    }
  };

  const columns = [
    {
      id: 'transactionId',
      label: 'Transaction ID',
      labelAr: 'رقم المعاملة',
      format: (value: string, row: Payment) => (
        <Typography variant="body2" fontWeight={600}>
          {value || `TXN-${row._id?.slice(-8)}`}
        </Typography>
      ),
    },
    {
      id: 'clientId',
      label: 'Client',
      labelAr: 'العميل',
      format: (value: any) => value?.name || 'N/A',
    },
    {
      id: 'amount',
      label: 'Amount',
      labelAr: 'المبلغ',
      numeric: true,
      format: (value: number) => (
        <Typography variant="body2" fontWeight={600}>
          {value?.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} SAR
        </Typography>
      ),
    },
    {
      id: 'paymentMethod',
      label: 'Method',
      labelAr: 'الطريقة',
      format: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getPaymentMethodIcon(value)}
          <Typography variant="body2">
            {value?.replace('_', ' ')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: string) => (
        <Chip
          label={value}
          color={getStatusColor(value) as any}
          size="small"
          icon={getStatusIcon(value)}
        />
      ),
    },
    {
      id: 'paymentDate',
      label: 'Date',
      labelAr: 'التاريخ',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
    },
  ];

  // Calculate statistics
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    thisMonth: payments.filter(p => {
      const date = new Date(p.paymentDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0),
  };

  // Recent transactions for timeline
  const recentTransactions = payments.slice(0, 5);

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Payments"
          titleAr="المدفوعات"
          subtitle="Track and manage all payments"
          subtitleAr="تتبع وإدارة جميع المدفوعات"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Payments', labelAr: 'المدفوعات' },
          ]}
          primaryAction={{
            label: 'Record Payment',
            labelAr: 'تسجيل دفعة',
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PaymentIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المدفوعات' : 'Total Payments'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stats.totalAmount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SAR
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'مكتمل' : 'Completed'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {stats.completed.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SAR
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Pending color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'معلق' : 'Pending'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">
                      {stats.pending.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SAR
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'هذا الشهر' : 'This Month'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {stats.thisMonth.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SAR
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Payments Table */}
          <Grid item xs={12} lg={8}>
            <DataTable
              columns={columns}
              data={payments}
              title="Payments List"
              titleAr="قائمة المدفوعات"
              loading={loading}
              locale={locale}
              onView={(id) => console.log('View payment', id)}
              onEdit={(id) => console.log('Edit payment', id)}
            />
          </Grid>

          {/* Recent Transactions Timeline */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isRTL ? 'المعاملات الأخيرة' : 'Recent Transactions'}
                </Typography>
                <Timeline position="right">
                  {recentTransactions.map((transaction, index) => (
                    <TimelineItem key={transaction._id}>
                      <TimelineSeparator>
                        <TimelineDot color={getStatusColor(transaction.status) as any}>
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                        </TimelineDot>
                        {index < recentTransactions.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight={600}>
                          {transaction.amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} SAR
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.clientId?.name || 'Unknown Client'}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.paymentDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Record Payment Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'تسجيل دفعة جديدة' : 'Record New Payment'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الفاتورة' : 'Invoice ID'}
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المبلغ' : 'Amount'}
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SAR</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</InputLabel>
                  <Select
                    value={paymentForm.paymentMethod}
                    label={isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="cash">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney />
                        {isRTL ? 'نقدي' : 'Cash'}
                      </Box>
                    </MenuItem>
                    <MenuItem value="credit_card">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCard />
                        {isRTL ? 'بطاقة ائتمان' : 'Credit Card'}
                      </Box>
                    </MenuItem>
                    <MenuItem value="bank_transfer">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalance />
                        {isRTL ? 'تحويل بنكي' : 'Bank Transfer'}
                      </Box>
                    </MenuItem>
                    <MenuItem value="check">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt />
                        {isRTL ? 'شيك' : 'Check'}
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم المعاملة' : 'Transaction ID'}
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" onClick={handleSubmit} startIcon={<PaymentIcon />}>
              {isRTL ? 'تسجيل' : 'Record'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
