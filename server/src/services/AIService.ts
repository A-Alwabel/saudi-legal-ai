import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AIConsultationRequest, AIConsultationResponse, LegalReference, CaseType } from '@shared/types';
import { rlhfService } from './rlhfService';
import { LawyerPreference } from '../models/LawyerPreference';

export class AIService {
  private openai: OpenAI;
  private legalKnowledgeBase: Map<string, any>;
  private firmKnowledgeCache: Map<string, any>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.legalKnowledgeBase = new Map();
    this.firmKnowledgeCache = new Map();
    this.initializeLegalKnowledgeBase();
  }

  private initializeLegalKnowledgeBase(): void {
    // Saudi Commercial Law
    this.legalKnowledgeBase.set('commercial_law', {
      name: 'نظام التجارة',
      articles: [
        {
          id: 'com_1',
          title: 'تعريف التجارة',
          content: 'التجارة هي كل عمل من أعمال البيع والشراء والاستيراد والتصدير والنقل والتخزين والتأمين والوساطة المالية',
          law: 'نظام التجارة',
          article: 'المادة 1',
          lastUpdated: '2023-01-01'
        },
        {
          id: 'com_2',
          title: 'التزامات التاجر',
          content: 'يجب على التاجر تسجيل تجارته في السجل التجاري والحصول على التراخيص اللازمة',
          law: 'نظام التجارة',
          article: 'المادة 2',
          lastUpdated: '2023-01-01'
        }
      ],
    });

    // Saudi Labor Law
    this.legalKnowledgeBase.set('labor_law', {
      name: 'نظام العمل',
      articles: [
        {
          id: 'lab_1',
          title: 'حقوق العامل',
          content: 'للعامل الحق في الحصول على أجر عادل ومتساوٍ مع العاملين في نفس العمل',
          law: 'نظام العمل',
          article: 'المادة 5',
          lastUpdated: '2023-01-01'
        },
        {
          id: 'lab_2',
          title: 'ساعات العمل',
          content: 'ساعات العمل العادية ثماني ساعات في اليوم أو ثمان وأربعين ساعة في الأسبوع',
          law: 'نظام العمل',
          article: 'المادة 98',
          lastUpdated: '2023-01-01'
        }
      ],
    });

    // Saudi Civil Law
    this.legalKnowledgeBase.set('civil_law', {
      name: 'النظام المدني',
      articles: [
        {
          id: 'civ_1',
          title: 'أحكام العقود',
          content: 'العقد شريعة المتعاقدين، فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين',
          law: 'النظام المدني',
          article: 'المادة 1',
          lastUpdated: '2023-01-01'
        }
      ],
    });
  }

  async processConsultation(
    request: AIConsultationRequest, 
    lawFirmId?: string, 
    userId?: string
  ): Promise<AIConsultationResponse> {
    try {
      logger.info('Processing AI consultation', { 
        caseType: request.caseType,
        language: request.language,
        lawFirmId,
        userId
      });

      // Get relevant legal references FIRST (global knowledge)
      const references = this.getRelevantReferences(request.query, request.caseType);
      
      // Get firm-specific knowledge if available
      const firmContext = lawFirmId ? await this.getFirmSpecificContext(request.query, lawFirmId) : null;
      
      // Get lawyer preferences if available
      const lawyerPrefs = userId ? await this.getLawyerPreferences(userId) : null;
      
      // Build comprehensive legal context (global + firm-specific + personalized)
      const context = this.buildLegalContext(request, references, firmContext, lawyerPrefs);
      
      // Generate AI response with enhanced context
      const response = await this.generateAIResponse(request.query, context, request.language);
      
      // Validate the response for accuracy
      const validation = this.validateResponse(response, references);
      
      // Calculate confidence based on validation and references
      const confidence = this.calculateConfidence(references, response, validation);
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(request.caseType, response);

      const initialResponse: AIConsultationResponse = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        answer: response,
        confidence,
        references,
        suggestions,
        successProbability: this.calculateSuccessProbability(references, request.caseType),
        validation: validation,
        disclaimers: this.getLegalDisclaimers(),
        lastUpdated: new Date().toISOString()
      };

      // Enhance with RLHF improvements (firm-specific first, then global)
      const enhancedResponse = await rlhfService.enhanceAIResponse(
        initialResponse, 
        request.query, 
        lawFirmId
      );

      return enhancedResponse;
    } catch (error) {
      logger.error('Error processing AI consultation:', error);
      throw new Error('Failed to process consultation');
    }
  }

  private getRelevantReferences(query: string, caseType?: CaseType): LegalReference[] {
    const references: LegalReference[] = [];
    
    if (caseType) {
      const knowledge = this.legalKnowledgeBase.get(`${caseType}_law`);
      if (knowledge) {
        knowledge.articles.forEach((article: any) => {
          if (this.isRelevant(query, article.content)) {
            references.push({
              id: article.id,
              title: article.title,
              article: article.article,
              law: article.law,
              source: 'Saudi Legal Database',
              relevance: this.calculateRelevance(query, article.content),
            });
          }
        });
      }
    }

    return references.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private buildLegalContext(
    request: AIConsultationRequest, 
    references: LegalReference[], 
    firmContext?: any,
    lawyerPrefs?: any
  ): string {
    let context = `You are a Saudi legal expert AI assistant. Provide accurate legal advice based on Saudi law and Sharia principles.\n\n`;
    
    // Add Saudi legal system context
    context += `IMPORTANT: Only provide advice based on Saudi legal system and Sharia law.\n`;
    context += `Current Saudi Legal Framework:\n`;
    
    if (references.length > 0) {
      context += '\nRelevant Legal References:\n';
      references.forEach(ref => {
        context += `- ${ref.law}, ${ref.article}: ${ref.title}\n`;
        context += `  Content: Reference available\n\n`;
      });
    }
    
    if (request.caseType) {
      context += `\nCase Type: ${request.caseType}\n`;
      context += `Relevant considerations for ${request.caseType} cases:\n`;
      context += this.getCaseTypeGuidance(request.caseType);
    }
    
    if (request.context) {
      context += `\nAdditional Context: ${request.context}\n`;
    }
    
    // Add firm-specific context if available
    if (firmContext) {
      context += `\nFirm-Specific Knowledge:\n`;
      if (firmContext.specializations) {
        context += `- Firm Specializations: ${firmContext.specializations.join(', ')}\n`;
      }
      if (firmContext.successPatterns) {
        context += `- Previous Success Patterns: ${firmContext.successPatterns}\n`;
      }
      if (firmContext.preferredApproaches) {
        context += `- Preferred Legal Approaches: ${firmContext.preferredApproaches}\n`;
      }
    }

    // Add lawyer preferences if available
    if (lawyerPrefs) {
      context += `\nLawyer Preferences:\n`;
      if (lawyerPrefs.responseStyle) {
        context += `- Response Style: ${lawyerPrefs.responseStyle}\n`;
      }
      if (lawyerPrefs.detailLevel) {
        context += `- Detail Level: ${lawyerPrefs.detailLevel}\n`;
      }
      if (lawyerPrefs.specializations && lawyerPrefs.specializations.length > 0) {
        context += `- Lawyer Specializations: ${lawyerPrefs.specializations.join(', ')}\n`;
      }
      if (lawyerPrefs.riskTolerance) {
        context += `- Risk Tolerance: ${lawyerPrefs.riskTolerance}\n`;
      }
      if (lawyerPrefs.clientCommunicationStyle) {
        context += `- Client Communication Style: ${lawyerPrefs.clientCommunicationStyle}\n`;
      }
      if (lawyerPrefs.includeExamples) {
        context += `- Include Practical Examples: Yes\n`;
      }
      if (lawyerPrefs.includeCitations) {
        context += `- Include Legal Citations: Yes\n`;
      }
    }

    // Add disclaimers
    context += `\nIMPORTANT DISCLAIMERS:\n`;
    context += `- This is general legal information, not specific legal advice\n`;
    context += `- Always consult with a qualified Saudi lawyer for specific cases\n`;
    context += `- Laws may have changed since last update\n`;
    context += `- Court interpretations may vary\n`;
    
    return context;
  }

  private async generateAIResponse(query: string, context: string, language: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: context,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent legal advice
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private isRelevant(query: string, content: string): boolean {
    // Simple relevance check - in production, use more sophisticated NLP
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    const commonWords = queryWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    );
    
    return commonWords.length >= 2;
  }

  private calculateRelevance(query: string, content: string): number {
    // Simple relevance scoring - in production, use vector similarity
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
      contentWords.forEach(contentWord => {
        if (contentWord.includes(word)) {
          score += 1;
        }
      });
    });
    
    return Math.min(score / queryWords.length, 1);
  }

  private validateResponse(response: string, references: LegalReference[]): any {
    const issues: string[] = [];
    let confidence = 0.8;
    
    // Check for generic responses
    if (this.isGenericResponse(response)) {
      issues.push("Response appears to be generic, not specific to Saudi law");
      confidence -= 0.2;
    }
    
    // Check for missing Saudi context
    if (!this.containsSaudiContext(response)) {
      issues.push("Response lacks Saudi legal context");
      confidence -= 0.1;
    }
    
    // Check for outdated information
    if (this.containsOutdatedInfo(response)) {
      issues.push("Response may contain outdated legal information");
      confidence -= 0.1;
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      confidence: Math.max(confidence, 0.3),
      recommendations: this.generateValidationRecommendations(issues)
    };
  }

  private isGenericResponse(response: string): boolean {
    const genericPhrases = [
      "in general",
      "typically",
      "usually",
      "generally speaking",
      "as a rule"
    ];
    
    return genericPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
  }

  private containsSaudiContext(response: string): boolean {
    const saudiKeywords = [
      "سعودي",
      "saudi",
      "نظام",
      "قانون",
      "شريعة",
      "محكمة",
      "court",
      "law"
    ];
    
    return saudiKeywords.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private containsOutdatedInfo(response: string): boolean {
    const outdatedPhrases = [
      "old law",
      "previous system",
      "former regulation"
    ];
    
    return outdatedPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
  }

  private generateValidationRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.includes("Response appears to be generic, not specific to Saudi law")) {
      recommendations.push("Consider adding specific Saudi legal references");
    }
    
    if (issues.includes("Response lacks Saudi legal context")) {
      recommendations.push("Include Saudi legal system context");
    }
    
    if (issues.includes("Response may contain outdated legal information")) {
      recommendations.push("Verify information is current and up-to-date");
    }
    
    return recommendations;
  }

  private getCaseTypeGuidance(caseType: CaseType): string {
    const guidance: Record<CaseType, string> = {
      [CaseType.COMMERCIAL]: "Consider commercial registration requirements and business licensing",
      [CaseType.CIVIL]: "Review civil law principles and contract obligations",
      [CaseType.CRIMINAL]: "Ensure compliance with criminal law procedures and evidence requirements",
      [CaseType.LABOR]: "Check labor law compliance and employee rights",
      [CaseType.FAMILY]: "Consider Sharia law principles and family court procedures",
      [CaseType.REAL_ESTATE]: "Review property law and registration requirements",
      [CaseType.INTELLECTUAL_PROPERTY]: "Check IP registration and protection requirements",
      [CaseType.ADMINISTRATIVE]: "Review administrative procedures and government regulations",
      [CaseType.CYBER_CRIME]: "Consider cybercrime laws and digital evidence requirements",
      [CaseType.INHERITANCE]: "Review inheritance law and Sharia principles"
    };
    
    return guidance[caseType] || "Consider general legal principles and procedures";
  }

  private getLegalDisclaimers(): string[] {
    return [
      "This is general legal information, not specific legal advice",
      "Always consult with a qualified Saudi lawyer for specific cases",
      "Laws may have changed since last update",
      "Court interpretations may vary",
      "This information is for educational purposes only"
    ];
  }

  private calculateConfidence(references: LegalReference[], response: string, validation: any): number {
    if (references.length === 0) return 0.3;
    
    const avgRelevance = references.reduce((sum, ref) => sum + ref.relevance, 0) / references.length;
    const responseLength = response.length;
    const validationConfidence = validation.confidence || 0.5;
    
    // Higher confidence for longer responses with good references and validation
    let confidence = (avgRelevance * 0.4) + (validationConfidence * 0.4);
    if (responseLength > 200) confidence += 0.1;
    if (responseLength > 500) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private generateSuggestions(caseType?: CaseType, response?: string): string[] {
    const suggestions: string[] = [];
    
    if (caseType === CaseType.COMMERCIAL) {
      suggestions.push('Consider reviewing commercial registration requirements');
      suggestions.push('Check for any required government approvals');
    } else if (caseType === CaseType.LABOR) {
      suggestions.push('Review labor law compliance requirements');
      suggestions.push('Consider HRDF registration status');
    } else if (caseType === CaseType.FAMILY) {
      suggestions.push('Verify Sharia law compliance');
      suggestions.push('Consider mediation options');
    }
    
    suggestions.push('Consult with a qualified lawyer for specific advice');
    suggestions.push('Review all relevant documentation');
    
    return suggestions;
  }

  private calculateSuccessProbability(references: LegalReference[], caseType?: CaseType): number {
    if (!caseType || references.length === 0) return 0.5;
    
    // Base success rates by case type (these would be calculated from historical data)
    const baseRates: Record<CaseType, number> = {
      [CaseType.COMMERCIAL]: 0.75,
      [CaseType.CIVIL]: 0.70,
      [CaseType.CRIMINAL]: 0.60,
      [CaseType.LABOR]: 0.80,
      [CaseType.FAMILY]: 0.65,
      [CaseType.REAL_ESTATE]: 0.85,
      [CaseType.INTELLECTUAL_PROPERTY]: 0.70,
      [CaseType.ADMINISTRATIVE]: 0.60,
      [CaseType.CYBER_CRIME]: 0.55,
      [CaseType.INHERITANCE]: 0.75,
    };
    
    let probability = baseRates[caseType] || 0.5;
    
    // Adjust based on reference quality
    if (references.length > 0) {
      const avgRelevance = references.reduce((sum, ref) => sum + ref.relevance, 0) / references.length;
      probability += avgRelevance * 0.2;
    }
    
    return Math.min(probability, 0.95);
  }

  // Get firm-specific context for enhanced responses
  private async getFirmSpecificContext(query: string, lawFirmId: string): Promise<any> {
    // Check cache first
    const cacheKey = `firm_${lawFirmId}_context`;
    if (this.firmKnowledgeCache.has(cacheKey)) {
      return this.firmKnowledgeCache.get(cacheKey);
    }

    // For now, return basic context - this can be enhanced with ML later
    const firmContext = {
      specializations: [], // Can be derived from firm's case history
      successPatterns: 'Standard Saudi legal procedures', // Can be learned from successful cases
      preferredApproaches: 'Conservative, Sharia-compliant legal strategies' // Can be learned from feedback
    };

    // Cache for 1 hour
    this.firmKnowledgeCache.set(cacheKey, firmContext);
    setTimeout(() => {
      this.firmKnowledgeCache.delete(cacheKey);
    }, 3600000); // 1 hour

    return firmContext;
  }

  // Get lawyer preferences for personalized responses
  private async getLawyerPreferences(userId: string): Promise<any> {
    try {
      const preferences = await LawyerPreference.findOne({ userId });
      return preferences ? preferences.toObject() : null;
    } catch (error) {
      logger.error('Error fetching lawyer preferences:', error);
      return null;
    }
  }
}

export const aiService = new AIService();
