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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Gavel,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add,
  FilterList,
  Search,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';
import { casesApi, clientsApi } from '@/services/unifiedApiService';

// Mock data for cases
const mockCases = [
  {
    id: 1,
    title: 'Commercial Contract Dispute',
    titleAr: 'نزاع عقد تجاري',
    client: 'ABC Trading Company',
    clientAr: 'شركة ايه بي سي للتجارة',
    status: 'active',
    priority: 'high',
    date: '2024-01-15',
    caseType: 'commercial',
    description: 'Contract breach regarding supply agreement',
    descriptionAr: 'خرق عقد متعلق باتفاقية التوريد',
  },
  {
    id: 2,
    title: 'Employment Termination',
    titleAr: 'إنهاء الخدمة',
    client: 'Mohammed Al-Ahmad',
    clientAr: 'محمد الأحمد',
    status: 'pending',
    priority: 'medium',
    date: '2024-01-10',
    caseType: 'labor',
    description: 'Wrongful termination claim',
    descriptionAr: 'دعوى إنهاء خدمة تعسفي',
  },
  {
    id: 3,
    title: 'Family Inheritance Dispute',
    titleAr: 'نزاع ميراث عائلي',
    client: 'Fatima Al-Zahra',
    clientAr: 'فاطمة الزهراء',
    status: 'completed',
    priority: 'low',
    date: '2023-12-20',
    caseType: 'family',
    description: 'Estate distribution disagreement',
    descriptionAr: 'خلاف حول توزيع التركة',
  },
  {
    id: 4,
    title: 'Real Estate Transaction',
    titleAr: 'معاملة عقارية',
    client: 'Riyadh Development Co.',
    clientAr: 'شركة الرياض للتطوير',
    status: 'active',
    priority: 'high',
    date: '2024-01-20',
    caseType: 'realEstate',
    description: 'Property purchase agreement review',
    descriptionAr: 'مراجعة اتفاقية شراء عقار',
  },
];

