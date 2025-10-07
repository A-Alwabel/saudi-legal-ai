'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome,
  Send,
  ContentCopy,
  Refresh,
  Speed,
  Security,
  Verified,
  Psychology,
  TrendingUp,
  School,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { aiApi } from '@/services/unifiedApiService';
import { useTranslation } from '@/i18n/TranslationProvider';
import { GlassCard } from '@/components/modern/GlassCard';
import { AnimatedButton } from '@/components/modern/AnimatedButton';
import { LoadingSpinner } from '@/components/modern/LoadingSpinner';

interface ConsultationFormData {
  caseType: string;
  question: string;
  language: 'ar' | 'en';
}

interface AIResponse {
  answer: string;
  confidence: number;
  processingTime: number;
  references?: string[];
  suggestions?: string[];
  verificationLevel?: string;
}

export default function ModernAIAssistantPage() {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    defaultValues: {
      caseType: 'general',
      language: locale as 'ar' | 'en',
      question: '',
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsLoading(true);
    try {
      // Use the chat method with consultation context
      const result = await aiApi.chat(data.question, {
        caseType: data.caseType,
        language: data.language
      });
      setResponse(result);
      toast.success(t('messages.consultationSuccess'));
    } catch (error) {
      console.error('AI consultation error:', error);
      toast.error(t('messages.consultationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response?.answer) {
      navigator.clipboard.writeText(response.answer);
      toast.success(t('messages.copySuccess'));
    }
  };

  const handleReset = () => {
    reset();
    setResponse(null);
  };

  const features = [
    {
      icon: <Psychology />,
      titleKey: 'ai.features.advanced.title',
      descriptionKey: 'ai.features.advanced.description',
      color: theme.palette.primary.main,
    },
    {
      icon: <School />,
      titleKey: 'ai.features.bilingual.title', 
      descriptionKey: 'ai.features.bilingual.description',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Verified />,
      titleKey: 'ai.features.references.title',
      descriptionKey: 'ai.features.references.description',
      color: theme.palette.success.main,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: theme.shadows[8],
                }}
              >
                <AutoAwesome sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </motion.div>
            
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('ai.title')}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              {t('ai.subtitle')}
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Consultation Form */}
          <Grid item xs={12} lg={response ? 6 : 8}>
            <motion.div variants={itemVariants}>
              <GlassCard variant="primary">
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    {t('ai.form.title')}
                  </Typography>
                  
                  <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="caseType"
                          control={control}
                          rules={{ required: 'Case type is required' }}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>{t('ai.form.caseType')}</InputLabel>
                              <Select
                                {...field}
                                label={t('ai.form.caseType')}
                                disabled={isLoading}
                              >
                                <MenuItem value="general">{t('ai.caseTypes.general')}</MenuItem>
                                <MenuItem value="commercial">{t('ai.caseTypes.commercial')}</MenuItem>
                                <MenuItem value="labor">{t('ai.caseTypes.labor')}</MenuItem>
                                <MenuItem value="family">{t('ai.caseTypes.family')}</MenuItem>
                                <MenuItem value="criminal">{t('ai.caseTypes.criminal')}</MenuItem>
                                <MenuItem value="realEstate">{t('ai.caseTypes.realEstate')}</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="language"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>{t('ai.form.language')}</InputLabel>
                              <Select
                                {...field}
                                label={t('ai.form.language')}
                                disabled={isLoading}
                              >
                                <MenuItem value="ar">العربية</MenuItem>
                                <MenuItem value="en">English</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          name="question"
                          control={control}
                          rules={{
                            required: t('ai.errors.questionRequired'),
                            minLength: {
                              value: 10,
                              message: t('ai.errors.questionMin'),
                            },
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={4}
                              label={t('ai.form.question')}
                              placeholder={t('ai.form.placeholder')}
                              error={!!errors.question}
                              helperText={errors.question?.message}
                              disabled={isLoading}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                          <AnimatedButton
                            type="submit"
                            variant="contained"
                            size="large"
                            loading={isLoading}
                            icon={<Send />}
                            disabled={isLoading}
                            sx={{ px: 4, py: 1.5 }}
                          >
                            {t('ai.form.submit')}
                          </AnimatedButton>
                          
                          <AnimatedButton
                            variant="outlined"
                            size="large"
                            onClick={handleReset}
                            icon={<Refresh />}
                            disabled={isLoading}
                          >
                            {t('ai.form.clear')}
                          </AnimatedButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>

          {/* AI Response */}
          {response && (
            <Grid item xs={12} lg={6}>
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard variant="secondary">
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {t('ai.response.title')}
                      </Typography>
                      
                      <Tooltip title={t('ai.response.copy')}>
                        <IconButton
                          onClick={handleCopyResponse}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Response Stats */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Speed />}
                        label={`${response.processingTime}ms`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={<TrendingUp />}
                        label={`${response.confidence}% ثقة`}
                        variant="outlined"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                      {response.verificationLevel && (
                        <Chip
                          icon={<Verified />}
                          label={response.verificationLevel}
                          variant="outlined"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* AI Answer */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.8,
                          mb: 3,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {response.answer}
                      </Typography>
                    </motion.div>

                    {/* References */}
                    {response.references && response.references.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Security /> {t('ai.response.references')}
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          {response.references.map((ref, index) => (
                            <Alert
                              key={index}
                              severity="info"
                              variant="outlined"
                              sx={{ mb: 1, borderRadius: 2 }}
                            >
                              {ref}
                            </Alert>
                          ))}
                        </Box>
                      </motion.div>
                    )}

                    {/* Suggestions */}
                    {response.suggestions && response.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {t('ai.response.suggestions')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {response.suggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              variant="filled"
                              color="primary"
                              sx={{ mb: 1 }}
                            />
                          ))}
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>
          )}

          {/* Features Section */}
          {!response && (
            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard>
                        <Box sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                backgroundColor: `${feature.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: feature.color,
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {t(feature.titleKey)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {t(feature.descriptionKey)}
                          </Typography>
                        </Box>
                      </GlassCard>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          )}
        </Grid>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <LoadingSpinner
                message={t('messages.processing')}
                variant="pulse"
                size="large"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
}