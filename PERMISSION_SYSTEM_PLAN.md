# Permission System Implementation Plan

## Executive Summary

This plan outlines the implementation of a flexible, configuration-driven permission system for LCLIMS that supports 6 distinct roles with granular resource and scope-based permissions. The system will start with JSON configuration for rapid development and include a migration path to database storage with an admin UI.

---

## 1. Current State Analysis

### Existing Auth Infrastructure

- **Redux State**: `authSlice.ts` manages user authentication state
- **User Model**: Basic `User` type with simple role (`admin | staff | viewer`)
- **Auth Hook**: Placeholder `useAuth` hook exists but not fully implemented
- **No Permission System**: Currently no permission checking or authorization logic
- **NextAuth.js**: Already configured (next-auth v4.24.13 in dependencies)

### Architecture Context

- Next.js 16 App Router with React 19
- Redux Toolkit for state management
- Material-UI v7 for components
- json-server mock API (port 8088)
- Feature-based architecture (auth, inventory, locations, transactions, hardware, dashboard)

### Authentication Strategy

**Google OAuth with Whitelist-Based Access Control**

- Users authenticate via Google Sign-In (no passwords to manage)
- Only pre-approved users (email whitelist) can access the system
- Optional domain restriction (e.g., @lipscomb.edu only)
- Admin-managed user invitations
- User status tracking (invited, active, suspended)

---

## 2. Permission System Design

### 2.1 Role Hierarchy

```
Admin > Lab Manager > Instructor > Coordinator > Student Worker > Viewer
```

### 2.2 Resource-Action Model

**Resources:**

- `inventory` - Chemical inventory management
- `locations` - Storage location management
- `transactions` - Transaction logs and history
- `procedures` - Lab procedures and protocols
- `users` - User management
- `reports` - Report generation and export
- `settings` - System configuration
- `audit` - Audit log viewing

**Actions per Resource:**

- `view` - Read access
- `create` - Create new records
- `edit` - Modify existing records
- `delete` - Remove records
- Custom actions (e.g., `viewCosts`, `viewSensitive`, `export`)

### 2.3 Scope System

**Scope Levels:**

- `own` - Only resources created/owned by the user
- `assigned` - Resources explicitly assigned to the user
- `department` - Resources within user's department
- `all` - All resources in the system

### 2.4 Permission Structure (JSON Schema)

```typescript
interface Permission {
  resource: ResourceType;
  action: ActionType;
  scope: ScopeType;
  conditions?: PermissionCondition[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher = more privileged
  permissions: Permission[];
  inheritsFrom?: string; // Role ID to inherit permissions from
}

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'contains';
  value: any;
}
```

---

## 3. Implementation Steps

### Phase 0: Authentication Setup

#### Step 0.1: Configure Google OAuth Provider

**File:** `src/lib/auth/config.ts`

**Actions:**

- Set up NextAuth.js with Google provider
- Implement email whitelist checking
- Add domain restriction (optional)
- Configure session management
- Add user status validation

**Implementation:**

