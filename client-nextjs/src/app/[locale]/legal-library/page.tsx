'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  LibraryBooks,
  Gavel,
  Article,
  Description,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Add,
  FolderOpen,
  AccountBalance,
  Policy,
  Rule,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { legalLibraryAPI } from '@/services/unifiedApiService';

interface LegalDocument {
  _id: string;
  title: string;
  titleAr: string;
  type: 'law' | 'regulation' | 'circular' | 'template' | 'precedent' | 'article';
  category: string;
  content: string;
  contentAr: string;
  jurisdiction: string;
  datePublished: string;
  source: string;
  tags: string[];
  practiceAreas: string[];
  isBookmarked?: boolean;
}

const documentTypes = [
  { value: 'all', label: 'All Types', icon: <LibraryBooks /> },
  { value: 'law', label: 'Laws', icon: <Gavel /> },
  { value: 'regulation', label: 'Regulations', icon: <Rule /> },
  { value: 'circular', label: 'Circulars', icon: <Description /> },
  { value: 'template', label: 'Templates', icon: <Article /> },
  { value: 'precedent', label: 'Precedents', icon: <AccountBalance /> },
  { value: 'article', label: 'Articles', icon: <Policy /> },
];

const practiceAreas = [
  'Commercial Law',
  'Criminal Law',
  'Family Law',
  'Labor Law',
  'Real Estate Law',
  'Corporate Law',
  'Banking Law',
  'Intellectual Property',
  'Sharia Law',
];

