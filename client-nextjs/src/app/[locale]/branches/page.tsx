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
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business,
  Add,
  LocationOn,
  Phone,
  Email,
  Person,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Edit,
  Delete,
  Map,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { branchAPI } from '@/services/unifiedApiService';

interface Branch {
  _id: string;
  name: string;
  nameAr: string;
  code: string;
  type: 'main' | 'branch' | 'satellite';
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    fax?: string;
  };
  managerId?: any;
  employees: any[];
  workingHours: {
    from: string;
    to: string;
    days: string[];
  };
  status: 'active' | 'inactive' | 'under_renovation';
  establishedDate: string;
  services: string[];
}

const branchTypes = [
  { value: 'main', label: 'Main Office', labelAr: 'المكتب الرئيسي', color: 'primary' },
  { value: 'branch', label: 'Branch Office', labelAr: 'فرع', color: 'secondary' },
  { value: 'satellite', label: 'Satellite Office', labelAr: 'مكتب فرعي', color: 'info' },
];

const cities = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
  'Taif', 'Abha', 'Tabuk', 'Hail', 'Najran', 'Jizan', 'Al-Kharj',
];

const services = [
  'Legal Consultation',
  'Court Representation',
  'Contract Drafting',
  'Corporate Services',
  'Real Estate Services',
  'Family Law',
  'Criminal Defense',
  'Commercial Litigation',
];

