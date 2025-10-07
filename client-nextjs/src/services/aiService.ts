// Re-export from unified API service for backward compatibility
export { aiApi as default } from './unifiedApiService';
export { aiApi as aiService } from './unifiedApiService';

// Keep original interface for backward compatibility
export interface ConsultationRequest {
  question: string;
  caseType: string;
  language: string;
  context?: any;
}

export interface ConsultationResponse {
  id: string;
  answer: string;
  confidence: number;
  references: any[];
  suggestions: string[];
  successProbability?: number;
  validation?: any;
  disclaimers: string[];
  lastUpdated: string;
  verificationLevel?: string;
}