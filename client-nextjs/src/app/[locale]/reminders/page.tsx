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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  NotificationsActive,
  Add,
  Schedule,
  Event,
  Alarm,
  CheckCircle,
  Cancel,
  Repeat,
  Person,
  Gavel,
  AttachMoney,
  Description,
  Edit,
  Delete,
  Today,
  DateRange,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { reminderAPI } from '@/services/unifiedApiService';

interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'appointment' | 'deadline' | 'payment' | 'court_date' | 'general';
  relatedTo?: {
    type: 'case' | 'client' | 'invoice' | 'document';
    id: string;
    name: string;
  };
  dueDate: string;
  dueTime?: string;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: any[];
  status: 'active' | 'completed' | 'cancelled' | 'snoozed';
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  remindBefore?: number; // minutes
  createdBy: any;
  createdAt: string;
}

const reminderTypes = [
  { value: 'task', label: 'Task', labelAr: 'مهمة', icon: <CheckCircle />, color: 'primary' },
  { value: 'appointment', label: 'Appointment', labelAr: 'موعد', icon: <Event />, color: 'info' },
  { value: 'deadline', label: 'Deadline', labelAr: 'موعد نهائي', icon: <Alarm />, color: 'error' },
  { value: 'payment', label: 'Payment', labelAr: 'دفعة', icon: <AttachMoney />, color: 'success' },
  { value: 'court_date', label: 'Court Date', labelAr: 'موعد محكمة', icon: <Gavel />, color: 'warning' },
  { value: 'general', label: 'General', labelAr: 'عام', icon: <NotificationsActive />, color: 'default' },
];