export default function BranchesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    nameAr: '',
    code: '',
    type: 'branch',
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Saudi Arabia',
    },
    contact: {
      phone: '',
      email: '',
      fax: '',
    },
    managerId: '',
    workingHours: {
      from: '09:00',
      to: '17:00',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    },
    services: [] as string[],
  });

  // Mock data
  const mockBranches: Branch[] = [
    {
      _id: '1',
      name: 'Head Office',
      nameAr: 'المكتب الرئيسي',
      code: 'HQ-RYD',
      type: 'main',
      address: {
        street: 'King Fahd Road',
        city: 'Riyadh',
        region: 'Central',
        postalCode: '11111',
        country: 'Saudi Arabia',
      },
      contact: {
        phone: '+966111234567',
        email: 'hq@legalfirm.sa',
        fax: '+966111234568',
      },
      managerId: { name: 'Ahmed Al-Rashid', _id: '1' },
      employees: [
        { _id: '1', name: 'Employee 1' },
        { _id: '2', name: 'Employee 2' },
        { _id: '3', name: 'Employee 3' },
        { _id: '4', name: 'Employee 4' },
        { _id: '5', name: 'Employee 5' },
      ],
      workingHours: {
        from: '08:00',
        to: '18:00',
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      },
      status: 'active',
      establishedDate: '2010-01-01',
      services: ['Legal Consultation', 'Court Representation', 'Contract Drafting', 'Corporate Services'],
    },
    {
      _id: '2',
      name: 'Jeddah Branch',
      nameAr: 'فرع جدة',
      code: 'BR-JED',
      type: 'branch',
      address: {
        street: 'Tahlia Street',
        city: 'Jeddah',
        region: 'Western',
        postalCode: '22222',
        country: 'Saudi Arabia',
      },
      contact: {
        phone: '+966121234567',
        email: 'jeddah@legalfirm.sa',
      },
      managerId: { name: 'Sarah Johnson', _id: '2' },
      employees: [
        { _id: '6', name: 'Employee 6' },
        { _id: '7', name: 'Employee 7' },
        { _id: '8', name: 'Employee 8' },
      ],
      workingHours: {
        from: '09:00',
        to: '17:00',
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      },
      status: 'active',
      establishedDate: '2015-06-15',
      services: ['Legal Consultation', 'Real Estate Services', 'Family Law'],
    },
  ];

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      // const response = await branchAPI.getAll({ limit: 100 });
      // setBranches(response || []);
      setBranches(mockBranches);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    return branchTypes.find(t => t.value === type) || branchTypes[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'under_renovation': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Branch',
      labelAr: 'الفرع',
      format: (value: string, row: Branch) => {
        const typeConfig = getTypeConfig(row.type);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: `${typeConfig.color}.main` }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {isRTL ? row.nameAr : value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.code}
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
          />
        );
      },
    },
    {
      id: 'address',
      label: 'Location',
      labelAr: 'الموقع',
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOn fontSize="small" color="action" />
          <Box>
            <Typography variant="body2">
              {value.city}, {value.region}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {value.street}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'managerId',
      label: 'Manager',
      labelAr: 'المدير',
      format: (value: any) => value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
            {value.name?.charAt(0)}
          </Avatar>
          <Typography variant="body2">
            {value.name}
          </Typography>
        </Box>
      ) : 'Not Assigned',
    },
    {
      id: 'employees',
      label: 'Employees',
      labelAr: 'الموظفون',
      format: (value: any[]) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
            {value?.map((emp) => (
              <Avatar key={emp._id}>
                {emp.name?.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          <Typography variant="body2" color="text.secondary">
            {value?.length || 0}
          </Typography>
        </Box>
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
          icon={value === 'active' ? <CheckCircle /> : <Warning />}
        />
      ),
    },
  ];

  // Statistics
  const stats = {
    total: branches.length,
    active: branches.filter(b => b.status === 'active').length,
    employees: branches.reduce((sum, b) => sum + (b.employees?.length || 0), 0),
    cities: new Set(branches.map(b => b.address.city)).size,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Branch Management"
          titleAr="إدارة الفروع"
          subtitle="Manage office branches and locations"
          subtitleAr="إدارة فروع المكتب والمواقع"
          breadcrumbs={[
            { label: 'HR Management', labelAr: 'إدارة الموارد البشرية', path: '#' },
            { label: 'Branches', labelAr: 'الفروع' },
          ]}
          primaryAction={{
            label: 'Add Branch',
            labelAr: 'إضافة فرع',
            onClick: () => setDialogOpen(true),
          }}
          secondaryActions={[
            {
              label: 'View Map',
              labelAr: 'عرض الخريطة',
              icon: <Map />,
              onClick: () => console.log('View map'),
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
                  <Business color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الفروع' : 'Total Branches'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
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
                      {isRTL ? 'فروع نشطة' : 'Active Branches'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.active}
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
                  <People color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الموظفين' : 'Total Employees'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.employees}
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
                  <LocationOn color="secondary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'المدن' : 'Cities'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">
                      {stats.cities}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Branch Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {branches.map((branch) => (
            <Grid item xs={12} md={6} key={branch._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: `${getTypeConfig(branch.type).color}.main` }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {isRTL ? branch.nameAr : branch.name}
                        </Typography>
                        <Chip 
                          label={isRTL ? getTypeConfig(branch.type).labelAr : getTypeConfig(branch.type).label}
                          size="small"
                          color={getTypeConfig(branch.type).color as any}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${branch.address.street}, ${branch.address.city}`}
                        secondary={`${branch.address.region}, ${branch.address.country} ${branch.address.postalCode}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={branch.contact.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={branch.contact.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${branch.workingHours.from} - ${branch.workingHours.to}`}
                        secondary={branch.workingHours.days.join(', ')}
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {isRTL ? 'الخدمات المقدمة:' : 'Services Offered:'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {branch.services.map((service) => (
                        <Chip key={service} label={service} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Branches Table */}
        <DataTable
          columns={columns}
          data={branches}
          title="All Branches"
          titleAr="جميع الفروع"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View branch', id)}
          onEdit={(id) => console.log('Edit branch', id)}
          onDelete={(ids) => console.log('Delete branches', ids)}
        />

        {/* Add Branch Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة فرع جديد' : 'Add New Branch'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الفرع' : 'Branch Name'}
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الاسم بالعربية' : 'Name in Arabic'}
                  value={branchForm.nameAr}
                  onChange={(e) => setBranchForm({ ...branchForm, nameAr: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رمز الفرع' : 'Branch Code'}
                  value={branchForm.code}
                  onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'نوع الفرع' : 'Branch Type'}</InputLabel>
                  <Select
                    value={branchForm.type}
                    label={isRTL ? 'نوع الفرع' : 'Branch Type'}
                    onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value })}
                  >
                    {branchTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {isRTL ? type.labelAr : type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'العنوان' : 'Address'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الشارع' : 'Street'}
                  value={branchForm.address.street}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    address: { ...branchForm.address, street: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'المدينة' : 'City'}</InputLabel>
                  <Select
                    value={branchForm.address.city}
                    label={isRTL ? 'المدينة' : 'City'}
                    onChange={(e) => setBranchForm({ 
                      ...branchForm, 
                      address: { ...branchForm.address, city: e.target.value }
                    })}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'المنطقة' : 'Region'}
                  value={branchForm.address.region}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    address: { ...branchForm.address, region: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الرمز البريدي' : 'Postal Code'}
                  value={branchForm.address.postalCode}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    address: { ...branchForm.address, postalCode: e.target.value }
                  })}
                />
              </Grid>

              {/* Contact */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الهاتف' : 'Phone'}
                  value={branchForm.contact.phone}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    contact: { ...branchForm.contact, phone: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="email"
                  label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  value={branchForm.contact.email}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    contact: { ...branchForm.contact, email: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الفاكس' : 'Fax'}
                  value={branchForm.contact.fax}
                  onChange={(e) => setBranchForm({ 
                    ...branchForm, 
                    contact: { ...branchForm.contact, fax: e.target.value }
                  })}
                />
              </Grid>

              {/* Services */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الخدمات المقدمة' : 'Services Offered'}</InputLabel>
                  <Select
                    multiple
                    value={branchForm.services}
                    label={isRTL ? 'الخدمات المقدمة' : 'Services Offered'}
                    onChange={(e) => setBranchForm({ ...branchForm, services: e.target.value as string[] })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {services.map((service) => (
                      <MenuItem key={service} value={service}>
                        {service}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Business />}>
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
