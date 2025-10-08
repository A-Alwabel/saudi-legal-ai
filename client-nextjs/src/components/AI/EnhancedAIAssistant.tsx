'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Feedback as FeedbackIcon,
  Verified as VerifiedIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { unifiedApiService } from '@/services/unifiedApiService';

interface AIResponse {
  id: string;
  answer: string;
  confidence: number;
  references: Array<{
    id: string;
    title: string;
    article: string;
    law: string;
    source: string;
    relevance: number;
  }>;
  suggestions: string[];
  successProbability: number;
  validation: any;
  disclaimers: string[];
  lastUpdated: string;
  verificationLevel?: 'unverified' | 'lawyer_verified' | 'expert_verified';
  canProvideFeedback?: boolean;
}

interface Conversation {
  id: string;
  query: string;
  response: AIResponse;
  timestamp: Date;
  feedback?: {
    rating: number;
    helpful: boolean;
    comment?: string;
  };
}

const EnhancedAIAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [caseType, setCaseType] = useState('');
  const [language, setLanguage] = useState(i18n.language);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const loadPreferences = async () => {
    try {
      const response = await unifiedApiService.get('/lawyer-preferences');
      const data = (response as any).data || response;
      if (data) {
        setPreferences(data);
        setLanguage(data.preferredLanguage === 'both' ? i18n.language : data.preferredLanguage);
        setIncludeReferences(data.includeCitations);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    const currentQuery = query.trim();
    setQuery('');

    try {
      const response = await unifiedApiService.ai.getConsultation({
        query: currentQuery,
        caseType: caseType || undefined,
        language,
        includeReferences,
      });

      const newConversation: Conversation = {
        id: response.id || Date.now().toString(),
        query: currentQuery,
        response,
        timestamp: new Date(),
      };

      setConversations(prev => [...prev, newConversation]);
    } catch (error: any) {
      console.error('AI consultation error:', error);
      // Add error message to conversation
      const errorConversation: Conversation = {
        id: Date.now().toString(),
        query: currentQuery,
        response: {
          id: 'error',
          answer: error.message || 'Failed to get AI response',
          confidence: 0,
          references: [],
          suggestions: [],
          successProbability: 0,
          validation: null,
          disclaimers: [],
          lastUpdated: new Date().toISOString(),
        },
        timestamp: new Date(),
      };
      setConversations(prev => [...prev, errorConversation]);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (conversationId: string, rating: number, helpful: boolean, comment?: string) => {
    try {
      await unifiedApiService.ai.submitFeedback({
        consultationId: conversationId,
        rating,
        isHelpful: helpful,
        comment,
      });

      // Update conversation with feedback
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, feedback: { rating, helpful, comment } }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getVerificationIcon = (level?: string) => {
    switch (level) {
      case 'lawyer_verified':
        return <VerifiedIcon color="success" fontSize="small" />;
      case 'expert_verified':
        return <SchoolIcon color="primary" fontSize="small" />;
      default:
        return <AIIcon color="action" fontSize="small" />;
    }
  };

  const getVerificationLabel = (level?: string) => {
    switch (level) {
      case 'lawyer_verified':
        return preferences?.lawFirmId ? 'Your Firm Verified' : 'Lawyer Verified';
      case 'expert_verified':
        return 'Expert Verified';
      default:
        return 'AI Generated';
    }
  };

  const caseTypes = [
    'commercial',
    'family',
    'criminal',
    'labor',
    'real_estate',
    'intellectual_property',
    'administrative',
    'cyber_crime',
    'inheritance',
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('ai.enhanced_assistant')}
            </Typography>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettings(!showSettings)}
              variant="outlined"
            >
              {t('common.settings')}
            </Button>
          </Box>

          {/* Settings Panel */}
          {showSettings && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('ai.consultation_settings')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{t('ai.case_type')}</InputLabel>
                    <Select
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                    >
                      <MenuItem value="">{t('ai.any_case_type')}</MenuItem>
                      {caseTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {t(`cases.types.${type}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('common.language')}</InputLabel>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <MenuItem value="en">{t('preferences.english')}</MenuItem>
                      <MenuItem value="ar">{t('preferences.arabic')}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={includeReferences}
                        onChange={(e) => setIncludeReferences(e.target.checked)}
                        size="small"
                      />
                    }
                    label={t('preferences.include_citations')}
                  />

                  {preferences && (
                    <Chip
                      icon={getVerificationIcon()}
                      label={`${t('preferences.response_style')}: ${preferences.responseStyle}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Conversations */}
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            {conversations.length === 0 ? (
              <Box textAlign="center" py={4}>
                <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('ai.welcome_message')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {preferences 
                    ? t('ai.personalized_ready', { style: preferences.responseStyle })
                    : t('ai.ask_anything')
                  }
                </Typography>
              </Box>
            ) : (
              conversations.map((conversation) => (
                <Box key={conversation.id} mb={3}>
                  {/* User Query */}
                  <Box display="flex" justifyContent="flex-end" mb={1}>
                    <Paper sx={{ p: 2, maxWidth: '70%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography>{conversation.query}</Typography>
                    </Paper>
                  </Box>

                  {/* AI Response */}
                  <Box display="flex" justifyContent="flex-start" mb={2}>
                    <Paper sx={{ p: 2, maxWidth: '85%', bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                      {/* Response Header */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getVerificationIcon(conversation.response.verificationLevel)}
                          <Typography variant="caption" color="text.secondary">
                            {getVerificationLabel(conversation.response.verificationLevel)}
                          </Typography>
                          <Chip 
                            label={`${Math.round(conversation.response.confidence * 100)}% confident`}
                            size="small"
                            color={conversation.response.confidence > 0.8 ? 'success' : 'warning'}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>

                      {/* Answer */}
                      <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                        {conversation.response.answer}
                      </Typography>

                      {/* References */}
                      {conversation.response.references.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('ai.legal_references')}:
                          </Typography>
                          {conversation.response.references.map((ref, index) => (
                            <Chip
                              key={index}
                              label={`${ref.law} - ${ref.article}`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Suggestions */}
                      {conversation.response.suggestions.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('ai.suggestions')}:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {conversation.response.suggestions.map((suggestion, index) => (
                              <li key={index}>
                                <Typography variant="body2">{suggestion}</Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}

                      {/* Success Probability */}
                      {conversation.response.successProbability > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('ai.success_probability')}: {Math.round(conversation.response.successProbability * 100)}%
                          </Typography>
                        </Box>
                      )}

                      {/* Feedback Section */}
                      {conversation.response.canProvideFeedback && !conversation.feedback && (
                        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                          <Typography variant="subtitle2" gutterBottom>
                            {t('ai.rate_response')}:
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Rating
                              size="small"
                              onChange={(e, value) => {
                                if (value) {
                                  submitFeedback(conversation.id, value, value >= 3);
                                }
                              }}
                            />
                            <Button
                              size="small"
                              startIcon={<FeedbackIcon />}
                              onClick={() => {
                                const comment = prompt(t('ai.feedback_comment'));
                                if (comment) {
                                  submitFeedback(conversation.id, 5, true, comment);
                                }
                              }}
                            >
                              {t('ai.provide_feedback')}
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* Feedback Display */}
                      {conversation.feedback && (
                        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                          <Typography variant="caption" color="text.secondary">
                            {t('ai.feedback_submitted')}: {conversation.feedback.rating}/5 stars
                          </Typography>
                        </Box>
                      )}

                      {/* Disclaimers */}
                      {conversation.response.disclaimers.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2, fontSize: '0.8rem' }}>
                          {conversation.response.disclaimers.join(' ')}
                        </Alert>
                      )}
                    </Paper>
                  </Box>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={preferences 
                  ? t('ai.personalized_placeholder', { language: preferences.preferredLanguage })
                  : t('ai.ask_question_placeholder')
                }
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!query.trim() || loading}
                sx={{ minWidth: 100 }}
              >
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedAIAssistant;
