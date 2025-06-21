import { headers } from 'next/headers';
import type { Daycare } from '@repo/shared-types';
import { extractSubdomain } from '../utils/tenant-client';

export async function getCurrentTenant(): Promise<Daycare | null> {
  const headersList = await headers();
  const host = headersList.get('host');
  
  if (!host) return null;

  // Extract subdomain from host
  const subdomain = extractSubdomain(host);
  if (!subdomain) return null;

  // In a real implementation, this would fetch from your API/database
  // For now, return mock data
  return await fetchDaycareBySubdomain(subdomain);
}

export async function fetchDaycareBySubdomain(subdomain: string): Promise<Daycare | null> {
  try {
    // This would call your API
    const response = await fetch(`${process.env.API_BASE_URL}/api/daycares/by-subdomain/${subdomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
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

export interface TenantContext {
  daycare: Daycare | null;
  subdomain: string | null;
  isValidTenant: boolean;
}