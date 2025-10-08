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
  Avatar,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  PersonAdd,
  Person,
  Business,
  Phone,
  Email,
  LocationOn,
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Favorite,
  Star,
  ContactPhone,
  Groups,
  AccountBalance,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { contactAPI } from '@/services/unifiedApiService';

interface Contact {
  _id: string;
  type: 'individual' | 'company' | 'government' | 'organization';
  name: string;
  nameAr?: string;
  title?: string;
  company?: string;
  department?: string;
  email: string;
  phone: string;
  mobile?: string;
  fax?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  category: 'client' | 'vendor' | 'partner' | 'court' | 'government' | 'other';
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: string;
  lastContactedAt?: string;
}

const contactTypes = [
  { value: 'individual', label: 'Individual', labelAr: 'فرد', icon: <Person />, color: 'primary' },
  { value: 'company', label: 'Company', labelAr: 'شركة', icon: <Business />, color: 'secondary' },
  { value: 'government', label: 'Government', labelAr: 'حكومي', icon: <AccountBalance />, color: 'error' },
  { value: 'organization', label: 'Organization', labelAr: 'منظمة', icon: <Groups />, color: 'warning' },
];

const contactCategories = [
  { value: 'client', label: 'Client', labelAr: 'عميل', color: 'success' },
  { value: 'vendor', label: 'Vendor', labelAr: 'مورد', color: 'info' },
  { value: 'partner', label: 'Partner', labelAr: 'شريك', color: 'primary' },
  { value: 'court', label: 'Court', labelAr: 'محكمة', color: 'error' },
  { value: 'government', label: 'Government', labelAr: 'حكومي', color: 'warning' },
  { value: 'other', label: 'Other', labelAr: 'أخرى', color: 'default' },
];

