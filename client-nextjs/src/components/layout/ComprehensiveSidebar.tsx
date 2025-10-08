'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Gavel,
  People,
  Description,
  Assignment,
  EventNote,
  Receipt,
  RequestQuote,
  AttachMoney,
  Payment,
  Assessment,
  Groups,
  Person,
  ExitToApp,
  AccountBalance,
  Business,
  Security,
  FolderSpecial,
  LibraryBooks,
  Notifications,
  AlarmOn,
  Event,
  Contacts,
  Article,
  GavelOutlined,
  Report,
  Work,
  ExpandLess,
  ExpandMore,
  Settings,
  ChevronLeft,
  ChevronRight,
  AutoAwesome,
  Language,
  PersonOutline,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

interface MenuItem {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  requiresAuth?: boolean;
  roles?: string[];
}

const menuStructure: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'ai-assistant',
    title: 'AI Legal Assistant',
    titleAr: 'المساعد القانوني الذكي',
    icon: <AutoAwesome />,
    path: '/ai-assistant',
  },
  // Core Legal Management
  {
    id: 'legal-management',
    title: 'Legal Management',
    titleAr: 'الإدارة القانونية',
    icon: <Gavel />,
    children: [
      {
        id: 'cases',
        title: 'Cases',
        titleAr: 'القضايا',
        icon: <GavelOutlined />,
        path: '/cases',
      },
      {
        id: 'sessions',
        title: 'Sessions',
        titleAr: 'الجلسات',
        icon: <Event />,
        path: '/sessions',
      },
      {
        id: 'legal-library',
        title: 'Legal Library',
        titleAr: 'المكتبة القانونية',
        icon: <LibraryBooks />,
        path: '/legal-library',
      },
      {
        id: 'power-attorney',
        title: 'Power of Attorney',
        titleAr: 'التوكيلات',
        icon: <Article />,
        path: '/power-attorney',
      },
      {
        id: 'execution-requests',
        title: 'Execution Requests',
        titleAr: 'طلبات التنفيذ',
        icon: <GavelOutlined />,
        path: '/execution-requests',
      },
    ],
  },
  // Client Management
  {
    id: 'client-management',
    title: 'Client Management',
    titleAr: 'إدارة العملاء',
    icon: <People />,
    children: [
      {
        id: 'clients',
        title: 'Clients',
        titleAr: 'العملاء',
        icon: <People />,
        path: '/clients',
      },
      {
        id: 'contacts',
        title: 'Contacts',
        titleAr: 'جهات الاتصال',
        icon: <Contacts />,
        path: '/contacts',
      },
      {
        id: 'client-reports',
        title: 'Client Reports',
        titleAr: 'تقارير العملاء',
        icon: <Report />,
        path: '/client-reports',
      },
      {
        id: 'client-portal',
        title: 'Client Portal',
        titleAr: 'بوابة العملاء',
        icon: <Language />,
        path: '/client-portal',
      },
    ],
  },
  // Document Management
  {
    id: 'documents',
    title: 'Documents',
    titleAr: 'المستندات',
    icon: <Description />,
    path: '/documents',
  },
  {
    id: 'archive',
    title: 'Archive',
    titleAr: 'الأرشيف',
    icon: <FolderSpecial />,
    path: '/archive',
  },
  // Task & Calendar
  {
    id: 'productivity',
    title: 'Productivity',
    titleAr: 'الإنتاجية',
    icon: <Assignment />,
    children: [
      {
        id: 'tasks',
        title: 'Tasks',
        titleAr: 'المهام',
        icon: <Assignment />,
        path: '/tasks',
      },
      {
        id: 'appointments',
        title: 'Appointments',
        titleAr: 'المواعيد',
        icon: <EventNote />,
        path: '/appointments',
      },
      {
        id: 'reminders',
        title: 'Reminders',
        titleAr: 'التذكيرات',
        icon: <AlarmOn />,
        path: '/reminders',
      },
      {
        id: 'work-updates',
        title: 'Work Updates',
        titleAr: 'تحديثات العمل',
        icon: <Work />,
        path: '/work-updates',
      },
    ],
  },
  // Financial Management
  {
    id: 'financial',
    title: 'Financial',
    titleAr: 'المالية',
    icon: <AttachMoney />,
    children: [
      {
        id: 'invoices',
        title: 'Invoices',
        titleAr: 'الفواتير',
        icon: <Receipt />,
        path: '/invoices',
      },
      {
        id: 'quotations',
        title: 'Quotations',
        titleAr: 'عروض الأسعار',
        icon: <RequestQuote />,
        path: '/quotations',
      },
      {
        id: 'payments',
        title: 'Payments',
        titleAr: 'المدفوعات',
        icon: <Payment />,
        path: '/payments',
      },
      {
        id: 'expenses',
        title: 'Expenses',
        titleAr: 'المصروفات',
        icon: <AttachMoney />,
        path: '/expenses',
      },
      {
        id: 'treasury',
        title: 'Treasury',
        titleAr: 'الخزينة',
        icon: <AccountBalance />,
        path: '/treasury',
      },
      {
        id: 'financial-reports',
        title: 'Financial Reports',
        titleAr: 'التقارير المالية',
        icon: <Assessment />,
        path: '/reports',
      },
    ],
  },
  // HR Management
  {
    id: 'hr',
    title: 'HR Management',
    titleAr: 'إدارة الموارد البشرية',
    icon: <Groups />,
    children: [
      {
        id: 'employees',
        title: 'Employees',
        titleAr: 'الموظفون',
        icon: <Person />,
        path: '/employees',
      },
      {
        id: 'leaves',
        title: 'Leave Management',
        titleAr: 'إدارة الإجازات',
        icon: <ExitToApp />,
        path: '/leaves',
      },
      {
        id: 'branches',
        title: 'Branches',
        titleAr: 'الفروع',
        icon: <Business />,
        path: '/branches',
      },
    ],
  },
  // System
  {
    id: 'system',
    title: 'System',
    titleAr: 'النظام',
    icon: <Settings />,
    children: [
      {
        id: 'users',
        title: 'Users',
        titleAr: 'المستخدمون',
        icon: <PersonOutline />,
        path: '/users',
      },
      {
        id: 'roles',
        title: 'Roles & Permissions',
        titleAr: 'الأدوار والصلاحيات',
        icon: <Security />,
        path: '/roles',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        titleAr: 'الإشعارات',
        icon: <Notifications />,
        path: '/notifications',
      },
      {
        id: 'lawyer-preferences',
        title: 'AI Preferences',
        titleAr: 'تفضيلات الذكاء الاصطناعي',
        icon: <Settings />,
        path: '/lawyer-preferences',
      },
    ],
  },
];

