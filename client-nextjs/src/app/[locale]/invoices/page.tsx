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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add,
  Receipt,
  AttachMoney,
  Delete,
  Print,
  Email,
  Download,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { invoicesApi } from '@/services/unifiedApiService';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: any;
  caseId: any;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    caseId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    vatRate: 15,
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesApi.getAll({ limit: 100 });
      setInvoices(response || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (invoiceForm.vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle />;
      case 'overdue': return <Cancel />;
      default: return <Pending />;
    }
  };

  const columns = [
    {
      id: 'invoiceNumber',
      label: 'Invoice #',
      labelAr: 'رقم الفاتورة',
      format: (value: string, row: Invoice) => (
        <Typography variant="body2" fontWeight={600}>
          {value || `INV-${row._id?.slice(-6)}`}
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
      id: 'totalAmount',
      label: 'Amount',
      labelAr: 'المبلغ',
      numeric: true,
      format: (value: number) => (
        <Typography variant="body2" fontWeight={600}>
          {value?.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {isRTL ? 'ر.س' : 'SAR'}
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
          color={getStatusColor(value) as any}
          size="small"
          icon={getStatusIcon(value)}
        />
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      labelAr: 'تاريخ الاستحقاق',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
    },
  ];

  // Calculate statistics
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Invoices"
          titleAr="الفواتير"
          subtitle="Manage billing and invoices"
          subtitleAr="إدارة الفواتير والمدفوعات"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Invoices', labelAr: 'الفواتير' },
          ]}
          primaryAction={{
            label: 'New Invoice',
            labelAr: 'فاتورة جديدة',
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
                  <Receipt color="primary" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الفواتير' : 'Total Invoices'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stats.total}
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
                  <AttachMoney color="success" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المبلغ' : 'Total Amount'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stats.totalAmount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
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
                  <CheckCircle color="success" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'مدفوع' : 'Paid'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {stats.paid}
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
                  <Cancel color="error" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'متأخر' : 'Overdue'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {stats.overdue}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Invoices Table */}
        <DataTable
          columns={columns}
          data={invoices}
          title="Invoices List"
          titleAr="قائمة الفواتير"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View invoice', id)}
          onEdit={(id) => console.log('Edit invoice', id)}
          onDelete={(ids) => console.log('Delete invoices', ids)}
        />

        {/* Create Invoice Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>{isRTL ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'العميل' : 'Client'}
                  value={invoiceForm.clientId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'القضية' : 'Case'}
                  value={invoiceForm.caseId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, caseId: e.target.value })}
                />
              </Grid>

              {/* Invoice Items */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {isRTL ? 'بنود الفاتورة' : 'Invoice Items'}
                    </Typography>
                    <Button startIcon={<Add />} onClick={handleAddItem}>
                      {isRTL ? 'إضافة بند' : 'Add Item'}
                    </Button>
                  </Box>
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{isRTL ? 'الوصف' : 'Description'}</TableCell>
                        <TableCell align="center">{isRTL ? 'الكمية' : 'Quantity'}</TableCell>
                        <TableCell align="center">{isRTL ? 'السعر' : 'Unit Price'}</TableCell>
                        <TableCell align="center">{isRTL ? 'المجموع' : 'Total'}</TableCell>
                        <TableCell align="center">{isRTL ? 'إجراءات' : 'Actions'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceForm.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              sx={{ width: 80 }}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              sx={{ width: 120 }}
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography>{item.total.toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                              disabled={invoiceForm.items.length === 1}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Totals */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 250 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>{isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}</Typography>
                        <Typography>{calculateTotals().subtotal.toFixed(2)} SAR</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>{isRTL ? `ضريبة القيمة المضافة (${invoiceForm.vatRate}%):` : `VAT (${invoiceForm.vatRate}%):`}</Typography>
                        <Typography>{calculateTotals().vatAmount.toFixed(2)} SAR</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <Typography fontWeight={600}>{isRTL ? 'الإجمالي:' : 'Total:'}</Typography>
                        <Typography fontWeight={600}>{calculateTotals().total.toFixed(2)} SAR</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Receipt />}>
              {isRTL ? 'إنشاء الفاتورة' : 'Create Invoice'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
