// Client-side tenant utilities (no server-side imports)

export function extractSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0];
  
  if (!hostname) {
    return null;
  }
  
  // Split by dots
  const parts = hostname.split('.');
  
  // If localhost or IP, return null
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // If subdomain.domain.com format, return subdomain
  if (parts.length >= 3) {
    return parts[0] || null;
  }
  
  return null;
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