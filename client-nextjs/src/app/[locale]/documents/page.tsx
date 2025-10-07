'use client';

import React, { useState } from 'react';
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
  LinearProgress,
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
  Description,
  PictureAsPdf,
  Image,
  VideoFile,
  AudioFile,
  MoreVert,
  Edit,
  Delete,
  Download,
  Share,
  Add,
  CloudUpload,
  Folder,
  InsertDriveFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    name: 'Commercial Contract - ABC Trading.pdf',
    nameAr: 'العقد التجاري - شركة ايه بي سي للتجارة.pdf',
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2024-01-20',
    category: 'contracts',
    categoryAr: 'العقود',
    caseId: 1,
    caseName: 'Commercial Contract Dispute',
    caseNameAr: 'نزاع عقد تجاري',
    status: 'approved',
    uploader: 'Ahmed Al-Mansouri',
    uploaderAr: 'أحمد المنصوري',
  },
  {
    id: 2,
    name: 'Employment Agreement.docx',
    nameAr: 'اتفاقية العمل.docx',
    type: 'document',
    size: '1.8 MB',
    uploadDate: '2024-01-18',
    category: 'agreements',
    categoryAr: 'الاتفاقيات',
    caseId: 2,
    caseName: 'Employment Termination',
    caseNameAr: 'إنهاء الخدمة',
    status: 'pending',
    uploader: 'Mohammed Al-Ahmad',
    uploaderAr: 'محمد الأحمد',
  },
  {
    id: 3,
    name: 'Property Photos.zip',
    nameAr: 'صور العقار.zip',
    type: 'archive',
    size: '15.2 MB',
    uploadDate: '2024-01-22',
    category: 'evidence',
    categoryAr: 'الأدلة',
    caseId: 4,
    caseName: 'Real Estate Transaction',
    caseNameAr: 'معاملة عقارية',
    status: 'approved',
    uploader: 'Legal Assistant',
    uploaderAr: 'المساعد القانوني',
  },
  {
    id: 4,
    name: 'Inheritance Documents.pdf',
    nameAr: 'وثائق الميراث.pdf',
    type: 'pdf',
    size: '4.1 MB',
    uploadDate: '2024-01-15',
    category: 'legal_docs',
    categoryAr: 'الوثائق القانونية',
    caseId: 3,
    caseName: 'Family Inheritance Dispute',
    caseNameAr: 'نزاع ميراث عائلي',
    status: 'approved',
    uploader: 'Fatima Al-Zahra',
    uploaderAr: 'فاطمة الزهراء',
  },
  {
    id: 5,
    name: 'Court Hearing Recording.mp3',
    nameAr: 'تسجيل جلسة المحكمة.mp3',
    type: 'audio',
    size: '25.6 MB',
    uploadDate: '2024-01-12',
    category: 'recordings',
    categoryAr: 'التسجيلات',
    caseId: 1,
    caseName: 'Commercial Contract Dispute',
    caseNameAr: 'نزاع عقد تجاري',
    status: 'confidential',
    uploader: 'Court Recorder',
    uploaderAr: 'مسجل المحكمة',
  },
  {
    id: 6,
    name: 'Financial Statements.xlsx',
    nameAr: 'البيانات المالية.xlsx',
    type: 'spreadsheet',
    size: '892 KB',
    uploadDate: '2024-01-10',
    category: 'financial',
    categoryAr: 'المالية',
    caseId: 2,
    caseName: 'Employment Termination',
    caseNameAr: 'إنهاء الخدمة',
    status: 'approved',
    uploader: 'Accountant',
    uploaderAr: 'المحاسب',
  },
];

