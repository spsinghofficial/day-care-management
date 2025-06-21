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
    pathname.startsWith('/select-tenant') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = extractSubdomain(host);

  // If no subdomain and trying to access tenant-specific routes, redirect to tenant selection
  if (!subdomain && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/select-tenant', request.url));
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