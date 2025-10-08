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
  Avatar,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ExitToApp,
  BeachAccess,
  LocalHospital,
  School,
  FlightTakeoff,
  EventBusy,
  CheckCircle,
  Cancel,
  Schedule,
  Add,
  CalendarMonth,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { leaveAPI } from '@/services/unifiedApiService';

interface Leave {
  _id: string;
  employeeId: any;
  type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'hajj' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: any;
  approvalDate?: string;
  notes?: string;
  attachments?: string[];
}

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', labelAr: 'إجازة سنوية', icon: <BeachAccess />, color: 'primary' },
  { value: 'sick', label: 'Sick Leave', labelAr: 'إجازة مرضية', icon: <LocalHospital />, color: 'error' },
  { value: 'maternity', label: 'Maternity Leave', labelAr: 'إجازة أمومة', icon: <School />, color: 'pink' },
  { value: 'paternity', label: 'Paternity Leave', labelAr: 'إجازة أبوة', icon: <School />, color: 'blue' },
  { value: 'hajj', label: 'Hajj Leave', labelAr: 'إجازة حج', icon: <FlightTakeoff />, color: 'success' },
  { value: 'emergency', label: 'Emergency Leave', labelAr: 'إجازة طارئة', icon: <EventBusy />, color: 'warning' },
  { value: 'unpaid', label: 'Unpaid Leave', labelAr: 'إجازة بدون راتب', icon: <ExitToApp />, color: 'default' },
];

// Saudi Arabia specific leave entitlements
const leaveEntitlements = {
  annual: 30, // 30 days per year after 5 years of service
  sick: 120, // 120 days per year
  maternity: 70, // 10 weeks
  paternity: 3, // 3 days
  hajj: 10, // Once in service, paid
  emergency: 5, // 5 days per year
};

export default function LeavesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    notes: '',
  });

  // Mock employee leave balance
  const leaveBalance = {
    annual: { used: 12, remaining: 18, total: 30 },
    sick: { used: 3, remaining: 117, total: 120 },
    emergency: { used: 2, remaining: 3, total: 5 },
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getAll({ limit: 100 });
      setLeaves(response || []);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async () => {
    const days = calculateDays(leaveForm.startDate, leaveForm.endDate);
    try {
      await leaveAPI.create({
        ...leaveForm,
        days,
        status: 'pending',
      });
      setDialogOpen(false);
      loadLeaves();
    } catch (error) {
      console.error('Failed to create leave request:', error);
    }
  };

  const getTypeConfig = (type: string) => {
    return leaveTypes.find(t => t.value === type) || leaveTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const columns = [
    {
      id: 'employeeId',
      label: 'Employee',
      labelAr: 'الموظف',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {value?.name?.charAt(0) || 'E'}
          </Avatar>
          <Typography variant="body2">
            {value?.name || 'Unknown Employee'}
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
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'startDate',
      label: 'Duration',
      labelAr: 'المدة',
      format: (value: string, row: Leave) => (
        <Box>
          <Typography variant="body2">
            {new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} - 
            {new Date(row.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.days} {isRTL ? 'يوم' : row.days === 1 ? 'day' : 'days'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'reason',
      label: 'Reason',
      labelAr: 'السبب',
      format: (value: string) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
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
  ];

  // Statistics
  const pendingRequests = leaves.filter(l => l.status === 'pending').length;
  const approvedThisMonth = leaves.filter(l => {
    if (l.status !== 'approved') return false;
    const approvalDate = new Date(l.approvalDate || l.startDate);
    const now = new Date();
    return approvalDate.getMonth() === now.getMonth() && approvalDate.getFullYear() === now.getFullYear();
  }).length;
  const onLeaveToday = leaves.filter(l => {
    if (l.status !== 'approved') return false;
    const today = new Date();
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return today >= start && today <= end;
  }).length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Leave Management"
          titleAr="إدارة الإجازات"
          subtitle="Manage employee leave requests and balances"
          subtitleAr="إدارة طلبات الإجازات وأرصدة الموظفين"
          breadcrumbs={[
            { label: 'HR Management', labelAr: 'إدارة الموارد البشرية', path: '#' },
            { label: 'Leave Management', labelAr: 'إدارة الإجازات' },
          ]}
          primaryAction={{
            label: 'Request Leave',
            labelAr: 'طلب إجازة',
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
                  <Schedule color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'طلبات معلقة' : 'Pending Requests'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {pendingRequests}
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
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'موافق عليها هذا الشهر' : 'Approved This Month'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {approvedThisMonth}
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
                  <BeachAccess color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'في إجازة اليوم' : 'On Leave Today'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {onLeaveToday}
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
                  <CalendarMonth color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'رصيد الإجازات السنوية' : 'Annual Leave Balance'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {leaveBalance.annual.remaining}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Balance Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isRTL ? 'رصيد الإجازات' : 'Leave Balance'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(leaveBalance).map(([type, balance]) => {
                    const config = getTypeConfig(type);
                    const percentage = (balance.used / balance.total) * 100;
                    return (
                      <Box key={type} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {isRTL ? config?.labelAr : config?.label || type}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {balance.remaining}/{balance.total} {isRTL ? 'يوم' : 'days'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={percentage > 80 ? 'error' : percentage > 60 ? 'warning' : 'primary'}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Saudi Leave Entitlements */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isRTL ? 'استحقاقات الإجازات السعودية' : 'Saudi Leave Entitlements'}
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  {isRTL ? 'حسب نظام العمل السعودي' : 'As per Saudi Labor Law'}
                </Alert>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(leaveEntitlements).map(([type, days]) => {
                    const config = getTypeConfig(type);
                    return (
                      <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {config?.icon}
                          <Typography variant="body2">
                            {isRTL ? config?.labelAr : config?.label || type}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {days} {isRTL ? 'يوم' : 'days'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Leave Requests Timeline */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isRTL ? 'الطلبات الأخيرة' : 'Recent Requests'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {leaves.slice(0, 3).map((leave, index) => (
                    <Box 
                      key={leave._id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: `${getStatusColor(leave.status)}.main`,
                          mr: 2 
                        }}
                      >
                        {getStatusIcon(leave.status)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {leave.employeeId?.name || 'Employee'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTypeConfig(leave.type).label} • {leave.days} days
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Requests Table */}
        <DataTable
          columns={columns}
          data={leaves}
          title="Leave Requests"
          titleAr="طلبات الإجازات"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View leave', id)}
          onEdit={(id) => console.log('Edit leave', id)}
        />

        {/* Request Leave Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'طلب إجازة جديد' : 'New Leave Request'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الموظف' : 'Employee'}
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع الإجازة' : 'Leave Type'}</InputLabel>
                  <Select
                    value={leaveForm.type}
                    label={isRTL ? 'نوع الإجازة' : 'Leave Type'}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  >
                    {leaveTypes.map((type) => (
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ البداية' : 'Start Date'}
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ النهاية' : 'End Date'}
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {leaveForm.startDate && leaveForm.endDate && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {isRTL ? 'المدة: ' : 'Duration: '}
                    {calculateDays(leaveForm.startDate, leaveForm.endDate)}
                    {isRTL ? ' يوم' : ' days'}
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'السبب' : 'Reason'}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={leaveForm.notes}
                  onChange={(e) => setLeaveForm({ ...leaveForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isRTL ? 'تقديم الطلب' : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
