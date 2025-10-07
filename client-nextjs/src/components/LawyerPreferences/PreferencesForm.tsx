'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  TextField,
  Button,
  Divider,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  Work as WorkIcon,
  Forum as CommunicationIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { unifiedApiService } from '@/services/unifiedApiService';

interface LawyerPreferences {
  // AI Response Preferences
  preferredLanguage: 'en' | 'ar' | 'both';
  responseStyle: 'formal' | 'conversational' | 'technical' | 'simplified';
  detailLevel: 'brief' | 'standard' | 'comprehensive';
  includeArabicTerms: boolean;
  includeCitations: boolean;
  includeExamples: boolean;
  
  // Legal Practice Preferences
  specializations: string[];
  preferredSources: string[];
  practiceAreas: string[];
  
  // Communication Preferences
  urgencyHandling: 'conservative' | 'balanced' | 'aggressive';
  clientCommunicationStyle: 'formal' | 'friendly' | 'educational';
  riskTolerance: 'low' | 'medium' | 'high';
  
  // Workflow Preferences
  preferredCaseTypes: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  
  // Learning Preferences
  feedbackFrequency: 'always' | 'weekly' | 'monthly' | 'never';
  improvementAreas: string[];
  successMetrics: string[];
  
  // Notification Preferences
  aiSuggestionNotifications: boolean;
  learningUpdates: boolean;
  personalizedTips: boolean;
}

interface PreferenceTemplate {
  [key: string]: {
    options: string[];
    default: string;
    description: string;
  };
}

const PreferencesForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState<LawyerPreferences | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadPreferences();
    loadTemplate();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await unifiedApiService.get('/lawyer-preferences');
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
    }
  };

  const loadTemplate = async () => {
    try {
      const response = await unifiedApiService.get('/lawyer-preferences/template');
      if (response.success) {
        setTemplate(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await unifiedApiService.put('/lawyer-preferences', preferences);
      if (response.success) {
        setSuccess(t('preferences.saved_successfully'));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t('preferences.confirm_reset'))) return;

    setSaving(true);
    try {
      const response = await unifiedApiService.post('/lawyer-preferences/reset');
      if (response.success) {
        setPreferences(response.data);
        setSuccess(t('preferences.reset_successfully'));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const updateNestedPreference = (parentKey: string, childKey: string, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [parentKey]: {
        ...(preferences as any)[parentKey],
        [childKey]: value,
      },
    });
  };

  const addToArrayPreference = (key: string, value: string) => {
    if (!preferences || !value.trim()) return;
    const currentArray = (preferences as any)[key] || [];
    if (!currentArray.includes(value.trim())) {
      updatePreference(key, [...currentArray, value.trim()]);
    }
  };

  const removeFromArrayPreference = (key: string, value: string) => {
    if (!preferences) return;
    const currentArray = (preferences as any)[key] || [];
    updatePreference(key, currentArray.filter((item: string) => item !== value));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (!preferences) {
    return (
      <Alert severity="error">
        {t('preferences.load_error')}
      </Alert>
    );
  }

  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index} style={{ paddingTop: '20px' }}>
      {value === index && children}
    </div>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('preferences.title')}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={saving}
                sx={{ mr: 2 }}
              >
                {t('preferences.reset')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<PsychologyIcon />} label={t('preferences.ai_responses')} />
            <Tab icon={<WorkIcon />} label={t('preferences.legal_practice')} />
            <Tab icon={<CommunicationIcon />} label={t('preferences.communication')} />
            <Tab icon={<ScheduleIcon />} label={t('preferences.workflow')} />
            <Tab icon={<AnalyticsIcon />} label={t('preferences.learning')} />
          </Tabs>

          {/* AI Response Preferences */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.preferred_language')}</InputLabel>
                  <Select
                    value={preferences.preferredLanguage}
                    onChange={(e) => updatePreference('preferredLanguage', e.target.value)}
                  >
                    <MenuItem value="en">{t('preferences.english')}</MenuItem>
                    <MenuItem value="ar">{t('preferences.arabic')}</MenuItem>
                    <MenuItem value="both">{t('preferences.both')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.response_style')}</InputLabel>
                  <Select
                    value={preferences.responseStyle}
                    onChange={(e) => updatePreference('responseStyle', e.target.value)}
                  >
                    <MenuItem value="formal">{t('preferences.formal')}</MenuItem>
                    <MenuItem value="conversational">{t('preferences.conversational')}</MenuItem>
                    <MenuItem value="technical">{t('preferences.technical')}</MenuItem>
                    <MenuItem value="simplified">{t('preferences.simplified')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.detail_level')}</InputLabel>
                  <Select
                    value={preferences.detailLevel}
                    onChange={(e) => updatePreference('detailLevel', e.target.value)}
                  >
                    <MenuItem value="brief">{t('preferences.brief')}</MenuItem>
                    <MenuItem value="standard">{t('preferences.standard')}</MenuItem>
                    <MenuItem value="comprehensive">{t('preferences.comprehensive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.includeArabicTerms}
                      onChange={(e) => updatePreference('includeArabicTerms', e.target.checked)}
                    />
                  }
                  label={t('preferences.include_arabic_terms')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.includeCitations}
                      onChange={(e) => updatePreference('includeCitations', e.target.checked)}
                    />
                  }
                  label={t('preferences.include_citations')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.includeExamples}
                      onChange={(e) => updatePreference('includeExamples', e.target.checked)}
                    />
                  }
                  label={t('preferences.include_examples')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Legal Practice Preferences */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('preferences.specializations')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {preferences.specializations.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      onDelete={() => removeFromArrayPreference('specializations', spec)}
                    />
                  ))}
                </Box>
                {template?.commonSpecializations && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {template.commonSpecializations
                      .filter((spec: string) => !preferences.specializations.includes(spec))
                      .map((spec: string) => (
                        <Chip
                          key={spec}
                          label={spec}
                          variant="outlined"
                          onClick={() => addToArrayPreference('specializations', spec)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('preferences.practice_areas')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {preferences.practiceAreas.map((area) => (
                    <Chip
                      key={area}
                      label={area}
                      onDelete={() => removeFromArrayPreference('practiceAreas', area)}
                    />
                  ))}
                </Box>
                {template?.commonPracticeAreas && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {template.commonPracticeAreas
                      .filter((area: string) => !preferences.practiceAreas.includes(area))
                      .map((area: string) => (
                        <Chip
                          key={area}
                          label={area}
                          variant="outlined"
                          onClick={() => addToArrayPreference('practiceAreas', area)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Communication Preferences */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.urgency_handling')}</InputLabel>
                  <Select
                    value={preferences.urgencyHandling}
                    onChange={(e) => updatePreference('urgencyHandling', e.target.value)}
                  >
                    <MenuItem value="conservative">{t('preferences.conservative')}</MenuItem>
                    <MenuItem value="balanced">{t('preferences.balanced')}</MenuItem>
                    <MenuItem value="aggressive">{t('preferences.aggressive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.client_communication_style')}</InputLabel>
                  <Select
                    value={preferences.clientCommunicationStyle}
                    onChange={(e) => updatePreference('clientCommunicationStyle', e.target.value)}
                  >
                    <MenuItem value="formal">{t('preferences.formal')}</MenuItem>
                    <MenuItem value="friendly">{t('preferences.friendly')}</MenuItem>
                    <MenuItem value="educational">{t('preferences.educational')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.risk_tolerance')}</InputLabel>
                  <Select
                    value={preferences.riskTolerance}
                    onChange={(e) => updatePreference('riskTolerance', e.target.value)}
                  >
                    <MenuItem value="low">{t('preferences.low')}</MenuItem>
                    <MenuItem value="medium">{t('preferences.medium')}</MenuItem>
                    <MenuItem value="high">{t('preferences.high')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Workflow Preferences */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('preferences.working_hours')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="time"
                  label={t('preferences.start_time')}
                  value={preferences.workingHours.start}
                  onChange={(e) => updateNestedPreference('workingHours', 'start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="time"
                  label={t('preferences.end_time')}
                  value={preferences.workingHours.end}
                  onChange={(e) => updateNestedPreference('workingHours', 'end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.timezone')}</InputLabel>
                  <Select
                    value={preferences.workingHours.timezone}
                    onChange={(e) => updateNestedPreference('workingHours', 'timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Riyadh">Asia/Riyadh</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem>
                    <MenuItem value="Asia/Kuwait">Asia/Kuwait</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Learning Preferences */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('preferences.feedback_frequency')}</InputLabel>
                  <Select
                    value={preferences.feedbackFrequency}
                    onChange={(e) => updatePreference('feedbackFrequency', e.target.value)}
                  >
                    <MenuItem value="always">{t('preferences.always')}</MenuItem>
                    <MenuItem value="weekly">{t('preferences.weekly')}</MenuItem>
                    <MenuItem value="monthly">{t('preferences.monthly')}</MenuItem>
                    <MenuItem value="never">{t('preferences.never')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.aiSuggestionNotifications}
                      onChange={(e) => updatePreference('aiSuggestionNotifications', e.target.checked)}
                    />
                  }
                  label={t('preferences.ai_suggestion_notifications')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.learningUpdates}
                      onChange={(e) => updatePreference('learningUpdates', e.target.checked)}
                    />
                  }
                  label={t('preferences.learning_updates')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.personalizedTips}
                      onChange={(e) => updatePreference('personalizedTips', e.target.checked)}
                    />
                  }
                  label={t('preferences.personalized_tips')}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PreferencesForm;
