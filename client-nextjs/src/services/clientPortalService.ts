// Re-export from unified API service for backward compatibility
import { clientPortalApi, clientAuthService } from './unifiedApiService';

export { clientPortalApi as default } from './unifiedApiService';
export { clientAuthService } from './unifiedApiService';

// Keep backward compatibility methods
export const clientPortalService = {
  // Re-export all methods from clientPortalApi and clientAuthService
  ...clientPortalApi,
  ...clientAuthService,
  
  // Additional helper methods for backward compatibility
  getCurrentClient: () => {
    return clientAuthService.getCurrentClient();
  },
  
  isAuthenticated: () => {
    return clientAuthService.isAuthenticated();
  }
};