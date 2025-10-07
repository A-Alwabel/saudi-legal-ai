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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Search,
  FilterList,
  FolderOpen,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  Description,
  Restore,
  Delete,
  Download,
  DateRange,
  Storage,
  CloudUpload,
  Person,
  Receipt,
  Article,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { archiveAPI } from '@/services/unifiedApiService';

interface ArchivedItem {
  _id: string;
  originalId: string;
  type: 'case' | 'document' | 'client' | 'invoice' | 'contract';
  name: string;
  description?: string;
  archivedBy: any;
  archivedDate: string;
  originalDate: string;
  fileSize?: number;
  fileType?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

const itemTypes = [
  { value: 'case', label: 'Case', labelAr: 'قضية', icon: <FolderOpen />, color: 'primary' },
  { value: 'document', label: 'Document', labelAr: 'مستند', icon: <Description />, color: 'secondary' },
  { value: 'client', label: 'Client', labelAr: 'عميل', icon: <Person />, color: 'success' },
  { value: 'invoice', label: 'Invoice', labelAr: 'فاتورة', icon: <Receipt />, color: 'warning' },
  { value: 'contract', label: 'Contract', labelAr: 'عقد', icon: <Article />, color: 'info' },
];

export default function ArchivePage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data
  const mockArchivedItems: ArchivedItem[] = [
    {
      _id: '1',
      originalId: 'case-001',
      type: 'case',
      name: 'Commercial Dispute Case #2023-001',
      description: 'Closed case between ABC Corp and XYZ Ltd',
      archivedBy: { name: 'Ahmed Al-Rashid', _id: '1' },
      archivedDate: '2024-01-15',
      originalDate: '2023-01-10',
      tags: ['commercial', 'dispute', 'resolved'],
      metadata: { outcome: 'Won', client: 'ABC Corp' },
    },
    {
      _id: '2',
      originalId: 'doc-456',
      type: 'document',
      name: 'Contract Agreement v2.1.pdf',
      description: 'Final signed contract agreement',
      archivedBy: { name: 'Sarah Johnson', _id: '2' },
      archivedDate: '2024-02-01',
      originalDate: '2023-12-01',
      fileSize: 2548576,
      fileType: 'application/pdf',
      tags: ['contract', 'signed', '2023'],
    },
    {
      _id: '3',
      originalId: 'inv-789',
      type: 'invoice',
      name: 'INV-2023-789',
      description: 'Paid invoice for legal services',
      archivedBy: { name: 'Mohammed Al-Saud', _id: '3' },
      archivedDate: '2024-01-20',
      originalDate: '2023-11-15',
      metadata: { amount: 50000, status: 'paid' },
    },
  ];

  useEffect(() => {
    loadArchivedItems();
  }, []);

