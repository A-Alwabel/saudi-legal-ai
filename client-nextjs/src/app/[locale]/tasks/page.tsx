'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Add,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { tasksApi } from '@/services/unifiedApiService';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  assignedTo?: any;
  caseId?: any;
  progress: number;
}

export default function TasksPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: '',
    caseId: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksApi.getAll({ limit: 100 });
      setTasks(response || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await tasksApi.create(taskForm);
      setDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'in_progress': return <Schedule color="info" />;
      case 'overdue': return <Warning color="error" />;
      default: return <Assignment color="action" />;
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Task',
      labelAr: 'المهمة',
      format: (value: string, row: Task) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon(row.status)}
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.description}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      labelAr: 'الأولوية',
      format: (value: string) => (
        <Chip
          label={value}
          color={getPriorityColor(value) as any}
          size="small"
        />
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      labelAr: 'تاريخ الاستحقاق',
      format: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : '-',
    },
    {
      id: 'progress',
      label: 'Progress',
      labelAr: 'التقدم',
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
          <LinearProgress
            variant="determinate"
            value={value || 0}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption">{value || 0}%</Typography>
        </Box>
      ),
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      labelAr: 'مُسند إلى',
      format: (value: any) => value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {value.name?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{value.name || 'Unassigned'}</Typography>
        </Box>
      ) : 'Unassigned',
    },
  ];

  // Statistics cards
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Tasks Management"
          titleAr="إدارة المهام"
          subtitle="Manage and track all legal tasks"
          subtitleAr="إدارة وتتبع جميع المهام القانونية"
          breadcrumbs={[
            { label: 'Productivity', labelAr: 'الإنتاجية', path: '#' },
            { label: 'Tasks', labelAr: 'المهام' },
          ]}
          primaryAction={{
            label: 'New Task',
            labelAr: 'مهمة جديدة',
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
                  {isRTL ? 'إجمالي المهام' : 'Total Tasks'}
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
                  {isRTL ? 'معلق' : 'Pending'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'قيد التنفيذ' : 'In Progress'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {stats.inProgress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'مكتمل' : 'Completed'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="caption">
                  {isRTL ? 'متأخر' : 'Overdue'}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {stats.overdue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tasks Table */}
        <DataTable
          columns={columns}
          data={tasks}
          title="Tasks List"
          titleAr="قائمة المهام"
          loading={loading}
          locale={locale}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(ids) => console.log('Delete', ids)}
          onView={(id) => console.log('View', id)}
        />

        {/* Add Task Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة مهمة جديدة' : 'Add New Task'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'عنوان المهمة' : 'Task Title'}
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'الوصف' : 'Description'}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                  <Select
                    value={taskForm.priority}
                    label={isRTL ? 'الأولوية' : 'Priority'}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <MenuItem value="low">{isRTL ? 'منخفضة' : 'Low'}</MenuItem>
                    <MenuItem value="medium">{isRTL ? 'متوسطة' : 'Medium'}</MenuItem>
                    <MenuItem value="high">{isRTL ? 'عالية' : 'High'}</MenuItem>
                    <MenuItem value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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
