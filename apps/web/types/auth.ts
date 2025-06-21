import type { UserRole, AuthUser } from '@repo/shared-types';

declare module 'next-auth' {
  interface Session {
    user: AuthUser;
  }

  interface JWT {
    userId: string;
    role: UserRole;
    daycareId?: string;
    firstName: string;
    lastName: string;
  }
}

export interface SessionUser extends AuthUser {
  // Add any additional session-specific user properties here
}

export interface AuthError {
  type: 'CredentialsSignin' | 'OAuthSignin' | 'OAuthCallback' | 'OAuthCreateAccount' | 'EmailCreateAccount' | 'Callback' | 'OAuthAccountNotLinked' | 'EmailSignin' | 'CredentialsSignup' | 'SessionRequired';
  message: string;
}