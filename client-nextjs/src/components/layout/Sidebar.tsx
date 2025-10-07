'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
  Badge,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Gavel,
  People,
  Description,
  Assignment,
  Event,
  AttachMoney,
  Receipt,
  AccountBalance,
  Business,
  SupervisedUserCircle,
  Archive,
  LibraryBooks,
  Notifications,
  Settings,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  Person,
  Work,
  RequestPage,
  ContactPhone,
  AssignmentInd,
  Assessment,
  Update,
  Gavel as ExecutionIcon,
  Report,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchUnreadCount } from '../../store/slices/notificationsSlice';

interface MenuItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'cases',
    label: 'Case Management',
    labelAr: 'إدارة القضايا',
    icon: <Gavel />,
    children: [
      {
        id: 'cases-list',
        label: 'All Cases',
        labelAr: 'جميع القضايا',
        icon: <Gavel />,
        path: '/cases',
      },
      {
        id: 'cases-new',
        label: 'New Case',
        labelAr: 'قضية جديدة',
        icon: <Assignment />,
        path: '/cases/new',
      },
      {
        id: 'sessions',
        label: 'Court Sessions',
        labelAr: 'الجلسات',
        icon: <Event />,
        path: '/sessions',
      },
    ],
  },
  {
    id: 'clients',
    label: 'Client Management',
    labelAr: 'إدارة العملاء',
    icon: <People />,
    children: [
      {
        id: 'clients-list',
        label: 'All Clients',
        labelAr: 'جميع العملاء',
        icon: <People />,
        path: '/clients',
      },
      {
        id: 'clients-new',
        label: 'New Client',
        labelAr: 'عميل جديد',
        icon: <Person />,
        path: '/clients/new',
      },
      {
        id: 'contacts',
        label: 'Contacts',
        labelAr: 'جهات الاتصال',
        icon: <ContactPhone />,
        path: '/contacts',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Document Management',
    labelAr: 'إدارة المستندات',
    icon: <Description />,
    children: [
      {
        id: 'documents-list',
        label: 'All Documents',
        labelAr: 'جميع المستندات',
        icon: <Description />,
        path: '/documents',
      },
      {
        id: 'documents-upload',
        label: 'Upload Document',
        labelAr: 'رفع مستند',
        icon: <Description />,
        path: '/documents/upload',
      },
      {
        id: 'archive',
        label: 'Archive',
        labelAr: 'الأرشيف',
        icon: <Archive />,
        path: '/archive',
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Task Management',
    labelAr: 'إدارة المهام',
    icon: <Assignment />,
    path: '/tasks',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    labelAr: 'المواعيد',
    icon: <Event />,
    path: '/appointments',
  },
  {
    id: 'financial',
    label: 'Financial Management',
    labelAr: 'الإدارة المالية',
    icon: <AttachMoney />,
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        labelAr: 'الفواتير',
        icon: <Receipt />,
        path: '/invoices',
      },
      {
        id: 'payments',
        label: 'Payments',
        labelAr: 'المدفوعات',
        icon: <AccountBalance />,
        path: '/payments',
      },
      {
        id: 'quotations',
        label: 'Quotations',
        labelAr: 'عروض الأسعار',
        icon: <RequestPage />,
        path: '/quotations',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        labelAr: 'المصاريف',
        icon: <AttachMoney />,
        path: '/expenses',
      },
      {
        id: 'treasury',
        label: 'Treasury',
        labelAr: 'الخزائن',
        icon: <AccountBalance />,
        path: '/treasury',
      },
      {
        id: 'reports',
        label: 'Financial Reports',
        labelAr: 'التقارير المالية',
        icon: <Assessment />,
        path: '/reports',
      },
    ],
  },
  {
    id: 'hr',
    label: 'Human Resources',
    labelAr: 'الموارد البشرية',
    icon: <SupervisedUserCircle />,
    children: [
      {
        id: 'employees',
        label: 'Employees',
        labelAr: 'الموظفين',
        icon: <SupervisedUserCircle />,
        path: '/employees',
      },
      {
        id: 'leaves',
        label: 'Leave Management',
        labelAr: 'إدارة الإجازات',
        icon: <Work />,
        path: '/leaves',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        labelAr: 'الأدوار والصلاحيات',
        icon: <AssignmentInd />,
        path: '/roles',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'legal-library',
    label: 'Legal Library',
    labelAr: 'المكتبة القانونية',
    icon: <LibraryBooks />,
    path: '/legal-library',
  },
  {
    id: 'management',
    label: 'Management',
    labelAr: 'الإدارة',
    icon: <Business />,
    children: [
      {
        id: 'branches',
        label: 'Branches',
        labelAr: 'الفروع',
        icon: <Business />,
        path: '/branches',
        roles: ['admin', 'manager'],
      },
      {
        id: 'work-updates',
        label: 'Work Updates',
        labelAr: 'مستجدات الأعمال',
        icon: <Update />,
        path: '/work-updates',
      },
      {
        id: 'execution-requests',
        label: 'Execution Requests',
        labelAr: 'طلبات التنفيذ',
        icon: <ExecutionIcon />,
        path: '/execution-requests',
      },
      {
        id: 'power-of-attorney',
        label: 'Power of Attorney',
        labelAr: 'الوكالات',
        icon: <AssignmentInd />,
        path: '/power-of-attorney',
      },
      {
        id: 'client-reports',
        label: 'Client Reports',
        labelAr: 'تقارير العملاء',
        icon: <Report />,
        path: '/client-reports',
      },
    ],
  },
];

interface SidebarProps {
  variant?: 'permanent' | 'persistent' | 'temporary';
}

export default function Sidebar({ variant = 'persistent' }: SidebarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const { sidebarOpen, language } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const isRTL = language === 'ar';

  useEffect(() => {
    // Fetch unread notifications count
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    // Auto-expand current menu section
    const currentItem = findCurrentMenuItem(menuItems, pathname);
    if (currentItem && currentItem.parent) {
      setExpandedItems(prev => 
        prev.includes(currentItem.parent) ? prev : [...prev, currentItem.parent]
      );
    }
  }, [pathname]);

  const findCurrentMenuItem = (items: MenuItem[], path: string, parent?: string): any => {
    for (const item of items) {
      if (item.path === path) {
        return { ...item, parent };
      }
      if (item.children) {
        const found = findCurrentMenuItem(item.children, path, item.id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      router.push(item.path);
      if (isMobile) {
        dispatch(setSidebarOpen(false));
      }
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.path === pathname);
    }
    return false;
  };

  const canAccessItem = (item: MenuItem): boolean => {
    if (!item.roles || !user) return true;
    return item.roles.includes(user.role);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!canAccessItem(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = Boolean(item.children);

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: sidebarOpen ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              backgroundColor: isActive ? 'action.selected' : 'transparent',
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'inherit',
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? item.labelAr : item.label}
              sx={{ 
                opacity: sidebarOpen ? 1 : 0,
                color: isActive ? 'primary.main' : 'inherit',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {hasChildren && sidebarOpen && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {/* Submenu */}
        {hasChildren && (
          <Collapse in={isExpanded && sidebarOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: sidebarOpen ? 48 : 40,
              height: sidebarOpen ? 48 : 40,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          {sidebarOpen && (
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap fontWeight="bold">
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.role || 'User'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => router.push('/notifications')}
              sx={{
                minHeight: 48,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={t('navigation.notifications')}
                sx={{ opacity: sidebarOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => router.push('/settings')}
              sx={{
                minHeight: 48,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary={t('navigation.settings')}
                sx={{ opacity: sidebarOpen ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ mx: 2 }} />

          <ListItem disablePadding>
            <Tooltip title={t('navigation.logout')} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  color: 'error.main',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: 'error.main',
                  }}
                >
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText
                  primary={t('navigation.logout')}
                  sx={{ opacity: sidebarOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const drawerWidth = sidebarOpen ? 280 : 64;

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            background: theme.palette.background.paper,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={variant}
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
