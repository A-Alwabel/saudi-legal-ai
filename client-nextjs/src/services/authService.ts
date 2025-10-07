// Re-export from unified API service for backward compatibility
export { authService as default } from './unifiedApiService';
export { authService } from './unifiedApiService';

// Re-export types for convenience
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  lawFirmId?: string;
}

export interface AuthResponse {
  user: any;
  token: string;
}