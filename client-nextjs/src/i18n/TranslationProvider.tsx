'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { translations } from './translations';

type Locale = 'en' | 'ar';

interface TranslationContextType {
  t: (key: string) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || 'en';

  const setLocale = (newLocale: Locale) => {
    // Get current path without locale
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|ar)/, '');
    // Navigate to new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const t = useMemo(() => {
    return (key: string): string => {
      const keys = key.split('.');
      let value: any = translations[locale];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          // Handle array index access (e.g., features.0)
          if (/^\d+$/.test(k)) {
            value = value[parseInt(k, 10)];
          } else {
            value = value[k];
          }
        } else {
          return key; // Return key if translation not found
        }
      }
      
      // Handle array results (return as string)
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      
      return typeof value === 'string' ? value : key;
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      t,
      locale,
      setLocale,
      dir: locale === 'ar' ? 'rtl' as const : 'ltr' as const,
    }),
    [t, locale]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}