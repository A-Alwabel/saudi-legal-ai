'use client';

import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, useTheme, Paper, alpha, IconButton } from '@mui/material';
import { 
  Gavel, 
  AutoAwesome, 
  Analytics, 
  Security, 
  Speed, 
  Language,
  ArrowForward,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';
import Link from 'next/link';
import { LanguageToggleSimple } from '@/components/common/LanguageToggle';
import { useThemeMode } from '@/contexts/ThemeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function HomePage() {
  const theme = useTheme();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { darkMode, toggleDarkMode } = useThemeMode();

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 48 }} />,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.description'),
      color: theme.palette.primary.main,
    },
    {
      icon: <Gavel sx={{ fontSize: 48 }} />,
      title: t('landing.features.cases.title'),
      description: t('landing.features.cases.description'),
      color: theme.palette.secondary.main,
    },
    {
      icon: <Analytics sx={{ fontSize: 48 }} />,
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description'),
      color: theme.palette.success.main,
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: t('landing.features.security.title'),
      description: t('landing.features.security.description'),
      color: theme.palette.error.main,
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: t('landing.features.speed.title'),
      description: t('landing.features.speed.description'),
      color: theme.palette.warning.main,
    },
    {
      icon: <Language sx={{ fontSize: 48 }} />,
      title: t('landing.features.bilingual.title'),
      description: t('landing.features.bilingual.description'),
      color: theme.palette.info.main,
    },
  ];

  const stats = [
    { value: '5000+', label: t('landing.stats.firms') },
    { value: '50K+', label: t('landing.stats.cases') },
    { value: '99.9%', label: t('landing.stats.uptime') },
    { value: '24/7', label: t('landing.stats.support') },
  ];

  const pricingPlans = [
    {
      name: t('landing.pricing.starter.name'),
      price: '2,999',
      currency: t('currency.sar'),
      period: t('landing.pricing.monthly'),
      description: t('landing.pricing.starter.description'),
      features: [0, 1, 2, 3, 4].map(i => t(`landing.pricing.starter.features.${i}`)),
      highlighted: false,
    },
    {
      name: t('landing.pricing.professional.name'),
      price: '5,999',
      currency: t('currency.sar'),
      period: t('landing.pricing.monthly'),
      description: t('landing.pricing.professional.description'),
      features: [0, 1, 2, 3, 4, 5].map(i => t(`landing.pricing.professional.features.${i}`)),
      highlighted: true,
      popular: true,
    },
    {
      name: t('landing.pricing.enterprise.name'),
      price: t('landing.pricing.enterprise.price'),
      currency: '',
      period: '',
      description: t('landing.pricing.enterprise.description'),
      features: [0, 1, 2, 3, 4, 5].map(i => t(`landing.pricing.enterprise.features.${i}`)),
      highlighted: false,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 2 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('app.title')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton onClick={toggleDarkMode} sx={{ color: theme.palette.text.primary }}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <LanguageToggleSimple />
              <Button
                variant="outlined"
                onClick={() => router.push(`/${locale}/login`)}
              >
                {t('auth.login.title')}
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/${locale}/register`)}
                startIcon={<ArrowForward />}
              >
                {t('auth.register.title')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            {t('landing.hero.title')}
          </Typography>
          
          <Typography 
            variant="h4" 
            color="text.secondary" 
            sx={{ 
              mb: 5, 
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 300,
              maxWidth: '800px',
            }}
          >
            {t('landing.hero.subtitle')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push(`/${locale}/register`)}
              sx={{ 
                px: 6, 
                py: 2,
                borderRadius: 3,
                fontSize: '1.2rem',
                textTransform: 'none',
                boxShadow: theme.shadows[10],
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[15],
                }
              }}
            >
              {t('landing.hero.getStarted')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push(`/${locale}/login`)}
              sx={{ 
                px: 6, 
                py: 2,
                borderRadius: 3,
                fontSize: '1.2rem',
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              {t('landing.hero.signIn')}
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mt: 8, maxWidth: '800px' }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      mb: 0.5
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Grid */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            {t('landing.features.title')}
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, fontWeight: 300 }}
          >
            {t('landing.hero.subtitle')}
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10],
                      borderColor: feature.color,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ 
                      color: feature.color, 
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            {t('landing.pricing.title')}
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, fontWeight: 300 }}
          >
            {t('landing.pricing.subtitle')}
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 4, alignItems: 'stretch' }}>
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: plan.highlighted ? 3 : 1,
                    borderColor: plan.highlighted ? 'primary.main' : 'divider',
                    transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[10],
                      transform: plan.highlighted ? 'scale(1.07)' : 'scale(1.02)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                        color: 'white',
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: locale === 'ar' ? 'normal' : '1px',
                        textAlign: 'center',
                        textTransform: locale === 'ar' ? 'none' : 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🔥</span>
                      <span>{t('landing.pricing.professional.popular')}</span>
                      <span style={{ fontSize: '1.2rem' }}>🔥</span>
                    </Box>
                  )}
                  <CardContent sx={{ 
                    p: 4, 
                    pt: plan.popular ? 6 : 4,
                    textAlign: 'center',
                    flex: 1,
                  }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h2" 
                        component="span"
                        sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                      >
                        {plan.price}
                      </Typography>
                      {plan.currency && (
                        <Typography variant="h6" component="span" sx={{ ml: 1 }}>
                          {plan.currency}
                        </Typography>
                      )}
                      <Typography variant="body1" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 4, textAlign: 'left' }}>
                      {plan.features.map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleOutline sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      fullWidth
                      variant={plan.highlighted ? 'contained' : 'outlined'}
                      size="large"
                      sx={{ py: 1.5 }}
                      onClick={() => router.push(`/${locale}/register`)}
                    >
                      {plan.name === t('landing.pricing.enterprise.name') 
                        ? t('landing.pricing.contactSales') 
                        : t('landing.pricing.startTrial')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t('landing.pricing.trialInfo')}
            </Typography>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            {t('landing.cta.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 300 }}>
            {t('landing.cta.subtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push(`/${locale}/register`)}
            sx={{ 
              px: 8, 
              py: 2.5,
              borderRadius: 3,
              fontSize: '1.3rem',
              textTransform: 'none',
              boxShadow: theme.shadows[10],
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {t('landing.cta.createAccount')}
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {t('landing.footer.copyright')}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Link href="#" style={{ color: theme.palette.primary.main }}>
                {t('landing.footer.privacy')}
              </Link>
              <Link href="#" style={{ color: theme.palette.primary.main }}>
                {t('landing.footer.terms')}
              </Link>
              <Link href="#" style={{ color: theme.palette.primary.main }}>
                {t('landing.footer.contact')}
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}