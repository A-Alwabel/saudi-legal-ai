import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { LawyerPreference } from '../models/LawyerPreference';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route GET /api/v1/lawyer-preferences
 * @desc Get current user's AI preferences
 * @access Private (Lawyer, Admin)
 */
router.get('/', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const lawFirmId = req.user?.lawFirmId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  let preferences = await LawyerPreference.findOne({ userId });

  // If no preferences exist, create default ones
  if (!preferences) {
    preferences = new LawyerPreference({
      userId,
      lawFirmId,
      // Defaults are set in the schema
    });
    await preferences.save();
  }

  res.json({ success: true, data: preferences, message: 'Preferences retrieved successfully.' });
}));

/**
 * @route PUT /api/v1/lawyer-preferences
 * @desc Update current user's AI preferences
 * @access Private (Lawyer, Admin)
 */
router.put('/', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const lawFirmId = req.user?.lawFirmId;
  const updates = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // Remove sensitive fields that shouldn't be updated directly
  delete updates._id;
  delete updates.userId;
  delete updates.lawFirmId;
  delete updates.createdAt;
  delete updates.updatedAt;

  const preferences = await LawyerPreference.findOneAndUpdate(
    { userId },
    { ...updates, lawFirmId }, // Ensure lawFirmId is always set
    { 
      new: true, 
      runValidators: true,
      upsert: true // Create if doesn't exist
    }
  );

  res.json({ success: true, data: preferences, message: 'Preferences updated successfully.' });
}));

/**
 * @route POST /api/v1/lawyer-preferences/reset
 * @desc Reset preferences to default values
 * @access Private (Lawyer, Admin)
 */
router.post('/reset', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const lawFirmId = req.user?.lawFirmId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // Delete existing preferences and create new default ones
  await LawyerPreference.findOneAndDelete({ userId });

  const defaultPreferences = new LawyerPreference({
    userId,
    lawFirmId,
    // All defaults are set in the schema
  });

  await defaultPreferences.save();

  res.json({ 
    success: true, 
    data: defaultPreferences, 
    message: 'Preferences reset to default values.' 
  });
}));

/**
 * @route GET /api/v1/lawyer-preferences/template
 * @desc Get preference template/options for frontend
 * @access Private (Lawyer, Admin)
 */
router.get('/template', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const template = {
    preferredLanguage: {
      options: ['en', 'ar', 'both'],
      default: 'both',
      description: 'Preferred language for AI responses'
    },
    responseStyle: {
      options: ['formal', 'conversational', 'technical', 'simplified'],
      default: 'formal',
      description: 'Style of AI responses'
    },
    detailLevel: {
      options: ['brief', 'standard', 'comprehensive'],
      default: 'standard',
      description: 'Level of detail in responses'
    },
    urgencyHandling: {
      options: ['conservative', 'balanced', 'aggressive'],
      default: 'balanced',
      description: 'How to handle urgent matters'
    },
    clientCommunicationStyle: {
      options: ['formal', 'friendly', 'educational'],
      default: 'formal',
      description: 'Style for client communications'
    },
    riskTolerance: {
      options: ['low', 'medium', 'high'],
      default: 'medium',
      description: 'Risk tolerance level'
    },
    feedbackFrequency: {
      options: ['always', 'weekly', 'monthly', 'never'],
      default: 'weekly',
      description: 'How often to provide feedback prompts'
    },
    commonSpecializations: [
      'Commercial Law',
      'Family Law', 
      'Criminal Law',
      'Labor Law',
      'Real Estate Law',
      'Intellectual Property',
      'Administrative Law',
      'Cyber Crime',
      'Inheritance Law',
      'Contract Law',
      'Corporate Law',
      'Banking Law',
      'Insurance Law',
      'Tax Law',
      'Immigration Law'
    ],
    commonPracticeAreas: [
      'Litigation',
      'Arbitration',
      'Mediation',
      'Contract Drafting',
      'Legal Consultation',
      'Compliance',
      'Due Diligence',
      'Mergers & Acquisitions',
      'Employment Issues',
      'Regulatory Affairs'
    ]
  };

  res.json({ 
    success: true, 
    data: template, 
    message: 'Preference template retrieved successfully.' 
  });
}));

/**
 * @route GET /api/v1/lawyer-preferences/analytics
 * @desc Get analytics on how preferences affect AI performance
 * @access Private (Lawyer, Admin)
 */
router.get('/analytics', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // This would integrate with AI consultation history to show:
  // - How preferences affect response quality
  // - Usage patterns
  // - Satisfaction metrics
  // For now, return placeholder data

  const analytics = {
    totalConsultations: 0, // Would be calculated from consultation history
    averageSatisfaction: 0, // Would be calculated from feedback
    preferenceUtilization: {
      responseStyle: 'actively_used',
      detailLevel: 'actively_used',
      specializations: 'needs_update'
    },
    recommendations: [
      'Consider updating your specializations based on recent case types',
      'Your detailed response preference is working well for client satisfaction'
    ],
    performanceMetrics: {
      responseRelevance: 0.85,
      clientSatisfaction: 0.90,
      timeToResolution: '2.3 days average'
    }
  };

  res.json({ 
    success: true, 
    data: analytics, 
    message: 'Preference analytics retrieved successfully.' 
  });
}));

export { router as lawyerPreferenceRoutes };
