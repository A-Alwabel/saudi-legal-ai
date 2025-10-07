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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Article,
  Add,
  Gavel,
  Person,
  DateRange,
  CheckCircle,
  Warning,
  Cancel,
  Description,
  Download,
  Edit,
  Delete,
  Verified,
  Schedule,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { powerOfAttorneyAPI } from '@/services/unifiedApiService';

interface PowerOfAttorney {
  _id: string;
  documentNumber: string;
  type: 'general' | 'special' | 'litigation' | 'commercial' | 'real_estate';
  grantor: {
    name: string;
    nationalId: string;
    contact: string;
  };
  attorney: {
    name: string;
    nationalId: string;
    barNumber?: string;
    contact: string;
  };
  scope: string[];
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  issuedBy: string;
  notaryNumber?: string;
  attachments?: string[];
  notes?: string;
}

const poaTypes = [
  { value: 'general', label: 'General Power of Attorney', labelAr: 'وكالة عامة', color: 'primary' },
  { value: 'special', label: 'Special Power of Attorney', labelAr: 'وكالة خاصة', color: 'secondary' },
  { value: 'litigation', label: 'Litigation POA', labelAr: 'وكالة قضائية', color: 'error' },
  { value: 'commercial', label: 'Commercial POA', labelAr: 'وكالة تجارية', color: 'warning' },
  { value: 'real_estate', label: 'Real Estate POA', labelAr: 'وكالة عقارية', color: 'success' },
];

const scopeOptions = [
  'Legal Representation',
  'Sign Documents',
  'Financial Transactions',
  'Property Management',
  'Court Appearances',
  'Contract Negotiation',
  'Company Representation',
  'Tax Matters',
];

