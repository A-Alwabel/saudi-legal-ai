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
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  PersonAdd,
  Person,
  AdminPanelSettings,
  Security,
  VpnKey,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Badge,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userAPI } from '@/services/unifiedApiService';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'accountant' | 'client';
  department?: string;
  branchId?: any;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions?: string[];
  avatar?: string;
}

const userRoles = [
  { value: 'admin', label: 'Administrator', labelAr: 'مدير النظام', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'lawyer', label: 'Lawyer', labelAr: 'محامي', color: 'primary', icon: <Person /> },
  { value: 'assistant', label: 'Legal Assistant', labelAr: 'مساعد قانوني', color: 'info', icon: <Badge /> },
  { value: 'accountant', label: 'Accountant', labelAr: 'محاسب', color: 'warning', icon: <Person /> },
  { value: 'client', label: 'Client', labelAr: 'عميل', color: 'success', icon: <Person /> },
];

export default function UsersPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'lawyer',
    department: '',
    branchId: '',
    isActive: true,
  });

  // Mock data
  const mockUsers: User[] = [
    {
      _id: '1',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@legalfirm.sa',
      phone: '+966501234567',
      role: 'admin',
      department: 'Management',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      createdAt: '2020-01-01',
      permissions: ['all'],
    },
    {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@legalfirm.sa',
      phone: '+966502345678',
      role: 'lawyer',
      department: 'Legal',
      isActive: true,
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
      createdAt: '2021-03-15',
    },
    {
      _id: '3',
      name: 'Mohammed Al-Saud',
      email: 'mohammed@legalfirm.sa',
      phone: '+966503456789',
      role: 'assistant',
      department: 'Legal',
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: '2022-06-01',
    },
    {
      _id: '4',
      name: 'Fatima Al-Zahra',
      email: 'fatima@legalfirm.sa',
      phone: '+966504567890',
      role: 'accountant',
      department: 'Finance',
      isActive: false,
      createdAt: '2023-01-10',
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // const response = await userAPI.getAll({ limit: 100 });
      // setUsers(response || []);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (userForm.password !== userForm.confirmPassword) {
      // Show error
      return;
    }
    try {
      // await userAPI.create(userForm);
      setDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const getRoleConfig = (role: string) => {
    return userRoles.find(r => r.value === role) || userRoles[0];
  };

  const columns = [
    {
      id: 'name',
      label: 'User',
      labelAr: 'المستخدم',
      format: (value: string, row: User) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              bgcolor: getRoleConfig(row.role).color + '.main',
              width: 36,
              height: 36,
            }}
          >
            {value?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      labelAr: 'الدور',
      format: (value: string) => {
        const config = getRoleConfig(value);
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
      id: 'department',
      label: 'Department',
      labelAr: 'القسم',
      format: (value: string) => value || '-',
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      labelAr: 'آخر دخول',
      format: (value: string) => {
        if (!value) return 'Never';
        const date = new Date(value);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (hours < 1) return isRTL ? 'الآن' : 'Just now';
        if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
        return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
      },
    },
    {
      id: 'isActive',
      label: 'Status',
      labelAr: 'الحالة',
      format: (value: boolean) => (
        <Chip
          label={value ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
          color={value ? 'success' : 'default'}
          size="small"
          icon={value ? <CheckCircle /> : <Cancel />}
        />
      ),
    },
  ];

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    lawyers: users.filter(u => u.role === 'lawyer').length,
    recentLogins: users.filter(u => {
      if (!u.lastLogin) return false;
      const hoursSinceLogin = (new Date().getTime() - new Date(u.lastLogin).getTime()) / 3600000;
      return hoursSinceLogin < 24;
    }).length,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="User Management"
          titleAr="إدارة المستخدمين"
          subtitle="Manage system users and their access"
          subtitleAr="إدارة مستخدمي النظام وصلاحياتهم"
          breadcrumbs={[
            { label: 'System', labelAr: 'النظام', path: '#' },
            { label: 'Users', labelAr: 'المستخدمون' },
          ]}
          primaryAction={{
            label: 'Add User',
            labelAr: 'إضافة مستخدم',
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
                  <Person color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
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
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'نشط' : 'Active'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {stats.active}
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
                  <AdminPanelSettings color="error" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'المدراء' : 'Admins'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {stats.admins}
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
                      {isRTL ? 'المحامون' : 'Lawyers'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.lawyers}
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
                  <VpnKey color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'آخر 24 ساعة' : 'Last 24h'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.recentLogins}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Role Distribution */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {userRoles.map((role) => {
            const count = users.filter(u => u.role === role.value).length;
            const percentage = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
            
            return (
              <Grid item xs={12} sm={6} md={2.4} key={role.value}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: `${role.color}.light`, mx: 'auto', mb: 1 }}>
                      {role.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isRTL ? role.labelAr : role.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {percentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          title="Users List"
          titleAr="قائمة المستخدمين"
          loading={loading}
          locale={locale}
          onView={(id) => console.log('View user', id)}
          onEdit={(id) => console.log('Edit user', id)}
          onDelete={(ids) => console.log('Delete users', ids)}
        />

        {/* Add User Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة مستخدم جديد' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              {isRTL 
                ? 'سيتم إرسال بريد إلكتروني للمستخدم بمعلومات الدخول'
                : 'An email will be sent to the user with login credentials'
              }
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{isRTL ? 'الدور' : 'Role'}</InputLabel>
                  <Select
                    value={userForm.role}
                    label={isRTL ? 'الدور' : 'Role'}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    {userRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {role.icon}
                          {isRTL ? role.labelAr : role.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'القسم' : 'Department'}
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={isRTL ? 'الفرع' : 'Branch'}
                  value={userForm.branchId}
                  onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label={isRTL ? 'كلمة المرور' : 'Password'}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  value={userForm.confirmPassword}
                  onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    />
                  }
                  label={isRTL ? 'حساب نشط' : 'Active Account'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" onClick={handleSubmit} startIcon={<PersonAdd />}>
              {isRTL ? 'إضافة' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
