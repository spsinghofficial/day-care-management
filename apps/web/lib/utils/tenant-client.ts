// Client-side tenant utilities (no server-side imports)

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

export function buildTenantUrlFromCurrent(subdomain: string, path: string = ''): string {
  if (typeof window === 'undefined') {
    return buildTenantUrl(subdomain, path);
  }
  
  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol;
  
  // Handle localhost specifically
  if (currentHost.startsWith('localhost') || currentHost.startsWith('127.0.0.1')) {
    // For localhost, keep the port and add subdomain as prefix
    return `${currentProtocol}//${subdomain}.${currentHost}${path}`;
  }
  
  // Extract the base domain (everything after the first subdomain)
  const hostParts = currentHost.split('.');
  let baseDomain;
  
  if (hostParts.length >= 3) {
    // Already has subdomain (e.g., existing.domain.com), extract base domain
    baseDomain = hostParts.slice(1).join('.');
  } else if (hostParts.length === 2) {
    // No subdomain (e.g., domain.com), use as is
    baseDomain = currentHost;
  } else {
    // Single domain, use as is
    baseDomain = currentHost;
  }
  
  // Build the new tenant URL
  return `${currentProtocol}//${subdomain}.${baseDomain}${path}`;
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