```typescript
// src/lib/auth/config.ts
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail } from '@/features/auth/services/userService';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: 'lipscomb.edu', // Optional: Restrict to organization domain
        },
      },
    }),
  ],

  callbacks: {
    // Whitelist-based access control
    async signIn({ user, account, profile }) {
      const dbUser = await getUserByEmail(user.email);

      // Check if user exists in database
      if (!dbUser) {
        console.log(`Access denied: ${user.email} not in whitelist`);
        return false;
      }

      // Check user status
      if (dbUser.status === 'suspended') {
        console.log(`Access denied: ${user.email} account suspended`);
        return false;
      }

      // Update last login
      await updateUserLastLogin(dbUser.id);

      return true;
    },

    // Add user info to session
    async session({ session, token }) {
      const dbUser = await getUserByEmail(session.user.email);

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.department = dbUser.department;
        session.user.status = dbUser.status;
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/auth/welcome',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

#### Step 0.2: Update User Model

**File:** `src/features/auth/types/index.ts`

**Actions:**

- Add authentication-related fields
- Add user status enum
- Add invitation tracking fields

**User Type:**

```typescript
export type UserStatus =
  | 'invited' // Added by admin, hasn't signed in yet
  | 'active' // Has signed in at least once
  | 'suspended' // Access revoked
  | 'pending'; // Requested access, awaiting approval

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
```

#### Step 0.3: Create User Service

**File:** `src/features/auth/services/userService.ts`

**Actions:**

- CRUD operations for user management
- Email whitelist checking
- User invitation workflow
- Status management

**Key Functions:**

```typescript
export const userService = {
  // Get user by email (for whitelist check)
  async getUserByEmail(email: string): Promise<User | null>,

  // Create invited user
  async inviteUser(email: string, role: UserRole, invitedBy: string): Promise<User>,

  // Update user status
  async updateUserStatus(userId: string, status: UserStatus): Promise<User>,

  // Update last login timestamp
  async updateUserLastLogin(userId: string): Promise<void>,

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]>,

  // Delete user (revoke access)
  async deleteUser(userId: string): Promise<void>
};
```

#### Step 0.4: Create User Management UI

**File:** `src/app/admin/users/page.tsx`

**Features:**

- List all users with status, role, last login
- Invite new user (email + role assignment)
- Change user role
- Suspend/reactivate users
- Delete users (revoke access)
- Filter by status, role, department
- Search by email/name

**UI Components:**

```tsx
// User list with actions
<UserTable
  users={users}
  onInvite={handleInvite}
  onChangeRole={handleChangeRole}
  onSuspend={handleSuspend}
  onDelete={handleDelete}
/>

// Invite dialog
<InviteUserDialog
  open={isOpen}
  onClose={handleClose}
  onInvite={(email, role, department) => {
    // Create user with status="invited"
  }}
/>
```

#### Step 0.5: Create Access Request Flow (Optional)

**Files:**

- `src/app/auth/request-access/page.tsx` - Public request form
- `src/app/admin/access-requests/page.tsx` - Admin approval page

**Flow:**

1. User visits public request page
2. Enters email, name, reason for access
3. Request stored in `accessRequests` collection
4. Admin gets notification
5. Admin approves → User created with invited status
6. User gets email, can now sign in with Google

#### Step 0.6: Update Database Schema

**File:** `db.json` (json-server)

**Add Collections:**

```json
{
  "users": [
    {
      "id": "1",
      "email": "admin@lipscomb.edu",
      "name": "Admin User",
      "role": "admin",
      "department": "chemistry",
      "status": "active",
      "googleId": "google-123456",
      "avatar": "https://...",
      "invitedBy": null,
      "invitedAt": "2025-01-01T00:00:00Z",
      "lastLoginAt": "2025-11-18T10:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-11-18T10:00:00Z"
    }
  ],
  "accessRequests": [
    {
      "id": "1",
      "email": "user@lipscomb.edu",
      "name": "John Doe",
      "reason": "Need access for Chemistry 101 course",
      "status": "pending",
      "requestedAt": "2025-11-18T09:00:00Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "reviewNotes": null
    }
  ]
}
```

#### Step 0.7: Environment Configuration

**File:** `.env.local`

**Required Variables:**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_SECRET=generate-random-secret-string
NEXTAUTH_URL=http://localhost:3000

# Optional: Domain restriction
ALLOWED_EMAIL_DOMAIN=lipscomb.edu
```

**Setup Instructions:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

---

### Phase 1: Core Permission Infrastructure

#### Step 1.1: Update Type Definitions

**File:** `src/features/auth/types/index.ts`

**Actions:**

- Expand `UserRole` type to include all 6 roles
- Add `Department` type
- Create comprehensive permission type definitions
- Add `PermissionConfig`, `Permission`, `Role`, `Scope` interfaces

**Code Structure:**

```typescript
export type UserRole =
  | 'admin'
  | 'lab_manager'
  | 'instructor'
  | 'coordinator'
  | 'student_worker'
  | 'viewer';

export type ResourceType =
  | 'inventory'
  | 'locations'
  | 'transactions'
  | 'procedures'
  | 'users'
  | 'reports'
  | 'settings'
  | 'audit';

export type ActionType =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'viewCosts'
  | 'viewSensitive'
  | 'export'
  | 'viewAll'
  | 'viewOwn';

export type ScopeType = 'own' | 'assigned' | 'department' | 'all';
```

#### Step 1.2: Create Permission Configuration File

