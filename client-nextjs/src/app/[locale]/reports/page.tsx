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
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Download,
  Print,
  FilterList,
  DateRange,
  PieChart,
  BarChart,
  ShowChart,
  AttachMoney,
  Receipt,
  Payment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DashboardLayout from '@/components/layout/DashboardLayout';

const COLORS = ['#3da582', '#f3cd35', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('summary');

  // Mock data for demonstration
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 31000, profit: 17000 },
    { month: 'Apr', revenue: 65000, expenses: 38000, profit: 27000 },
    { month: 'May', revenue: 78000, expenses: 42000, profit: 36000 },
    { month: 'Jun', revenue: 72000, expenses: 40000, profit: 32000 },
  ];

  const expenseCategories = [
    { name: 'Salaries', value: 45, percentage: 45 },
    { name: 'Office Rent', value: 15, percentage: 15 },
    { name: 'Marketing', value: 12, percentage: 12 },
    { name: 'Operations', value: 18, percentage: 18 },
    { name: 'Other', value: 10, percentage: 10 },
  ];

  const clientRevenue = [
    { client: 'ABC Corp', amount: 125000, cases: 8 },
    { client: 'XYZ Ltd', amount: 98000, cases: 6 },
    { client: 'Tech Solutions', amount: 87000, cases: 5 },
    { client: 'Global Trade', amount: 76000, cases: 4 },
    { client: 'Local Business', amount: 54000, cases: 3 },
  ];

  const casePerformance = [
    { type: 'Commercial', won: 24, lost: 3, pending: 8, successRate: 88.9 },
    { type: 'Criminal', won: 12, lost: 2, pending: 4, successRate: 85.7 },
    { type: 'Family', won: 18, lost: 1, pending: 6, successRate: 94.7 },
    { type: 'Labor', won: 15, lost: 4, pending: 5, successRate: 78.9 },
  ];

  // Calculate summary statistics
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = revenueData.reduce((sum, d) => sum + d.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const getReportTitle = () => {
    switch (reportType) {
      case 'pl': return isRTL ? 'تقرير الأرباح والخسائر' : 'Profit & Loss Report';
      case 'cash': return isRTL ? 'تقرير التدفق النقدي' : 'Cash Flow Report';
      case 'client': return isRTL ? 'تقرير العملاء' : 'Client Report';
      case 'case': return isRTL ? 'تقرير أداء القضايا' : 'Case Performance Report';
      default: return isRTL ? 'ملخص مالي' : 'Financial Summary';
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Financial Reports"
          titleAr="التقارير المالية"
          subtitle="Comprehensive financial analytics and insights"
          subtitleAr="تحليلات مالية شاملة ورؤى تفصيلية"
          breadcrumbs={[
            { label: 'Financial', labelAr: 'المالية', path: '#' },
            { label: 'Reports', labelAr: 'التقارير' },
          ]}
          primaryAction={{
            label: 'Export Report',
            labelAr: 'تصدير التقرير',
            icon: <Download />,
            onClick: () => console.log('Export'),
          }}
          secondaryActions={[
            {
              label: 'Print',
              labelAr: 'طباعة',
              icon: <Print />,
              onClick: () => window.print(),
              variant: 'outlined',
            },
          ]}
          locale={locale}
        />

        {/* Report Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{isRTL ? 'نوع التقرير' : 'Report Type'}</InputLabel>
                <Select
                  value={reportType}
                  label={isRTL ? 'نوع التقرير' : 'Report Type'}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="summary">{isRTL ? 'ملخص مالي' : 'Financial Summary'}</MenuItem>
                  <MenuItem value="pl">{isRTL ? 'الأرباح والخسائر' : 'Profit & Loss'}</MenuItem>
                  <MenuItem value="cash">{isRTL ? 'التدفق النقدي' : 'Cash Flow'}</MenuItem>
                  <MenuItem value="client">{isRTL ? 'تقرير العملاء' : 'Client Report'}</MenuItem>
                  <MenuItem value="case">{isRTL ? 'أداء القضايا' : 'Case Performance'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{isRTL ? 'الفترة الزمنية' : 'Date Range'}</InputLabel>
                <Select
                  value={dateRange}
                  label={isRTL ? 'الفترة الزمنية' : 'Date Range'}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</MenuItem>
                  <MenuItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</MenuItem>
                  <MenuItem value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</MenuItem>
                  <MenuItem value="year">{isRTL ? 'هذه السنة' : 'This Year'}</MenuItem>
                  <MenuItem value="custom">{isRTL ? 'مخصص' : 'Custom'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label={isRTL ? 'من' : 'From'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label={isRTL ? 'إلى' : 'To'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={dateRange === 'custom' ? 2 : 6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assessment />}
              >
                {isRTL ? 'إنشاء التقرير' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="success" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {totalRevenue.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<TrendingUp />}
                      label="+15.3%"
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt color="warning" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {totalExpenses.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<TrendingDown />}
                      label="-5.2%"
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShowChart color="primary" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'صافي الربح' : 'Net Profit'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {totalProfit.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<TrendingUp />}
                      label="+22.7%"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChart color="info" fontSize="large" />
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      {isRTL ? 'هامش الربح' : 'Profit Margin'}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {profitMargin}%
                    </Typography>
                    <Chip
                      size="small"
                      label={isRTL ? 'ممتاز' : 'Excellent'}
                      color="info"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Content */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label={isRTL ? 'نظرة عامة' : 'Overview'} />
          <Tab label={isRTL ? 'تحليل مفصل' : 'Detailed Analysis'} />
          <Tab label={isRTL ? 'المقارنات' : 'Comparisons'} />
          <Tab label={isRTL ? 'التوقعات' : 'Projections'} />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Revenue Trend Chart */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isRTL ? 'اتجاه الإيرادات والمصروفات' : 'Revenue & Expense Trend'}
                  </Typography>
                  <Box sx={{ height: 350, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3da582" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3da582" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3da582"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="#f59e0b"
                          fillOpacity={1}
                          fill="url(#colorExpenses)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Expense Breakdown Pie Chart */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isRTL ? 'توزيع المصروفات' : 'Expense Breakdown'}
                  </Typography>
                  <Box sx={{ height: 350, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Clients Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {isRTL ? 'أفضل العملاء' : 'Top Clients by Revenue'}
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{isRTL ? 'العميل' : 'Client'}</TableCell>
                        <TableCell align="right">{isRTL ? 'الإيرادات' : 'Revenue'}</TableCell>
                        <TableCell align="center">{isRTL ? 'القضايا' : 'Cases'}</TableCell>
                        <TableCell align="right">{isRTL ? 'متوسط القيمة' : 'Avg Value'}</TableCell>
                        <TableCell align="center">{isRTL ? 'الحصة' : 'Share'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientRevenue.map((client) => {
                        const share = ((client.amount / totalRevenue) * 100).toFixed(1);
                        const avgValue = Math.round(client.amount / client.cases);
                        return (
                          <TableRow key={client.client}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {client.client}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {client.amount.toLocaleString()} SAR
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={client.cases} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              {avgValue.toLocaleString()} SAR
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="primary">
                                {share}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </DashboardLayout>
  );
}
