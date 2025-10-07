'use client';

import React from 'react';
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
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Gavel as CasesIcon,
  People as ClientsIcon,
  Description as DocumentsIcon,
  Assignment as TasksIcon,
  Event as AppointmentsIcon,
  Receipt as InvoicesIcon,
  Groups as EmployeesIcon,
  Psychology as AIIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  MenuBook as LegalLibraryIcon,
  Analytics as AnalyticsIcon,
  Psychology as PreferencesIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

const DRAWER_WIDTH = 280;

const menuItems = [
  { key: 'dashboard', path: '/dashboard', icon: DashboardIcon, label: 'dashboard.title' },
  { key: 'ai-assistant', path: '/ai-assistant', icon: AIIcon, label: 'ai.title' },
  { key: 'cases', path: '/cases', icon: CasesIcon, label: 'cases.title' },
  { key: 'clients', path: '/clients', icon: ClientsIcon, label: 'clients.title' },
  { key: 'documents', path: '/documents', icon: DocumentsIcon, label: 'documents.title' },
  { key: 'tasks', path: '/tasks', icon: TasksIcon, label: 'tasks.title' },
  { key: 'appointments', path: '/appointments', icon: AppointmentsIcon, label: 'appointments.title' },
  { key: 'invoices', path: '/invoices', icon: InvoicesIcon, label: 'invoices.title' },
  { key: 'employees', path: '/employees', icon: EmployeesIcon, label: 'employees.title' },
  { key: 'legal-library', path: '/legal-library', icon: LegalLibraryIcon, label: 'legal_library.title' },
  { key: 'analytics', path: '/analytics', icon: AnalyticsIcon, label: 'analytics.title' },
  { key: 'notifications', path: '/notifications', icon: NotificationsIcon, label: 'notifications.title' },
];

const settingsItems = [
  { key: 'lawyer-preferences', path: '/lawyer-preferences', icon: PreferencesIcon, label: 'preferences.title' },
  { key: 'settings', path: '/settings', icon: SettingsIcon, label: 'settings.title' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  onClose, 
  variant = 'temporary' 
}) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: theme.palette.primary.contrastText,
      }}>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Saudi Legal AI
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          {t('common.legal_management_system')}
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <ListItem key={item.key} disablePadding sx={{ px: 2, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: active ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t(item.label)}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Settings Section */}
        <List>
          <ListItem sx={{ px: 2, py: 1 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              {t('common.settings')}
            </Typography>
          </ListItem>
          
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <ListItem key={item.key} disablePadding sx={{ px: 2, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    color: active ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t(item.label)}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
