/**
 * NextAuth Type Declarations
 *
 * Extends NextAuth types to include our custom user properties
 */

import 'next-auth';
import { UserRole, UserStatus } from '@/features/auth/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      department: string;
      status: UserStatus;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role?: UserRole;
    department?: string;
    status?: UserStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    role?: UserRole;
    department?: string;
    status?: UserStatus;
  }
}
