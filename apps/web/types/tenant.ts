import type { Daycare } from '@repo/shared-types';

export interface TenantContext {
  daycare: Daycare | null;
  subdomain: string | null;
  isValidTenant: boolean;
}

export interface TenantAwareRequest {
  tenant: TenantContext;
}

export interface TenantConfig {
  subdomain: string;
  domain?: string;
  customDomain?: boolean;
}