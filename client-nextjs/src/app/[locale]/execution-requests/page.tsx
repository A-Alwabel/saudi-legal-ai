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
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Gavel,
  Add,
  AttachMoney,
  Person,
  Description,
  Schedule,
  CheckCircle,
  Warning,
  HourglassEmpty,
  AccountBalance,
  LocalPolice,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { executionRequestAPI } from '@/services/unifiedApiService';

interface ExecutionRequest {
  _id: string;
  requestNumber: string;
  caseId: any;
  type: 'financial' | 'eviction' | 'custody' | 'property' | 'injunction';
  creditor: {
    name: string;
    nationalId: string;
    contact: string;
  };
  debtor: {
    name: string;
    nationalId: string;
    contact: string;
  };
  amount?: number;
  courtOrder: {
    number: string;
    date: string;
    issuingCourt: string;
  };
  status: 'pending' | 'in_progress' | 'executed' | 'suspended' | 'cancelled';
  executionDate?: string;
  executionOfficer?: string;
  notes?: string;
}

const executionTypes = [
  { value: 'financial', label: 'Financial Execution', labelAr: 'تنفيذ مالي', icon: <AttachMoney />, color: 'success' },
  { value: 'eviction', label: 'Eviction', labelAr: 'إخلاء', icon: <AccountBalance />, color: 'error' },
  { value: 'custody', label: 'Custody', labelAr: 'حضانة', icon: <Person />, color: 'info' },
  { value: 'property', label: 'Property', labelAr: 'عقار', icon: <AccountBalance />, color: 'warning' },
  { value: 'injunction', label: 'Injunction', labelAr: 'أمر قضائي', icon: <Gavel />, color: 'secondary' },
];

const executionSteps = [
  'Request Submission',
  'Review & Approval',
  'Officer Assignment',
  'Execution Process',
  'Completion',
];

