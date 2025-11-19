/**
 * NextAuth Configuration with Google OAuth
 *
 * Features:
 * - Google OAuth provider with optional domain restriction
 * - Email whitelist enforcement (invitation-only access)
 * - User status validation (active, suspended, invited)
 * - Session management with user role and permissions
 */

import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail, updateUserLastLogin } from '@/features/auth/services/userService';
import { User } from '@/features/auth/types';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Manually configure endpoints to bypass OIDC discovery (fixes WSL2 timeout issues)
      wellKnown: undefined,
      issuer: 'https://accounts.google.com',
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
          // Optional: Restrict to specific domain (e.g., @lipscomb.edu)
          ...(process.env.ALLOWED_EMAIL_DOMAIN && {
            hd: process.env.ALLOWED_EMAIL_DOMAIN,
          }),
        },
      },
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
      jwks_endpoint: 'https://www.googleapis.com/oauth2/v3/certs',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Sign In Callback - Whitelist-based access control
     *
     * Checks if user exists in database and has appropriate status
     * before allowing authentication.
     */
    async signIn({ user, account, profile }) {
      try {
        const email = user.email;

        if (!email) {
          console.error('Sign-in attempt with no email');
          return false;
        }

        // Check if user exists in database (whitelist)
        const dbUser = await getUserByEmail(email);

        if (!dbUser) {
          console.log(`Access denied: ${email} not in whitelist`);
          return '/api/auth/error?error=AccessDenied';
        }

        // Check user status
        if (dbUser.status === 'suspended') {
          console.log(`Access denied: ${email} account suspended`);
          return '/api/auth/error?error=AccountSuspended';
        }

        // Update last login timestamp
        if (account?.provider === 'google') {
          await updateUserLastLogin(dbUser.id, account.providerAccountId);
        }

        return true;
      } catch (error) {
        console.error('Sign-in callback error:', error);
        return false;
      }
    },

    /**
     * JWT Callback - Add user data to token
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    /**
     * Session Callback - Add user info to session
     *
     * Fetches fresh user data from database and adds to session.
     * This ensures role/permission changes are reflected immediately.
     */
    async session({ session, token }) {
      try {
        if (token.email) {
          const dbUser = await getUserByEmail(token.email as string);

          if (dbUser) {
            session.user = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              image: dbUser.avatar,
              role: dbUser.role,
              department: dbUser.department,
              status: dbUser.status,
            };
          }
        }
      } catch (error) {
        console.error('Session callback error:', error);
      }

      return session;
    },

    /**
     * Redirect Callback - Custom redirect logic
     *
     * Redirects to dashboard after successful sign-in.
     */
    async redirect({ url, baseUrl }) {
      // If redirecting to API sign-in, always send to dashboard
      if (url === `${baseUrl}/api/auth/signin` || url === '/api/auth/signin') {
        return `${baseUrl}/dashboard`;
      }
      // Don't redirect if already on other auth pages
      if (url.includes('/api/auth')) {
        return url;
      }

      // Redirect to dashboard after successful sign-in from root
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }

      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Default to dashboard for successful authentication
      return `${baseUrl}/dashboard`;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};
