import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import ClientProvider from '@/components/ClientProvider';
import ReduxProvider from '@/components/providers/ReduxProvider';
import { TranslationProvider } from '@/i18n/TranslationProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import { i18nConfig, type Locale, isValidLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'Saudi Legal AI v2.0',
  description: 'AI-powered legal consultation platform for Saudi Arabia',
  keywords: 'legal, AI, Saudi Arabia, consultation, law firm',
};

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  
  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const font = locale === 'ar' ? notoSansArabic : inter;

  return (
    <html lang={locale} dir={dir}>
      <body className={font.className}>
        <ReduxProvider>
          <TranslationProvider>
            <ClientProvider>
              <ThemeProvider>
                <ThemeRegistry>
                  {children}
                  <div suppressHydrationWarning={true}>
                    <ToastContainer
                      position={locale === 'ar' ? 'top-left' : 'top-right'}
                      autoClose={3000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={locale === 'ar'}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                    />
                  </div>
                </ThemeRegistry>
              </ThemeProvider>
            </ClientProvider>
          </TranslationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