interface ComprehensiveSidebarProps {
  open?: boolean;
  onToggle?: () => void;
}

export default function ComprehensiveSidebar({ open = true, onToggle }: ComprehensiveSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';

  const [expandedItems, setExpandedItems] = useState<string[]>(['legal-management', 'financial']);
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (path: string) => {
    // Remove locale prefix if present
    const cleanPath = path.replace(/^\/(ar|en)/, '');
    router.push(`/${locale}${cleanPath}`);
  };

  const isActive = (path: string) => {
    const cleanPath = path.replace(/^\/(ar|en)/, '');
    const cleanPathname = pathname.replace(/^\/(ar|en)/, '');
    return cleanPathname === cleanPath || cleanPathname.startsWith(`${cleanPath}/`);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = item.path ? isActive(item.path) : false;

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleToggleExpand(item.id)}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: depth === 0 ? 2.5 : 4,
                py: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                  color: theme.palette.text.secondary,
                }}
              >
                {collapsed ? (
                  <Tooltip title={isRTL ? item.titleAr : item.title} placement={isRTL ? 'left' : 'right'}>
                    <Box component="span">{item.icon}</Box>
                  </Tooltip>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={isRTL ? item.titleAr : item.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </ListItem>
          {!collapsed && item.children && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map(child => renderMenuItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={() => item.path && handleNavigation(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'initial',
            px: depth === 0 ? 2.5 : 4,
            py: 1,
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            borderRight: active && !isRTL ? `3px solid ${theme.palette.primary.main}` : 'none',
            borderLeft: active && isRTL ? `3px solid ${theme.palette.primary.main}` : 'none',
            '&:hover': {
              backgroundColor: active 
                ? alpha(theme.palette.primary.main, 0.16)
                : alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 'auto' : 3,
              ml: depth > 0 ? 2 : 0,
              justifyContent: 'center',
              color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            }}
          >
            {collapsed ? (
              <Tooltip title={isRTL ? item.titleAr : item.title} placement={isRTL ? 'left' : 'right'}>
                <Box component="span">{item.icon}</Box>
              </Tooltip>
            ) : (
              item.icon
            )}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={isRTL ? item.titleAr : item.title}
              primaryTypographyProps={{
                fontSize: depth === 0 ? '0.875rem' : '0.813rem',
                fontWeight: active ? 600 : 500,
                color: active ? theme.palette.primary.main : theme.palette.text.primary,
              }}
            />
          )}
          {!collapsed && item.badge && (
            <Box
              sx={{
                backgroundColor: theme.palette.error.main,
                color: 'white',
                borderRadius: '12px',
                px: 1,
                py: 0.25,
                fontSize: '0.75rem',
                fontWeight: 600,
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {item.badge}
            </Box>
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Gavel sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: theme.palette.primary.main,
                  lineHeight: 1.2,
                }}
              >
                {isRTL ? 'النظام القانوني' : 'Legal System'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem',
                }}
              >
                {isRTL ? 'الإصدار 2.0' : 'Version 2.0'}
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          }}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft /> : <ChevronRight />
          ) : (
            isRTL ? <ChevronRight /> : <ChevronLeft />
          )}
        </IconButton>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuStructure.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && item.id === 'system' && <Divider sx={{ my: 1 }} />}
              {renderMenuItem(item)}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {isRTL ? '© 2024 النظام القانوني السعودي' : '© 2024 Saudi Legal System'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
