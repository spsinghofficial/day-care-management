import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { getSSOProvider } from './providers';
import { getCurrentTenant } from './tenant';
import type { AuthUser, UserRole } from '@repo/shared-types';

export const authOptions: NextAuthOptions = {
  providers: [getSSOProvider().getProvider()],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Verify user belongs to the current tenant
      const tenant = await getCurrentTenant();
      
      if (!tenant) {
        return false; // No valid tenant found
      }

      // In a real implementation, verify user belongs to this daycare
      // For now, allow all users
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Get user details from your API
        const userDetails = await fetchUserDetails(user.email!);
        
        if (userDetails) {
          token.userId = userDetails.id;
          token.role = userDetails.role;
          token.daycareId = userDetails.daycareId;
          token.firstName = userDetails.firstName;
          token.lastName = userDetails.lastName;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add custom fields to session
      const authUser: AuthUser = {
        id: token.userId as string,
        email: token.email!,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as UserRole,
        daycareId: token.daycareId as string | undefined,
      };

      return {
        ...session,
        user: authUser,
      };
    },

    async redirect({ url, baseUrl }) {
      // Handle tenant-aware redirects
      const tenant = await getCurrentTenant();
      
      if (tenant) {
        // Redirect to tenant-specific URL
        return `${baseUrl}/dashboard`;
      }
      
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

async function fetchUserDetails(email: string): Promise<AuthUser | null> {
  try {
    // This would call your API to get user details
    const response = await fetch(`${process.env.API_BASE_URL}/api/users/by-email/${email}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data as AuthUser;
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return null;
  }
}