export default function LegalLibraryPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [addDialog, setAddDialog] = useState(false);

  // Mock data for demonstration
  const mockDocuments: LegalDocument[] = [
    {
      _id: '1',
      title: 'Saudi Labor Law',
      titleAr: 'نظام العمل السعودي',
      type: 'law',
      category: 'Employment',
      content: 'Full text of Saudi Labor Law...',
      contentAr: 'النص الكامل لنظام العمل السعودي...',
      jurisdiction: 'Saudi Arabia',
      datePublished: '2024-01-01',
      source: 'Ministry of Human Resources',
      tags: ['employment', 'rights', 'contracts'],
      practiceAreas: ['Labor Law'],
    },
    {
      _id: '2',
      title: 'Commercial Court Procedures',
      titleAr: 'إجراءات المحاكم التجارية',
      type: 'regulation',
      category: 'Procedures',
      content: 'Procedures for commercial courts...',
      contentAr: 'إجراءات المحاكم التجارية...',
      jurisdiction: 'Saudi Arabia',
      datePublished: '2024-01-15',
      source: 'Ministry of Justice',
      tags: ['courts', 'commercial', 'procedures'],
      practiceAreas: ['Commercial Law'],
    },
    {
      _id: '3',
      title: 'Employment Contract Template',
      titleAr: 'نموذج عقد العمل',
      type: 'template',
      category: 'Templates',
      content: 'Standard employment contract template...',
      contentAr: 'نموذج عقد العمل القياسي...',
      jurisdiction: 'Saudi Arabia',
      datePublished: '2024-01-20',
      source: 'Legal Department',
      tags: ['template', 'contract', 'employment'],
      practiceAreas: ['Labor Law'],
    },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, selectedType, selectedArea, documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // const response = await legalLibraryAPI.getAll({ limit: 100 });
      // setDocuments(response || []);
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.titleAr.includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Filter by practice area
    if (selectedArea !== 'all') {
      filtered = filtered.filter(doc => doc.practiceAreas.includes(selectedArea));
    }

    setFilteredDocuments(filtered);
  };

  const handleToggleBookmark = (docId: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc._id === docId ? { ...doc, isBookmarked: !doc.isBookmarked } : doc
      )
    );
  };

  const handleViewDocument = (doc: LegalDocument) => {
    setSelectedDocument(doc);
    setViewDialog(true);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.icon || <Article />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, any> = {
      law: 'primary',
      regulation: 'secondary',
      circular: 'info',
      template: 'success',
      precedent: 'warning',
      article: 'default',
    };
    return colors[type] || 'default';
  };

  // Statistics
  const stats = {
    total: documents.length,
    laws: documents.filter(d => d.type === 'law').length,
    regulations: documents.filter(d => d.type === 'regulation').length,
    templates: documents.filter(d => d.type === 'template').length,
    bookmarked: documents.filter(d => d.isBookmarked).length,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Legal Library"
          titleAr="المكتبة القانونية"
          subtitle="Access laws, regulations, templates and legal resources"
          subtitleAr="الوصول إلى القوانين واللوائح والنماذج والموارد القانونية"
          breadcrumbs={[
            { label: 'Legal Management', labelAr: 'الإدارة القانونية', path: '#' },
            { label: 'Legal Library', labelAr: 'المكتبة القانونية' },
          ]}
          primaryAction={{
            label: 'Add Document',
            labelAr: 'إضافة مستند',
            onClick: () => setAddDialog(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Documents', value: stats.total, icon: <LibraryBooks />, color: 'primary' },
            { label: 'Laws', value: stats.laws, icon: <Gavel />, color: 'secondary' },
            { label: 'Regulations', value: stats.regulations, icon: <Rule />, color: 'info' },
            { label: 'Templates', value: stats.templates, icon: <Article />, color: 'success' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${stat.color}.light`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={isRTL ? 'بحث في المكتبة القانونية...' : 'Search legal library...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{isRTL ? 'نوع المستند' : 'Document Type'}</InputLabel>
                <Select
                  value={selectedType}
                  label={isRTL ? 'نوع المستند' : 'Document Type'}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {documentTypes.map((type) => (
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{isRTL ? 'مجال الممارسة' : 'Practice Area'}</InputLabel>
                <Select
                  value={selectedArea}
                  label={isRTL ? 'مجال الممارسة' : 'Practice Area'}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <MenuItem value="all">{isRTL ? 'جميع المجالات' : 'All Areas'}</MenuItem>
                  {practiceAreas.map((area) => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
              >
                {isRTL ? 'المزيد من الفلاتر' : 'More Filters'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Documents Grid */}
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(doc.type)}
                      <Chip
                        label={doc.type}
                        color={getTypeColor(doc.type) as any}
                        size="small"
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleBookmark(doc._id)}
                    >
                      {doc.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {isRTL ? doc.titleAr : doc.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {(isRTL ? doc.contentAr : doc.content).substring(0, 150)}...
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {doc.source} • {new Date(doc.datePublished).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleViewDocument(doc)}>
                    {isRTL ? 'عرض' : 'View'}
                  </Button>
                  <Button size="small" startIcon={<Download />}>
                    {isRTL ? 'تحميل' : 'Download'}
                  </Button>
                  <Button size="small" startIcon={<Share />}>
                    {isRTL ? 'مشاركة' : 'Share'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* View Document Dialog */}
        <Dialog 
          open={viewDialog} 
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedDocument && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTypeIcon(selectedDocument.type)}
                  {isRTL ? selectedDocument.titleAr : selectedDocument.title}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Chip label={selectedDocument.type} color={getTypeColor(selectedDocument.type) as any} sx={{ mr: 1 }} />
                  <Chip label={selectedDocument.jurisdiction} variant="outlined" sx={{ mr: 1 }} />
                  {selectedDocument.practiceAreas.map((area) => (
                    <Chip key={area} label={area} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                <Typography variant="body1" paragraph>
                  {isRTL ? selectedDocument.contentAr : selectedDocument.content}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source: {selectedDocument.source}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Published: {new Date(selectedDocument.datePublished).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button startIcon={<Download />}>
                  {isRTL ? 'تحميل' : 'Download'}
                </Button>
                <Button startIcon={<Share />}>
                  {isRTL ? 'مشاركة' : 'Share'}
                </Button>
                <Button onClick={() => setViewDialog(false)} variant="contained">
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
