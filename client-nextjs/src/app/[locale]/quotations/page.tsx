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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add,
  RequestQuote,
  Delete,
  Send,
  Edit,
  CheckCircle,
  Schedule,
  Cancel,
  FileCopy,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { quotationAPI } from '@/services/unifiedApiService';

interface Quotation {
  _id: string;
  quotationNumber: string;
  clientId: any;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  notes?: string;
}

export default function QuotationsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quotationForm, setQuotationForm] = useState({
    clientId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    validDays: 30,
    notes: '',
    vatRate: 15,
  });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationAPI.getAll({ limit: 100 });
      setQuotations(response || []);
    } catch (error) {
      console.error('Failed to load quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setQuotationForm({
      ...quotationForm,
      items: [...quotationForm.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setQuotationForm({
      ...quotationForm,
      items: quotationForm.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...quotationForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setQuotationForm({ ...quotationForm, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = quotationForm.items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (quotationForm.vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'sent': return 'info';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'expired': return <Schedule />;
      default: return <RequestQuote />;
    }
  };

  const columns = [
    {
      id: 'quotationNumber',
      label: 'Quote #',
      labelAr: 'رقم العرض',
      format: (value: string, row: Quotation) => (
        <Typography variant="body2" fontWeight={600}>
          {value || `QT-${row._id?.slice(-6)}`}
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
          {value?.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} SAR
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
      id: 'validUntil',
      label: 'Valid Until',
      labelAr: 'صالح حتى',
      format: (value: string) => {
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <Typography 
            variant="body2" 
            color={isExpired ? 'error' : 'text.primary'}
          >
            {date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Typography>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      labelAr: 'تاريخ الإنشاء',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
    },
  ];

  // Statistics
  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    totalValue: quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0),
    acceptanceRate: quotations.length > 0 
      ? Math.round((quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100)
      : 0,
  };

  const steps = ['Draft', 'Sent', 'Response'];

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Quotations"
          titleAr="عروض الأسعار"
          subtitle="Create and manage price quotations"
          subtitleAr="إنشاء وإدارة عروض الأسعار"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Quotations', labelAr: 'عروض الأسعار' },
          ]}
          primaryAction={{
            label: 'New Quotation',
            labelAr: 'عرض سعر جديد',
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'إجمالي العروض' : 'Total Quotes'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'مسودة' : 'Draft'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.secondary">
                  {stats.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'مرسل' : 'Sent'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {stats.sent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'مقبول' : 'Accepted'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.accepted}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'معدل القبول' : 'Acceptance Rate'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.acceptanceRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quotations Table */}
        <DataTable
          columns={columns}
          data={quotations}
          title="Quotations List"
          titleAr="قائمة عروض الأسعار"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View quotation', id)}
          onEdit={(id) => console.log('Edit quotation', id)}
          onDelete={(ids) => console.log('Delete quotations', ids)}
        />

        {/* Create Quotation Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>{isRTL ? 'إنشاء عرض سعر جديد' : 'Create New Quotation'}</DialogTitle>
          <DialogContent>
            {/* Stepper */}
            <Stepper activeStep={0} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'العميل' : 'Client'}
                  value={quotationForm.clientId}
                  onChange={(e) => setQuotationForm({ ...quotationForm, clientId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={isRTL ? 'صلاحية العرض (أيام)' : 'Valid for (days)'}
                  value={quotationForm.validDays}
                  onChange={(e) => setQuotationForm({ ...quotationForm, validDays: parseInt(e.target.value) })}
                />
              </Grid>

              {/* Quotation Items */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {isRTL ? 'بنود العرض' : 'Quotation Items'}
                    </Typography>
                    <Button startIcon={<Add />} onClick={handleAddItem}>
                      {isRTL ? 'إضافة بند' : 'Add Item'}
                    </Button>
                  </Box>
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{isRTL ? 'الوصف' : 'Description'}</TableCell>
                        <TableCell align="center">{isRTL ? 'الكمية' : 'Qty'}</TableCell>
                        <TableCell align="center">{isRTL ? 'السعر' : 'Unit Price'}</TableCell>
                        <TableCell align="center">{isRTL ? 'المجموع' : 'Total'}</TableCell>
                        <TableCell align="center">{isRTL ? 'إجراءات' : 'Actions'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quotationForm.items.map((item, index) => (
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
                              disabled={quotationForm.items.length === 1}
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
                        <Typography>{isRTL ? `ضريبة (${quotationForm.vatRate}%):` : `VAT (${quotationForm.vatRate}%):`}</Typography>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={quotationForm.notes}
                  onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="outlined" startIcon={<FileCopy />}>
              {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
            </Button>
            <Button variant="contained" startIcon={<Send />}>
              {isRTL ? 'إرسال العرض' : 'Send Quote'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