export default function PowerOfAttorneyPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [powerOfAttorneys, setPowerOfAttorneys] = useState<PowerOfAttorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [poaForm, setPoaForm] = useState({
    type: 'general',
    grantor: { name: '', nationalId: '', contact: '' },
    attorney: { name: '', nationalId: '', barNumber: '', contact: '' },
    scope: [] as string[],
    startDate: '',
    expiryDate: '',
    issuedBy: '',
    notaryNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadPowerOfAttorneys();
  }, []);

  const loadPowerOfAttorneys = async () => {
    try {
      setLoading(true);
      // const response = await powerOfAttorneyAPI.getAll({ limit: 100 });
      // setPowerOfAttorneys(response || []);
      
      // Mock data
      setPowerOfAttorneys([
        {
          _id: '1',
          documentNumber: 'POA-2024-001',
          type: 'litigation',
          grantor: { name: 'Ahmed Al-Rashid', nationalId: '1234567890', contact: '+966501234567' },
          attorney: { name: 'Mohammed Al-Saud', nationalId: '0987654321', barNumber: 'SA12345', contact: '+966509876543' },
          scope: ['Legal Representation', 'Court Appearances', 'Sign Documents'],
          startDate: '2024-01-01',
          expiryDate: '2025-01-01',
          status: 'active',
          issuedBy: 'Riyadh Notary Public',
          notaryNumber: 'NP-2024-1234',
        },
        {
          _id: '2',
          documentNumber: 'POA-2024-002',
          type: 'commercial',
          grantor: { name: 'ABC Trading Co.', nationalId: 'CR-123456', contact: '+966111234567' },
          attorney: { name: 'Sarah Johnson', nationalId: '1122334455', contact: '+966502345678' },
          scope: ['Contract Negotiation', 'Financial Transactions', 'Company Representation'],
          startDate: '2024-02-01',
          expiryDate: '2024-08-01',
          status: 'expired',
          issuedBy: 'Jeddah Commercial Court',
        },
      ]);
    } catch (error) {
      console.error('Failed to load power of attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'revoked': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'expired': return <Cancel />;
      case 'revoked': return <Warning />;
      default: return <Schedule />;
    }
  };

  const columns = [
    {
      id: 'documentNumber',
      label: 'Document #',
      labelAr: 'رقم الوثيقة',
      format: (value: string, row: PowerOfAttorney) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.notaryNumber}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      labelAr: 'النوع',
      format: (value: string) => {
        const type = poaTypes.find(t => t.value === value);
        return (
          <Chip 
            label={isRTL ? type?.labelAr : type?.label} 
            color={type?.color as any} 
            size="small"
          />
        );
      },
    },
    {
      id: 'grantor',
      label: 'Grantor',
      labelAr: 'الموكِل',
      format: (value: any) => (
        <Box>
          <Typography variant="body2">{value.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {value.nationalId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'attorney',
      label: 'Attorney',
      labelAr: 'الوكيل',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" />
          <Box>
            <Typography variant="body2">{value.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {value.barNumber || value.nationalId}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'expiryDate',
      label: 'Validity',
      labelAr: 'الصلاحية',
      format: (value: string, row: PowerOfAttorney) => {
        const isExpired = new Date(value) < new Date();
        return (
          <Box>
            <Typography 
              variant="body2" 
              color={isExpired ? 'error' : 'text.primary'}
            >
              {new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isRTL ? 'من' : 'From'} {new Date(row.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </Typography>
          </Box>
        );
      },
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
  ];

  // Statistics
  const stats = {
    total: powerOfAttorneys.length,
    active: powerOfAttorneys.filter(poa => poa.status === 'active').length,
    expired: powerOfAttorneys.filter(poa => poa.status === 'expired').length,
    expiringSoon: powerOfAttorneys.filter(poa => {
      const daysUntilExpiry = Math.ceil((new Date(poa.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Power of Attorney"
          titleAr="التوكيلات"
          subtitle="Manage legal power of attorney documents"
          subtitleAr="إدارة وثائق التوكيلات القانونية"
          breadcrumbs={[
            { label: 'Legal Management', labelAr: 'الإدارة القانونية', path: '#' },
            { label: 'Power of Attorney', labelAr: 'التوكيلات' },
          ]}
          primaryAction={{
            label: 'New POA',
            labelAr: 'توكيل جديد',
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
                  <Article color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي التوكيلات' : 'Total POAs'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
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
                  <Verified color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'نشط' : 'Active'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.active}
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
                  <Warning color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'ينتهي قريباً' : 'Expiring Soon'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.expiringSoon}
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
                  <Cancel color="error" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'منتهي' : 'Expired'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {stats.expired}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Expiring Soon Alert */}
        {stats.expiringSoon > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {isRTL 
              ? `لديك ${stats.expiringSoon} توكيلات ستنتهي خلال 30 يوماً`
              : `You have ${stats.expiringSoon} POA(s) expiring within 30 days`
            }
          </Alert>
        )}

        {/* Power of Attorney Table */}
        <DataTable
          columns={columns}
          data={powerOfAttorneys}
          title="Power of Attorney Documents"
          titleAr="وثائق التوكيلات"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View POA', id)}
          onEdit={(id) => console.log('Edit POA', id)}
          onDelete={(ids) => console.log('Delete POAs', ids)}
        />

        {/* Create POA Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إنشاء توكيل جديد' : 'Create New Power of Attorney'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع التوكيل' : 'POA Type'}</InputLabel>
                  <Select
                    value={poaForm.type}
                    label={isRTL ? 'نوع التوكيل' : 'POA Type'}
                    onChange={(e) => setPoaForm({ ...poaForm, type: e.target.value })}
                  >
                    {poaTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {isRTL ? type.labelAr : type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Grantor Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات الموكِل' : 'Grantor Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الموكِل' : 'Grantor Name'}
                  value={poaForm.grantor.name}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    grantor: { ...poaForm.grantor, name: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الهوية' : 'National ID'}
                  value={poaForm.grantor.nationalId}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    grantor: { ...poaForm.grantor, nationalId: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم التواصل' : 'Contact'}
                  value={poaForm.grantor.contact}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    grantor: { ...poaForm.grantor, contact: e.target.value }
                  })}
                />
              </Grid>

              {/* Attorney Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات الوكيل' : 'Attorney Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الوكيل' : 'Attorney Name'}
                  value={poaForm.attorney.name}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    attorney: { ...poaForm.attorney, name: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الهوية' : 'National ID'}
                  value={poaForm.attorney.nationalId}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    attorney: { ...poaForm.attorney, nationalId: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم القيد' : 'Bar Number'}
                  value={poaForm.attorney.barNumber}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    attorney: { ...poaForm.attorney, barNumber: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم التواصل' : 'Contact'}
                  value={poaForm.attorney.contact}
                  onChange={(e) => setPoaForm({ 
                    ...poaForm, 
                    attorney: { ...poaForm.attorney, contact: e.target.value }
                  })}
                />
              </Grid>

              {/* Scope */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نطاق التوكيل' : 'Scope of Authority'}</InputLabel>
                  <Select
                    multiple
                    value={poaForm.scope}
                    label={isRTL ? 'نطاق التوكيل' : 'Scope of Authority'}
                    onChange={(e) => setPoaForm({ ...poaForm, scope: e.target.value as string[] })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {scopeOptions.map((scope) => (
                      <MenuItem key={scope} value={scope}>
                        {scope}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dates and Details */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ البداية' : 'Start Date'}
                  value={poaForm.startDate}
                  onChange={(e) => setPoaForm({ ...poaForm, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  value={poaForm.expiryDate}
                  onChange={(e) => setPoaForm({ ...poaForm, expiryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الجهة المصدرة' : 'Issued By'}
                  value={poaForm.issuedBy}
                  onChange={(e) => setPoaForm({ ...poaForm, issuedBy: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم كاتب العدل' : 'Notary Number'}
                  value={poaForm.notaryNumber}
                  onChange={(e) => setPoaForm({ ...poaForm, notaryNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={poaForm.notes}
                  onChange={(e) => setPoaForm({ ...poaForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Article />}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