export default function CasesPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const isRTL = locale === 'ar';
  const [cases, setCases] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // Dialog states
  const [newCaseDialog, setNewCaseDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);

  // Form state
  const [caseForm, setCaseForm] = useState({
    title: '',
    titleAr: '',
    clientId: '',
    description: '',
    descriptionAr: '',
    caseType: '',
    priority: 'medium',
    status: 'new',
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesResponse, clientsResponse] = await Promise.all([
        casesApi.getAll({ limit: 50 }),
        clientsApi.getAll({ limit: 100 })
      ]);
      
      setCases(casesResponse || []);
      setClients(clientsResponse || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setNotification({
        open: true,
        message: isRTL ? 'فشل في تحميل البيانات' : 'Failed to load data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, caseId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCase(caseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCase(null);
  };

  // Handle new case
  const handleNewCase = () => {
    setCaseForm({
      title: '',
      titleAr: '',
      clientId: '',
      description: '',
      descriptionAr: '',
      caseType: '',
      priority: 'medium',
      status: 'new',
    });
    setNewCaseDialog(true);
  };

  // Handle form submission
  const handleSubmitCase = async () => {
    if (!caseForm.title || !caseForm.clientId || !caseForm.caseType) {
      setNotification({
        open: true,
        message: isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      if (editDialog && selectedCase) {
        // Update existing case
        await casesApi.update(selectedCase, {
          title: caseForm.title,
          description: caseForm.description,
          status: caseForm.status as any,
          priority: caseForm.priority as any,
        });
        setNotification({
          open: true,
          message: isRTL ? 'تم تحديث القضية بنجاح' : 'Case updated successfully',
          severity: 'success',
        });
        setEditDialog(false);
      } else {
        // Create new case
        await casesApi.create({
          title: caseForm.title,
          description: caseForm.description,
          caseType: caseForm.caseType as any,
          priority: caseForm.priority as any,
          clientId: caseForm.clientId,
        });
        setNotification({
          open: true,
          message: isRTL ? 'تم إنشاء القضية بنجاح' : 'Case created successfully',
          severity: 'success',
        });
        setNewCaseDialog(false);
      }
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Failed to submit case:', error);
      setNotification({
        open: true,
        message: isRTL ? 'فشل في حفظ القضية' : 'Failed to save case',
        severity: 'error',
      });
    }
  };

  // Handle view case
  const handleViewCase = (caseId: string) => {
    setSelectedCase(caseId);
    setViewDialog(true);
    handleMenuClose();
  };

  // Handle edit case
  const handleEditCase = (caseId: string) => {
    const caseToEdit = cases.find(c => c.id === caseId || c._id === caseId);
    if (caseToEdit) {
      setCaseForm({
        title: caseToEdit.title,
        titleAr: caseToEdit.titleAr || '',
        clientId: caseToEdit.clientId?._id || caseToEdit.clientId,
        description: caseToEdit.description,
        descriptionAr: caseToEdit.descriptionAr || '',
        caseType: caseToEdit.caseType,
        priority: caseToEdit.priority,
        status: caseToEdit.status,
      });
      setSelectedCase(caseId);
      setEditDialog(true);
    }
    handleMenuClose();
  };

  // Handle delete case
  const handleDeleteCase = (caseId: string) => {
    setSelectedCase(caseId);
    setDeleteDialog(true);
    handleMenuClose();
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (selectedCase) {
      try {
        await casesApi.delete(selectedCase);
        setNotification({
          open: true,
          message: isRTL ? 'تم حذف القضية بنجاح' : 'Case deleted successfully',
          severity: 'success',
        });
        await loadData(); // Reload data
      } catch (error) {
        console.error('Failed to delete case:', error);
        setNotification({
          open: true,
          message: isRTL ? 'فشل في حذف القضية' : 'Failed to delete case',
          severity: 'error',
        });
      }
    }
    setDeleteDialog(false);
    setSelectedCase(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {t('nav.cases')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'إدارة جميع القضايا والملفات القانونية' : 'Manage all legal cases and files'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <AnimatedButton
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ minWidth: 120 }}
            >
              {isRTL ? 'تصفية' : 'Filter'}
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              startIcon={<Add />}
              sx={{ minWidth: 140 }}
              onClick={handleNewCase}
            >
              {isRTL ? 'قضية جديدة' : 'New Case'}
            </AnimatedButton>
          </Box>
        </Box>

        {/* Cases Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="h6">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Typography>
          </Box>
        ) : cases.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'لا توجد قضايا' : 'No cases found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isRTL ? 'انقر على "قضية جديدة" لإنشاء أول قضية' : 'Click "New Case" to create your first case'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cases.map((caseItem, index) => (
              <Grid item xs={12} md={6} lg={4} key={caseItem._id || caseItem.id}>
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
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Header with menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Gavel sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Chip
                            size="small"
                            label={t(`status.${caseItem.status}`)}
                            sx={{
                              backgroundColor: `${getStatusColor(caseItem.status)}20`,
                              color: getStatusColor(caseItem.status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, caseItem._id || caseItem.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Case Title */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                      {isRTL ? caseItem.titleAr : caseItem.title}
                    </Typography>

                    {/* Client */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>{isRTL ? 'العميل: ' : 'Client: '}</strong>
                      {caseItem.clientId?.name || caseItem.clientId || 'N/A'}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {caseItem.description}
                    </Typography>

                    {/* Case Type and Priority */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={t(`caseTypes.${caseItem.caseType}`)}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip
                        size="small"
                        label={isRTL ? 
                          (caseItem.priority === 'high' ? 'عالية' : caseItem.priority === 'medium' ? 'متوسطة' : 'منخفضة') :
                          caseItem.priority
                        }
                        sx={{
                          backgroundColor: `${getPriorityColor(caseItem.priority)}20`,
                          color: getPriorityColor(caseItem.priority),
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Date */}
                    <Typography variant="caption" color="text.secondary">
                      {isRTL ? 'تاريخ الإنشاء: ' : 'Created: '}{new Date(caseItem.createdAt || caseItem.startDate || Date.now()).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleViewCase(caseItem._id || caseItem.id)}
                    >
                      {isRTL ? 'عرض' : 'View'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleEditCase(caseItem._id || caseItem.id)}
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
          <MenuItem onClick={() => selectedCase && handleViewCase(selectedCase)}>
            <Visibility sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </MenuItem>
          <MenuItem onClick={() => selectedCase && handleEditCase(selectedCase)}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تحرير' : 'Edit'}
          </MenuItem>
          <MenuItem onClick={() => selectedCase && handleDeleteCase(selectedCase)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'حذف' : 'Delete'}
          </MenuItem>
        </Menu>
        {/* New Case Dialog */}
        <Dialog
          open={newCaseDialog}
          onClose={() => setNewCaseDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isRTL ? 'إنشاء قضية جديدة' : 'Create New Case'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'عنوان القضية' : 'Case Title'}
                    value={caseForm.title}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العنوان بالعربية' : 'Title in Arabic'}
                    value={caseForm.titleAr}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, titleAr: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العميل' : 'Client'}
                    value={caseForm.clientId}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, clientId: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{isRTL ? 'نوع القضية' : 'Case Type'}</InputLabel>
                    <Select
                      value={caseForm.caseType}
                      label={isRTL ? 'نوع القضية' : 'Case Type'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, caseType: e.target.value }))}
                    >
                      <MenuItem value="commercial">{isRTL ? 'تجاري' : 'Commercial'}</MenuItem>
                      <MenuItem value="civil">{isRTL ? 'مدني' : 'Civil'}</MenuItem>
                      <MenuItem value="criminal">{isRTL ? 'جنائي' : 'Criminal'}</MenuItem>
                      <MenuItem value="labor">{isRTL ? 'عمالي' : 'Labor'}</MenuItem>
                      <MenuItem value="family">{isRTL ? 'أحوال شخصية' : 'Family'}</MenuItem>
                      <MenuItem value="real_estate">{isRTL ? 'عقاري' : 'Real Estate'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                    <Select
                      value={caseForm.priority}
                      label={isRTL ? 'الأولوية' : 'Priority'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="low">{isRTL ? 'منخفضة' : 'Low'}</MenuItem>
                      <MenuItem value="medium">{isRTL ? 'متوسطة' : 'Medium'}</MenuItem>
                      <MenuItem value="high">{isRTL ? 'عالية' : 'High'}</MenuItem>
                      <MenuItem value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الحالة' : 'Status'}</InputLabel>
                    <Select
                      value={caseForm.status}
                      label={isRTL ? 'الحالة' : 'Status'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="pending">{isRTL ? 'معلقة' : 'Pending'}</MenuItem>
                      <MenuItem value="active">{isRTL ? 'نشطة' : 'Active'}</MenuItem>
                      <MenuItem value="closed">{isRTL ? 'مغلقة' : 'Closed'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={isRTL ? 'وصف القضية' : 'Case Description'}
                    value={caseForm.description}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewCaseDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitCase} variant="contained">
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Case Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isRTL ? 'تعديل القضية' : 'Edit Case'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'عنوان القضية' : 'Case Title'}
                    value={caseForm.title}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العنوان بالعربية' : 'Title in Arabic'}
                    value={caseForm.titleAr}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, titleAr: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العميل' : 'Client'}
                    value={caseForm.clientId}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, clientId: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{isRTL ? 'نوع القضية' : 'Case Type'}</InputLabel>
                    <Select
                      value={caseForm.caseType}
                      label={isRTL ? 'نوع القضية' : 'Case Type'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, caseType: e.target.value }))}
                    >
                      <MenuItem value="commercial">{isRTL ? 'تجاري' : 'Commercial'}</MenuItem>
                      <MenuItem value="civil">{isRTL ? 'مدني' : 'Civil'}</MenuItem>
                      <MenuItem value="criminal">{isRTL ? 'جنائي' : 'Criminal'}</MenuItem>
                      <MenuItem value="labor">{isRTL ? 'عمالي' : 'Labor'}</MenuItem>
                      <MenuItem value="family">{isRTL ? 'أحوال شخصية' : 'Family'}</MenuItem>
                      <MenuItem value="real_estate">{isRTL ? 'عقاري' : 'Real Estate'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                    <Select
                      value={caseForm.priority}
                      label={isRTL ? 'الأولوية' : 'Priority'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="low">{isRTL ? 'منخفضة' : 'Low'}</MenuItem>
                      <MenuItem value="medium">{isRTL ? 'متوسطة' : 'Medium'}</MenuItem>
                      <MenuItem value="high">{isRTL ? 'عالية' : 'High'}</MenuItem>
                      <MenuItem value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الحالة' : 'Status'}</InputLabel>
                    <Select
                      value={caseForm.status}
                      label={isRTL ? 'الحالة' : 'Status'}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="pending">{isRTL ? 'معلقة' : 'Pending'}</MenuItem>
                      <MenuItem value="active">{isRTL ? 'نشطة' : 'Active'}</MenuItem>
                      <MenuItem value="closed">{isRTL ? 'مغلقة' : 'Closed'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={isRTL ? 'وصف القضية' : 'Case Description'}
                    value={caseForm.description}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitCase} variant="contained">
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Case Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isRTL ? 'تفاصيل القضية' : 'Case Details'}
          </DialogTitle>
          <DialogContent>
            {selectedCase && (
              <Box sx={{ pt: 2 }}>
                {(() => {
                  const caseItem = cases.find(c => c.id === selectedCase);
                  if (!caseItem) return null;
                  
                  return (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {isRTL ? 'عنوان القضية' : 'Case Title'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {isRTL ? caseItem.titleAr : caseItem.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {isRTL ? 'العميل' : 'Client'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {typeof caseItem.clientId === 'object' ? caseItem.clientId?.name : caseItem.clientId || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {isRTL ? 'نوع القضية' : 'Case Type'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {caseItem.caseType}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {isRTL ? 'الحالة' : 'Status'}
                        </Typography>
                        <Chip
                          label={caseItem.status}
                          sx={{
                            backgroundColor: `${getStatusColor(caseItem.status)}20`,
                            color: getStatusColor(caseItem.status),
                            fontWeight: 600,
                            mb: 2,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {isRTL ? 'وصف القضية' : 'Case Description'}
                        </Typography>
                        <Typography variant="body1">
                          {isRTL ? caseItem.descriptionAr : caseItem.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })()}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
        >
          <DialogTitle>
            {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {isRTL 
                ? 'هل أنت متأكد من أنك تريد حذف هذه القضية؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this case? This action cannot be undone.'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
