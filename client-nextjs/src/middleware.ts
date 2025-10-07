import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',          // Home page
  '',           // Root path after locale removal (e.g., /en becomes '')
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/features',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

// Check if the path is a public route
function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix if present
  const path = pathname.replace(/^\/(en|ar)/, '');
  
  // Check if it's a public route or static file
  return publicRoutes.some(route => path === route) || 
         path.startsWith('/_next') || 
         path.startsWith('/api') || 
         path.includes('.');
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;
  
  // Handle root redirect to default or preferred locale
  if (pathname === '/') {
    // Check for preferred language cookie
    const preferredLocale = request.cookies.get('preferred_locale')?.value;
    
    // If no preference, check browser language
    let defaultLocale = 'ar'; // Default to Arabic for Saudi Legal system
    
    if (preferredLocale) {
      defaultLocale = preferredLocale;
    } else {
      // Check Accept-Language header for Arabic
      const acceptLanguage = request.headers.get('accept-language') || '';
      if (acceptLanguage.includes('ar')) {
        defaultLocale = 'ar';
      } else if (acceptLanguage.includes('en')) {
        defaultLocale = 'en';
      }
      // Otherwise keeps default as 'ar'
    }
    
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }
  
  // Extract locale from pathname
  const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');
  
  // Check if user is trying to access a protected route without authentication
  // TEMPORARILY DISABLED FOR TESTING - Uncomment to re-enable auth
  // if (!isPublicRoute(pathname) && !token) {
  //   // Redirect to login page
  //   return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  // }
  
  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (token && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};