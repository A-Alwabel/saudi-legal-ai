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
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Security,
  Add,
  ExpandMore,
  Person,
  LockOpen,
  Lock,
  CheckCircle,
  Edit,
  Delete,
  ContentCopy,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { roleAPI } from '@/services/unifiedApiService';

interface Role {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  permissions: string[];
  usersCount?: number;
  isSystem?: boolean;
  createdAt: string;
}

interface PermissionCategory {
  name: string;
  nameAr: string;
  permissions: Array<{
    key: string;
    label: string;
    labelAr: string;
  }>;
}

const permissionCategories: PermissionCategory[] = [
  {
    name: 'Cases Management',
    nameAr: 'إدارة القضايا',
    permissions: [
      { key: 'cases.view', label: 'View Cases', labelAr: 'عرض القضايا' },
      { key: 'cases.create', label: 'Create Cases', labelAr: 'إنشاء القضايا' },
      { key: 'cases.edit', label: 'Edit Cases', labelAr: 'تعديل القضايا' },
      { key: 'cases.delete', label: 'Delete Cases', labelAr: 'حذف القضايا' },
    ],
  },
  {
    name: 'Clients Management',
    nameAr: 'إدارة العملاء',
    permissions: [
      { key: 'clients.view', label: 'View Clients', labelAr: 'عرض العملاء' },
      { key: 'clients.create', label: 'Create Clients', labelAr: 'إضافة العملاء' },
      { key: 'clients.edit', label: 'Edit Clients', labelAr: 'تعديل العملاء' },
      { key: 'clients.delete', label: 'Delete Clients', labelAr: 'حذف العملاء' },
    ],
  },
  {
    name: 'Financial Management',
    nameAr: 'الإدارة المالية',
    permissions: [
      { key: 'invoices.view', label: 'View Invoices', labelAr: 'عرض الفواتير' },
      { key: 'invoices.create', label: 'Create Invoices', labelAr: 'إنشاء الفواتير' },
      { key: 'payments.manage', label: 'Manage Payments', labelAr: 'إدارة المدفوعات' },
      { key: 'treasury.access', label: 'Access Treasury', labelAr: 'الوصول للخزينة' },
    ],
  },
  {
    name: 'System Administration',
    nameAr: 'إدارة النظام',
    permissions: [
      { key: 'users.manage', label: 'Manage Users', labelAr: 'إدارة المستخدمين' },
      { key: 'roles.manage', label: 'Manage Roles', labelAr: 'إدارة الأدوار' },
      { key: 'settings.modify', label: 'Modify Settings', labelAr: 'تعديل الإعدادات' },
      { key: 'system.audit', label: 'System Audit', labelAr: 'مراجعة النظام' },
    ],
  },
];

