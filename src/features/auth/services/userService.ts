/**
 * User Service - User management operations
 *
 * Handles user CRUD operations, whitelist checking, and status management.
 * Uses ApiClient for database communication via json-server.
 */

import { ApiClient } from '@/lib/api/client';
import { User, UserRole, UserStatus } from '../types';

const apiClient = new ApiClient();

/**
 * Get user by email (for whitelist checking)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Query json-server for user by email
    const users = await apiClient.get<User[]>(`users?email=${encodeURIComponent(email)}`);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    return await apiClient.get<User>(`users/${userId}`);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    return await apiClient.get<User[]>('users');
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Update user's last login timestamp and Google ID
 */
export async function updateUserLastLogin(userId: string, googleId?: string): Promise<void> {
  try {
    const updates: Partial<User> = {
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update Google ID if provided and user doesn't have one
    if (googleId) {
      const user = await getUserById(userId);
      if (user && !user.googleId) {
        updates.googleId = googleId;
      }
    }

    // If user was invited, set status to active on first login
    const user = await getUserById(userId);
    if (user?.status === 'invited') {
      updates.status = 'active';
    }

    await apiClient.patch(`users/${userId}`, updates);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Create invited user
 */
export async function inviteUser(
  email: string,
  role: UserRole,
  department: string,
  invitedBy: string
): Promise<User> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user with invited status
    const newUser: Omit<User, 'id'> = {
      email,
      name: email.split('@')[0], // Default name from email, user can update later
      role,
      department,
      status: 'invited',
      invitedBy,
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await apiClient.post<User>('users', newUser);
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(userId: string, status: UserStatus): Promise<User> {
  try {
    const updates = {
      status,
      updatedAt: new Date().toISOString(),
    };

    return await apiClient.patch<User>(`users/${userId}`, updates);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  try {
    const updates = {
      role,
      updatedAt: new Date().toISOString(),
    };

    return await apiClient.patch<User>(`users/${userId}`, updates);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Update user department
 */
export async function updateUserDepartment(userId: string, department: string): Promise<User> {
  try {
    const updates = {
      department,
      updatedAt: new Date().toISOString(),
    };

    return await apiClient.patch<User>(`users/${userId}`, updates);
  } catch (error) {
    console.error('Error updating user department:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'avatar'>>
): Promise<User> {
  try {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return await apiClient.patch<User>(`users/${userId}`, payload);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Delete user (revoke access)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await apiClient.delete(`users/${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