export default function ContactsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  const [contactForm, setContactForm] = useState({
    type: 'individual',
    name: '',
    nameAr: '',
    title: '',
    company: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Saudi Arabia',
      postalCode: '',
    },
    category: 'client',
    tags: [] as string[],
    notes: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      website: '',
    },
  });

  // Mock data
  const mockContacts: Contact[] = [
    {
      _id: '1',
      type: 'individual',
      name: 'Abdullah Al-Rashid',
      nameAr: 'عبدالله الراشد',
      title: 'CEO',
      company: 'Al-Rashid Holdings',
      email: 'abdullah@alrashid.sa',
      phone: '+966111234567',
      mobile: '+966501234567',
      address: {
        street: 'King Fahd Road',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postalCode: '11111',
      },
      category: 'client',
      tags: ['VIP', 'Priority'],
      isFavorite: true,
      createdAt: '2023-01-15',
      lastContactedAt: '2024-01-10',
    },
    {
      _id: '2',
      type: 'company',
      name: 'Tech Solutions Ltd',
      email: 'info@techsolutions.sa',
      phone: '+966121234567',
      address: {
        street: 'Tahlia Street',
        city: 'Jeddah',
        country: 'Saudi Arabia',
      },
      category: 'partner',
      tags: ['Technology', 'Software'],
      socialMedia: {
        website: 'www.techsolutions.sa',
        linkedin: 'tech-solutions-sa',
      },
      createdAt: '2023-03-20',
    },
    {
      _id: '3',
      type: 'government',
      name: 'Ministry of Commerce',
      nameAr: 'وزارة التجارة',
      email: 'contact@mc.gov.sa',
      phone: '+966114000000',
      address: {
        street: 'Government Complex',
        city: 'Riyadh',
        country: 'Saudi Arabia',
      },
      category: 'government',
      tags: ['Official', 'Government'],
      createdAt: '2022-06-01',
    },
    {
      _id: '4',
      type: 'individual',
      name: 'Sarah Johnson',
      title: 'Legal Consultant',
      email: 'sarah.j@legalconsult.com',
      phone: '+966502345678',
      category: 'vendor',
      tags: ['Legal', 'Consultant'],
      createdAt: '2023-08-15',
    },
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      // const response = await contactAPI.getAll({ limit: 100 });
      // setContacts(response || []);
      setContacts(mockContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return contactTypes.find(t => t.value === type) || contactTypes[0];
  };

  const getCategoryConfig = (category: string) => {
    return contactCategories.find(c => c.value === category) || contactCategories[0];
  };

  const toggleFavorite = (id: string) => {
    setContacts(prev => prev.map(contact => 
      contact._id === id ? { ...contact, isFavorite: !contact.isFavorite } : contact
    ));
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    const matchesTab = activeTab === 0 || // All
                      (activeTab === 1 && contact.isFavorite) || // Favorites
                      (activeTab === 2 && contact.category === 'client') || // Clients
                      (activeTab === 3 && contact.type === 'company'); // Companies
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Statistics
  const stats = {
    total: contacts.length,
    individuals: contacts.filter(c => c.type === 'individual').length,
    companies: contacts.filter(c => c.type === 'company').length,
    clients: contacts.filter(c => c.category === 'client').length,
    favorites: contacts.filter(c => c.isFavorite).length,
  };

  const columns = [
    {
      id: 'name',
      label: 'Contact',
      labelAr: 'جهة الاتصال',
      format: (value: string, row: Contact) => {
        const typeConfig = getTypeConfig(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: `${typeConfig.color}.light` }}>
              {typeConfig.icon}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {isRTL && row.nameAr ? row.nameAr : value}
                </Typography>
                {row.isFavorite && <Star fontSize="small" color="warning" />}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {row.title && `${row.title} • `}
                {row.company}
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
            size="small"
            variant="outlined"
            icon={config.icon}
          />
        );
      },
    },
    {
      id: 'category',
      label: 'Category',
      labelAr: 'الفئة',
      format: (value: string) => {
        const config = getCategoryConfig(value);
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
      id: 'email',
      label: 'Contact Info',
      labelAr: 'معلومات الاتصال',
      format: (value: string, row: Contact) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2">{value}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {row.mobile || row.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'address',
      label: 'Location',
      labelAr: 'الموقع',
      format: (value: any) => value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2">
            {value.city}, {value.country}
          </Typography>
        </Box>
      ) : '-',
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
          title="Contacts Management"
          titleAr="إدارة جهات الاتصال"
          subtitle="Manage your contacts and business relationships"
          subtitleAr="إدارة جهات الاتصال والعلاقات التجارية"
          breadcrumbs={[
            { label: 'CRM', labelAr: 'إدارة العلاقات', path: '#' },
            { label: 'Contacts', labelAr: 'جهات الاتصال' },
          ]}
          primaryAction={{
            label: 'Add Contact',
            labelAr: 'إضافة جهة اتصال',
            icon: <PersonAdd />,
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ContactPhone color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي جهات الاتصال' : 'Total Contacts'}
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
                  <Person color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'أفراد' : 'Individuals'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.individuals}
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
                  <Business color="secondary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'شركات' : 'Companies'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">
                      {stats.companies}
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
                  <Groups color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'العملاء' : 'Clients'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.clients}
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
                  <Star color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'المفضلة' : 'Favorites'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.favorites}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={isRTL ? 'البحث في جهات الاتصال...' : 'Search contacts...'}
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{isRTL ? 'الفئة' : 'Category'}</InputLabel>
                  <Select
                    value={filterCategory}
                    label={isRTL ? 'الفئة' : 'Category'}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="all">{isRTL ? 'الكل' : 'All'}</MenuItem>
                    {contactCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {isRTL ? cat.labelAr : cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  size="large"
                >
                  {isRTL ? 'تصفية' : 'Filter'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label={isRTL ? 'الكل' : 'All'} />
            <Tab label={isRTL ? 'المفضلة' : 'Favorites'} icon={<Star fontSize="small" />} iconPosition="start" />
            <Tab label={isRTL ? 'العملاء' : 'Clients'} />
            <Tab label={isRTL ? 'الشركات' : 'Companies'} />
          </Tabs>
        </Paper>

        {/* Contacts Table */}
        <DataTable
          columns={columns}
          data={filteredContacts}
          title="Contacts List"
          titleAr="قائمة جهات الاتصال"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View contact', id)}
          onEdit={(id) => console.log('Edit contact', id)}
          onDelete={(ids) => console.log('Delete contacts', ids)}
          actions={true}
        />

        {/* Add Contact Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة جهة اتصال جديدة' : 'Add New Contact'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'النوع' : 'Type'}</InputLabel>
                  <Select
                    value={contactForm.type}
                    label={isRTL ? 'النوع' : 'Type'}
                    onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                  >
                    {contactTypes.map((type) => (
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
                  label={isRTL ? 'الاسم' : 'Name'}
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الاسم بالعربية' : 'Name in Arabic'}
                  value={contactForm.nameAr}
                  onChange={(e) => setContactForm({ ...contactForm, nameAr: e.target.value })}
                />
              </Grid>
              {contactForm.type === 'individual' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={isRTL ? 'المسمى الوظيفي' : 'Title'}
                      value={contactForm.title}
                      onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={isRTL ? 'الشركة' : 'Company'}
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الهاتف' : 'Phone'}
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الجوال' : 'Mobile'}
                  value={contactForm.mobile}
                  onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الفئة' : 'Category'}</InputLabel>
                  <Select
                    value={contactForm.category}
                    label={isRTL ? 'الفئة' : 'Category'}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value as any })}
                  >
                    {contactCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {isRTL ? cat.labelAr : cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Address Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'العنوان' : 'Address'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الشارع' : 'Street'}
                  value={contactForm.address.street}
                  onChange={(e) => setContactForm({ 
                    ...contactForm, 
                    address: { ...contactForm.address, street: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المدينة' : 'City'}
                  value={contactForm.address.city}
                  onChange={(e) => setContactForm({ 
                    ...contactForm, 
                    address: { ...contactForm.address, city: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المنطقة' : 'State'}
                  value={contactForm.address.state}
                  onChange={(e) => setContactForm({ 
                    ...contactForm, 
                    address: { ...contactForm.address, state: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الرمز البريدي' : 'Postal Code'}
                  value={contactForm.address.postalCode}
                  onChange={(e) => setContactForm({ 
                    ...contactForm, 
                    address: { ...contactForm.address, postalCode: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={isRTL ? 'ملاحظات' : 'Notes'}
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<PersonAdd />}>
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
