'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Divider,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check,
  Delete,
  MoreVert,
  Gavel,
  Assignment,
  Payment,
  Event,
  Warning,
  Info,
  CheckCircle,
  Error,
  People,
  DoneAll,
  Settings,
} from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHeader from '@/components/common/PageHeader';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { notificationAPI } from '@/services/unifiedApiService';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'case' | 'task' | 'payment' | 'appointment';
  isRead: boolean;
  createdAt: string;
  link?: string;
  sender?: string;
}

export default function NotificationsPage() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      _id: '1',
      title: 'New case assigned',
      message: 'You have been assigned to case #2024-001',
      type: 'case',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      link: '/cases/2024-001',
    },
    {
      _id: '2',
      title: 'Task deadline approaching',
      message: 'Task "Review contract" is due tomorrow',
      type: 'task',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      link: '/tasks/123',
    },
    {
      _id: '3',
      title: 'Payment received',
      message: 'Payment of 5,000 SAR received from Client ABC',
      type: 'payment',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      link: '/payments/456',
    },
    {
      _id: '4',
      title: 'Appointment reminder',
      message: 'Court hearing scheduled for tomorrow at 10:00 AM',
      type: 'appointment',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      link: '/appointments/789',
    },
    {
      _id: '5',
      title: 'System update',
      message: 'New features have been added to the AI Assistant',
      type: 'info',
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [filter, notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // const response = await notificationAPI.getAll({ limit: 100 });
      // setNotifications(response || []);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'read':
        filtered = filtered.filter(n => n.isRead);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'case': return <Gavel />;
      case 'task': return <Assignment />;
      case 'payment': return <Payment />;
      case 'appointment': return <Event />;
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      case 'payment': return 'success.main';
      case 'task': return 'primary.main';
      case 'case': return 'secondary.main';
      case 'appointment': return 'info.main';
      default: return 'text.secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <PageHeader
          title="Notifications"
          titleAr="الإشعارات"
          subtitle={`${unreadCount} unread notifications`}
          subtitleAr={`${unreadCount} إشعارات غير مقروءة`}
          breadcrumbs={[
            { label: 'System', labelAr: 'النظام', path: '#' },
            { label: 'Notifications', labelAr: 'الإشعارات' },
          ]}
          secondaryActions={[
            {
              label: 'Mark All as Read',
              labelAr: 'تحديد الكل كمقروء',
              icon: <DoneAll />,
              onClick: handleMarkAllAsRead,
              variant: 'outlined',
            },
            {
              label: 'Settings',
              labelAr: 'الإعدادات',
              icon: <Settings />,
              onClick: () => console.log('Settings'),
              variant: 'outlined',
            },
          ]}
          locale={locale}
        />

        {/* Filter Tabs */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            sx={{ mr: 1 }}
          >
            {isRTL ? 'الكل' : 'All'} ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            onClick={() => setFilter('unread')}
            sx={{ mr: 1 }}
          >
            {isRTL ? 'غير مقروء' : 'Unread'} ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'contained' : 'outlined'}
            onClick={() => setFilter('read')}
          >
            {isRTL ? 'مقروء' : 'Read'} ({notifications.filter(n => n.isRead).length})
          </Button>
        </Box>

        {/* Notifications List */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>{isRTL ? 'جاري التحميل...' : 'Loading...'}</Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {filter === 'unread' 
                  ? (isRTL ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')
                  : (isRTL ? 'لا توجد إشعارات' : 'No notifications')
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      bgcolor: !notification.isRead ? 'action.hover' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={notification.isRead}
                      >
                        <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={!notification.isRead ? 600 : 400}>
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Chip label={isRTL ? 'جديد' : 'New'} size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            {notification.sender && ` • ${notification.sender}`}
                          </Typography>
                        </>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.isRead && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification._id)}
                          title={isRTL ? 'تحديد كمقروء' : 'Mark as read'}
                        >
                          <Check />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification._id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedNotification) {
              const notification = notifications.find(n => n._id === selectedNotification);
              if (notification?.link) {
                // Navigate to link
                console.log('Navigate to:', notification.link);
              }
              handleMenuClose();
            }
          }}>
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedNotification) {
              handleMarkAsRead(selectedNotification);
              handleMenuClose();
            }
          }}>
            {isRTL ? 'تحديد كمقروء' : 'Mark as Read'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => selectedNotification && handleDelete(selectedNotification)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'حذف' : 'Delete'}
          </MenuItem>
        </Menu>
      </Container>
    </DashboardLayout>
  );
}