const priorities = [
  { value: 'low', label: 'Low', labelAr: 'منخفض', color: 'default' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسط', color: 'info' },
  { value: 'high', label: 'High', labelAr: 'عالي', color: 'warning' },
  { value: 'urgent', label: 'Urgent', labelAr: 'عاجل', color: 'error' },
];

export default function RemindersPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    type: 'task',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    recurring: {
      enabled: false,
      frequency: 'weekly',
      endDate: '',
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    remindBefore: 30,
    assignedTo: [],
  });

  // Mock data
  const mockReminders: Reminder[] = [
    {
      _id: '1',
      title: 'Court Hearing - Case #2024-123',
      description: 'Commercial dispute hearing at Riyadh Commercial Court',
      type: 'court_date',
      relatedTo: { type: 'case', id: 'case-123', name: 'Commercial Dispute' },
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      dueTime: '10:00',
      priority: 'urgent',
      status: 'active',
      notifications: { email: true, sms: true, push: true },
      remindBefore: 60,
      createdBy: { name: 'Ahmed Al-Rashid' },
      createdAt: '2024-01-10',
    },
    {
      _id: '2',
      title: 'Invoice Payment Due',
      description: 'Payment due for INV-2024-456',
      type: 'payment',
      relatedTo: { type: 'invoice', id: 'inv-456', name: 'INV-2024-456' },
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      priority: 'high',
      status: 'active',
      notifications: { email: true, sms: false, push: true },
      remindBefore: 1440, // 1 day
      createdBy: { name: 'Sarah Johnson' },
      createdAt: '2024-01-15',
    },
    {
      _id: '3',
      title: 'Weekly Team Meeting',
      description: 'Regular weekly legal team sync',
      type: 'appointment',
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      dueTime: '14:00',
      recurring: { enabled: true, frequency: 'weekly' },
      priority: 'medium',
      status: 'active',
      assignedTo: [
        { name: 'Legal Team', _id: 'team-1' }
      ],
      notifications: { email: true, sms: false, push: false },
      remindBefore: 15,
      createdBy: { name: 'Mohammed Al-Saud' },
      createdAt: '2024-01-01',
    },
  ];

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      // const response = await reminderAPI.getAll({ limit: 100 });
      // setReminders(response || []);
      setReminders(mockReminders);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return reminderTypes.find(t => t.value === type) || reminderTypes[0];
  };

  const getPriorityConfig = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[0];
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (date: string, time?: string) => {
    const dueDate = new Date(date);
    const dateStr = dueDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
    return time ? `${dateStr} ${time}` : dateStr;
  };

  // Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const stats = {
    total: reminders.filter(r => r.status === 'active').length,
    today: reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return r.status === 'active' && dueDate.getTime() === today.getTime();
    }).length,
    tomorrow: reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return r.status === 'active' && dueDate.getTime() === tomorrow.getTime();
    }).length,
    thisWeek: reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return r.status === 'active' && dueDate >= today && dueDate <= weekEnd;
    }).length,
    urgent: reminders.filter(r => r.status === 'active' && r.priority === 'urgent').length,
    overdue: reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return r.status === 'active' && dueDate < today;
    }).length,
  };

  const columns = [
    {
      id: 'title',
      label: 'Reminder',
      labelAr: 'التذكير',
      format: (value: string, row: Reminder) => {
        const typeConfig = getTypeConfig(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: `${typeConfig.color}.main` }}>
              {typeConfig.icon}
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.description || row.relatedTo?.name}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      labelAr: 'الموعد',
      format: (value: string, row: Reminder) => {
        const daysUntil = getDaysUntilDue(value);
        const isOverdue = daysUntil < 0;
        const isToday = daysUntil === 0;
        const isTomorrow = daysUntil === 1;
        
        return (
          <Box>
            <Typography 
              variant="body2" 
              color={isOverdue ? 'error' : isToday ? 'warning.main' : 'text.primary'}
              fontWeight={isOverdue || isToday ? 600 : 400}
            >
              {formatDueDate(value, row.dueTime)}
            </Typography>
            <Typography 
              variant="caption" 
              color={isOverdue ? 'error' : isToday ? 'warning.main' : 'text.secondary'}
            >
              {isOverdue ? (isRTL ? 'متأخر' : 'Overdue') :
               isToday ? (isRTL ? 'اليوم' : 'Today') :
               isTomorrow ? (isRTL ? 'غداً' : 'Tomorrow') :
               (isRTL ? `بعد ${daysUntil} يوم` : `In ${daysUntil} days`)}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'priority',
      label: 'Priority',
      labelAr: 'الأولوية',
      format: (value: string) => {
        const config = getPriorityConfig(value);
        return (
          <Chip
            label={isRTL ? config.labelAr : config.label}
            color={config.color as any}
            size="small"
          />
        );
      },
    },
    {
      id: 'recurring',
      label: 'Recurring',
      labelAr: 'متكرر',
      format: (value: any) => value?.enabled ? (
        <Chip
          icon={<Repeat />}
          label={value.frequency}
          size="small"
          variant="outlined"
        />
      ) : '-',
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      labelAr: 'مُسند إلى',
      format: (value: any[]) => value?.length > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" />
          <Typography variant="body2">
            {value[0]?.name || 'Unassigned'}
          </Typography>
        </Box>
      ) : 'Everyone',
    },
    {
      id: 'status',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: string) => {
        const statusConfig = {
          active: { label: 'Active', labelAr: 'نشط', color: 'success' as const, icon: <CheckCircle /> },
          completed: { label: 'Completed', labelAr: 'مكتمل', color: 'default' as const, icon: <CheckCircle /> },
          cancelled: { label: 'Cancelled', labelAr: 'ملغي', color: 'error' as const, icon: <Cancel /> },
          snoozed: { label: 'Snoozed', labelAr: 'مؤجل', color: 'warning' as const, icon: <Alarm /> },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <Chip
            label={isRTL ? config.labelAr : config.label}
            color={config.color}
            size="small"
            icon={config.icon}
          />
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Reminders"
          titleAr="التذكيرات"
          subtitle="Manage tasks, appointments, and deadlines"
          subtitleAr="إدارة المهام والمواعيد والمواعيد النهائية"
          breadcrumbs={[
            { label: 'Productivity', labelAr: 'الإنتاجية', path: '#' },
            { label: 'Reminders', labelAr: 'التذكيرات' },
          ]}
          primaryAction={{
            label: 'New Reminder',
            labelAr: 'تذكير جديد',
            icon: <Add />,
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <NotificationsActive color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'نشط' : 'Active'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Today color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'اليوم' : 'Today'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.today}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DateRange color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'غداً' : 'Tomorrow'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.tomorrow}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'هذا الأسبوع' : 'This Week'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.thisWeek}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Alarm color="error" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'عاجل' : 'Urgent'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {stats.urgent}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Cancel color="error" fontSize="large" />
                  <Box>
                    <Typography color="error" variant="caption">
                      {isRTL ? 'متأخر' : 'Overdue'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error">
                      {stats.overdue}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Overdue Alert */}
        {stats.overdue > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {isRTL 
              ? `لديك ${stats.overdue} تذكيرات متأخرة تحتاج إلى اهتمامك`
              : `You have ${stats.overdue} overdue reminders that need your attention`
            }
          </Alert>
        )}

        {/* Today's Reminders */}
        {stats.today > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? "تذكيرات اليوم" : "Today's Reminders"}
              </Typography>
              <List>
                {reminders
                  .filter(r => {
                    const dueDate = new Date(r.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return r.status === 'active' && dueDate.getTime() === today.getTime();
                  })
                  .map((reminder) => {
                    const typeConfig = getTypeConfig(reminder.type);
                    const priorityConfig = getPriorityConfig(reminder.priority);
                    return (
                      <ListItem key={reminder._id} divider>
                        <ListItemIcon>
                          {typeConfig.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={600}>{reminder.title}</Typography>
                              <Chip 
                                label={isRTL ? priorityConfig.labelAr : priorityConfig.label} 
                                color={priorityConfig.color as any} 
                                size="small" 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              {reminder.dueTime && `${reminder.dueTime} • `}
                              {reminder.description || reminder.relatedTo?.name}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small">
                            <CheckCircle />
                          </IconButton>
                          <IconButton edge="end" size="small">
                            <Alarm />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Reminders Table */}
        <DataTable
          columns={columns}
          data={reminders}
          title="All Reminders"
          titleAr="جميع التذكيرات"
          loading={loading}
          locale={locale}
          onEdit={(id) => console.log('Edit reminder', id)}
          onDelete={(ids) => console.log('Delete reminders', ids)}
        />

        {/* Create Reminder Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'إنشاء تذكير جديد' : 'Create New Reminder'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'العنوان' : 'Title'}
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={isRTL ? 'الوصف' : 'Description'}
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'النوع' : 'Type'}</InputLabel>
                  <Select
                    value={reminderForm.type}
                    label={isRTL ? 'النوع' : 'Type'}
                    onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value })}
                  >
                    {reminderTypes.map((type) => (
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'التاريخ' : 'Date'}
                  value={reminderForm.dueDate}
                  onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label={isRTL ? 'الوقت' : 'Time'}
                  value={reminderForm.dueTime}
                  onChange={(e) => setReminderForm({ ...reminderForm, dueTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                  <Select
                    value={reminderForm.priority}
                    label={isRTL ? 'الأولوية' : 'Priority'}
                    onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {isRTL ? priority.labelAr : priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminderForm.recurring.enabled}
                      onChange={(e) => setReminderForm({
                        ...reminderForm,
                        recurring: { ...reminderForm.recurring, enabled: e.target.checked }
                      })}
                    />
                  }
                  label={isRTL ? 'تذكير متكرر' : 'Recurring Reminder'}
                />
              </Grid>
              {reminderForm.recurring.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{isRTL ? 'التكرار' : 'Frequency'}</InputLabel>
                      <Select
                        value={reminderForm.recurring.frequency}
                        label={isRTL ? 'التكرار' : 'Frequency'}
                        onChange={(e) => setReminderForm({
                          ...reminderForm,
                          recurring: { ...reminderForm.recurring, frequency: e.target.value as any }
                        })}
                      >
                        <MenuItem value="daily">{isRTL ? 'يومياً' : 'Daily'}</MenuItem>
                        <MenuItem value="weekly">{isRTL ? 'أسبوعياً' : 'Weekly'}</MenuItem>
                        <MenuItem value="monthly">{isRTL ? 'شهرياً' : 'Monthly'}</MenuItem>
                        <MenuItem value="yearly">{isRTL ? 'سنوياً' : 'Yearly'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label={isRTL ? 'ينتهي في' : 'End Date'}
                      value={reminderForm.recurring.endDate}
                      onChange={(e) => setReminderForm({
                        ...reminderForm,
                        recurring: { ...reminderForm.recurring, endDate: e.target.value }
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'الإشعارات' : 'Notifications'}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminderForm.notifications.email}
                      onChange={(e) => setReminderForm({
                        ...reminderForm,
                        notifications: { ...reminderForm.notifications, email: e.target.checked }
                      })}
                    />
                  }
                  label={isRTL ? 'بريد إلكتروني' : 'Email'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminderForm.notifications.sms}
                      onChange={(e) => setReminderForm({
                        ...reminderForm,
                        notifications: { ...reminderForm.notifications, sms: e.target.checked }
                      })}
                    />
                  }
                  label={isRTL ? 'رسالة نصية' : 'SMS'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reminderForm.notifications.push}
                      onChange={(e) => setReminderForm({
                        ...reminderForm,
                        notifications: { ...reminderForm.notifications, push: e.target.checked }
                      })}
                    />
                  }
                  label={isRTL ? 'إشعارات التطبيق' : 'Push Notifications'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<NotificationsActive />}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
