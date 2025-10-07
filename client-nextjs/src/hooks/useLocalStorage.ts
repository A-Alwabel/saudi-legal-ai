import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing localStorage with TypeScript support
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Hook for managing user preferences in localStorage
 */
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'ar',
    sidebarCollapsed: false,
    notificationsEnabled: true,
    autoSave: true,
  });

  const updatePreference = useCallback(
    (key: string, value: any) => {
      setPreferences((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPreferences]
  );

  return {
    preferences,
    updatePreference,
    resetPreferences: removePreferences,
  };
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches(maxItems: number = 10) {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);

  const addSearch = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return;
      
      setRecentSearches((prev) => {
        // Remove if already exists
        const filtered = prev.filter(item => item !== searchTerm);
        // Add to beginning and limit to maxItems
        return [searchTerm, ...filtered].slice(0, maxItems);
      });
    },
    [setRecentSearches, maxItems]
  );

  const removeSearch = useCallback(
    (searchTerm: string) => {
      setRecentSearches((prev) => prev.filter(item => item !== searchTerm));
    },
    [setRecentSearches]
  );

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
