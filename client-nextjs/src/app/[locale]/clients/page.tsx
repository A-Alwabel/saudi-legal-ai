'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person,
  Business,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Add,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';

// Mock data for clients
const mockClients = [
  {
    id: 1,
    name: 'Ahmed Al-Mansouri',
    nameAr: 'أحمد المنصوري',
    email: 'ahmed.almansouri@email.com',
    phone: '+966 50 123 4567',
    company: 'Al-Mansouri Trading',
    companyAr: 'تجارة المنصوري',
    type: 'individual',
    status: 'active',
    location: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، المملكة العربية السعودية',
    activeCases: 3,
    totalCases: 8,
    joinDate: '2023-06-15',
  },
  {
    id: 2,
    name: 'Saudi Tech Solutions',
    nameAr: 'الحلول التقنية السعودية',
    email: 'contact@sauditech.com',
    phone: '+966 11 456 7890',
    company: 'Saudi Tech Solutions LLC',
    companyAr: 'شركة الحلول التقنية السعودية ذ.م.م',
    type: 'corporate',
    status: 'active',
    location: 'Jeddah, Saudi Arabia',
    locationAr: 'جدة، المملكة العربية السعودية',
    activeCases: 2,
    totalCases: 5,
    joinDate: '2023-09-10',
  },
  {
    id: 3,
    name: 'Fatima Al-Zahra',
    nameAr: 'فاطمة الزهراء',
    email: 'fatima.zahra@email.com',
    phone: '+966 55 987 6543',
    company: null,
    companyAr: null,
    type: 'individual',
    status: 'inactive',
    location: 'Dammam, Saudi Arabia',
    locationAr: 'الدمام، المملكة العربية السعودية',
    activeCases: 0,
    totalCases: 2,
    joinDate: '2023-03-20',
  },
  {
    id: 4,
    name: 'Gulf Construction Co.',
    nameAr: 'شركة الخليج للإنشاءات',
    email: 'info@gulfconstruction.com',
    phone: '+966 12 345 6789',
    company: 'Gulf Construction Company',
    companyAr: 'شركة الخليج للإنشاءات',
    type: 'corporate',
    status: 'active',
    location: 'Mecca, Saudi Arabia',
    locationAr: 'مكة، المملكة العربية السعودية',
    activeCases: 5,
    totalCases: 12,
    joinDate: '2023-01-08',
  },
];

export default function ClientsPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const isRTL = locale === 'ar';
  const [clients, setClients] = useState(mockClients);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, clientId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.warning.main;
      case 'blocked':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {t('nav.clients')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'إدارة جميع العملاء والشركات' : 'Manage all clients and companies'}
            </Typography>
          </Box>
          
          <AnimatedButton
            variant="contained"
            startIcon={<Add />}
            sx={{ minWidth: 140 }}
          >
            {isRTL ? 'عميل جديد' : 'New Client'}
          </AnimatedButton>
        </Box>

        {/* Clients Grid */}
        <Grid container spacing={3}>
          {clients.map((client, index) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Header with avatar and menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: client.type === 'corporate' 
                              ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
                              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                          }}
                        >
                          {client.type === 'corporate' ? (
                            <Business sx={{ fontSize: 28 }} />
                          ) : (
                            getClientInitials(client.name)
                          )}
                        </Avatar>
                        <Box>
                          <Chip
                            size="small"
                            label={client.type === 'corporate' ? 
                              (isRTL ? 'شركة' : 'Corporate') : 
                              (isRTL ? 'فرد' : 'Individual')
                            }
                            sx={{
                              backgroundColor: client.type === 'corporate' ? 
                                `${theme.palette.secondary.main}20` : 
                                `${theme.palette.primary.main}20`,
                              color: client.type === 'corporate' ? 
                                theme.palette.secondary.main : 
                                theme.palette.primary.main,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              mb: 1,
                            }}
                          />
                          <Chip
                            size="small"
                            label={isRTL ? 
                              (client.status === 'active' ? 'نشط' : 'غير نشط') :
                              client.status
                            }
                            sx={{
                              backgroundColor: `${getStatusColor(client.status)}20`,
                              color: getStatusColor(client.status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              ml: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, client.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Client Name */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                      {isRTL ? client.nameAr : client.name}
                    </Typography>

                    {/* Company (if applicable) */}
                    {client.company && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Business sx={{ fontSize: 16 }} />
                        {isRTL ? client.companyAr : client.company}
                      </Typography>
                    )}

                    {/* Contact Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 16 }} />
                        {client.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16 }} />
                        {client.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        {isRTL ? client.locationAr : client.location}
                      </Typography>
                    </Box>

                    {/* Case Stats */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {client.activeCases}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'قضايا نشطة' : 'Active Cases'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          {client.totalCases}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'إجمالي القضايا' : 'Total Cases'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Join Date */}
                    <Typography variant="caption" color="text.secondary">
                      {isRTL ? 'تاريخ التسجيل: ' : 'Joined: '}{new Date(client.joinDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      sx={{ textTransform: 'none' }}
                    >
                      {isRTL ? 'عرض' : 'View'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      sx={{ textTransform: 'none' }}
                    >
                      {isRTL ? 'تحرير' : 'Edit'}
                    </Button>
                  </CardActions>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Visibility sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تحرير' : 'Edit'}
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'حذف' : 'Delete'}
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
}
