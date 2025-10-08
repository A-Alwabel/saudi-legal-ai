// Re-export from unified API service for backward compatibility
import { clientPortalApi, clientAuthService } from './unifiedApiService';

export { clientPortalApi as default } from './unifiedApiService';
export { clientAuthService } from './unifiedApiService';

// Keep backward compatibility methods
export const clientPortalService = {
  // Re-export all methods from clientPortalApi (which is clientsAPI/ApiService)
  getAll: clientPortalApi.getAll.bind(clientPortalApi),
  getById: clientPortalApi.getById.bind(clientPortalApi),
  create: clientPortalApi.create.bind(clientPortalApi),
  update: clientPortalApi.update.bind(clientPortalApi),
  delete: clientPortalApi.delete.bind(clientPortalApi),
  search: clientPortalApi.search.bind(clientPortalApi),
  
  // Auth methods
  ...clientAuthService,
  
  // Additional helper methods for backward compatibility
  getCurrentClient: () => {
    return clientAuthService.getCurrentClient();
  },
  
  isAuthenticated: () => {
    return clientAuthService.isAuthenticated();
  },
  
  // Custom methods for client portal
  getProfile: async () => {
    const currentClient = clientAuthService.getCurrentClient();
    return currentClient;
  },
  
  getCases: async (params?: any) => {
    return clientPortalApi.getAll(params);
  },
  
  getDocuments: async (params?: any) => {
    // Use documents API
    const documentsApi = new (clientPortalApi.constructor as any)('/documents');
    return documentsApi.getAll(params);
  },
  
  downloadDocument: async (documentId: string) => {
    // Download document logic
    const response = await fetch(`/api/documents/${documentId}/download`);
    return response.blob();
  },
  
  submitConsultationRequest: async (data: any) => {
    // Submit AI consultation
    const response = await fetch('/api/v1/ai/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};