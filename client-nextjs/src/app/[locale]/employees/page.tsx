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
  Avatar,
  AvatarGroup,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add,
  People,
  PersonAdd,
  Work,
  School,
  Phone,
  Email,
  Badge,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { employeesApi } from '@/services/unifiedApiService';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
  avatar?: string;
}

const departments = [
  'Legal',
  'Finance',
  'Administration',
  'IT',
  'Human Resources',
  'Operations',
];

const positions = [
  'Senior Lawyer',
  'Junior Lawyer',
  'Legal Assistant',
  'Paralegal',
  'Office Manager',
  'Accountant',
  'IT Support',
  'HR Manager',
  'Receptionist',
];

export default function EmployeesPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employeeId: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesApi.getAll({ limit: 100 });
      setEmployees(response || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await employeesApi.create({
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
      });
      setDialogOpen(false);
      loadEmployees();
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Employee',
      labelAr: 'الموظف',
      format: (value: string, row: Employee) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {value?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeId}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'position',
      label: 'Position',
      labelAr: 'المنصب',
      format: (value: string, row: Employee) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.department}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Contact',
      labelAr: 'التواصل',
      format: (value: string, row: Employee) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'joinDate',
      label: 'Join Date',
      labelAr: 'تاريخ الانضمام',
      format: (value: string) => new Date(value).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'),
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
        />
      ),
    },
  ];

  // Department statistics
  const departmentStats = departments.map(dept => ({
    name: dept,
    count: employees.filter(emp => emp.department === dept).length,
  }));

  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.status === 'active').length,
    onLeave: employees.filter(emp => emp.status === 'on_leave').length,
    departments: new Set(employees.map(emp => emp.department)).size,
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Employees"
          titleAr="الموظفون"
          subtitle="Manage your team and staff"
          subtitleAr="إدارة فريقك والموظفين"
          breadcrumbs={[
            { label: 'HR Management', labelAr: 'إدارة الموارد البشرية', path: '#' },
            { label: 'Employees', labelAr: 'الموظفون' },
          ]}
          primaryAction={{
            label: 'Add Employee',
            labelAr: 'إضافة موظف',
            icon: <PersonAdd />,
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
                  <People color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الموظفين' : 'Total Employees'}
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
                  <Badge color="success" fontSize="large" />
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
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Work color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'في إجازة' : 'On Leave'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {stats.onLeave}
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
                  <School color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'الأقسام' : 'Departments'}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {stats.departments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Department Cards */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isRTL ? 'الأقسام' : 'Departments'}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {departmentStats.map((dept) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={dept.name}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {dept.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dept.name}
                  </Typography>
                  <AvatarGroup max={3} sx={{ justifyContent: 'center', mt: 1 }}>
                    {employees
                      .filter(emp => emp.department === dept.name)
                      .slice(0, 3)
                      .map((emp) => (
                        <Avatar key={emp._id} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {emp.name?.charAt(0)}
                        </Avatar>
                      ))}
                  </AvatarGroup>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Employees Table */}
        <DataTable
          columns={columns}
          data={employees}
          title="Employees List"
          titleAr="قائمة الموظفين"
          loading={loading}
          locale={locale}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(ids) => console.log('Delete', ids)}
          onView={(id) => console.log('View', id)}
        />

        {/* Add Employee Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}</DialogTitle>
          <DialogContent>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
              <Tab label={isRTL ? 'معلومات أساسية' : 'Basic Information'} />
              <Tab label={isRTL ? 'معلومات الوظيفة' : 'Job Information'} />
              <Tab label={isRTL ? 'معلومات الاتصال' : 'Contact Information'} />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'الاسم الكامل' : 'Full Name'}
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'رقم الموظف' : 'Employee ID'}
                    value={employeeForm.employeeId}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                    value={employeeForm.joinDate}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, joinDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الحالة' : 'Status'}</InputLabel>
                    <Select
                      value={employeeForm.status}
                      label={isRTL ? 'الحالة' : 'Status'}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                    >
                      <MenuItem value="active">{isRTL ? 'نشط' : 'Active'}</MenuItem>
                      <MenuItem value="on_leave">{isRTL ? 'في إجازة' : 'On Leave'}</MenuItem>
                      <MenuItem value="terminated">{isRTL ? 'منتهي' : 'Terminated'}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'القسم' : 'Department'}</InputLabel>
                    <Select
                      value={employeeForm.department}
                      label={isRTL ? 'القسم' : 'Department'}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'المنصب' : 'Position'}</InputLabel>
                    <Select
                      value={employeeForm.position}
                      label={isRTL ? 'المنصب' : 'Position'}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={isRTL ? 'الراتب' : 'Salary'}
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
