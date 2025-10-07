'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Gavel,
  Description,
  TrendingUp,
  Schedule,
  Person,
  Business,
  Phone,
  Email,
  Assignment,
  GetApp,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { clientPortalService } from '@/services/clientPortalService';
import { GlassCard } from '@/components/modern/GlassCard';
import { StatCard } from '@/components/modern/StatCard';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';
import { toast } from 'react-toastify';

interface DashboardData {
  statistics: {
    totalCases: number;
    activeCases: number;
    closedCases: number;
    totalDocuments: number;
  };
  recentCases: any[];
  recentDocuments: any[];
}

interface ClientData {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  clientType: string;
  lawFirm: any;
}

export default function ClientDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadClientData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await clientPortalService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const loadClientData = async () => {
    try {
      // First try to get from localStorage
      const localClient = clientPortalService.getCurrentClient();
      if (localClient) {
        setClientData(localClient);
      }

      // Then fetch fresh data
      const profile = await clientPortalService.getProfile();
      setClientData(profile);
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'completed':
      case 'won':
        return theme.palette.success.main;
      case 'closed':
      case 'lost':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LoadingSpinner message="Loading your portal..." variant="pulse" size="large" />
      </Container>
    );
  }

  if (!dashboardData || !clientData) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="error">
            Failed to load dashboard data. Please try refreshing the page.
          </Typography>
        </Box>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Cases',
      value: dashboardData.statistics.totalCases,
      icon: <Gavel />,
      color: theme.palette.primary.main,
      trend: {
        value: 0,
        label: 'All time',
        direction: 'up' as const,
      },
    },
    {
      title: 'Active Cases',
      value: dashboardData.statistics.activeCases,
      icon: <Schedule />,
      color: theme.palette.warning.main,
      trend: {
        value: 0,
        label: 'In progress',
        direction: 'up' as const,
      },
    },
    {
      title: 'Closed Cases',
      value: dashboardData.statistics.closedCases,
      icon: <Assignment />,
      color: theme.palette.success.main,
      trend: {
        value: 0,
        label: 'Completed',
        direction: 'up' as const,
      },
    },
    {
      title: 'Documents',
      value: dashboardData.statistics.totalDocuments,
      icon: <Description />,
      color: theme.palette.info.main,
      trend: {
        value: 0,
        label: 'Available',
        direction: 'up' as const,
      },
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome, {clientData.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Your Legal Portal Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Client Profile Card */}
        <Grid item xs={12} md={4}>
          <GlassCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: theme.palette.primary.main,
                    mr: 2,
                  }}
                >
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {clientData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {clientData.clientType.charAt(0).toUpperCase() + clientData.clientType.slice(1)} Client
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={clientData.email} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Phone fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={clientData.phone} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Business fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={clientData.lawFirm?.name || 'Law Firm'} />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/client/profile')}
              >
                View Full Profile
              </Button>
            </CardActions>
          </GlassCard>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {statCards.map((card, index) => (
              <Grid item xs={6} md={3} key={index}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Cases */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Cases
              </Typography>
              
              {dashboardData.recentCases.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No cases found.
                </Typography>
              ) : (
                <List>
                  {dashboardData.recentCases.slice(0, 5).map((case_, index) => (
                    <ListItem
                      key={case_._id}
                      divider={index < dashboardData.recentCases.length - 1}
                      sx={{
                        px: 0,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          borderRadius: 1,
                        },
                      }}
                      onClick={() => router.push(`/client/cases/${case_._id}`)}
                    >
                      <ListItemIcon>
                        <Gavel color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={case_.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={case_.status}
                              size="small"
                              sx={{
                                backgroundColor: `${getStatusColor(case_.status)}20`,
                                color: getStatusColor(case_.status),
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(case_.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/client/cases')}
              >
                View All Cases
              </Button>
            </CardActions>
          </GlassCard>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Documents
              </Typography>
              
              {dashboardData.recentDocuments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents found.
                </Typography>
              ) : (
                <List>
                  {dashboardData.recentDocuments.slice(0, 5).map((doc, index) => (
                    <ListItem
                      key={doc._id}
                      divider={index < dashboardData.recentDocuments.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <Description color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {doc.fileSize} • {formatDate(doc.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<GetApp />}
                        onClick={() => {
                          // Handle document download
                          clientPortalService.downloadDocument(doc._id)
                            .then(() => toast.success('Download started'))
                            .catch(() => toast.error('Download failed'));
                        }}
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/client/documents')}
              >
                View All Documents
              </Button>
            </CardActions>
          </GlassCard>
        </Grid>
      </Grid>
    </Container>
  );
}

