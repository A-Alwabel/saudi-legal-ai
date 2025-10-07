'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
  ExitToApp,
  Brightness4,
  Brightness7,
  Language,
  NavigateNext,
  Home,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { toggleSidebar, setSidebarOpen, setTheme, setLanguage } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchUnreadCount } from '../../store/slices/notificationsSlice';
import Sidebar from './Sidebar';
import AuthGuard from '../auth/AuthGuard';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const { sidebarOpen, theme: currentTheme, language, breadcrumbs } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState<null | HTMLElement>(null);

  const isRTL = language === 'ar';
  const drawerWidth = sidebarOpen ? 280 : 64;

  useEffect(() => {
    // Auto-close sidebar on mobile
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  }, [isMobile, dispatch]);

  useEffect(() => {
    // Fetch notifications count periodically
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    dispatch(setLanguage(newLang));
    i18n.changeLanguage(newLang);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsMenuAnchor(event.currentTarget);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleUserMenuClose();
  };

  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/client-portal');
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar variant={isMobile ? 'temporary' : 'persistent'} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* App Bar */}
          <AppBar
            position="fixed"
            sx={{
              width: { lg: `calc(100% - ${drawerWidth}px)` },
              ml: { lg: `${drawerWidth}px` },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              {/* Menu Button */}
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              {/* Breadcrumbs */}
              <Box sx={{ flexGrow: 1 }}>
                {breadcrumbs.length > 0 && (
                  <Breadcrumbs
                    separator={<NavigateNext fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    <Link
                      color="inherit"
                      href="/dashboard"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                      {t('navigation.home')}
                    </Link>
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      const label = isRTL ? crumb.labelAr || crumb.label : crumb.label;
                      
                      if (isLast || !crumb.href) {
                        return (
                          <Typography key={index} color="text.primary" fontWeight="medium">
                            {label}
                          </Typography>
                        );
                      }

                      return (
                        <Link
                          key={index}
                          color="inherit"
                          href={crumb.href}
                          sx={{
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </Breadcrumbs>
                )}
              </Box>

              {/* Header Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Theme Toggle */}
                <Tooltip title={t('common.toggleTheme')}>
                  <IconButton color="inherit" onClick={handleThemeToggle}>
                    {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Tooltip>

                {/* Language Toggle */}
                <Tooltip title={t('common.toggleLanguage')}>
                  <IconButton color="inherit" onClick={handleLanguageToggle}>
                    <Language />
                  </IconButton>
                </Tooltip>

                {/* Notifications */}
                <Tooltip title={t('navigation.notifications')}>
                  <IconButton color="inherit" onClick={handleNotificationsMenuOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Tooltip title={t('navigation.userMenu')}>
                  <IconButton
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                      }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          <Box
            sx={{
              flexGrow: 1,
              pt: 8, // Account for AppBar height
              minHeight: '100vh',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              {children}
            </motion.div>
          </Box>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          onClick={handleUserMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => window.location.href = '/profile'}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('navigation.profile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => window.location.href = '/settings'}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('navigation.settings')}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <ExitToApp fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>{t('navigation.logout')}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsMenuAnchor}
          open={Boolean(notificationsMenuAnchor)}
          onClose={handleNotificationsMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 300,
              maxWidth: 400,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              {t('navigation.notifications')}
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {t('notifications.unreadCount', { count: unreadCount })}
              </Typography>
            )}
          </Box>
          
          {/* Placeholder for notifications - will be implemented later */}
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {t('notifications.noNotifications')}
            </Typography>
          </Box>
          
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                window.location.href = '/notifications';
                handleNotificationsMenuClose();
              }}
            >
              {t('notifications.viewAll')}
            </Button>
          </Box>
        </Menu>
      </Box>
    </AuthGuard>
  );
}
