import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractSubdomain } from './lib/utils/tenant-client';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/select-tenant') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = extractSubdomain(host);

  // If no subdomain and trying to access tenant-specific routes, redirect to tenant selection
  if (!subdomain && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/parent') || pathname.startsWith('/super-admin'))) {
    return NextResponse.redirect(new URL('/select-tenant', request.url));
  }
  
  // If already on a subdomain but accessing select-tenant, redirect to dashboard
  if (subdomain && pathname === '/select-tenant') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect old /dashboard/* URLs to new clean URLs
  if (subdomain && pathname.startsWith('/dashboard/')) {
    const cleanPath = pathname.replace('/dashboard/', '/');
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  // Role-based route protection
  if (subdomain) {
    const response = await checkRoutePermissions(request, pathname);
    if (response) return response;
  }

  // If subdomain exists, validate it
  if (subdomain) {
    // In a real implementation, validate subdomain against database
    const isValidTenant = await validateTenant(subdomain);
    
    if (!isValidTenant) {
      return NextResponse.redirect(new URL('/tenant-not-found', request.url));
    }

    // Add tenant info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-tenant-subdomain', subdomain);
    return response;
  }

  return NextResponse.next();
}

async function validateTenant(subdomain: string): Promise<boolean> {
  try {
    // This would validate against your API/database
    // For now, allow all subdomains
    return true;
  } catch (error) {
    console.error('Failed to validate tenant:', error);
    return false;
  }
}

async function checkRoutePermissions(request: NextRequest, pathname: string): Promise<NextResponse | null> {
  // Skip permission check for public routes
  if (pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/auth/')) {
    return null;
  }

  // Get user info from headers or cookie (in real app, decode JWT)
  // For now, we'll check localStorage on client side through a different approach
  
  // Admin routes - only BUSINESS_ADMIN should access
  if (pathname.startsWith('/admin/')) {
    // In a real app, you'd decode the JWT token here
    // For now, we'll let the client-side handle this through the layout
    return null;
  }

  // Teacher routes - only EDUCATOR should access  
  if (pathname.startsWith('/teacher/')) {
    return null;
  }

  // Parent routes - only PARENT should access
  if (pathname.startsWith('/parent/')) {
    return null;
  }

  // Super admin routes - only SUPER_ADMIN should access
  if (pathname.startsWith('/super-admin/')) {
    return null;
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};