import { LawyerFeedback, LawyerFeedbackDocument } from '../models/LawyerFeedback';
import { AnswerImprovement, AnswerImprovementDocument } from '../models/AnswerImprovement';
import { SystemLearning, SystemLearningDocument } from '../models/SystemLearning';
import { Types } from 'mongoose';
import { 
  LawyerFeedback as ILawyerFeedback,
  AnswerImprovement as IAnswerImprovement,
  FeedbackType,
  FeedbackStatus,
  AdminDecision,
  AIConsultationResponse 
} from '@shared/types';

export class RLHFService {
  
  // Submit lawyer feedback - integrates with existing consultation responses
  async submitFeedback(feedbackData: {
    consultationId: string;
    userId: string;
    lawFirmId: string;
    rating: number;
    feedbackType: FeedbackType;
    improvementSuggestion?: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    originalQuery: string;
    originalAnswer: string;
  }): Promise<LawyerFeedbackDocument> {
    
    const feedback = new LawyerFeedback({
      ...feedbackData,
      status: FeedbackStatus.PENDING,
      adminReviewed: false,
    });

    await feedback.save();

    // Auto-trigger admin notification for high urgency
    if (feedbackData.urgencyLevel === 'critical' || feedbackData.urgencyLevel === 'high') {
      await this.notifyAdmin(feedback);
    }

    return feedback;
  }

  // Get all pending feedback for admin review (YOU)
  async getPendingFeedbackForAdmin(): Promise<LawyerFeedbackDocument[]> {
    return LawyerFeedback.find({
      adminReviewed: false,
      status: FeedbackStatus.PENDING
    })
    .populate('userId', 'name email')
    .populate('lawFirmId', 'name')
    .sort({ urgencyLevel: 1, createdAt: -1 }); // Critical first, then by date
  }

