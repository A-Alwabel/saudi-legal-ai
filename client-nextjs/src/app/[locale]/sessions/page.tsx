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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  AvatarGroup,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Event,
  Gavel,
  Schedule,
  LocationOn,
  People,
  Description,
  Add,
  VideoCall,
  CalendarToday,
  Timer,
  CheckCircle,
  Warning,
  AttachFile,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { sessionAPI } from '@/services/unifiedApiService';

interface Session {
  _id: string;
  title: string;
  type: 'court_hearing' | 'client_meeting' | 'internal_meeting' | 'deposition' | 'mediation';
  caseId?: any;
  scheduledTime: string;
  endTime?: string;
  location?: string;
  isVirtual: boolean;
  virtualLink?: string;
  participants: Array<{
    name: string;
    role: string;
    email?: string;
  }>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  judge?: string;
  courtName?: string;
  notes?: string;
  documents?: string[];
  outcomes?: string;
}

const sessionTypes = [
  { value: 'court_hearing', label: 'Court Hearing', icon: <Gavel />, color: 'error' },
  { value: 'client_meeting', label: 'Client Meeting', icon: <People />, color: 'primary' },
  { value: 'internal_meeting', label: 'Internal Meeting', icon: <Event />, color: 'info' },
  { value: 'deposition', label: 'Deposition', icon: <Description />, color: 'warning' },
  { value: 'mediation', label: 'Mediation', icon: <People />, color: 'success' },
];

