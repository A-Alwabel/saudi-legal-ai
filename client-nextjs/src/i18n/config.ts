export const i18nConfig = {
  defaultLocale: 'ar',
  locales: ['ar', 'en'] as const,
};

export type Locale = (typeof i18nConfig.locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}