**File:** `src/lib/auth/permissions.config.ts`

**Actions:**

- Define default permission configuration for all 6 roles
- Include permission inheritance structure
- Document each role's capabilities

#### Step 1.3: Create Permission Utility Functions

**File:** `src/lib/auth/permissions.ts`

**Key Functions:**

```typescript
hasPermission(
  user: User,
  resource: ResourceType,
  action: ActionType,
  context?: PermissionContext
): boolean

hasAnyPermission(
  user: User,
  checks: PermissionCheck[]
): boolean

getRolePermissions(role: UserRole): Permission[]

hasScopeAccess(
  user: User,
  scope: ScopeType,
  resourceOwnerId?: string
): boolean

filterByPermissions<T>(
  user: User,
  data: T[],
  resource: ResourceType
): T[]
```

#### Step 1.4: Create Permission Context Provider

**File:** `src/lib/auth/PermissionProvider.tsx`

**Structure:**

```typescript
interface PermissionContextValue {
  can: (resource: ResourceType, action: ActionType, context?: PermissionContext) => boolean;
  canAny: (checks: PermissionCheck[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  getPermissions: () => Permission[];
  isLoading: boolean;
}

export const PermissionProvider: React.FC<{ children: React.ReactNode }>;
```

#### Step 1.5: Create Permission Hooks

**File:** `src/features/auth/hooks/usePermissions.ts`

**Hooks:**

```typescript
// General permission hook
export function usePermissions(): {
  can: (resource: ResourceType, action: ActionType, context?) => boolean;
  canAny: (checks: PermissionCheck[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  loading: boolean;
};

// Resource-specific hook
export function useResourcePermissions(resource: ResourceType): {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  actions: Record<ActionType, boolean>;
};

// Field-level permissions
export function useFieldPermissions(
  resource: ResourceType,
  field: string
): {
  canView: boolean;
  canEdit: boolean;
};
```

#### Step 1.6: Update Auth Slice

**File:** `src/features/auth/store/authSlice.ts`

**New State:**

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionsLoaded: boolean;
  department?: string;
}

// New selectors
export const selectUserPermissions = (state: RootState) =>
  state.auth.user ? getRolePermissions(state.auth.user.role) : [];

export const selectCanAccess = (resource: ResourceType, action: ActionType) => (state: RootState) =>
  hasPermission(state.auth.user, resource, action);
```

---

### Phase 2: UI Components for Permission Control

#### Step 2.1: Create Permission Guard Components

**File:** `src/features/auth/components/PermissionGuard.tsx`

**Component API:**

```tsx
<PermissionGuard resource="inventory" action="edit" fallback={<AccessDenied />} showFallback={true}>
  <EditButton />
</PermissionGuard>
```

#### Step 2.2: Create Role Guard Component

**File:** `src/features/auth/components/RoleGuard.tsx`

```tsx
<RoleGuard allowedRoles={['admin', 'lab_manager']} fallback={<Unauthorized />}>
  <AdminPanel />
</RoleGuard>
```

#### Step 2.3: Create Permission-Aware UI Components

**Files:**

- `src/features/auth/components/ProtectedButton.tsx`
- `src/features/auth/components/ProtectedMenuItem.tsx`
- `src/features/auth/components/ConditionalRender.tsx`

```tsx
<ProtectedButton resource="inventory" action="delete" onClick={handleDelete} hideIfDisabled>
  Delete
</ProtectedButton>
```

#### Step 2.4: Create Permission Display Components

**File:** `src/features/auth/components/PermissionBadge.tsx`

---

### Phase 3: Integration with Existing Features

#### Step 3.1: Inventory Feature Integration

**Files to modify:**

- `src/features/inventory/components/InventoryTable.tsx`
- `src/features/inventory/components/ChemicalFormDialog.tsx`
- `src/features/inventory/components/MultiEditForm.tsx`

**Example Integration:**

```tsx
const { can } = usePermissions();
const { canEdit, canDelete, canView } = useResourcePermissions('inventory');

