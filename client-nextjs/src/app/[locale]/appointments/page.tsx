'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Schedule,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add,
  CalendarToday,
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
  Person,
  LocationOn,
  AccessTime,
  Phone,
  VideoCall,
  Business,
  Gavel,
  EventAvailable,
  EventBusy,
  Cancel,
  CheckCircle,
  Search,
  FilterList,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';
import { appointmentsApi, clientsApi, casesApi, usersApi } from '@/services/unifiedApiService';
import { toast } from 'react-toastify';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Appointment {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  appointmentType: string;
  status: string;
  priority: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  assignedLawyerId: any;
  clientId?: any;
  caseId?: any;
  location?: any;
  notes?: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function AppointmentsPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const isRTL = locale === 'ar';
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'today' | 'week' | 'month'>('list');
  const [currentTab, setCurrentTab] = useState(0);

  // Dialog states
  const [newAppointmentDialog, setNewAppointmentDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);

  // Form state
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    titleAr: '',
    description: '',
    appointmentType: 'consultation',
    priority: 'medium',
    startDateTime: new Date(),
    endDateTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    assignedLawyerId: '',
    clientId: '',
    caseId: '',
    location: {
      type: 'office',
      address: '',
      room: '',
      meetingLink: '',
      phone: '',
      notes: '',
    },
    notes: '',
    isPrivate: false,
    allowClientReschedule: true,
  });

  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadDropdownData();
  }, [viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getAll({
        limit: viewMode === 'list' ? 50 : 0,
      });
      setAppointments(response || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      toast.error(isRTL ? 'فشل في تحميل المواعيد' : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [clientsRes, casesRes, usersRes] = await Promise.all([
        clientsApi.getAll({ limit: 100 }),
        casesApi.getAll({ limit: 100 }),
        usersApi.getAll({ limit: 100 }),
      ]);
      
      setClients(clientsRes || []);
      setCases(casesRes || []);
      setLawyers((usersRes || []).filter((user: any) => user.role === 'lawyer' || user.role === 'admin'));
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, appointmentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointmentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleNewAppointment = () => {
    setAppointmentForm({
      title: '',
      titleAr: '',
      description: '',
      appointmentType: 'consultation',
      priority: 'medium',
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 60 * 60 * 1000),
      assignedLawyerId: '',
      clientId: '',
      caseId: '',
      location: {
        type: 'office',
        address: '',
        room: '',
        meetingLink: '',
        phone: '',
        notes: '',
      },
      notes: '',
      isPrivate: false,
      allowClientReschedule: true,
    });
    setNewAppointmentDialog(true);
  };

  const handleSubmitAppointment = async () => {
    if (!appointmentForm.title || !appointmentForm.assignedLawyerId) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      if (editDialog && selectedAppointment) {
        await appointmentsApi.update(selectedAppointment, appointmentForm);
        toast.success(isRTL ? 'تم تحديث الموعد بنجاح' : 'Appointment updated successfully');
        setEditDialog(false);
      } else {
        await appointmentsApi.create(appointmentForm);
        toast.success(isRTL ? 'تم إنشاء الموعد بنجاح' : 'Appointment created successfully');
        setNewAppointmentDialog(false);
      }
      await loadData();
    } catch (error: any) {
      console.error('Failed to submit appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save appointment';
      toast.error(isRTL ? 'فشل في حفظ الموعد' : errorMessage);
    }
  };

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleEditAppointment = (appointmentId: string) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    if (appointment) {
      setAppointmentForm({
        title: appointment.title,
        titleAr: appointment.titleAr || '',
        description: appointment.description || '',
        appointmentType: appointment.appointmentType,
        priority: appointment.priority,
        startDateTime: new Date(appointment.startDateTime),
        endDateTime: new Date(appointment.endDateTime),
        assignedLawyerId: appointment.assignedLawyerId?._id || appointment.assignedLawyerId,
        clientId: appointment.clientId?._id || appointment.clientId || '',
        caseId: appointment.caseId?._id || appointment.caseId || '',
        location: appointment.location || { type: 'office' },
        notes: appointment.notes || '',
        isPrivate: appointment.isPrivate,
        allowClientReschedule: true,
      });
      setSelectedAppointment(appointmentId);
      setEditDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await appointmentsApi.delete(selectedAppointment);
        toast.success(isRTL ? 'تم إلغاء الموعد بنجاح' : 'Appointment cancelled successfully');
        await loadData();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        toast.error(isRTL ? 'فشل في إلغاء الموعد' : 'Failed to cancel appointment');
      }
    }
    setDeleteDialog(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'confirmed':
        return theme.palette.primary.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'rescheduled':
        return theme.palette.secondary.main;
      case 'no_show':
        return theme.palette.error.dark;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return theme.palette.info.main;
      case 'medium':
        return theme.palette.primary.main;
      case 'high':
        return theme.palette.warning.main;
      case 'urgent':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Schedule />;
      case 'meeting':
        return <Business />;
      case 'court_hearing':
        return <Gavel />;
      case 'phone_call':
        return <Phone />;
      case 'video_call':
        return <VideoCall />;
      default:
        return <CalendarToday />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedAppointmentData = appointments.find(a => a._id === selectedAppointment);

  // Filter appointments by current tab
  const getFilteredAppointments = () => {
    const now = new Date();
    switch (currentTab) {
      case 0: // All
        return appointments;
      case 1: // Today
        return appointments.filter(apt => {
          const aptDate = new Date(apt.startDateTime);
          return aptDate.toDateString() === now.toDateString();
        });
      case 2: // Upcoming
        return appointments.filter(apt => new Date(apt.startDateTime) > now);
      case 3: // Past
        return appointments.filter(apt => new Date(apt.endDateTime) < now);
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner message={isRTL ? 'جاري تحميل المواعيد...' : 'Loading appointments...'} variant="pulse" size="large" />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isRTL ? 'جدول المواعيد' : 'Appointments Schedule'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="list">
                <CalendarViewDay />
              </ToggleButton>
              <ToggleButton value="today">
                <CalendarToday />
              </ToggleButton>
              <ToggleButton value="week">
                <CalendarViewWeek />
              </ToggleButton>
              <ToggleButton value="month">
                <CalendarViewMonth />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <AnimatedButton
              variant="contained"
              startIcon={<Add />}
              sx={{ minWidth: 160 }}
              onClick={handleNewAppointment}
            >
              {isRTL ? 'موعد جديد' : 'New Appointment'}
            </AnimatedButton>
          </Box>
        </Box>

        {/* Filter Tabs */}
        <GlassCard sx={{ mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab label={isRTL ? 'الكل' : 'All'} />
            <Tab label={isRTL ? 'اليوم' : 'Today'} />
            <Tab label={isRTL ? 'القادمة' : 'Upcoming'} />
            <Tab label={isRTL ? 'السابقة' : 'Past'} />
          </Tabs>
        </GlassCard>

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'لا توجد مواعيد' : 'No appointments found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isRTL ? 'انقر على "موعد جديد" لجدولة موعد' : 'Click "New Appointment" to schedule an appointment'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAppointments.map((appointment, index) => (
              <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header with Status and Menu */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={appointment.status.replace('_', ' ').toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(appointment.status)}20`,
                              color: getStatusColor(appointment.status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                          <Chip
                            label={appointment.priority.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: `${getPriorityColor(appointment.priority)}20`,
                              color: getPriorityColor(appointment.priority),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, appointment._id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      {/* Appointment Icon and Type */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                            mr: 2,
                          }}
                        >
                          {getAppointmentTypeIcon(appointment.appointmentType)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {isRTL ? appointment.titleAr || appointment.title : appointment.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.appointmentType.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Date and Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(appointment.startDateTime)}
                        </Typography>
                      </Box>

                      {/* Duration */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>{isRTL ? 'المدة: ' : 'Duration: '}</strong>
                        {appointment.duration} {isRTL ? 'دقيقة' : 'minutes'}
                      </Typography>

                      {/* Assigned Lawyer */}
                      {appointment.assignedLawyerId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.assignedLawyerId.name || 'Assigned Lawyer'}
                          </Typography>
                        </Box>
                      )}

                      {/* Client */}
                      {appointment.clientId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.clientId.name || 'Client'}
                          </Typography>
                        </Box>
                      )}

                      {/* Location */}
                      {appointment.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.location.type?.replace('_', ' ') || 'Office'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => handleViewAppointment(appointment._id)}
                      >
                        {isRTL ? 'عرض' : 'View'}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => handleEditAppointment(appointment._id)}
                      >
                        {isRTL ? 'تحرير' : 'Edit'}
                      </Button>
                    </CardActions>
                  </GlassCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedAppointment && handleViewAppointment(selectedAppointment)}>
            <Visibility sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </MenuItem>
          <MenuItem onClick={() => selectedAppointment && handleEditAppointment(selectedAppointment)}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تحرير' : 'Edit'}
          </MenuItem>
          <MenuItem onClick={() => selectedAppointment && handleDeleteAppointment(selectedAppointment)} sx={{ color: 'error.main' }}>
            <Cancel sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </MenuItem>
        </Menu>

        {/* New/Edit Appointment Dialog */}
        <Dialog
          open={newAppointmentDialog || editDialog}
          onClose={() => {
            setNewAppointmentDialog(false);
            setEditDialog(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editDialog 
              ? (isRTL ? 'تعديل الموعد' : 'Edit Appointment')
              : (isRTL ? 'موعد جديد' : 'New Appointment')
            }
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'عنوان الموعد' : 'Appointment Title'}
                    value={appointmentForm.title}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العنوان بالعربية' : 'Title in Arabic'}
                    value={appointmentForm.titleAr}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, titleAr: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{isRTL ? 'نوع الموعد' : 'Appointment Type'}</InputLabel>
                    <Select
                      value={appointmentForm.appointmentType}
                      label={isRTL ? 'نوع الموعد' : 'Appointment Type'}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentType: e.target.value }))}
                    >
                      <MenuItem value="consultation">{isRTL ? 'استشارة' : 'Consultation'}</MenuItem>
                      <MenuItem value="meeting">{isRTL ? 'اجتماع' : 'Meeting'}</MenuItem>
                      <MenuItem value="court_hearing">{isRTL ? 'جلسة محكمة' : 'Court Hearing'}</MenuItem>
                      <MenuItem value="client_meeting">{isRTL ? 'لقاء عميل' : 'Client Meeting'}</MenuItem>
                      <MenuItem value="phone_call">{isRTL ? 'مكالمة هاتفية' : 'Phone Call'}</MenuItem>
                      <MenuItem value="video_call">{isRTL ? 'مكالمة فيديو' : 'Video Call'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                    <Select
                      value={appointmentForm.priority}
                      label={isRTL ? 'الأولوية' : 'Priority'}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="low">{isRTL ? 'منخفضة' : 'Low'}</MenuItem>
                      <MenuItem value="medium">{isRTL ? 'متوسطة' : 'Medium'}</MenuItem>
                      <MenuItem value="high">{isRTL ? 'عالية' : 'High'}</MenuItem>
                      <MenuItem value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label={isRTL ? 'تاريخ ووقت البداية' : 'Start Date & Time'}
                    value={appointmentForm.startDateTime}
                    onChange={(newValue) => {
                      if (newValue) {
                        setAppointmentForm(prev => ({ 
                          ...prev, 
                          startDateTime: newValue,
                          endDateTime: new Date(newValue.getTime() + 60 * 60 * 1000) // 1 hour later
                        }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label={isRTL ? 'تاريخ ووقت النهاية' : 'End Date & Time'}
                    value={appointmentForm.endDateTime}
                    onChange={(newValue) => {
                      if (newValue) {
                        setAppointmentForm(prev => ({ ...prev, endDateTime: newValue }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{isRTL ? 'المحامي المسؤول' : 'Assigned Lawyer'}</InputLabel>
                    <Select
                      value={appointmentForm.assignedLawyerId}
                      label={isRTL ? 'المحامي المسؤول' : 'Assigned Lawyer'}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, assignedLawyerId: e.target.value }))}
                    >
                      {lawyers.map((lawyer) => (
                        <MenuItem key={lawyer._id} value={lawyer._id}>
                          {lawyer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'العميل' : 'Client'}</InputLabel>
                    <Select
                      value={appointmentForm.clientId}
                      label={isRTL ? 'العميل' : 'Client'}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientId: e.target.value }))}
                    >
                      <MenuItem value="">{isRTL ? 'بدون عميل' : 'No Client'}</MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client._id} value={client._id}>
                          {isRTL ? client.nameAr || client.name : client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={isRTL ? 'الوصف' : 'Description'}
                    value={appointmentForm.description}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={isRTL ? 'ملاحظات' : 'Notes'}
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setNewAppointmentDialog(false);
              setEditDialog(false);
            }}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitAppointment} variant="contained">
              {editDialog 
                ? (isRTL ? 'تحديث' : 'Update')
                : (isRTL ? 'إنشاء' : 'Create')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
        >
          <DialogTitle>
            {isRTL ? 'تأكيد إلغاء الموعد' : 'Confirm Appointment Cancellation'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {isRTL 
                ? 'هل أنت متأكد من أنك تريد إلغاء هذا الموعد؟'
                : 'Are you sure you want to cancel this appointment?'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              {isRTL ? 'لا' : 'No'}
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              {isRTL ? 'نعم، إلغاء' : 'Yes, Cancel'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Appointment Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isRTL ? 'تفاصيل الموعد' : 'Appointment Details'}
          </DialogTitle>
          <DialogContent>
            {selectedAppointmentData && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {isRTL ? selectedAppointmentData.titleAr || selectedAppointmentData.title : selectedAppointmentData.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={selectedAppointmentData.status.replace('_', ' ').toUpperCase()}
                        sx={{
                          backgroundColor: `${getStatusColor(selectedAppointmentData.status)}20`,
                          color: getStatusColor(selectedAppointmentData.status),
                        }}
                      />
                      <Chip
                        label={selectedAppointmentData.priority.toUpperCase()}
                        sx={{
                          backgroundColor: `${getPriorityColor(selectedAppointmentData.priority)}20`,
                          color: getPriorityColor(selectedAppointmentData.priority),
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {isRTL ? 'نوع الموعد' : 'Appointment Type'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAppointmentData.appointmentType.replace('_', ' ')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {isRTL ? 'المدة' : 'Duration'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAppointmentData.duration} {isRTL ? 'دقيقة' : 'minutes'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {isRTL ? 'وقت البداية' : 'Start Time'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDateTime(selectedAppointmentData.startDateTime)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {isRTL ? 'وقت النهاية' : 'End Time'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDateTime(selectedAppointmentData.endDateTime)}
                    </Typography>
                  </Grid>

                  {selectedAppointmentData.assignedLawyerId && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {isRTL ? 'المحامي المسؤول' : 'Assigned Lawyer'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedAppointmentData.assignedLawyerId.name || 'Assigned Lawyer'}
                      </Typography>
                    </Grid>
                  )}

                  {selectedAppointmentData.clientId && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {isRTL ? 'العميل' : 'Client'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedAppointmentData.clientId.name || 'Client'}
                      </Typography>
                    </Grid>
                  )}

                  {selectedAppointmentData.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {isRTL ? 'الوصف' : 'Description'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedAppointmentData.description}
                      </Typography>
                    </Grid>
                  )}

                  {selectedAppointmentData.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {isRTL ? 'ملاحظات' : 'Notes'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedAppointmentData.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setViewDialog(false);
                handleEditAppointment(selectedAppointment || '');
              }}
            >
              {isRTL ? 'تحرير' : 'Edit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

