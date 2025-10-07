'use client';

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  alpha,
  InputBase,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Search,
  AccountCircle,
  Settings,
  Logout,
  Language,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import ComprehensiveSidebar from './ComprehensiveSidebar';
import { useTranslation } from '@/i18n/TranslationProvider';
import LanguageToggle from '../common/LanguageToggle';
import { useThemeMode } from '@/contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const { darkMode, toggleDarkMode } = useThemeMode();
  
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Clear cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Navigate to login page
    router.push(`/${locale}/login`);
    handleMenuClose();
  };

  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Sidebar */}
      <ComprehensiveSidebar open={!mobileOpen} onToggle={handleDrawerToggle} />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {/* Mobile menu toggle */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Search Bar */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
                marginRight: isRTL ? 0 : 'auto',
                marginLeft: isRTL ? 'auto' : 0,
                width: { xs: 'auto', sm: '300px', md: '400px' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Box
                sx={{
                  padding: theme.spacing(0, 2),
                  height: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search />
              </Box>
              <InputBase
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                sx={{
                  color: 'inherit',
                  '& .MuiInputBase-input': {
                    padding: theme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                    paddingRight: isRTL ? `calc(1em + ${theme.spacing(4)})` : theme.spacing(1),
                    transition: theme.transitions.create('width'),
                    width: '100%',
                  },
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Theme Toggle */}
              <IconButton onClick={handleToggleTheme} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>

              {/* Language Toggle */}
              <LanguageToggle />

              {/* Notifications */}
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* Profile */}
              <IconButton
                edge="end"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { router.push('/profile'); handleMenuClose(); }}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </MenuItem>
          <MenuItem onClick={() => { router.push('/settings'); handleMenuClose(); }}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            {isRTL ? 'الإعدادات' : 'Settings'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 360,
              maxHeight: 400,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600}>
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
            </Typography>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}