export default function SessionsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState('all');
  
  const [sessionForm, setSessionForm] = useState({
    title: '',
    type: 'court_hearing',
    caseId: '',
    scheduledTime: '',
    endTime: '',
    location: '',
    isVirtual: false,
    virtualLink: '',
    judge: '',
    courtName: '',
    participants: [],
    notes: '',
  });

  // Mock data for demonstration
  const mockSessions: Session[] = [
    {
      _id: '1',
      title: 'Commercial Case Hearing',
      type: 'court_hearing',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      location: 'Riyadh Commercial Court',
      isVirtual: false,
      participants: [
        { name: 'Ahmed Al-Rashid', role: 'Lawyer' },
        { name: 'Client ABC Corp', role: 'Client' },
      ],
      status: 'scheduled',
      judge: 'Judge Mohammed Al-Saud',
      courtName: 'Commercial Court',
    },
    {
      _id: '2',
      title: 'Client Strategy Meeting',
      type: 'client_meeting',
      scheduledTime: new Date(Date.now() + 172800000).toISOString(),
      isVirtual: true,
      virtualLink: 'https://meet.example.com/abc123',
      participants: [
        { name: 'Sarah Johnson', role: 'Senior Lawyer' },
        { name: 'Tech Solutions Ltd', role: 'Client' },
      ],
      status: 'scheduled',
    },
    {
      _id: '3',
      title: 'Labor Case Mediation',
      type: 'mediation',
      scheduledTime: new Date(Date.now() - 86400000).toISOString(),
      location: 'Mediation Center',
      isVirtual: false,
      participants: [
        { name: 'Ali Hassan', role: 'Mediator' },
        { name: 'Employee Representative', role: 'Plaintiff' },
        { name: 'Company Representative', role: 'Defendant' },
      ],
      status: 'completed',
      outcomes: 'Settlement reached - 50,000 SAR compensation agreed',
    },
  ];

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // const response = await sessionAPI.getAll({ limit: 100 });
      // setSessions(response || []);
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return sessionTypes.find(t => t.value === type) || sessionTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'cancelled': return 'error';
      case 'postponed': return 'default';
      default: return 'info';
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Session',
      labelAr: 'الجلسة',
      format: (value: string, row: Session) => {
        const typeConfig = getTypeConfig(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: `${typeConfig.color}.light`, width: 36, height: 36 }}>
              {typeConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {typeConfig.label} {row.courtName && `• ${row.courtName}`}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'scheduledTime',
      label: 'Date & Time',
      labelAr: 'التاريخ والوقت',
      format: (value: string, row: Session) => {
        const date = new Date(value);
        return (
          <Box>
            <Typography variant="body2">
              {date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              {row.endTime && ` - ${new Date(row.endTime).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'location',
      label: 'Location',
      labelAr: 'الموقع',
      format: (value: string, row: Session) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {row.isVirtual ? <VideoCall fontSize="small" /> : <LocationOn fontSize="small" />}
          <Typography variant="body2">
            {row.isVirtual ? (isRTL ? 'اجتماع افتراضي' : 'Virtual Meeting') : value || 'TBD'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'participants',
      label: 'Participants',
      labelAr: 'المشاركون',
      format: (value: any[]) => (
        <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
          {value?.map((participant, index) => (
            <Tooltip key={index} title={`${participant.name} (${participant.role})`}>
              <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                {participant.name?.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: string) => (
        <Chip
          label={value.replace('_', ' ')}
          color={getStatusColor(value) as any}
          size="small"
        />
      ),
    },
  ];

  // Statistics
  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduledTime) > new Date()
  );
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledTime);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const courtHearings = sessions.filter(s => s.type === 'court_hearing');

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Sessions Management"
          titleAr="إدارة الجلسات"
          subtitle="Manage court hearings, meetings, and appointments"
          subtitleAr="إدارة جلسات المحكمة والاجتماعات والمواعيد"
          breadcrumbs={[
            { label: 'Legal Management', labelAr: 'الإدارة القانونية', path: '#' },
            { label: 'Sessions', labelAr: 'الجلسات' },
          ]}
          primaryAction={{
            label: 'New Session',
            labelAr: 'جلسة جديدة',
            onClick: () => setDialogOpen(true),
          }}
          secondaryActions={[
            {
              label: viewType === 'list' ? 'Calendar View' : 'List View',
              labelAr: viewType === 'list' ? 'عرض التقويم' : 'عرض القائمة',
              icon: <CalendarToday />,
              onClick: () => setViewType(viewType === 'list' ? 'calendar' : 'list'),
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'القادمة' : 'Upcoming'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {upcomingSessions.length}
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
                  <CalendarToday color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'اليوم' : 'Today'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {todaySessions.length}
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
                  <Gavel color="error" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'جلسات المحكمة' : 'Court Hearings'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {courtHearings.length}
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
                      {isRTL ? 'مكتملة' : 'Completed'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {completedSessions.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isRTL ? "جلسات اليوم" : "Today's Sessions"}
            </Typography>
            <List>
              {todaySessions.map((session) => {
                const typeConfig = getTypeConfig(session.type);
                return (
                  <ListItem key={session._id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: `${typeConfig.color}.main` }}>
                        {typeConfig.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={600}>{session.title}</Typography>
                          {session.status === 'in_progress' && (
                            <Chip label={isRTL ? 'جارية الآن' : 'In Progress'} size="small" color="warning" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {new Date(session.scheduledTime).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {' • '}
                          {session.isVirtual ? (
                            <Typography variant="body2" component="span" color="primary">
                              {isRTL ? 'اجتماع افتراضي' : 'Virtual Meeting'}
                            </Typography>
                          ) : (
                            session.location
                          )}
                        </>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {session.isVirtual && session.virtualLink && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VideoCall />}
                          href={session.virtualLink}
                          target="_blank"
                        >
                          {isRTL ? 'انضم' : 'Join'}
                        </Button>
                      )}
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}

        {/* Sessions Table */}
        <DataTable
          columns={columns}
          data={sessions}
          title="All Sessions"
          titleAr="جميع الجلسات"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View session', id)}
          onEdit={(id) => console.log('Edit session', id)}
          onDelete={(ids) => console.log('Delete sessions', ids)}
        />

        {/* Create Session Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'جدولة جلسة جديدة' : 'Schedule New Session'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'عنوان الجلسة' : 'Session Title'}
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع الجلسة' : 'Session Type'}</InputLabel>
                  <Select
                    value={sessionForm.type}
                    label={isRTL ? 'نوع الجلسة' : 'Session Type'}
                    onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  >
                    {sessionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'القضية' : 'Case'}
                  value={sessionForm.caseId}
                  onChange={(e) => setSessionForm({ ...sessionForm, caseId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label={isRTL ? 'تاريخ ووقت البداية' : 'Start Date & Time'}
                  value={sessionForm.scheduledTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, scheduledTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label={isRTL ? 'تاريخ ووقت النهاية' : 'End Date & Time'}
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {sessionForm.type === 'court_hearing' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={isRTL ? 'اسم القاضي' : 'Judge Name'}
                      value={sessionForm.judge}
                      onChange={(e) => setSessionForm({ ...sessionForm, judge: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={isRTL ? 'اسم المحكمة' : 'Court Name'}
                      value={sessionForm.courtName}
                      onChange={(e) => setSessionForm({ ...sessionForm, courtName: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع الاجتماع' : 'Meeting Type'}</InputLabel>
                  <Select
                    value={sessionForm.isVirtual ? 'virtual' : 'physical'}
                    label={isRTL ? 'نوع الاجتماع' : 'Meeting Type'}
                    onChange={(e) => setSessionForm({ ...sessionForm, isVirtual: e.target.value === 'virtual' })}
                  >
                    <MenuItem value="physical">{isRTL ? 'حضوري' : 'In-Person'}</MenuItem>
                    <MenuItem value="virtual">{isRTL ? 'افتراضي' : 'Virtual'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {sessionForm.isVirtual ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'رابط الاجتماع الافتراضي' : 'Virtual Meeting Link'}
                    value={sessionForm.virtualLink}
                    onChange={(e) => setSessionForm({ ...sessionForm, virtualLink: e.target.value })}
                  />
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'الموقع' : 'Location'}
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Event />}>
              {isRTL ? 'جدولة' : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
