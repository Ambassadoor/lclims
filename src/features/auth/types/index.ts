// Auth feature - Type definitions

/**
 * User Roles - Hierarchical access levels
 */
export type UserRole =
  | 'admin'
  | 'lab_manager'
  | 'instructor'
  | 'coordinator'
  | 'student_worker'
  | 'viewer';

/**
 * User Status - Account lifecycle states
 */
export type UserStatus =
  | 'invited' // Added by admin, hasn't signed in yet
  | 'active' // Has signed in at least once
  | 'suspended' // Access revoked, cannot sign in
  | 'pending'; // Requested access, awaiting approval

/**
 * User Model - Complete user information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  googleId?: string;
  avatar?: string;
  invitedBy?: string;
  invitedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session User - User data stored in session
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}