  const loadArchivedItems = async () => {
    try {
      setLoading(true);
      // const response = await archiveAPI.getAll({ limit: 100 });
      // setArchivedItems(response || []);
      setArchivedItems(mockArchivedItems);
    } catch (error) {
      console.error('Failed to load archived items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return itemTypes.find(t => t.value === type) || itemTypes[0];
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <InsertDriveFile />;
    if (fileType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (fileType.includes('image')) return <Image color="primary" />;
    return <Description color="action" />;
  };

  // Filter items
  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    total: archivedItems.length,
    cases: archivedItems.filter(i => i.type === 'case').length,
    documents: archivedItems.filter(i => i.type === 'document').length,
    thisMonth: archivedItems.filter(i => {
      const archivedDate = new Date(i.archivedDate);
      const now = new Date();
      return archivedDate.getMonth() === now.getMonth() && 
             archivedDate.getFullYear() === now.getFullYear();
    }).length,
    totalSize: archivedItems.reduce((sum, i) => sum + (i.fileSize || 0), 0),
  };

  const columns = [
    {
      id: 'name',
      label: 'Item',
      labelAr: 'العنصر',
      format: (value: string, row: ArchivedItem) => {
        const config = getTypeConfig(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: `${config.color}.main` }}>
              {row.fileType ? getFileIcon(row.fileType) : config.icon}
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.description || row.originalId}
              </Typography>
            </Box>
          </Box>
        );
      },
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
            color={config.color as any}
            size="small"
            icon={config.icon}
          />
        );
      },
    },
    {
      id: 'archivedDate',
      label: 'Archived Date',
      labelAr: 'تاريخ الأرشفة',
      format: (value: string, row: ArchivedItem) => (
        <Box>
          <Typography variant="body2">
            {new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isRTL ? 'الأصل: ' : 'Original: '}
            {new Date(row.originalDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'archivedBy',
      label: 'Archived By',
      labelAr: 'أرشف بواسطة',
      format: (value: any) => value?.name || 'System',
    },
    {
      id: 'fileSize',
      label: 'Size',
      labelAr: 'الحجم',
      format: (value: number) => formatFileSize(value),
    },
    {
      id: 'tags',
      label: 'Tags',
      labelAr: 'الوسوم',
      format: (value: string[]) => value ? (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
          {value.length > 2 && (
            <Chip label={`+${value.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      ) : '-',
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Archive System"
          titleAr="نظام الأرشفة"
          subtitle="Manage and search archived documents and records"
          subtitleAr="إدارة والبحث في المستندات والسجلات المؤرشفة"
          breadcrumbs={[
            { label: 'System', labelAr: 'النظام', path: '#' },
            { label: 'Archive', labelAr: 'الأرشيف' },
          ]}
          primaryAction={{
            label: 'Archive Item',
            labelAr: 'أرشفة عنصر',
            icon: <ArchiveIcon />,
            onClick: () => console.log('Archive item'),
          }}
          secondaryActions={[
            {
              label: 'Bulk Restore',
              labelAr: 'استرجاع متعدد',
              icon: <Restore />,
              onClick: () => console.log('Bulk restore'),
              variant: 'outlined',
            },
          ]}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ArchiveIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المؤرشف' : 'Total Archived'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderOpen color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'القضايا' : 'Cases'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.cases}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Description color="secondary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'المستندات' : 'Documents'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">
                      {stats.documents}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DateRange color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'هذا الشهر' : 'This Month'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.thisMonth}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Storage color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الحجم' : 'Total Size'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {formatFileSize(stats.totalSize)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={isRTL ? 'البحث في الأرشيف...' : 'Search in archive...'}
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
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع العنصر' : 'Item Type'}</InputLabel>
                  <Select
                    value={filterType}
                    label={isRTL ? 'نوع العنصر' : 'Item Type'}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">{isRTL ? 'الكل' : 'All'}</MenuItem>
                    {itemTypes.map((type) => (
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
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'من تاريخ' : 'From Date'}
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label={isRTL ? 'إلى تاريخ' : 'To Date'}
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FilterList />}
                  sx={{ height: '56px' }}
                >
                  {isRTL ? 'تصفية' : 'Filter'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {isRTL ? 'استخدام التخزين' : 'Storage Usage'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(stats.totalSize)} / 100 GB
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.totalSize / (100 * 1024 * 1024 * 1024)) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {isRTL 
                ? `${Math.round((stats.totalSize / (100 * 1024 * 1024 * 1024)) * 100)}% من المساحة المستخدمة`
                : `${Math.round((stats.totalSize / (100 * 1024 * 1024 * 1024)) * 100)}% of space used`
              }
            </Typography>
          </CardContent>
        </Card>

        {/* Archived Items Table */}
        <DataTable
          columns={columns}
          data={filteredItems}
          title="Archived Items"
          titleAr="العناصر المؤرشفة"
          loading={loading}
          locale={locale}
          actions={true}
          onView={(id) => console.log('View item', id)}
          onDelete={(ids) => console.log('Delete items', ids)}
        />
      </Container>
    </DashboardLayout>
  );
}