export default function ExecutionRequestsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [executionRequests, setExecutionRequests] = useState<ExecutionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [requestForm, setRequestForm] = useState({
    type: 'financial',
    creditor: { name: '', nationalId: '', contact: '' },
    debtor: { name: '', nationalId: '', contact: '' },
    amount: '',
    courtOrder: { number: '', date: '', issuingCourt: '' },
    notes: '',
  });

  // Mock data
  const mockRequests: ExecutionRequest[] = [
    {
      _id: '1',
      requestNumber: 'EX-2024-001',
      caseId: { number: 'CASE-2024-123' },
      type: 'financial',
      creditor: { name: 'ABC Trading Co.', nationalId: 'CR-123456', contact: '+966501234567' },
      debtor: { name: 'XYZ Company', nationalId: 'CR-654321', contact: '+966509876543' },
      amount: 250000,
      courtOrder: { 
        number: 'CO-2024-456', 
        date: '2024-01-15', 
        issuingCourt: 'Riyadh Commercial Court' 
      },
      status: 'in_progress',
      executionOfficer: 'Officer Ahmed Al-Rashid',
    },
    {
      _id: '2',
      requestNumber: 'EX-2024-002',
      caseId: { number: 'CASE-2024-124' },
      type: 'eviction',
      creditor: { name: 'Property Owner LLC', nationalId: 'CR-111222', contact: '+966502345678' },
      debtor: { name: 'Tenant Name', nationalId: '1234567890', contact: '+966503456789' },
      courtOrder: { 
        number: 'CO-2024-457', 
        date: '2024-02-01', 
        issuingCourt: 'Jeddah Civil Court' 
      },
      status: 'pending',
    },
  ];

  useEffect(() => {
    loadExecutionRequests();
  }, []);

  const loadExecutionRequests = async () => {
    try {
      setLoading(true);
      // const response = await executionRequestAPI.getAll({ limit: 100 });
      // setExecutionRequests(response || []);
      setExecutionRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load execution requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return executionTypes.find(t => t.value === type) || executionTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'success';
      case 'in_progress': return 'info';
      case 'suspended': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed': return <CheckCircle />;
      case 'in_progress': return <HourglassEmpty />;
      case 'suspended': return <Warning />;
      default: return <Schedule />;
    }
  };

  const getStepFromStatus = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'in_progress': return 3;
      case 'executed': return 4;
      default: return 0;
    }
  };

  const columns = [
    {
      id: 'requestNumber',
      label: 'Request #',
      labelAr: 'رقم الطلب',
      format: (value: string, row: ExecutionRequest) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.caseId?.number}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      labelAr: 'النوع',
      format: (value: string) => {
        const config = getTypeConfig(value);
        return (
          <Chip
            label={isRTL ? config.labelAr : config.label}
            icon={config.icon}
            color={config.color as any}
            size="small"
          />
        );
      },
    },
    {
      id: 'creditor',
      label: 'Creditor',
      labelAr: 'الدائن',
      format: (value: any) => value.name,
    },
    {
      id: 'debtor',
      label: 'Debtor',
      labelAr: 'المدين',
      format: (value: any) => value.name,
    },
    {
      id: 'amount',
      label: 'Amount',
      labelAr: 'المبلغ',
      numeric: true,
      format: (value: number) => value ? (
        <Typography variant="body2" fontWeight={600}>
          {value.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} SAR
        </Typography>
      ) : '-',
    },
    {
      id: 'status',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: string, row: ExecutionRequest) => (
        <Box>
          <Chip
            label={value.replace('_', ' ')}
            color={getStatusColor(value) as any}
            size="small"
            icon={getStatusIcon(value)}
          />
          {row.executionOfficer && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {row.executionOfficer}
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: executionRequests.length,
    pending: executionRequests.filter(r => r.status === 'pending').length,
    inProgress: executionRequests.filter(r => r.status === 'in_progress').length,
    executed: executionRequests.filter(r => r.status === 'executed').length,
    totalAmount: executionRequests.reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Execution Requests"
          titleAr="طلبات التنفيذ"
          subtitle="Manage court execution and enforcement requests"
          subtitleAr="إدارة طلبات تنفيذ الأحكام القضائية"
          breadcrumbs={[
            { label: 'Legal Management', labelAr: 'الإدارة القانونية', path: '#' },
            { label: 'Execution Requests', labelAr: 'طلبات التنفيذ' },
          ]}
          primaryAction={{
            label: 'New Request',
            labelAr: 'طلب جديد',
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Gavel color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الطلبات' : 'Total Requests'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.pending}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HourglassEmpty color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'قيد التنفيذ' : 'In Progress'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.inProgress}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'منفذ' : 'Executed'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.executed}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AttachMoney color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المبلغ' : 'Total Amount'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {(stats.totalAmount / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Execution Progress */}
        {executionRequests.filter(r => r.status === 'in_progress').length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'طلبات قيد التنفيذ' : 'Executions in Progress'}
              </Typography>
              {executionRequests.filter(r => r.status === 'in_progress').map((request) => (
                <Box key={request._id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {request.requestNumber} - {request.creditor.name} vs {request.debtor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.executionOfficer}
                    </Typography>
                  </Box>
                  <Stepper activeStep={getStepFromStatus(request.status)} alternativeLabel>
                    {executionSteps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Execution Requests Table */}
        <DataTable
          columns={columns}
          data={executionRequests}
          title="Execution Requests"
          titleAr="طلبات التنفيذ"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View request', id)}
          onEdit={(id) => console.log('Edit request', id)}
          onDelete={(ids) => console.log('Delete requests', ids)}
        />

        {/* Create Request Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'طلب تنفيذ جديد' : 'New Execution Request'}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              {isRTL 
                ? 'يجب أن يكون لديك حكم قضائي نهائي قابل للتنفيذ'
                : 'You must have a final enforceable court order'
              }
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع التنفيذ' : 'Execution Type'}</InputLabel>
                  <Select
                    value={requestForm.type}
                    label={isRTL ? 'نوع التنفيذ' : 'Execution Type'}
                    onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                  >
                    {executionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {isRTL ? type.labelAr : type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Creditor Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات الدائن' : 'Creditor Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الدائن' : 'Creditor Name'}
                  value={requestForm.creditor.name}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    creditor: { ...requestForm.creditor, name: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الهوية/السجل' : 'ID/CR Number'}
                  value={requestForm.creditor.nationalId}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    creditor: { ...requestForm.creditor, nationalId: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم التواصل' : 'Contact'}
                  value={requestForm.creditor.contact}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    creditor: { ...requestForm.creditor, contact: e.target.value }
                  })}
                />
              </Grid>

              {/* Debtor Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات المدين' : 'Debtor Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم المدين' : 'Debtor Name'}
                  value={requestForm.debtor.name}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    debtor: { ...requestForm.debtor, name: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الهوية/السجل' : 'ID/CR Number'}
                  value={requestForm.debtor.nationalId}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    debtor: { ...requestForm.debtor, nationalId: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم التواصل' : 'Contact'}
                  value={requestForm.debtor.contact}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    debtor: { ...requestForm.debtor, contact: e.target.value }
                  })}
                />
              </Grid>

              {/* Court Order Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات الحكم القضائي' : 'Court Order Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الحكم' : 'Order Number'}
                  value={requestForm.courtOrder.number}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    courtOrder: { ...requestForm.courtOrder, number: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ الحكم' : 'Order Date'}
                  value={requestForm.courtOrder.date}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    courtOrder: { ...requestForm.courtOrder, date: e.target.value }
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المحكمة المصدرة' : 'Issuing Court'}
                  value={requestForm.courtOrder.issuingCourt}
                  onChange={(e) => setRequestForm({ 
                    ...requestForm, 
                    courtOrder: { ...requestForm.courtOrder, issuingCourt: e.target.value }
                  })}
                />
              </Grid>

              {requestForm.type === 'financial' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label={isRTL ? 'المبلغ المطلوب تنفيذه' : 'Amount to Execute'}
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">SAR</InputAdornment>,
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Gavel />}>
              {isRTL ? 'تقديم الطلب' : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
