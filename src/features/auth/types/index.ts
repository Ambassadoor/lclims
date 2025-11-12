// Auth feature - Type definitions
export type UserRole = 'admin' | 'staff' | 'viewer';

export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  role: UserRole;
}
