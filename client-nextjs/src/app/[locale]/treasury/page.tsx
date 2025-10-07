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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  Print,
  Download,
  MoreVert,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { treasuryAPI } from '@/services/unifiedApiService';

interface TreasuryAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  accountType: 'cash' | 'bank' | 'credit';
  balance: number;
  currency: string;
  bankName?: string;
  status: 'active' | 'inactive' | 'frozen';
}

interface Transaction {
  _id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  date: string;
  reference?: string;
  category?: string;
}

export default function TreasuryPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountDialog, setAccountDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  const [accountForm, setAccountForm] = useState({
    accountName: '',
    accountNumber: '',
    accountType: 'bank',
    bankName: '',
    initialBalance: '',
    currency: 'SAR',
  });

  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    type: 'deposit',
    amount: '',
    description: '',
    reference: '',
    category: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsResponse] = await Promise.all([
        treasuryAPI.getAll({ limit: 100 }),
      ]);
      setAccounts(accountsResponse || []);
    } catch (error) {
      console.error('Failed to load treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash': return <AccountBalanceWallet />;
      case 'credit': return <CreditCard />;
      default: return <AccountBalance />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownward color="success" />;
      case 'withdrawal': return <ArrowUpward color="error" />;
      case 'transfer': return <SwapHoriz color="info" />;
      default: return <AttachMoney />;
    }
  };

  // Calculate statistics
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const cashBalance = accounts.filter(acc => acc.accountType === 'cash').reduce((sum, acc) => sum + acc.balance, 0);
  const bankBalance = accounts.filter(acc => acc.accountType === 'bank').reduce((sum, acc) => sum + acc.balance, 0);
  
  // Mock recent transactions
  const recentTransactions: Transaction[] = [
    {
      _id: '1',
      accountId: '1',
      type: 'deposit',
      amount: 15000,
      description: 'Client payment',
      date: new Date().toISOString(),
      reference: 'INV-2024-001',
    },
    {
      _id: '2',
      accountId: '2',
      type: 'withdrawal',
      amount: 3500,
      description: 'Office rent',
      date: new Date(Date.now() - 86400000).toISOString(),
      category: 'Expenses',
    },
    {
      _id: '3',
      accountId: '1',
      type: 'transfer',
      amount: 10000,
      description: 'Transfer to savings',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const accountColumns = [
    {
      id: 'accountName',
      label: 'Account Name',
      labelAr: 'اسم الحساب',
      format: (value: string, row: TreasuryAccount) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getAccountIcon(row.accountType)}
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.accountNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'accountType',
      label: 'Type',
      labelAr: 'النوع',
      format: (value: string) => (
        <Chip label={value} size="small" variant="outlined" />
      ),
    },
    {
      id: 'balance',
      label: 'Balance',
      labelAr: 'الرصيد',
      numeric: true,
      format: (value: number, row: TreasuryAccount) => (
        <Typography 
          variant="body2" 
          fontWeight={700}
          color={value >= 0 ? 'success.main' : 'error.main'}
        >
          {value?.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {row.currency}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: string) => (
        <Chip 
          label={value} 
          size="small"
          color={value === 'active' ? 'success' : value === 'frozen' ? 'error' : 'default'}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Treasury Management"
          titleAr="إدارة الخزينة"
          subtitle="Manage accounts and track cash flow"
          subtitleAr="إدارة الحسابات وتتبع التدفق النقدي"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Treasury', labelAr: 'الخزينة' },
          ]}
          primaryAction={{
            label: 'Add Account',
            labelAr: 'إضافة حساب',
            onClick: () => setAccountDialog(true),
          }}
          secondaryActions={[
            {
              label: 'New Transaction',
              labelAr: 'معاملة جديدة',
              onClick: () => setTransactionDialog(true),
              variant: 'outlined',
            },
          ]}
          locale={locale}
        />

        {/* Balance Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                  <AccountBalance fontSize="large" />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {isRTL ? 'إجمالي الرصيد' : 'Total Balance'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {totalBalance.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Typography variant="caption">SAR</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceWallet color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'النقد' : 'Cash'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {cashBalance.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalance color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'البنك' : 'Bank'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {bankBalance.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'التدفق الشهري' : 'Monthly Flow'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      +12.5%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Accounts Table */}
          <Grid item xs={12} lg={7}>
            <DataTable
              columns={accountColumns}
              data={accounts}
              title="Treasury Accounts"
              titleAr="حسابات الخزينة"
              loading={loading}
              locale={locale}
              onEdit={(id) => console.log('Edit account', id)}
              onView={(id) => setSelectedAccount(id)}
            />
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} lg={5}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {isRTL ? 'المعاملات الأخيرة' : 'Recent Transactions'}
                  </Typography>
                  <Button size="small">
                    {isRTL ? 'عرض الكل' : 'View All'}
                  </Button>
                </Box>
                <List>
                  {recentTransactions.map((transaction) => (
                    <ListItem key={transaction._id} divider>
                      <ListItemIcon>
                        {getTransactionIcon(transaction.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={transaction.description}
                        secondary={
                          <>
                            {new Date(transaction.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                            {transaction.reference && ` • ${transaction.reference}`}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={transaction.type === 'deposit' ? 'success.main' : transaction.type === 'withdrawal' ? 'error.main' : 'info.main'}
                        >
                          {transaction.type === 'withdrawal' ? '-' : '+'}
                          {transaction.amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Account Dialog */}
        <Dialog open={accountDialog} onClose={() => setAccountDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة حساب جديد' : 'Add New Account'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الحساب' : 'Account Name'}
                  value={accountForm.accountName}
                  onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الحساب' : 'Account Number'}
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع الحساب' : 'Account Type'}</InputLabel>
                  <Select
                    value={accountForm.accountType}
                    label={isRTL ? 'نوع الحساب' : 'Account Type'}
                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                  >
                    <MenuItem value="cash">{isRTL ? 'نقد' : 'Cash'}</MenuItem>
                    <MenuItem value="bank">{isRTL ? 'بنك' : 'Bank'}</MenuItem>
                    <MenuItem value="credit">{isRTL ? 'ائتمان' : 'Credit'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {accountForm.accountType === 'bank' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'اسم البنك' : 'Bank Name'}
                    value={accountForm.bankName}
                    onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={isRTL ? 'الرصيد الافتتاحي' : 'Initial Balance'}
                  value={accountForm.initialBalance}
                  onChange={(e) => setAccountForm({ ...accountForm, initialBalance: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SAR</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'العملة' : 'Currency'}</InputLabel>
                  <Select
                    value={accountForm.currency}
                    label={isRTL ? 'العملة' : 'Currency'}
                    onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                  >
                    <MenuItem value="SAR">SAR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAccountDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained">
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Transaction Dialog */}
        <Dialog open={transactionDialog} onClose={() => setTransactionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'معاملة جديدة' : 'New Transaction'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الحساب' : 'Account'}</InputLabel>
                  <Select
                    value={transactionForm.accountId}
                    label={isRTL ? 'الحساب' : 'Account'}
                    onChange={(e) => setTransactionForm({ ...transactionForm, accountId: e.target.value })}
                  >
                    {accounts.map((acc) => (
                      <MenuItem key={acc._id} value={acc._id}>
                        {acc.accountName} ({acc.balance.toLocaleString()} {acc.currency})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع المعاملة' : 'Transaction Type'}</InputLabel>
                  <Select
                    value={transactionForm.type}
                    label={isRTL ? 'نوع المعاملة' : 'Transaction Type'}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                  >
                    <MenuItem value="deposit">{isRTL ? 'إيداع' : 'Deposit'}</MenuItem>
                    <MenuItem value="withdrawal">{isRTL ? 'سحب' : 'Withdrawal'}</MenuItem>
                    <MenuItem value="transfer">{isRTL ? 'تحويل' : 'Transfer'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={isRTL ? 'المبلغ' : 'Amount'}
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SAR</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الوصف' : 'Description'}
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المرجع' : 'Reference'}
                  value={transactionForm.reference}
                  onChange={(e) => setTransactionForm({ ...transactionForm, reference: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained">
              {isRTL ? 'تنفيذ' : 'Execute'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
