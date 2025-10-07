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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  Description,
  GetApp,
  MoreVert,
  Visibility,
  FilterList,
  Search,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  VideoFile,
  Folder,
  CalendarToday,
  Person,
  FileDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { clientPortalService } from '@/services/clientPortalService';
import { GlassCard } from '@/components/modern/GlassCard';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';
import { toast } from 'react-toastify';

interface Document {
  _id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  status: string;
  caseId?: any;
  uploadedBy?: any;
  createdAt: string;
  updatedAt: string;
}

const getFileIcon = (mimeType: string, documentType: string) => {
  if (mimeType.includes('pdf')) return <PictureAsPdf />;
  if (mimeType.includes('image')) return <Image />;
  if (mimeType.includes('video')) return <VideoFile />;
  if (documentType === 'contract') return <Description />;
  return <InsertDriveFile />;
};

const getFileColor = (mimeType: string, documentType: string) => {
  if (mimeType.includes('pdf')) return '#f44336';
  if (mimeType.includes('image')) return '#4caf50';
  if (mimeType.includes('video')) return '#ff9800';
  if (documentType === 'contract') return '#2196f3';
  return '#757575';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ClientDocumentsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCase, setFilterCase] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    loadDocuments();
    loadCases();
  }, [filterType, filterCase]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterType) params.documentType = filterType;
      if (filterCase) params.caseId = filterCase;
      
      const response = await clientPortalService.getDocuments(params);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const response = await clientPortalService.getCases({ limit: 100 });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(documentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleViewDocument = (documentId: string) => {
    setSelectedDocument(documentId);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const downloadData = await clientPortalService.downloadDocument(documentId);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadData.downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
    handleMenuClose();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return theme.palette.primary.main;
      case 'court_filing':
        return theme.palette.error.main;
      case 'evidence':
        return theme.palette.warning.main;
      case 'correspondence':
        return theme.palette.info.main;
      case 'report':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDocumentData = documents.find(d => d._id === selectedDocument);

  // Group documents by case
  const documentsByCase = filteredDocuments.reduce((acc, doc) => {
    const caseTitle = doc.caseId?.title || 'Uncategorized';
    if (!acc[caseTitle]) acc[caseTitle] = [];
    acc[caseTitle].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner message="Loading your documents..." variant="pulse" size="large" />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          My Documents
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Access and download your legal documents
        </Typography>
      </Box>

      {/* Filters */}
      <GlassCard sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={filterType}
                label="Document Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="contract">Contracts</MenuItem>
                <MenuItem value="court_filing">Court Filings</MenuItem>
                <MenuItem value="evidence">Evidence</MenuItem>
                <MenuItem value="correspondence">Correspondence</MenuItem>
                <MenuItem value="report">Reports</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Case</InputLabel>
              <Select
                value={filterCase}
                label="Filter by Case"
                onChange={(e) => setFilterCase(e.target.value)}
              >
                <MenuItem value="">All Cases</MenuItem>
                {cases.map((case_) => (
                  <MenuItem key={case_._id} value={case_._id}>
                    {case_.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
            </Typography>
          </Grid>
        </Grid>
      </GlassCard>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm || filterType || filterCase 
              ? 'Try adjusting your search or filter criteria'
              : 'Your legal documents will appear here once they are uploaded'
            }
          </Typography>
        </Box>
      ) : (
        <Box>
          {Object.entries(documentsByCase).map(([caseTitle, caseDocuments]) => (
            <Box key={caseTitle} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                }}
              >
                <Folder sx={{ mr: 1 }} />
                {caseTitle}
                <Chip
                  label={`${caseDocuments.length} document${caseDocuments.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Typography>

              <Grid container spacing={2}>
                {caseDocuments.map((document, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={document._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8],
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          {/* Header with Type and Menu */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Chip
                              label={document.documentType.replace('_', ' ').toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: `${getDocumentTypeColor(document.documentType)}20`,
                                color: getDocumentTypeColor(document.documentType),
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, document._id)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>

                          {/* File Icon */}
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                backgroundColor: `${getFileColor(document.mimeType, document.documentType)}20`,
                                color: getFileColor(document.mimeType, document.documentType),
                              }}
                            >
                              {getFileIcon(document.mimeType, document.documentType)}
                            </Avatar>
                          </Box>

                          {/* Document Title */}
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              lineHeight: 1.3,
                              textAlign: 'center',
                              minHeight: '2.6em',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {document.title}
                          </Typography>

                          {/* File Info */}
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {document.fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(document.fileSize)}
                            </Typography>
                          </Box>

                          {/* Upload Date */}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatDate(document.createdAt)}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ px: 2, pb: 2, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            sx={{ textTransform: 'none' }}
                            onClick={() => handleViewDocument(document._id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<GetApp />}
                            sx={{ textTransform: 'none' }}
                            onClick={() => handleDownloadDocument(document._id, document.fileName)}
                          >
                            Download
                          </Button>
                        </CardActions>
                      </GlassCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedDocument && handleViewDocument(selectedDocument)}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedDocument && handleDownloadDocument(selectedDocument, selectedDocumentData?.fileName || 'document')}>
          <FileDownload sx={{ mr: 1, fontSize: 18 }} />
          Download
        </MenuItem>
      </Menu>

      {/* Document Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Details
        </DialogTitle>
        <DialogContent>
          {selectedDocumentData && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: `${getFileColor(selectedDocumentData.mimeType, selectedDocumentData.documentType)}20`,
                      color: getFileColor(selectedDocumentData.mimeType, selectedDocumentData.documentType),
                      margin: '0 auto 16px auto',
                    }}
                  >
                    {getFileIcon(selectedDocumentData.mimeType, selectedDocumentData.documentType)}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedDocumentData.title}
                  </Typography>
                  <Chip
                    label={selectedDocumentData.documentType.replace('_', ' ').toUpperCase()}
                    sx={{
                      backgroundColor: `${getDocumentTypeColor(selectedDocumentData.documentType)}20`,
                      color: getDocumentTypeColor(selectedDocumentData.documentType),
                      mt: 1,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    File Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedDocumentData.fileName}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatFileSize(selectedDocumentData.fileSize)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Document Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedDocumentData.documentType.replace('_', ' ')}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedDocumentData.status}
                  </Typography>
                </Grid>

                {selectedDocumentData.caseId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Associated Case
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedDocumentData.caseId.title || 'Case Details'}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Upload Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedDocumentData.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedDocumentData.updatedAt)}
                  </Typography>
                </Grid>
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
            startIcon={<GetApp />}
            onClick={() => {
              if (selectedDocumentData) {
                handleDownloadDocument(selectedDocumentData._id, selectedDocumentData.fileName);
                setViewDialog(false);
              }
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

