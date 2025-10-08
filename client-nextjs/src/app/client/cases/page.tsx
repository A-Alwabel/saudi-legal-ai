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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Gavel,
  MoreVert,
  Visibility,
  Schedule,
  Person,
  Business,
  Phone,
  Email,
  Assignment,
  AttachMoney,
  CalendarToday,
  FilterList,
  Search,
  Add,
  Notes,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { clientPortalApi, clientAuthService } from '@/services/unifiedApiService';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';
import { toast } from 'react-toastify';

interface Case {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  caseType: string;
  assignedLawyerId?: any;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  successProbability?: number;
  estimatedValue?: number;
  actualValue?: number;
  notes: any[];
  createdAt: string;
  updatedAt: string;
}

export default function ClientCasesPage() {
  const theme = useTheme();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [consultationDialog, setConsultationDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Consultation form
  const [consultationForm, setConsultationForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    caseId: '',
  });

  useEffect(() => {
    loadCases();
  }, [filterStatus]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filterStatus) params.status = filterStatus;
      
      const cases = await clientPortalApi.getAll(params);
      setCases(cases || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, caseId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCase(caseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCase(null);
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCase(caseId);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleRequestConsultation = (caseId?: string) => {
    setConsultationForm({
      subject: '',
      description: '',
      priority: 'medium',
      caseId: caseId || '',
    });
    setConsultationDialog(true);
    handleMenuClose();
  };

  const submitConsultationRequest = async () => {
    if (!consultationForm.subject || !consultationForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await clientPortalApi.submitConsultationRequest(consultationForm);
      toast.success('Consultation request submitted successfully');
      setConsultationDialog(false);
      loadCases(); // Reload to show new consultation case
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      toast.error('Failed to submit consultation request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.primary.main;
      case 'under_review':
        return theme.palette.warning.main;
      case 'pending_documents':
        return theme.palette.secondary.main;
      case 'court_hearing':
        return theme.palette.error.main;
      case 'settled':
      case 'won':
        return theme.palette.success.main;
      case 'lost':
        return theme.palette.error.dark;
      case 'closed':
        return theme.palette.text.disabled;
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const filteredCases = cases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCaseData = cases.find(c => c._id === selectedCase);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner message="Loading your cases..." variant="pulse" size="large" />
      </Container>
    );
  }

  return (
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
          My Cases
        </Typography>
        <AnimatedButton
          variant="contained"
          startIcon={<Add />}
          sx={{ minWidth: 160 }}
          onClick={() => handleRequestConsultation()}
        >
          Request Consultation
        </AnimatedButton>
      </Box>

      {/* Filters */}
      <GlassCard sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="court_hearing">Court Hearing</MenuItem>
                <MenuItem value="settled">Settled</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
            </Typography>
          </Grid>
        </Grid>
      </GlassCard>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No cases found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm || filterStatus 
              ? 'Try adjusting your search or filter criteria'
              : 'Request a consultation to get started with your first case'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCases.map((case_, index) => (
            <Grid item xs={12} md={6} lg={4} key={case_._id}>
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={case_.status.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(case_.status)}20`,
                            color: getStatusColor(case_.status),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                        <Chip
                          label={case_.priority.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getPriorityColor(case_.priority)}20`,
                            color: getPriorityColor(case_.priority),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, case_._id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Case Title */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                      {case_.title}
                    </Typography>

                    {/* Case Type */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Type:</strong> {case_.caseType.replace('_', ' ')}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {case_.description.length > 100 
                        ? `${case_.description.substring(0, 100)}...`
                        : case_.description
                      }
                    </Typography>

                    {/* Lawyer */}
                    {case_.assignedLawyerId && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                          {case_.assignedLawyerId.name?.[0] || 'L'}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {case_.assignedLawyerId.name || 'Assigned Lawyer'}
                        </Typography>
                      </Box>
                    )}

                    {/* Progress Bar (if success probability exists) */}
                    {case_.successProbability && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Success Probability
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {case_.successProbability}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={case_.successProbability}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        />
                      </Box>
                    )}

                    {/* Dates */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Started: {formatDate(case_.startDate)}
                      </Typography>
                      {case_.expectedEndDate && (
                        <Typography variant="caption" color="text.secondary">
                          Expected: {formatDate(case_.expectedEndDate)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleViewCase(case_._id)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Notes />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleRequestConsultation(case_._id)}
                    >
                      Consult
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
        <MenuItem onClick={() => selectedCase && handleViewCase(selectedCase)}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedCase && handleRequestConsultation(selectedCase)}>
          <Notes sx={{ mr: 1, fontSize: 18 }} />
          Request Consultation
        </MenuItem>
      </Menu>

      {/* Case Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Case Details
        </DialogTitle>
        <DialogContent>
          {selectedCaseData && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedCaseData.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={selectedCaseData.status.replace('_', ' ').toUpperCase()}
                      sx={{
                        backgroundColor: `${getStatusColor(selectedCaseData.status)}20`,
                        color: getStatusColor(selectedCaseData.status),
                      }}
                    />
                    <Chip
                      label={selectedCaseData.priority.toUpperCase()}
                      sx={{
                        backgroundColor: `${getPriorityColor(selectedCaseData.priority)}20`,
                        color: getPriorityColor(selectedCaseData.priority),
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Case Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCaseData.caseType.replace('_', ' ')}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedCaseData.startDate)}
                  </Typography>
                </Grid>

                {selectedCaseData.expectedEndDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected End Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(selectedCaseData.expectedEndDate)}
                    </Typography>
                  </Grid>
                )}

                {selectedCaseData.estimatedValue && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Value
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatCurrency(selectedCaseData.estimatedValue)}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCaseData.description}
                  </Typography>
                </Grid>

                {selectedCaseData.assignedLawyerId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Assigned Lawyer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                        {selectedCaseData.assignedLawyerId.name?.[0] || 'L'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedCaseData.assignedLawyerId.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCaseData.assignedLawyerId.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {selectedCaseData.notes && selectedCaseData.notes.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Case Notes
                    </Typography>
                    <List>
                      {selectedCaseData.notes.slice(0, 5).map((note, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={note.content}
                            secondary={`Added on ${formatDate(note.addedAt)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialog(false);
              handleRequestConsultation(selectedCase || '');
            }}
          >
            Request Consultation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consultation Request Dialog */}
      <Dialog
        open={consultationDialog}
        onClose={() => setConsultationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Request Legal Consultation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={consultationForm.subject}
                  onChange={(e) => setConsultationForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={consultationForm.priority}
                    label="Priority"
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  placeholder="Please describe your legal question or concern in detail..."
                  value={consultationForm.description}
                  onChange={(e) => setConsultationForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsultationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={submitConsultationRequest} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

