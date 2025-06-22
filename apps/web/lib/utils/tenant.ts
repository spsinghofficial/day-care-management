import { headers } from 'next/headers';
import type { TenantContext } from '../../types/tenant';
import type { Daycare } from '@repo/shared-types';

export function extractSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0];
  
  if (!hostname) {
    return null;
  }
  
  // Split by dots
  const parts = hostname.split('.');
  
  // Handle localhost with subdomain (e.g., tenant.localhost)
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0] || null;
  }
  
  // If plain localhost or IP, return null
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // If subdomain.domain.com format, return subdomain
  if (parts.length >= 3) {
    return parts[0] || null;
  }
  
  return null;
}

export async function getTenantContext(): Promise<TenantContext> {
  const headersList = await headers();
  const host = headersList.get('host');
  
  if (!host) {
    return {
      daycare: null,
      subdomain: null,
      isValidTenant: false,
    };
  }

  const subdomain = extractSubdomain(host);
  
  if (!subdomain) {
    return {
      daycare: null,
      subdomain: null,
      isValidTenant: false,
    };
  }

  // Fetch daycare details
  const daycare = await fetchDaycareBySubdomain(subdomain);
  
  return {
    daycare,
    subdomain,
    isValidTenant: daycare !== null,
  };
}

async function fetchDaycareBySubdomain(subdomain: string): Promise<Daycare | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/api/daycares/by-subdomain/${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache daycare info
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data as Daycare;
  } catch (error) {
    console.error('Failed to fetch daycare:', error);
    return null;
  }
}

export function buildTenantUrl(subdomain: string, path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(baseUrl);
  
  // Set subdomain
  url.hostname = `${subdomain}.${url.hostname}`;
  
  // Add path
  if (path) {
    url.pathname = path;
  }
  
  return url.toString();
}

export function validateSubdomain(subdomain: string): boolean {
  // Basic validation rules for subdomain
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  
  if (!subdomainRegex.test(subdomain)) {
    return false;
  }

  // Reserved subdomains
  const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost'];
  if (reserved.includes(subdomain.toLowerCase())) {
    return false;
  }

  return true;
}