// Performance Monitoring and Optimization Utilities
// Saudi Legal AI v2.0

// Performance metrics collector
class PerformanceMonitor {
  private metrics: Map<string, any> = new Map();
  private timers: Map<string, number> = new Map();
  
  // Start timing an operation
  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }
  
  // End timing and record the duration
  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer ${label} was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    this.recordMetric(`${label}_duration`, duration);
    
    return duration;
  }
  
  // Record a metric
  recordMetric(name: string, value: any): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      // If metric exists, store as array
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        this.metrics.set(name, [existing, value]);
      }
    } else {
      this.metrics.set(name, value);
    }
  }
  
  // Get all metrics
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((value, key) => {
      if (Array.isArray(value)) {
        // Calculate statistics for arrays
        result[key] = {
          values: value,
          count: value.length,
          avg: value.reduce((a, b) => a + b, 0) / value.length,
          min: Math.min(...value),
          max: Math.max(...value),
        };
      } else {
        result[key] = value;
      }
    });
    
    return result;
  }
  
  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }
  
  // Log performance metrics
  logMetrics(): void {
    console.table(this.getMetrics());
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Measure Web Vitals
export function measureWebVitals(metric: any): void {
  const { name, value, id } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${name}`, value);
  }
  
  // Record in performance monitor
  performanceMonitor.recordMetric(`webvital_${name}`, value);
  
  // Send to analytics service (if configured)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Lazy load images with Intersection Observer
export function lazyLoadImages(selector: string = 'img[data-lazy]'): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }
  
  const images = document.querySelectorAll<HTMLImageElement>(selector);
  
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.lazy;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
    }
  );
  
  images.forEach((img) => imageObserver.observe(img));
}

// Memory cache for expensive operations
class MemoryCache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  set(key: string, value: T, ttl: number = 300000): void {
    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new MemoryCache();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(
  key: string,
  request: () => Promise<T>
): Promise<T> {
  // Check if request is already pending
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending;
  }
  
  // Create new request
  const promise = request().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// Virtual scrolling helper
export function calculateVisibleItems<T>(
  items: T[],
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
): { visible: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return {
    visible: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
  };
}

// Batch operations for better performance
export class BatchProcessor<T> {
  private batch: T[] = [];
  private batchSize: number;
  private processInterval: number;
  private processor: (items: T[]) => void;
  private timer?: NodeJS.Timeout;
  
  constructor(
    processor: (items: T[]) => void,
    batchSize: number = 50,
    processInterval: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.processInterval = processInterval;
  }
  
  add(item: T): void {
    this.batch.push(item);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }
  
  private scheduleFlush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
      this.flush();
    }, this.processInterval);
  }
  
  flush(): void {
    if (this.batch.length === 0) {
      return;
    }
    
    const items = [...this.batch];
    this.batch = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    
    this.processor(items);
  }
  
  clear(): void {
    this.batch = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}

// React hook for performance monitoring
import { useEffect, useRef, useState } from 'react';
import React from 'react';

export function usePerformance(componentName: string): void {
  const renderCount = useRef(0);
  const renderStart = useRef<number>(0);
  
  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - renderStart.current;
    
    performanceMonitor.recordMetric(`${componentName}_render_count`, renderCount.current);
    performanceMonitor.recordMetric(`${componentName}_render_time`, renderTime);
    
    return () => {
      renderStart.current = performance.now();
    };
  });
}

// React hook for intersection observer
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  
  return isIntersecting;
}

// React hook for lazy loading
export function useLazyLoad<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await loadFunction();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    load();
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return { data, loading, error };
}

// Optimize bundle size by removing unused exports in production
if (process.env.NODE_ENV === 'production') {
  // Tree-shaking will remove these in production
  module.exports = {
    performanceMonitor,
    measureWebVitals,
    debounce,
    throttle,
    lazyLoadImages,
    apiCache,
    deduplicateRequest,
    calculateVisibleItems,
    BatchProcessor,
  };
}
