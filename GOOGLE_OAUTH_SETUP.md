# Google OAuth Setup Guide

## Step 0.1 Complete ✅

Phase 0.1 (Configure Google OAuth Provider) has been implemented with the following files:

### Files Created/Modified:

1. **`/src/lib/auth/config.ts`** - NextAuth configuration with Google OAuth
2. **`/src/app/api/auth/[...nextauth]/route.ts`** - NextAuth API route handler
3. **`/src/types/next-auth.d.ts`** - TypeScript type extensions
4. **`/src/features/auth/types/index.ts`** - Updated user types with roles and status
5. **`/src/features/auth/services/userService.ts`** - User service placeholder
6. **`.env.local`** - Environment variables template

---

## Next Steps: Google Cloud Console Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen (if not done):
   - User Type: Internal (for organization) or External
   - App name: "LCLIMS" (or your preferred name)
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
   - Save and continue

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "LCLIMS Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL (when deployed)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Click **Create**

7. Copy the **Client ID** and **Client Secret**

### 2. Update Environment Variables

Edit `.env.local` with your credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=generate-random-secret-string-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Domain Restriction (uncomment to restrict to @lipscomb.edu)
# ALLOWED_EMAIL_DOMAIN=lipscomb.edu
```

**Generate NEXTAUTH_SECRET:**

```bash
# In terminal, run:
openssl rand -base64 32
```

### 3. Test Authentication (After Step 0.3)

Once user service is implemented in Step 0.3, you can test:

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to the sign-in page (to be created)

3. Click "Sign in with Google"

4. Should redirect to Google OAuth consent screen

5. After Google authentication:
   - If email is in whitelist → Success, redirect to app
   - If email NOT in whitelist → Access denied error
   - If account suspended → Account suspended error

---

## Current Behavior

⚠️ **Important**: Until Step 0.3 is complete, ALL sign-in attempts will be denied because `getUserByEmail()` currently returns `null` (no users in database yet).

This is intentional to prevent unauthorized access during setup.

---

## What's Next

**Step 0.2**: Update User Model (Already done!)
**Step 0.3**: Create User Service - Implement actual database operations
**Step 0.4**: Create User Management UI - Admin interface for invitations
**Step 0.5**: Create Access Request Flow (Optional)
**Step 0.6**: Update Database Schema - Add users to db.json
**Step 0.7**: Environment Configuration - Finalize .env setup

---

## Features Implemented

✅ Google OAuth provider configuration
✅ Email whitelist checking in signIn callback
✅ User status validation (invited, active, suspended)
✅ Session management with role and department
✅ Optional domain restriction (@lipscomb.edu)
✅ NextAuth API routes
✅ TypeScript type definitions
✅ Environment variables template
✅ Updated user types (6 roles + 4 statuses)

---

## Security Notes

- Sign-in checks database whitelist before allowing access
- User status checked on every authentication
- Sessions expire after 30 days
- JWT tokens include user role and permissions
- Google handles password security
- Domain restriction available for organization-only access
