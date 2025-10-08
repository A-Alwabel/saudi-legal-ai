// Unified API Service for Saudi Legal AI v2.0
// This file provides a centralized API service for all frontend-backend communication

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    'Accept': 'application/json',
    },
  withCredentials: true, // For HttpOnly cookies
  });

  // Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
    // Add auth token from localStorage or cookies (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add language header
      const locale = localStorage.getItem('locale') || 'en';
      config.headers['Accept-Language'] = locale;
    }
    
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await apiClient.post('/auth/refresh');
        const { token } = refreshResponse.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
        }
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails (only in browser)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          // Get current locale from URL or default to 'ar'
          const locale = window.location.pathname.startsWith('/en') ? 'en' : 'ar';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(refreshError);
        }
      }

      // Handle other errors
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', 'No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      }

      return Promise.reject(error);
    }
  );

// Generic API request types
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Base API Service Class
class ApiService<T = any> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: QueryParams): Promise<T[]> {
    const response = await apiClient.get<ApiResponse<T[]>>(this.endpoint, { params });
    return response.data.data;
  }

  async getById(id: string): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return response.data.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(this.endpoint, data);
    return response.data.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  async search(query: string, params?: QueryParams): Promise<T[]> {
    const response = await apiClient.get<ApiResponse<T[]>>(`${this.endpoint}/search`, {
      params: { query, ...params },
    });
    return response.data.data;
  }
}

// Specific API Services for each feature
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<ApiResponse>('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await apiClient.post<ApiResponse>('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  refresh: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/refresh');
    return response.data;
  },
  resetPassword: async (email: string) => {
    const response = await apiClient.post('/auth/reset-password', { email });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse>('/auth/me');
    return response.data;
  },
};
export const authService = authAPI; // Alias for compatibility

// Cases API
export const casesAPI = new ApiService('/cases');
export const casesApi = casesAPI; // Alias for compatibility

// Clients API
export const clientsAPI = new ApiService('/clients');
export const clientsApi = clientsAPI; // Alias for compatibility

// Documents API
export const documentsAPI = {
  ...new ApiService('/documents'),
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    const response = await apiClient.post<ApiResponse>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  download: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
export const documentsApi = documentsAPI; // Alias for compatibility

// AI Assistant API
export const aiAPI = {
  chat: async (message: string, context?: any) => {
    const response = await apiClient.post<ApiResponse>('/ai/chat', { message, context });
    return response.data.data;
  },
  analyze: async (documentId: string, analysisType: string) => {
    const response = await apiClient.post<ApiResponse>('/ai/analyze', { documentId, analysisType });
    return response.data.data;
  },
  generateDocument: async (type: string, data: any) => {
    const response = await apiClient.post<ApiResponse>('/ai/generate-document', { type, data });
    return response.data.data;
  },
  submitFeedback: async (messageId: string, feedback: any) => {
    const response = await apiClient.post<ApiResponse>('/ai/feedback', { messageId, feedback });
    return response.data;
  },
};
export const aiApi = aiAPI; // Alias for compatibility

// Financial APIs
export const invoicesAPI = new ApiService('/invoices');
export const invoicesApi = invoicesAPI; // Alias for compatibility
export const paymentsAPI = new ApiService('/payments');
export const expensesAPI = new ApiService('/expenses');
export const treasuryAPI = new ApiService('/treasury');
export const quotationAPI = new ApiService('/quotations');

// HR Management APIs
export const employeesAPI = new ApiService('/employees');
export const employeesApi = employeesAPI; // Alias for compatibility
export const leaveAPI = new ApiService('/leaves');
export const branchAPI = new ApiService('/branches');

// Legal Management APIs
export const sessionAPI = new ApiService('/sessions');
export const powerOfAttorneyAPI = new ApiService('/power-of-attorney');
export const executionRequestAPI = new ApiService('/execution-requests');
export const legalLibraryAPI = new ApiService('/legal-library');
export const legalLibraryApi = legalLibraryAPI; // Alias for compatibility

// System APIs
export const userAPI = new ApiService('/users');
export const roleAPI = new ApiService('/roles');
export const notificationAPI = new ApiService('/notifications');
export const notificationsApi = notificationAPI; // Alias for compatibility
export const reminderAPI = new ApiService('/reminders');
export const archiveAPI = new ApiService('/archive');
export const contactAPI = new ApiService('/contacts');

// Additional APIs
export const appointmentsApi = new ApiService('/appointments');
export const tasksApi = new ApiService('/tasks');

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get<ApiResponse>('/analytics/dashboard');
    return response.data.data;
  },
  getCaseAnalytics: async (period: string) => {
    const response = await apiClient.get<ApiResponse>('/analytics/cases', { params: { period } });
    return response.data.data;
  },
  getFinancialAnalytics: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ApiResponse>('/analytics/financial', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
  getPerformanceMetrics: async () => {
    const response = await apiClient.get<ApiResponse>('/analytics/performance');
    return response.data.data;
  },
};
export const analyticsApi = analyticsAPI; // Alias for compatibility

// Reports API
export const reportsAPI = {
  generateReport: async (type: string, params: any) => {
    const response = await apiClient.post<ApiResponse>('/reports/generate', { type, params });
    return response.data.data;
  },
  getReportHistory: async () => {
    const response = await apiClient.get<ApiResponse>('/reports/history');
    return response.data.data;
  },
  downloadReport: async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse>('/settings');
    return response.data.data;
  },
  updateSettings: async (settings: any) => {
    const response = await apiClient.put<ApiResponse>('/settings', settings);
    return response.data.data;
  },
  getFirmSettings: async () => {
    const response = await apiClient.get<ApiResponse>('/settings/firm');
    return response.data.data;
  },
  updateFirmSettings: async (settings: any) => {
    const response = await apiClient.put<ApiResponse>('/settings/firm', settings);
    return response.data.data;
  },
};

// Add missing aliases for compatibility with existing components
export const usersApi = userAPI;
export const expenseAPI = expensesAPI;
export const paymentAPI = paymentsAPI;
export const clientPortalApi = clientsAPI; // Using clientsAPI as clientPortal
export const clientAuthService = authAPI; // Using authAPI for client auth
export const unifiedApiService = apiClient; // Main API instance alias

// Export the configured axios instance for custom requests
export default apiClient;