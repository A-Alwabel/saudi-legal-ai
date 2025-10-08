import { useState, useCallback } from 'react';
import { unifiedApiService } from '@/services/unifiedApiService';

/**
 * Generic API hook for handling API calls with loading, error, and success states
 */
export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * Hook for AI consultation requests
 */
export function useAIConsultation() {
  const { loading, error, data, execute, reset } = useApi();

  const getConsultation = useCallback(
    (consultationData: {
      query: string;
      caseType?: string;
      language?: string;
      context?: any;
      includeReferences?: boolean;
    }) => {
      return execute(async () => {
        const response = await fetch('/api/v1/ai/consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultationData)
        });
        return response.json();
      });
    },
    [execute]
  );

  return {
    loading,
    error,
    consultation: data,
    getConsultation,
    reset,
  };
}

/**
 * Hook for CRUD operations
 */
export function useCrud<T = any>(serviceInstance: any) {
  const { loading, error, data, execute, reset } = useApi<T[]>();
  const [item, setItem] = useState<T | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const getAll = useCallback(
    (params?: any) => {
      return execute(() => serviceInstance.getAll(params));
    },
    [execute, serviceInstance]
  );

  const getById = useCallback(
    async (id: string) => {
      try {
        setItemLoading(true);
        setItemError(null);
        const result = await serviceInstance.getById(id);
        setItem(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch item';
        setItemError(errorMessage);
        throw err;
      } finally {
        setItemLoading(false);
      }
    },
    [serviceInstance]
  );

  const create = useCallback(
    async (itemData: Partial<T>) => {
      try {
        setItemLoading(true);
        setItemError(null);
        const result = await serviceInstance.create(itemData);
        setItem(result);
        // Note: Caller should refetch list after create
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create item';
        setItemError(errorMessage);
        throw err;
      } finally {
        setItemLoading(false);
      }
    },
    [serviceInstance]
  );

  const update = useCallback(
    async (id: string, updates: Partial<T>) => {
      try {
        setItemLoading(true);
        setItemError(null);
        const result = await serviceInstance.update(id, updates);
        setItem(result);
        // Note: Caller should refetch list after update
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update item';
        setItemError(errorMessage);
        throw err;
      } finally {
        setItemLoading(false);
      }
    },
    [serviceInstance]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        setItemLoading(true);
        setItemError(null);
        await serviceInstance.delete(id);
        // Clear item if it's the one being deleted
        if (item && (item as any)._id === id) {
          setItem(null);
        }
        // Note: Caller should refetch list after delete
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete item';
        setItemError(errorMessage);
        throw err;
      } finally {
        setItemLoading(false);
      }
    },
    [serviceInstance, item]
  );

  return {
    // List operations
    loading,
    error,
    data,
    getAll,
    reset,
    
    // Item operations
    item,
    itemLoading,
    itemError,
    getById,
    create,
    update,
    remove,
  };
}
