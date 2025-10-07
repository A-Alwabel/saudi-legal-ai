import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { aiService } from '../services/AIService';
import { AIConsultationRequest } from '@shared/types';
import { aiConsultationValidator } from '../validators/aiValidators';

/**
 * AI Controller
 * Handles AI-related requests with proper validation and error handling
 */
export class AIController extends BaseController {
  /**
   * Process AI consultation request
   */
  async processConsultation(req: Request, res: Response) {
    try {
      this.logRequest(req, 'AI Consultation');

      // Validate request
      const validationResult = aiConsultationValidator.validate(req.body);
      if (validationResult.error) {
        return this.sendValidationError(res, validationResult.error.details);
      }

      const consultationRequest: AIConsultationRequest = validationResult.value;
      
      // Process consultation with user context
      const response = await aiService.processConsultation(
        consultationRequest,
        req.user?.lawFirmId?.toString(),
        req.user?._id?.toString()
      );

      return this.sendSuccess(res, response, 'AI consultation completed successfully');
    } catch (error: any) {
      return this.sendError(res, 'Failed to process AI consultation', 500, error.message);
    }
  }

  /**
   * Analyze document with AI
   */
  async analyzeDocument(req: Request, res: Response) {
    try {
      this.logRequest(req, 'AI Document Analysis');

      const { documentId, analysisType = 'general' } = req.body;

      if (!documentId) {
        return this.sendValidationError(res, [{ field: 'documentId', message: 'Document ID is required' }]);
      }

      // TODO: Implement document analysis
      const analysisResult = {
        documentId,
        analysisType,
        summary: 'Document analysis completed',
        keyPoints: [],
        recommendations: [],
        confidence: 0.85,
        processedAt: new Date().toISOString(),
      };

      return this.sendSuccess(res, analysisResult, 'Document analyzed successfully');
    } catch (error: any) {
      return this.sendError(res, 'Failed to analyze document', 500, error.message);
    }
  }

  /**
   * Get AI suggestions for case
   */
  async getCaseSuggestions(req: Request, res: Response) {
    try {
      this.logRequest(req, 'AI Case Suggestions');

      const { caseId, type = 'general' } = req.query;

      if (!caseId) {
        return this.sendValidationError(res, [{ field: 'caseId', message: 'Case ID is required' }]);
      }

      // TODO: Implement case-specific suggestions
      const suggestions = {
        caseId,
        suggestions: [
          'Review all relevant documentation',
          'Consider mediation options',
          'Prepare for potential counterarguments',
          'Schedule follow-up with client',
        ],
        priority: 'medium',
        confidence: 0.8,
        generatedAt: new Date().toISOString(),
      };

      return this.sendSuccess(res, suggestions, 'AI suggestions generated successfully');
    } catch (error: any) {
      return this.sendError(res, 'Failed to generate AI suggestions', 500, error.message);
    }
  }
}
