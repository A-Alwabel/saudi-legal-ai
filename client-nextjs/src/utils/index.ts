/**
 * Utility Functions
 */

import { format, parseISO, isValid } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Date and Time Utilities
export const dateUtils = {
  /**
   * Format date for display
   */
  formatDate: (date: string | Date, formatStr: string = 'dd/MM/yyyy', locale: string = 'ar') => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid Date';
      
      return format(dateObj, formatStr, {
        locale: locale === 'ar' ? ar : enUS,
      });
    } catch (error) {
      return 'Invalid Date';
    }
  },

  /**
   * Format date with time
   */
  formatDateTime: (date: string | Date, locale: string = 'ar') => {
    return dateUtils.formatDate(date, 'dd/MM/yyyy HH:mm', locale);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime: (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return 'الآن';
      if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
      if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
      
      return dateUtils.formatDate(dateObj);
    } catch (error) {
      return 'Invalid Date';
    }
  },

  /**
   * Check if date is today
   */
  isToday: (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const today = new Date();
      return dateObj.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  },
};

// String Utilities
export const stringUtils = {
  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, length: number = 100) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert to title case
   */
  toTitleCase: (str: string) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * Generate initials from name
   */
  getInitials: (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  /**
   * Clean and format phone number
   */
  formatPhone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('966')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+966${cleaned.substring(1)}`;
    }
    return `+966${cleaned}`;
  },

  /**
   * Generate slug from text
   */
  slugify: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF ]+/g, '') // Keep Arabic and English letters
      .replace(/ +/g, '-');
  },
};

// Number and Currency Utilities
export const numberUtils = {
  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'SAR') => {
    const formatter = new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  },

  /**
   * Format number with thousands separator
   */
  formatNumber: (num: number, locale: string = 'ar-SA') => {
    return new Intl.NumberFormat(locale).format(num);
  },

  /**
   * Calculate percentage
   */
  calculatePercentage: (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  /**
   * Round to decimal places
   */
  roundToDecimals: (num: number, decimals: number = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
};

// Validation Utilities
export const validationUtils = {
  /**
   * Validate email
   */
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate Saudi phone number
   */
  isValidSaudiPhone: (phone: string) => {
    const phoneRegex = /^(\+966|966|0)?[1-9]\d{8}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate Saudi national ID
   */
  isValidSaudiId: (id: string) => {
    const idRegex = /^\d{10}$/;
    return idRegex.test(id);
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      strength: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
    };
  },
};

// File Utilities
export const fileUtils = {
  /**
   * Format file size
   */
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file extension
   */
  getFileExtension: (filename: string) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Check if file type is allowed
   */
  isAllowedFileType: (filename: string, allowedTypes: string[]) => {
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return allowedTypes.includes(extension);
  },

  /**
   * Generate unique filename
   */
  generateUniqueFilename: (originalName: string) => {
    const timestamp = Date.now();
    const extension = fileUtils.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    return `${nameWithoutExt}_${timestamp}.${extension}`;
  },
};

// Array Utilities
export const arrayUtils = {
  /**
   * Remove duplicates from array
   */
  removeDuplicates: <T>(array: T[], key?: keyof T) => {
    if (!key) {
      return [...new Set(array)];
    }
    return array.filter((item, index, self) => 
      index === self.findIndex(t => t[key] === item[key])
    );
  },

  /**
   * Group array by key
   */
  groupBy: <T>(array: T[], key: keyof T) => {
    return array.reduce((groups, item) => {
      const group = item[key] as unknown as string;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Sort array by key
   */
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Paginate array
   */
  paginate: <T>(array: T[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: array.slice(startIndex, endIndex),
      totalItems: array.length,
      totalPages: Math.ceil(array.length / pageSize),
      currentPage: page,
      hasNextPage: endIndex < array.length,
      hasPrevPage: startIndex > 0,
    };
  },
};

// URL and Navigation Utilities
export const urlUtils = {
  /**
   * Build query string from object
   */
  buildQueryString: (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  },

  /**
   * Parse query string to object
   */
  parseQueryString: (queryString: string) => {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  },

  /**
   * Get current URL without query parameters
   */
  getBaseUrl: () => {
    if (typeof window === 'undefined') return '';
    return window.location.origin + window.location.pathname;
  },
};

// Local Storage Utilities
export const storageUtils = {
  /**
   * Set item in localStorage with error handling
   */
  setItem: (key: string, value: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },

  /**
   * Get item from localStorage with error handling
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
    } catch (error) {
      console.error('Error getting localStorage item:', error);
    }
    return defaultValue;
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
