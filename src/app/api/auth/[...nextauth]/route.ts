/**
 * NextAuth API Route Handler
 *
 * This file sets up the authentication endpoints at /api/auth/*
 * All NextAuth routes (signin, signout, callback, etc.) are handled here
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