const columns = [
  { field: 'name', headerName: 'Name' },
  ...(can('inventory', 'viewCosts') ? [{ field: 'cost', headerName: 'Cost' }] : []),
  {
    field: 'actions',
    renderCell: (params) => (
      <>
        {canEdit && <IconButton onClick={() => handleEdit(params.row)} />}
        {canDelete && <IconButton onClick={() => handleDelete(params.row)} />}
      </>
    ),
  },
];
```

#### Step 3.2: Locations Feature Integration

**Files to modify:**

- `src/features/locations/components/LocationManager.tsx`
- `src/features/locations/components/LocationFormDialog.tsx`

#### Step 3.3: Transactions Feature Integration

**Files to modify:**

- `src/features/transactions/components/TransactionLog.tsx`

#### Step 3.4: Dashboard Feature Integration

**Files to modify:**

- `src/features/dashboard/components/DashboardStats.tsx`

#### Step 3.5: Navigation/Sidebar Integration

**Files to modify:**

- `src/shared/components/layout/Navbar.tsx`

**Example:**

```tsx
const menuItems = [
  { label: 'Dashboard', path: '/dashboard', resource: 'dashboard', action: 'view' },
  { label: 'Inventory', path: '/inventory', resource: 'inventory', action: 'view' },
  { label: 'Users', path: '/users', resource: 'users', action: 'view' },
  { label: 'Settings', path: '/settings', resource: 'settings', action: 'view' },
].filter((item) => can(item.resource, item.action));
```

---

### Phase 4: API Integration

#### Step 4.1: Update API Client

**File:** `src/lib/api/client.ts`

**Actions:**

- Add permission context to API requests
- Include user role and department in headers
- Handle 403 Forbidden responses
- Add permission error handling

#### Step 4.2: Create Permission API Endpoints (json-server)

**File:** `db.json` (add new collections)

**Structure:**

```json
{
  "users": [
    {
      "id": "1",
      "email": "admin@lipscomb.edu",
      "name": "Admin User",
      "role": "admin",
      "department": "chemistry"
    }
  ],
  "roles": [...],
  "userPermissions": [...]
}
```

#### Step 4.3: Create Permission Service

**File:** `src/features/auth/services/permissionService.ts`

---

### Phase 5: Database Migration Path

#### Step 5.1: Design Database Schema

**File:** `docs/database/permissions-schema.sql`

**Schema:**

```sql
CREATE TABLE roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL,
  inherits_from VARCHAR(50) REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(20) NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(20) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100)
);
```

#### Step 5.2: Create Migration Utility

**File:** `src/lib/auth/migratePermissions.ts`

#### Step 5.3: Update Permission Service for Database

**File:** `src/features/auth/services/permissionService.ts`

---

### Phase 6: Admin UI for Permission Management

#### Step 6.1: Create Role Management Page

**File:** `src/app/admin/roles/page.tsx`

**Features:**

- List all roles with descriptions
- View permissions for each role
- Edit role metadata
- Create new roles
- Delete custom roles

#### Step 6.2: Create Permission Editor Component

**File:** `src/features/auth/components/PermissionEditor.tsx`

**Features:**

- Grid/matrix view of resources × actions
- Toggle permissions on/off
- Set scope for each permission
- Add conditional rules
- Visual inheritance indicator

#### Step 6.3: Create User Permission Override UI

**File:** `src/app/admin/users/[id]/permissions/page.tsx`

#### Step 6.4: Create Permission Testing Tool

**File:** `src/features/auth/components/PermissionTester.tsx`

---

### Phase 7: Testing & Documentation

#### Step 7.1: Unit Tests

**Files:**

- `src/lib/auth/__tests__/permissions.test.ts`
- `src/features/auth/hooks/__tests__/usePermissions.test.ts`

#### Step 7.2: Integration Tests

**Files:**

- `src/features/inventory/__tests__/permissionIntegration.test.tsx`
- `src/features/auth/__tests__/PermissionGuard.test.tsx`

#### Step 7.3: Create Documentation

**File:** `PERMISSION_SYSTEM.md`

---

## 4. Detailed Permission Configuration Examples

### 4.1 Admin Role

```typescript
{
  id: 'admin',
  name: 'Administrator',
  description: 'Full system access with all permissions',
  priority: 100,
  permissions: [
    { resource: '*', action: '*', scope: 'all' }
  ]
}
```

### 4.2 Lab Manager Role

```typescript
{
  id: 'lab_manager',
  name: 'Lab Manager',
  description: 'Manages lab operations, inventory, and staff',
  priority: 80,
  permissions: [
    { resource: 'inventory', action: 'view', scope: 'all' },
    { resource: 'inventory', action: 'create', scope: 'all' },
    { resource: 'inventory', action: 'edit', scope: 'all' },
    { resource: 'inventory', action: 'delete', scope: 'all' },
    { resource: 'inventory', action: 'viewCosts', scope: 'all' },
    { resource: 'locations', action: 'view', scope: 'all' },
    { resource: 'locations', action: 'create', scope: 'all' },
    { resource: 'locations', action: 'edit', scope: 'all' },
    { resource: 'locations', action: 'delete', scope: 'all' },
    { resource: 'transactions', action: 'view', scope: 'all' },
    { resource: 'transactions', action: 'create', scope: 'all' },
    { resource: 'transactions', action: 'viewAll', scope: 'all' },
    { resource: 'procedures', action: 'view', scope: 'all' },
    { resource: 'procedures', action: 'create', scope: 'all' },
    { resource: 'procedures', action: 'edit', scope: 'all' },
    { resource: 'procedures', action: 'delete', scope: 'all' },
    { resource: 'users', action: 'view', scope: 'department' },
    { resource: 'users', action: 'edit', scope: 'department' },
    { resource: 'reports', action: 'generate', scope: 'all' },
    { resource: 'reports', action: 'export', scope: 'all' },
    { resource: 'settings', action: 'view', scope: 'all' },
    { resource: 'audit', action: 'view', scope: 'all' }
  ]
}
```

### 4.3 Instructor Role

```typescript
{
  id: 'instructor',
  name: 'Instructor',
  description: 'Manages courses, procedures, and assigned inventory',
  priority: 60,
  permissions: [
    { resource: 'inventory', action: 'view', scope: 'all' },
    { resource: 'inventory', action: 'edit', scope: 'assigned' },
    { resource: 'inventory', action: 'create', scope: 'assigned' },
    { resource: 'locations', action: 'view', scope: 'all' },
    { resource: 'locations', action: 'edit', scope: 'own' },
    { resource: 'transactions', action: 'view', scope: 'assigned' },
    { resource: 'transactions', action: 'create', scope: 'assigned' },
    { resource: 'procedures', action: 'view', scope: 'all' },
    { resource: 'procedures', action: 'create', scope: 'own' },
    { resource: 'procedures', action: 'edit', scope: 'own' },
    { resource: 'procedures', action: 'delete', scope: 'own' },
    { resource: 'procedures', action: 'viewOwn', scope: 'own' },
    { resource: 'reports', action: 'generate', scope: 'assigned' },
    { resource: 'settings', action: 'view', scope: 'all' }
  ]
}
```

### 4.4 Coordinator Role

```typescript
{
  id: 'coordinator',
  name: 'Coordinator',
  description: 'Coordinates lab activities and assists with inventory',
  priority: 50,
  permissions: [
    { resource: 'inventory', action: 'view', scope: 'all' },
    { resource: 'inventory', action: 'edit', scope: 'assigned' },
    { resource: 'locations', action: 'view', scope: 'all' },
    { resource: 'transactions', action: 'view', scope: 'own' },
    { resource: 'transactions', action: 'create', scope: 'own' },
    { resource: 'procedures', action: 'view', scope: 'all' },
    { resource: 'procedures', action: 'edit', scope: 'own' },
    { resource: 'reports', action: 'generate', scope: 'own' }
  ]
}
```

### 4.5 Student Worker Role

```typescript
{
  id: 'student_worker',
  name: 'Student Worker',
  description: 'Basic lab access for inventory tasks',
  priority: 30,
  permissions: [
    { resource: 'inventory', action: 'view', scope: 'all' },
    { resource: 'inventory', action: 'edit', scope: 'assigned',
      conditions: [{ field: 'Status', operator: 'in', value: ['Available', 'In Use'] }]
    },
    { resource: 'locations', action: 'view', scope: 'all' },
    { resource: 'transactions', action: 'view', scope: 'own' },
    { resource: 'transactions', action: 'create', scope: 'own' },
    { resource: 'procedures', action: 'view', scope: 'all' }
  ]
}
```

### 4.6 Viewer Role

```typescript
{
  id: 'viewer',
  name: 'Viewer',
  description: 'Read-only access to inventory and reports',
  priority: 10,
  permissions: [
    { resource: 'inventory', action: 'view', scope: 'all' },
    { resource: 'locations', action: 'view', scope: 'all' },
    { resource: 'procedures', action: 'view', scope: 'all' },
    { resource: 'reports', action: 'view', scope: 'all' }
  ]
}
```

---

## 5. Code Architecture & File Organization

```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── PermissionGuard.tsx
│       │   ├── RoleGuard.tsx
│       │   ├── ProtectedButton.tsx
│       │   ├── ProtectedMenuItem.tsx
│       │   ├── ConditionalRender.tsx
│       │   ├── PermissionBadge.tsx
│       │   ├── PermissionEditor.tsx
│       │   ├── PermissionMatrix.tsx
│       │   └── PermissionTester.tsx
│       ├── hooks/
│       │   ├── usePermissions.ts
│       │   ├── useResourcePermissions.ts
│       │   └── useFieldPermissions.ts
│       ├── services/
│       │   └── permissionService.ts
│       ├── store/
│       │   └── authSlice.ts [UPDATE]
│       └── types/
│           └── index.ts [UPDATE]
│
├── lib/
│   └── auth/
│       ├── permissions.config.ts
│       ├── permissions.ts
│       ├── PermissionProvider.tsx
│       ├── migratePermissions.ts
│       └── __tests__/
│
├── app/
│   └── admin/
│       ├── roles/
│       │   ├── page.tsx
│       │   └── [roleId]/page.tsx
│       └── users/
│           └── [userId]/permissions/page.tsx
│
└── PERMISSION_SYSTEM.md
```

---

## 6. Migration Strategy (JSON → Database)

### Phase A: JSON-Only (Weeks 1-3)

- All permissions stored in `permissions.config.ts`
- Fast iteration and testing
- No database setup required

### Phase B: Dual Mode (Weeks 4-5)

- Permissions can load from JSON or database
- Environment variable: `PERMISSION_SOURCE=json|db`
- Test database queries

### Phase C: Database Primary (Week 6+)

- Database becomes primary source
- JSON for seeding/defaults only
- Admin UI enables runtime changes

---

## 7. Performance Considerations

### Optimization Strategies:

1. **Permission Caching**
   - Cache user permissions in Redux store
   - Invalidate on role change
   - Use React.memo for wrapped components

2. **Lazy Loading**
   - Load permissions only on authentication
   - Code split admin UI

3. **Computed Permissions**
   - Pre-compute common checks
   - Use reselect for memoized selectors

4. **Batch Checks**
   - Use `hasAnyPermission` for multiple checks
   - Reduce redundant evaluations

5. **Database Optimization**
   - Index resource + action columns
   - Cache database queries
   - Redis cache for production

---

## 8. Security Considerations

### Authentication Security

**Email Whitelist Enforcement:**

- All sign-in attempts validate against database before granting access
- No open registration - only invited users can access
- Optional domain restriction (@lipscomb.edu only)
- Session management via secure JWT tokens
- Google handles password security (no passwords to manage)

**User Status Controls:**

- Suspended users immediately blocked from sign-in
- Real-time status checking on every authentication
- Admin can revoke access instantly
- Audit trail of all user invitations and status changes

### Backend Enforcement (Critical)

- **Never trust frontend permission checks alone**
- Always validate permissions on API endpoints
- Include user context (role, department, status) in JWT tokens
- Verify permissions before database operations
- Validate user status on every API request

### API Security:

```typescript
export async function requirePermission(resource: ResourceType, action: ActionType) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req);
    if (!hasPermission(user, resource, action)) {
      return new Response('Forbidden', { status: 403 });
    }
  };
}
```

---

## 9. Rollout Plan

### Week 1: Authentication Setup

- ✅ Configure Google OAuth provider
- ✅ Set up NextAuth.js with whitelist checking
- ✅ Create user service (CRUD operations)
- ✅ Build user management UI (invite, suspend, delete)
- ✅ Set up database schema for users
- ✅ Test sign-in flow with whitelist

### Week 2-3: Permission Foundation

- ✅ Core permission types and utilities
- ✅ JSON configuration for all 6 roles
- ✅ Basic permission hooks
- ✅ Update auth slice with permissions
- ✅ Permission context provider

### Week 4-5: UI Integration

- ✅ PermissionGuard components
- ✅ Integrate with Inventory feature
- ✅ Integrate with Locations feature
- ✅ Integrate with Transactions feature
- ✅ Update navigation with permission checks

### Week 6-7: API & Database

- ✅ Update API client for permissions
- ✅ Database schema for permissions
- ✅ Migration scripts
- ✅ Dual-mode service (JSON/DB)
- ✅ Backend permission enforcement

### Week 8-9: Admin UI

- ✅ Role management page
- ✅ Permission editor matrix
- ✅ User permission overrides
- ✅ Permission testing tool
- ✅ Access request workflow (optional)

### Week 10: Testing & Polish

- ✅ Unit tests (auth, permissions)
- ✅ Integration tests
- ✅ Security audit (whitelist, permissions)
- ✅ Documentation
- ✅ Performance optimization

### Week 11: Deployment

- ✅ Google OAuth setup (production)
- ✅ Staging deployment
- ✅ User acceptance testing
- ✅ Admin training (user management)
- ✅ Production deployment
- ✅ Monitor authentication and permissions

---

## 10. Success Metrics

### Technical Metrics:

- Permission check latency < 5ms (p95)
- Zero permission bypass incidents
- 100% test coverage
- Admin UI loads < 1s

### User Metrics:

- Self-service role management
- Users understand access level
- Zero unauthorized access attempts
- Zero non-whitelisted sign-ins
- Weekly admin UI usage for user management
- < 5 minute user invitation workflow

### Business Metrics:

- 80% reduction in permission support tickets
- Self-service role management
- Compliance audit support
- Scale to 100+ users

---

## 11. Future Enhancements (Post-MVP)

1. **Time-Based Permissions** - Temporary elevated access
2. **Resource-Level Permissions** - Per-item overrides
3. **Permission Groups** - Custom bundles
4. **Approval Workflows** - Request elevated permissions
5. **Advanced Conditions** - Time/IP restrictions
6. **Analytics** - Usage reports and insights

---

## 12. Risk Mitigation

### Risk: Unauthorized Access (Non-Whitelisted Users)

**Mitigation:**

- Whitelist check in NextAuth signIn callback (server-side)
- User status validation on every authentication
- Domain restriction for additional security
- Audit logging of all sign-in attempts
- Immediate session invalidation for suspended users

### Risk: Permission Bypass

**Mitigation:** Backend enforcement, security audits, penetration testing, JWT validation

### Risk: Performance Degradation

**Mitigation:** Caching, monitoring, optimization, CDN, session management

### Risk: Complex Logic

**Mitigation:** Simple model, testing, clear errors, permission testing tool

### Risk: Migration Issues

**Mitigation:** Testing, rollback plan, dual-mode, validation

### Risk: Google OAuth Outage

**Mitigation:**

- Monitor Google OAuth status
- Graceful error handling
- Clear user communication
- Consider backup authentication method for admins
- Session persistence (users stay logged in during outages)

---

## Conclusion

This implementation provides a complete, extensible, data-driven permission system for LCLIMS with secure Google OAuth authentication and whitelist-based access control. The phased approach allows incremental development while maintaining flexibility for future enhancements.

**Key Benefits:**

**Authentication:**

- ✅ Secure Google OAuth (no passwords to manage)
- ✅ Whitelist-based access control (invitation-only)
- ✅ Optional domain restriction (@lipscomb.edu)
- ✅ Real-time user status management (suspend/reactivate)
- ✅ Admin-managed user invitations

**Permissions:**

- ✅ Zero code changes for permission updates
- ✅ 6 distinct roles with granular control
- ✅ Scope-based access (own, assigned, department, all)
- ✅ Per-user permission overrides (grant/revoke)
- ✅ Easy to test and maintain
- ✅ Self-service admin UI
- ✅ Performance-optimized with caching
- ✅ Security-first design with backend enforcement

**User Management:**

- ✅ Simple invitation workflow
- ✅ Role assignment during invitation
- ✅ Status tracking (invited, active, suspended)
- ✅ Access request system (optional)
- ✅ Audit trail of all changes
