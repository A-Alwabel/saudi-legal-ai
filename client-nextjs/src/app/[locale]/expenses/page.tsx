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
} from '@mui/material';
import {
  Add,
  AttachMoney,
  Receipt,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  LocalGasStation,
  Restaurant,
  DirectionsCar,
  Business,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { expenseAPI } from '@/services/unifiedApiService';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  incurredBy: any;
  attachments?: string[];
  notes?: string;
}

const expenseCategories = [
  { value: 'office_supplies', label: 'Office Supplies', icon: <Business /> },
  { value: 'transportation', label: 'Transportation', icon: <DirectionsCar /> },
  { value: 'meals', label: 'Meals & Entertainment', icon: <Restaurant /> },
  { value: 'fuel', label: 'Fuel', icon: <LocalGasStation /> },
  { value: 'legal_fees', label: 'Legal Fees', icon: <Receipt /> },
  { value: 'other', label: 'Other', icon: <ShoppingCart /> },
];

export default function ExpensesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getAll({ limit: 100 });
      setExpenses(response || []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await expenseAPI.create({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      });
      setDialogOpen(false);
      loadExpenses();
      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat?.icon || <Receipt />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'reimbursed': return 'info';
      default: return 'warning';
    }
  };

  const columns = [
    {
      id: 'date',
      label: 'Date',
      labelAr: 'التاريخ',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
    },
    {
      id: 'description',
      label: 'Description',
      labelAr: 'الوصف',
      format: (value: string, row: Expense) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCategoryIcon(row.category)}
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.category?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      ),
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
      label: 'Payment Method',
      labelAr: 'طريقة الدفع',
      format: (value: string) => (
        <Chip label={value} size="small" variant="outlined" />
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
        />
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    thisMonth: expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + (exp.amount || 0), 0),
    pending: expenses.filter(exp => exp.status === 'pending').length,
    approved: expenses.filter(exp => exp.status === 'approved').length,
  };

  // Calculate previous month for comparison
  const lastMonth = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear();
  }).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const monthlyChange = lastMonth > 0 ? ((stats.thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Expenses"
          titleAr="المصروفات"
          subtitle="Track and manage business expenses"
          subtitleAr="تتبع وإدارة مصروفات الأعمال"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Expenses', labelAr: 'المصروفات' },
          ]}
          primaryAction={{
            label: 'Add Expense',
            labelAr: 'إضافة مصروف',
            onClick: () => setDialogOpen(true),
          }}
          secondaryActions={[
            {
              label: 'Export',
              labelAr: 'تصدير',
              onClick: () => console.log('Export'),
              variant: 'outlined',
            },
          ]}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  {isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalAmount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  SAR {isRTL ? 'ريال سعودي' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  {isRTL ? 'هذا الشهر' : 'This Month'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.thisMonth.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {Number(monthlyChange) > 0 ? (
                    <TrendingUp color="error" fontSize="small" />
                  ) : (
                    <TrendingDown color="success" fontSize="small" />
                  )}
                  <Typography
                    variant="caption"
                    color={Number(monthlyChange) > 0 ? 'error' : 'success'}
                  >
                    {monthlyChange}% {isRTL ? 'من الشهر الماضي' : 'from last month'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  {isRTL ? 'معلق' : 'Pending'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isRTL ? 'بانتظار الموافقة' : 'Awaiting approval'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  {isRTL ? 'موافق عليه' : 'Approved'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.approved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isRTL ? 'تمت الموافقة' : 'Already approved'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Category Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {expenseCategories.slice(0, 4).map((category) => {
            const categoryTotal = expenses
              .filter(exp => exp.category === category.value)
              .reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const percentage = stats.totalAmount > 0 ? (categoryTotal / stats.totalAmount * 100).toFixed(1) : 0;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={category.value}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {category.icon}
                      <Typography variant="body2" color="text.secondary">
                        {category.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {categoryTotal.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} SAR
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {percentage}% {isRTL ? 'من الإجمالي' : 'of total'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Expenses Table */}
        <DataTable
          columns={columns}
          data={expenses}
          title="Expenses List"
          titleAr="قائمة المصروفات"
          loading={loading}
          locale={locale}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(ids) => console.log('Delete', ids)}
          onView={(id) => console.log('View', id)}
        />

        {/* Add Expense Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة مصروف جديد' : 'Add New Expense'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الوصف' : 'Description'}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المبلغ' : 'Amount'}
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SAR</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الفئة' : 'Category'}</InputLabel>
                  <Select
                    value={expenseForm.category}
                    label={isRTL ? 'الفئة' : 'Category'}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {expenseCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cat.icon}
                          {cat.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'التاريخ' : 'Date'}
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</InputLabel>
                  <Select
                    value={expenseForm.paymentMethod}
                    label={isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="cash">{isRTL ? 'نقدي' : 'Cash'}</MenuItem>
                    <MenuItem value="credit_card">{isRTL ? 'بطاقة ائتمان' : 'Credit Card'}</MenuItem>
                    <MenuItem value="bank_transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</MenuItem>
                    <MenuItem value="check">{isRTL ? 'شيك' : 'Check'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