export default function DocumentsPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const isRTL = locale === 'ar';
  const [documents, setDocuments] = useState(mockDocuments);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  
  // Dialog states
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '',
    caseId: '',
    file: null as File | null,
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, documentId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(documentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, name: file.name }));
    }
  };

  // Handle upload submission
  const handleUploadSubmit = async () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      setNotification({
        open: true,
        message: isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        severity: 'error',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate upload completion
    setTimeout(() => {
      const newDocument = {
        id: documents.length + 1,
        name: uploadForm.name,
        nameAr: uploadForm.name, // In real app, would need translation
        type: uploadForm.file!.type.includes('pdf') ? 'pdf' : 'document',
        size: `${(uploadForm.file!.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        category: uploadForm.category,
        categoryAr: uploadForm.category, // In real app, would need translation
        caseId: parseInt(uploadForm.caseId) || 1,
        caseName: 'New Case',
        caseNameAr: 'قضية جديدة',
        status: 'pending',
        uploader: 'Current User',
        uploaderAr: 'المستخدم الحالي',
      };

      setDocuments(prev => [newDocument, ...prev]);
      setUploadDialog(false);
      setUploadForm({ name: '', category: '', caseId: '', file: null });
      setIsUploading(false);
      setUploadProgress(0);
      
      setNotification({
        open: true,
        message: isRTL ? 'تم رفع الملف بنجاح' : 'File uploaded successfully',
        severity: 'success',
      });
    }, 1500);
  };

  // Handle download
  const handleDownload = (documentId: number) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      // In a real app, this would trigger actual download
      setNotification({
        open: true,
        message: isRTL ? `تم تحميل ${document.nameAr}` : `Downloaded ${document.name}`,
        severity: 'success',
      });
    }
    handleMenuClose();
  };

  // Handle share
  const handleShare = (documentId: number) => {
    setSelectedDocument(documentId);
    setShareDialog(true);
    handleMenuClose();
  };

  // Handle edit
  const handleEdit = (documentId: number) => {
    setSelectedDocument(documentId);
    setEditDialog(true);
    handleMenuClose();
  };

  // Handle delete
  const handleDelete = (documentId: number) => {
    setSelectedDocument(documentId);
    setDeleteDialog(true);
    handleMenuClose();
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedDocument) {
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument));
      setNotification({
        open: true,
        message: isRTL ? 'تم حذف الملف بنجاح' : 'Document deleted successfully',
        severity: 'success',
      });
    }
    setDeleteDialog(false);
    setSelectedDocument(null);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf sx={{ fontSize: 28, color: '#d32f2f' }} />;
      case 'document':
        return <Description sx={{ fontSize: 28, color: '#1976d2' }} />;
      case 'image':
        return <Image sx={{ fontSize: 28, color: '#388e3c' }} />;
      case 'audio':
        return <AudioFile sx={{ fontSize: 28, color: '#f57c00' }} />;
      case 'video':
        return <VideoFile sx={{ fontSize: 28, color: '#7b1fa2' }} />;
      case 'spreadsheet':
        return <InsertDriveFile sx={{ fontSize: 28, color: '#00796b' }} />;
      case 'archive':
        return <Folder sx={{ fontSize: 28, color: '#5d4037' }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: 28, color: theme.palette.grey[600] }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'confidential':
        return theme.palette.error.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'approved':
          return 'معتمد';
        case 'pending':
          return 'قيد المراجعة';
        case 'confidential':
          return 'سري';
        case 'rejected':
          return 'مرفوض';
        default:
          return status;
      }
    }
    return status;
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
              {t('nav.documents')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'إدارة جميع الوثائق والملفات القانونية' : 'Manage all legal documents and files'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <AnimatedButton
              variant="outlined"
              startIcon={<Folder />}
              sx={{ minWidth: 120 }}
            >
              {isRTL ? 'المجلدات' : 'Folders'}
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              startIcon={<CloudUpload />}
              sx={{ minWidth: 140 }}
              onClick={() => setUploadDialog(true)}
            >
              {isRTL ? 'رفع ملف' : 'Upload'}
            </AnimatedButton>
          </Box>
        </Box>

        {/* Documents Grid */}
        <Grid container spacing={3}>
          {documents.map((document, index) => (
            <Grid item xs={12} md={6} lg={4} key={document.id}>
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
                    {/* Header with file icon and menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.background.paper, 0.5),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        >
                          {getFileIcon(document.type)}
                        </Box>
                        <Box>
                          <Chip
                            size="small"
                            label={getStatusLabel(document.status)}
                            sx={{
                              backgroundColor: `${getStatusColor(document.status)}20`,
                              color: getStatusColor(document.status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, document.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Document Name */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1, 
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={isRTL ? document.nameAr : document.name}
                    >
                      {isRTL ? document.nameAr : document.name}
                    </Typography>

                    {/* File Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>{isRTL ? 'الحجم: ' : 'Size: '}</strong>
                        {document.size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>{isRTL ? 'التصنيف: ' : 'Category: '}</strong>
                        {isRTL ? document.categoryAr : document.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>{isRTL ? 'القضية: ' : 'Case: '}</strong>
                        {isRTL ? document.caseNameAr : document.caseName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{isRTL ? 'رفع بواسطة: ' : 'Uploaded by: '}</strong>
                        {isRTL ? document.uploaderAr : document.uploader}
                      </Typography>
                    </Box>

                    {/* Upload Date */}
                    <Typography variant="caption" color="text.secondary">
                      {isRTL ? 'تاريخ الرفع: ' : 'Uploaded: '}{new Date(document.uploadDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleDownload(document.id)}
                    >
                      {isRTL ? 'تحميل' : 'Download'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Share />}
                      sx={{ textTransform: 'none' }}
                      onClick={() => handleShare(document.id)}
                    >
                      {isRTL ? 'مشاركة' : 'Share'}
                    </Button>
                  </CardActions>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedDocument && handleDownload(selectedDocument)}>
            <Download sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تحميل' : 'Download'}
          </MenuItem>
          <MenuItem onClick={() => selectedDocument && handleShare(selectedDocument)}>
            <Share sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'مشاركة' : 'Share'}
          </MenuItem>
          <MenuItem onClick={() => selectedDocument && handleEdit(selectedDocument)}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تحرير' : 'Edit'}
          </MenuItem>
          <MenuItem onClick={() => selectedDocument && handleDelete(selectedDocument)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'حذف' : 'Delete'}
          </MenuItem>
        </Menu>

        {/* Upload Dialog */}
        <Dialog 
          open={uploadDialog} 
          onClose={() => setUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {isRTL ? 'رفع ملف جديد' : 'Upload New Document'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png,.mp3,.mp4"
                onChange={handleFileUpload}
                style={{ marginBottom: 16 }}
              />
              
              <TextField
                label={isRTL ? 'اسم الملف' : 'Document Name'}
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              
              <FormControl fullWidth required>
                <InputLabel>{isRTL ? 'التصنيف' : 'Category'}</InputLabel>
                <Select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  label={isRTL ? 'التصنيف' : 'Category'}
                >
                  <MenuItem value="contracts">{isRTL ? 'العقود' : 'Contracts'}</MenuItem>
                  <MenuItem value="agreements">{isRTL ? 'الاتفاقيات' : 'Agreements'}</MenuItem>
                  <MenuItem value="evidence">{isRTL ? 'الأدلة' : 'Evidence'}</MenuItem>
                  <MenuItem value="legal_docs">{isRTL ? 'الوثائق القانونية' : 'Legal Documents'}</MenuItem>
                  <MenuItem value="financial">{isRTL ? 'المالية' : 'Financial'}</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label={isRTL ? 'رقم القضية' : 'Case ID'}
                value={uploadForm.caseId}
                onChange={(e) => setUploadForm(prev => ({ ...prev, caseId: e.target.value }))}
                fullWidth
                type="number"
              />
              
              {isUploading && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)} disabled={isUploading}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleUploadSubmit} 
              variant="contained"
              disabled={isUploading || !uploadForm.file}
            >
              {isUploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع' : 'Upload')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>
            {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {isRTL ? 'هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this document? This action cannot be undone.'}
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

        {/* Share Dialog */}
        <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isRTL ? 'مشاركة الملف' : 'Share Document'}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              {isRTL ? 'اختر كيفية مشاركة هذا الملف:' : 'Choose how to share this document:'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'نسخ الرابط' : 'Copy Link'}
              </Button>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'إرسال بالبريد الإلكتروني' : 'Send via Email'}
              </Button>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'مشاركة مع فريق القضية' : 'Share with Case Team'}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialog(false)}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
        >
          <Alert 
            severity={notification.severity}
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