  // Get feedback analytics for specific law firm
  async getFeedbackAnalyticsByFirm(lawFirmId: string) {
    const lawFirmObjectId = new Types.ObjectId(lawFirmId);
    
    const [
      totalFeedback,
      pendingReview,
      implemented,
      averageRating,
      feedbackByType,
      improvementsByMonth
    ] = await Promise.all([
      LawyerFeedback.countDocuments({ lawFirmId: lawFirmObjectId }),
      LawyerFeedback.countDocuments({ lawFirmId: lawFirmObjectId, adminReviewed: false }),
      LawyerFeedback.countDocuments({ lawFirmId: lawFirmObjectId, status: FeedbackStatus.IMPLEMENTED }),
      LawyerFeedback.aggregate([
        { $match: { lawFirmId: lawFirmObjectId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      LawyerFeedback.aggregate([
        { $match: { lawFirmId: lawFirmObjectId } },
        { $group: { _id: '$feedbackType', count: { $sum: 1 } } }
      ]),
      AnswerImprovement.aggregate([
        {
          $lookup: {
            from: 'lawyerfeedbacks',
            localField: 'feedbackId',
            foreignField: '_id',
            as: 'feedback'
          }
        },
        { $unwind: '$feedback' },
        { $match: { 'feedback.lawFirmId': lawFirmObjectId } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    return {
      totalFeedback,
      pendingReview,
      implemented,
      accuracyImprovement: implemented > 0 ? `System improved ${implemented} times based on your firm's feedback` : 'No improvements yet',
      averageRating: averageRating[0]?.avgRating || 0,
      feedbackByType: feedbackByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      monthlyImprovements: improvementsByMonth
    };
  }

  // Admin reviews feedback (YOUR decision-making process)
  async adminReviewFeedback(
    feedbackId: string,
    adminDecision: AdminDecision,
    adminNotes?: string
  ): Promise<LawyerFeedbackDocument> {
    
    const feedback = await LawyerFeedback.findById(feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    feedback.adminReviewed = true;
    feedback.adminDecision = adminDecision;
    feedback.adminNotes = adminNotes;
    feedback.status = FeedbackStatus.UNDER_REVIEW;

    await feedback.save();

    // If you decide it needs lawyer verification, add to lawyer queue
    if (adminDecision === AdminDecision.NEEDS_LAWYER_VERIFICATION) {
      await this.addToLawyerVerificationQueue(feedback);
    }

    return feedback;
  }

  // Create answer improvement (after you or hired lawyer fixes the answer)
  async createAnswerImprovement(improvementData: {
    feedbackId: string;
    improvedAnswer: string;
    legalReferences: string[];
    verificationLevel: 'admin_corrected' | 'lawyer_verified';
    verifiedBy?: string; // User ID of hired lawyer if lawyer_verified
  }): Promise<AnswerImprovementDocument> {
    
    const feedback = await LawyerFeedback.findById(improvementData.feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    // Generate question pattern for similarity matching
    const questionPattern = this.generateQuestionPattern(feedback.originalQuery);

    const improvement = new AnswerImprovement({
      feedbackId: improvementData.feedbackId,
      originalAnswer: feedback.originalAnswer,
      improvedAnswer: improvementData.improvedAnswer,
      verificationLevel: improvementData.verificationLevel,
      verifiedBy: improvementData.verifiedBy,
      verificationDate: new Date(),
      legalReferences: improvementData.legalReferences,
      questionPattern: questionPattern,
      isActive: true,
      effectiveDate: new Date(),
    });

    await improvement.save();

    // Update feedback status
    feedback.status = FeedbackStatus.IMPLEMENTED;
    await feedback.save();

    // Add to system learning for future similar questions
    await this.addToSystemLearning(improvement);

    return improvement;
  }

  // Check if we have an improved answer for similar questions
  async findSimilarImprovement(query: string): Promise<AnswerImprovementDocument | null> {
    const questionPattern = this.generateQuestionPattern(query);
    
    // Find learning entries for similar questions
    const learningEntries = await SystemLearning.find({
      isActive: true,
      questionPattern: { $regex: new RegExp(questionPattern, 'i') }
    })
    .populate('improvement')
    .sort({ similarity: -1, usageCount: -1 })
    .limit(5);

    if (learningEntries.length === 0) {
      return null;
    }

    // Use the most relevant improvement
    const bestMatch = learningEntries[0];
    
    // Update usage count
    await SystemLearning.findByIdAndUpdate(bestMatch._id, {
      $inc: { usageCount: 1 },
      lastUsed: new Date()
    });

    // Get the improvement document
    const improvement = await AnswerImprovement.findById(bestMatch.improvementId);
    return improvement as AnswerImprovementDocument;
  }

  // Enhanced AI response that includes RLHF improvements (firm-specific)
  async enhanceAIResponse(
    originalResponse: AIConsultationResponse,
    query: string,
    lawFirmId?: string
  ): Promise<AIConsultationResponse> {
    // Check if we have an improved answer for similar questions (firm-specific first)
    let improvement: AnswerImprovementDocument | null = null;
    
    if (lawFirmId) {
      improvement = await this.findSimilarImprovementByFirm(query, lawFirmId);
    }
    
    // Fallback to global improvements if no firm-specific improvement found
    if (!improvement) {
      improvement = await this.findSimilarImprovement(query);
    }
    
    if (improvement) {
      return {
        ...originalResponse,
        id: originalResponse.id,
        answer: improvement.improvedAnswer,
        references: (improvement.legalReferences || []).map((ref, index) => ({
          id: `ref-${index}`,
          title: ref,
          article: ref,
          law: ref,
          source: lawFirmId ? 'Your Firm Verified' : 'Lawyer Verified',
          relevance: lawFirmId ? 0.98 : 0.95 // Higher relevance for firm-specific improvements
        })),
        verificationLevel: improvement.verificationLevel === 'lawyer_verified' ? 'lawyer_verified' : 'expert_verified',
        lastUpdated: improvement.verificationDate?.toISOString(),
        canProvideFeedback: true,
      };
    }

    // Return original response with feedback capability
    return {
      ...originalResponse,
      canProvideFeedback: true,
      verificationLevel: 'unverified'
    };
  }

  // Find firm-specific improvements first
  async findSimilarImprovementByFirm(query: string, lawFirmId: string): Promise<AnswerImprovementDocument | null> {
    const lawFirmObjectId = new Types.ObjectId(lawFirmId);
    
    // First, get feedback from this specific law firm
    const firmFeedback = await LawyerFeedback.find({ lawFirmId: lawFirmObjectId }).select('_id');
    
    if (firmFeedback.length === 0) {
      return null;
    }
    
    const feedbackIds = firmFeedback.map(f => f._id);
    
    // Find improvements based on this firm's feedback
    const firmImprovements = await AnswerImprovement.find({
      feedbackId: { $in: feedbackIds },
      isActive: true
    }).sort({ createdAt: -1 });
    
    // Simple pattern matching for now (can be enhanced with ML later)
    const queryPattern = this.generateQuestionPattern(query);
    
    for (const improvement of firmImprovements) {
      if (this.patternsMatch(improvement.questionPattern, queryPattern)) {
        return improvement as AnswerImprovementDocument;
      }
    }
    
    return null;
  }

  // Pattern matching helper
  private patternsMatch(pattern1: string, pattern2: string): boolean {
    // Simple keyword overlap check (can be enhanced with ML)
    const keywords1 = pattern1.toLowerCase().split(' ');
    const keywords2 = pattern2.toLowerCase().split(' ');
    
    const overlap = keywords1.filter(word => keywords2.includes(word));
    return overlap.length >= Math.min(keywords1.length, keywords2.length) * 0.6;
  }

  // Analytics for admin dashboard
  async getFeedbackAnalytics() {
    const [
      totalFeedback,
      pendingReview,
      implemented,
      averageRating,
      feedbackByType,
      improvementsByMonth
    ] = await Promise.all([
      LawyerFeedback.countDocuments(),
      LawyerFeedback.countDocuments({ adminReviewed: false }),
      LawyerFeedback.countDocuments({ status: FeedbackStatus.IMPLEMENTED }),
      LawyerFeedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      LawyerFeedback.aggregate([
        { $group: { _id: '$feedbackType', count: { $sum: 1 } } }
      ]),
      AnswerImprovement.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    return {
      totalFeedback,
      pendingReview,
      implemented,
      accuracyImprovement: implemented > 0 ? `System improved ${implemented} times based on lawyer feedback` : 'No improvements yet',
      averageRating: averageRating[0]?.avgRating || 0,
      feedbackByType: feedbackByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      monthlyImprovements: improvementsByMonth
    };
  }

  // Private helper methods
  private generateQuestionPattern(query: string): string {
    // Extract keywords and legal concepts for pattern matching
    const cleaned = query.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, '') // Keep Arabic and English
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract key legal terms
    const legalTerms = [
      'overtime', 'ساعات إضافية', 'company', 'شركة', 'contract', 'عقد',
      'labor', 'عمل', 'commercial', 'تجاري', 'court', 'محكمة'
    ];
    
    const foundTerms = legalTerms.filter(term => 
      cleaned.includes(term.toLowerCase())
    );
    
    return foundTerms.length > 0 ? foundTerms.join(' ') : cleaned;
  }

  private async addToSystemLearning(improvement: AnswerImprovementDocument): Promise<void> {
    const learning = new SystemLearning({
      questionPattern: improvement.questionPattern,
      improvementId: improvement._id,
      similarity: 1.0, // Exact match initially
      usageCount: 0,
      isActive: true,
    });

    await learning.save();
  }

  private async addToLawyerVerificationQueue(feedback: LawyerFeedbackDocument): Promise<void> {
    // This would integrate with your hired lawyer notification system
    // For now, we just mark it as needing lawyer review
    console.log(`🔔 New feedback needs lawyer verification: ${feedback._id}`);
  }

  private async notifyAdmin(feedback: LawyerFeedbackDocument): Promise<void> {
    // This would integrate with your admin notification system
    console.log(`🚨 High priority feedback received: ${feedback.urgencyLevel} - ${feedback._id}`);
  }
}

export const rlhfService = new RLHFService();