export default function RolesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | false>('panel0');
  const [roleForm, setRoleForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    permissions: [] as string[],
  });

  // Mock data
  const mockRoles: Role[] = [
    {
      _id: '1',
      name: 'Administrator',
      nameAr: 'مدير النظام',
      description: 'Full system access with all permissions',
      permissions: ['*'],
      usersCount: 2,
      isSystem: true,
      createdAt: '2020-01-01',
    },
    {
      _id: '2',
      name: 'Senior Lawyer',
      nameAr: 'محامي أول',
      description: 'Full access to legal and client management',
      permissions: [
        'cases.*',
        'clients.*',
        'documents.*',
        'invoices.view',
        'invoices.create',
      ],
      usersCount: 5,
      createdAt: '2020-01-01',
    },
    {
      _id: '3',
      name: 'Junior Lawyer',
      nameAr: 'محامي مبتدئ',
      description: 'Limited access to cases and documents',
      permissions: [
        'cases.view',
        'cases.edit',
        'clients.view',
        'documents.view',
      ],
      usersCount: 8,
      createdAt: '2021-06-15',
    },
    {
      _id: '4',
      name: 'Accountant',
      nameAr: 'محاسب',
      description: 'Access to financial management',
      permissions: [
        'invoices.*',
        'payments.*',
        'treasury.*',
        'reports.financial',
      ],
      usersCount: 3,
      createdAt: '2021-03-10',
    },
    {
      _id: '5',
      name: 'Receptionist',
      nameAr: 'موظف استقبال',
      description: 'Basic access for client management',
      permissions: [
        'clients.view',
        'appointments.manage',
        'notifications.send',
      ],
      usersCount: 2,
      createdAt: '2022-01-20',
    },
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      // const response = await roleAPI.getAll({ limit: 100 });
      // setRoles(response || []);
      setRoles(mockRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleCategoryToggle = (category: PermissionCategory) => {
    const categoryPermissions = category.permissions.map(p => p.key);
    const allSelected = categoryPermissions.every(p => roleForm.permissions.includes(p));
    
    if (allSelected) {
      setRoleForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p)),
      }));
    } else {
      setRoleForm(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])],
      }));
    }
  };

  const getPermissionCount = (permissions: string[]) => {
    if (permissions.includes('*')) return 'All';
    return permissions.length;
  };

  const columns = [
    {
      id: 'name',
      label: 'Role',
      labelAr: 'الدور',
      format: (value: string, row: Role) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {isRTL ? row.nameAr : value}
            </Typography>
            {row.isSystem && (
              <Chip label={isRTL ? 'نظام' : 'System'} size="small" color="primary" />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {row.description}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'permissions',
      label: 'Permissions',
      labelAr: 'الصلاحيات',
      format: (value: string[]) => {
        const count = getPermissionCount(value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {count === 'All' ? (
              <Chip
                icon={<LockOpen />}
                label={isRTL ? 'كل الصلاحيات' : 'All Permissions'}
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<Lock />}
                label={`${count} ${isRTL ? 'صلاحية' : 'permissions'}`}
                color="default"
                size="small"
              />
            )}
          </Box>
        );
      },
    },
    {
      id: 'usersCount',
      label: 'Users',
      labelAr: 'المستخدمون',
      numeric: true,
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" />
          <Typography variant="body2">
            {value || 0} {isRTL ? 'مستخدم' : 'users'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      labelAr: 'تاريخ الإنشاء',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Roles & Permissions"
          titleAr="الأدوار والصلاحيات"
          subtitle="Manage user roles and their permissions"
          subtitleAr="إدارة أدوار المستخدمين وصلاحياتهم"
          breadcrumbs={[
            { label: 'System', labelAr: 'النظام', path: '#' },
            { label: 'Roles', labelAr: 'الأدوار' },
          ]}
          primaryAction={{
            label: 'Create Role',
            labelAr: 'إنشاء دور',
            icon: <Add />,
            onClick: () => setDialogOpen(true),
          }}
          locale={locale}
        />

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Security color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الأدوار' : 'Total Roles'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {roles.length}
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
                  <Person color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'المستخدمون المعينون' : 'Assigned Users'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {roles.reduce((sum, r) => sum + (r.usersCount || 0), 0)}
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
                  <LockOpen color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'أدوار النظام' : 'System Roles'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {roles.filter(r => r.isSystem).length}
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
                  <Lock color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'أدوار مخصصة' : 'Custom Roles'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {roles.filter(r => !r.isSystem).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Roles Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {roles.slice(0, 3).map((role) => (
            <Grid item xs={12} md={4} key={role._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {isRTL ? role.nameAr : role.name}
                      </Typography>
                      {role.isSystem && (
                        <Chip label={isRTL ? 'نظام' : 'System'} size="small" color="primary" sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" disabled={role.isSystem}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" disabled={role.isSystem}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {role.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2">
                      <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {role.usersCount || 0} {isRTL ? 'مستخدم' : 'users'}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {getPermissionCount(role.permissions)} {isRTL ? 'صلاحية' : 'permissions'}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    fullWidth
                  >
                    {isRTL ? 'نسخ الدور' : 'Duplicate Role'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Roles Table */}
        <DataTable
          columns={columns}
          data={roles}
          title="All Roles"
          titleAr="جميع الأدوار"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View role', id)}
          onEdit={(id) => console.log('Edit role', id)}
          onDelete={(ids) => console.log('Delete roles', ids)}
        />

        {/* Create Role Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إنشاء دور جديد' : 'Create New Role'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'اسم الدور' : 'Role Name'}
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الاسم بالعربية' : 'Name in Arabic'}
                  value={roleForm.nameAr}
                  onChange={(e) => setRoleForm({ ...roleForm, nameAr: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={isRTL ? 'الوصف' : 'Description'}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {isRTL ? 'الصلاحيات' : 'Permissions'}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {isRTL 
                    ? 'حدد الصلاحيات التي يمكن لهذا الدور الوصول إليها'
                    : 'Select the permissions this role can access'
                  }
                </Alert>

                {permissionCategories.map((category, index) => (
                  <Accordion
                    key={category.name}
                    expanded={expanded === `panel${index}`}
                    onChange={(e, isExpanded) => setExpanded(isExpanded ? `panel${index}` : false)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                          checked={category.permissions.every(p => roleForm.permissions.includes(p.key))}
                          indeterminate={
                            category.permissions.some(p => roleForm.permissions.includes(p.key)) &&
                            !category.permissions.every(p => roleForm.permissions.includes(p.key))
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(category);
                          }}
                        />
                        <Typography>{isRTL ? category.nameAr : category.name}</Typography>
                        <Chip
                          label={`${category.permissions.filter(p => roleForm.permissions.includes(p.key)).length}/${category.permissions.length}`}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormGroup>
                        {category.permissions.map((permission) => (
                          <FormControlLabel
                            key={permission.key}
                            control={
                              <Checkbox
                                checked={roleForm.permissions.includes(permission.key)}
                                onChange={() => handlePermissionToggle(permission.key)}
                              />
                            }
                            label={isRTL ? permission.labelAr : permission.label}
                          />
                        ))}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" startIcon={<Security />}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
