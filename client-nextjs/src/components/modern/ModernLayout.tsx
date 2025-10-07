'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  alpha,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  People,
  Description,
  AutoAwesome,
  ExitToApp,
  AccountCircle,
  Settings,
  Notifications,
  DarkMode,
  LightMode,
  Close,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { ModernLanguageSwitcher } from './ModernLanguageSwitcher';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useThemeMode } from '@/contexts/ThemeContext';
import { NoSSR } from '@/components/NoSSR';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';

const drawerWidth = 280;

// Styled components with glass morphism
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none',
  color: theme.palette.text.primary,
}));

const GlassDrawer = styled(Drawer)<{ anchor?: 'left' | 'right' }>(({ theme, anchor }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    border: 'none',
    ...(anchor === 'right' ? {
      borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    } : {
      borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }),
  },
}));

const StyledNavItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isRTL',
})<{ isActive?: boolean; isRTL?: boolean }>(({ theme, isActive, isRTL }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isActive 
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`
      : 'transparent',
    borderRadius: 'inherit',
    transition: 'all 0.3s ease',
  },

  '&:hover': {
    backgroundColor: 'transparent',
    transform: isRTL ? 'translateX(-8px)' : 'translateX(8px)',
    
    '&::before': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
    },
  },

  ...(isActive && {
    '&::after': {
      content: '""',
      position: 'absolute',
      ...(isRTL ? {
        right: 0,
        borderRadius: '2px 0 0 2px',
      } : {
        left: 0,
        borderRadius: '0 2px 2px 0',
      }),
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: '60%',
      background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  }),
}));

const getMenuItems = (t: (key: string) => string) => [
  { 
    text: t('nav.dashboard'), 
    icon: <Dashboard />, 
    path: '/dashboard',
    badge: null,
  },
  { 
    text: t('nav.aiAssistant'), 
    icon: <AutoAwesome />, 
    path: '/ai-assistant',
    badge: 'AI',
  },
  { 
    text: t('nav.cases'), 
    icon: <Gavel />, 
    path: '/cases',
    badge: null,
  },
  { 
    text: t('nav.clients'), 
    icon: <People />, 
    path: '/clients',
    badge: null,
  },
  { 
    text: t('nav.documents'), 
    icon: <Description />, 
    path: '/documents',
    badge: null,
  },
];

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t, locale, dir } = useTranslation();
  const isRTL = dir === 'rtl';
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { darkMode, toggleDarkMode } = useThemeMode();
  
  const menuItems = getMenuItems(t);

  // Handle hydration to prevent SSR/CSR mismatches
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    dispatch(logout());
    router.push(`/${locale}`);
    handleMenuClose();
  }, [dispatch, router, locale]);

  const handleNavigation = useCallback((path: string) => {
    router.push(`/${locale}${path}`);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [router, locale, isMobile]);

  const getCurrentPageTitle = useCallback(() => {
    const currentItem = menuItems.find(item => pathname.includes(item.path));
    return currentItem?.text || t('app.title');
  }, [menuItems, pathname, t]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            {t('app.title')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('app.version')}
          </Typography>
        </motion.div>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => {
            const isActive = pathname.includes(item.path);
            
            return (
              <motion.div
                key={item.path}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ListItem disablePadding>
                  <StyledNavItem
                    isActive={isActive}
                    isRTL={isRTL}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? theme.palette.primary.main : 'inherit',
                        minWidth: 40,
                      }}
                    >
                      {item.badge ? (
                        <Badge
                          badgeContent={item.badge}
                          color="secondary"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            },
                          }}
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? theme.palette.primary.main : 'inherit',
                        },
                      }}
                    />
                  </StyledNavItem>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* User Info Section */}
      <Box sx={{ p: 2 }}>
        <GlassCard variant="primary" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </GlassCard>
      </Box>
    </Box>
  );

  // Completely prevent SSR to avoid hydration mismatches
  if (!isHydrated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} suppressHydrationWarning>
      {/* App Bar */}
      <GlassAppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ...(isRTL ? {
            mr: { md: `${drawerWidth}px` },
          } : {
            ml: { md: `${drawerWidth}px` },
          }),
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getCurrentPageTitle()}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <NoSSR>
              <Tooltip title={darkMode ? t('theme.light') : t('theme.dark')}>
                <IconButton
                  onClick={toggleDarkMode}
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            </NoSSR>

            {/* Notifications */}
            <Tooltip title={t('nav.notifications')}>
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Language Switcher */}
            <ModernLanguageSwitcher />

            {/* User Menu */}
            <Tooltip title={t('nav.profile')}>
              <IconButton onClick={handleMenuClick} color="inherit" sx={{ ml: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </GlassAppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary={t('nav.profile')} />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary={t('nav.settings')} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary={t('nav.logout')} />
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <GlassDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          anchor={isRTL ? 'right' : 'left'}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
        >
          <Box sx={{ position: 'relative', height: '100%' }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                top: 16,
                ...(isRTL ? { left: 16 } : { right: 16 }),
                zIndex: 1,
              }}
            >
              <Close />
            </IconButton>
            {drawerContent}
          </Box>
        </GlassDrawer>

        {/* Desktop drawer */}
        <GlassDrawer
          variant="permanent"
          anchor={isRTL ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
          open
        >
          {drawerContent}
        </GlassDrawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e27 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ padding: theme.spacing(3) }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
