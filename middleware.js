import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'ur'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Custom middleware function to handle authentication
export default function middleware(request) {
  // First, handle internationalization
  const response = intlMiddleware(request);
  
  // Check if the request is for admin routes
  const isAdminRoute = request.nextUrl.pathname.includes('/admin');
  
  // if (isAdminRoute) {
  //   // Check for authentication token in cookies or headers
  //   const token = request.cookies.get('auth-token')?.value || 
  //                 request.headers.get('authorization')?.replace('Bearer ', '');
    
  //   // If no token and trying to access admin routes, redirect to login
  //   if (!token) {
  //     const locale = request.nextUrl.pathname.split('/')[1] || 'en';
  //     const loginUrl = new URL(`/${locale}/login`, request.url);
  //     return NextResponse.redirect(loginUrl);
  //   }
  // }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel\\..*).*)']
};