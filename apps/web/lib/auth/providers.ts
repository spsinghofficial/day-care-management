// For NextAuth v4, Provider type is available from the main module
import KeycloakProvider from 'next-auth/providers/keycloak';

export interface SSOProvider {
  id: string;
  name: string;
  getProvider(): any; // Using any for now since Provider type is complex in v4
}

export class KeycloakSSOProvider implements SSOProvider {
  id = 'keycloak';
  name = 'Keycloak';

  getProvider(): any {
    return KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    });
  }
}

export class OktaProvider implements SSOProvider {
  id = 'okta';
  name = 'Okta';

  getProvider(): any {
    // Future implementation for Okta
    throw new Error('Okta provider not implemented yet');
  }
}

export class EntraIDProvider implements SSOProvider {
  id = 'entra-id';
  name = 'Microsoft Entra ID';

  getProvider(): any {
    // Future implementation for Entra ID
    throw new Error('Entra ID provider not implemented yet');
  }
}

export function getSSOProvider(): SSOProvider {
  const providerType = process.env.SSO_PROVIDER || 'keycloak';
  
  switch (providerType) {
    case 'keycloak':
      return new KeycloakSSOProvider();
    case 'okta':
      return new OktaProvider();
    case 'entra-id':
      return new EntraIDProvider();
    default:
      throw new Error(`Unsupported SSO provider: ${providerType}`);
  }
}