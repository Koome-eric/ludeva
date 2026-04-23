# Conditional Onboarding Flow Documentation

## Overview

This document explains the complete conditional onboarding flow implemented in your Next.js app with Clerk authentication and Prisma database.

## Architecture

### Key Components

1. **Clerk Authentication**: Manages user authentication (sign-up, sign-in)
2. **Prisma Database**: Stores user records with `onboardingCompleted` flag
3. **Next.js Middleware**: Controls route access based on onboarding status
4. **API Endpoints**: Verify user status and database consistency
5. **Server Components**: Enforce protection on protected pages

---

## Flow Diagrams

### New User (First-Time Sign Up)

```
┌─────────────────┐
│   User clicks   │
│ "Start Investing"
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /sign-up page (Clerk)       │
│ - User fills form           │
│ - Clerk creates auth user   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PostSignupRedirect Component    │
│ - Calls /api/auth/check-user    │
│ - User doesn't exist in DB      │
│ - Redirects to onboarding       │
└────────┬──────────────────────┬─┘
         │                      │
         ▼                      ▼
    [NO]                       [YES]
         │                      │
    Onboarding              Onboarded?
         │                      │
         ▼                      ▼
  /onboarding/investment   /member/dashboard
```

### Existing User (Returning Login)

```
┌─────────────────┐
│  User clicks    │
│  "Sign In"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /sign-in page (Clerk)       │
│ - User logs in              │
│ - Clerk authenticates       │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Middleware checks JWT metadata   │
│ - Reads onboardingCompleted flag │
└────────┬─────────────────────────┘
         │
    ┌────┴─────────┐
    │              │
    ▼              ▼
[YES]           [NO]
    │              │
    │              ▼
    │        /onboarding/investment
    │
    ▼
/member/dashboard
```

---

## Detailed Flow Implementation

### 1. Sign-Up Page (`/src/app/sign-up/[[...sign-up]]/page.tsx`)

```tsx
- Displays Clerk SignUp component
- After successful signup, PostSignupRedirect component renders
- PostSignupRedirect checks database and redirects accordingly
```

### 2. PostSignupRedirect Component (`/src/components/PostSignupRedirect.tsx`)

**What it does:**
- Runs after user completes Clerk signup
- Calls `/api/auth/check-user` to check database
- Returns: `{ exists: boolean, onboardingCompleted: boolean }`
- Redirects based on response

**Redirect Logic:**
- User doesn't exist in DB → `/onboarding/investment`
- User exists but not onboarded → `/onboarding/investment`
- User exists and onboarded → `/member/dashboard`

### 3. Check User API (`/src/app/api/auth/check-user.ts`)

**Purpose:** Verify user exists in database and get their status

**Request:**
```json
POST /api/auth/check-user
{
  "clerkId": "user_123"
}
```

**Response:**
```json
{
  "exists": true,
  "onboardingCompleted": true
}
```

### 4. Onboarding Form (`/src/app/onboarding/investment/page.tsx`)

**What happens:**
- User fills out their profile (name, email, phone, ID, investment amount)
- Form is pre-populated with data from Clerk (email, name)
- On submit, calls `completeOnboarding()` server action

### 5. Complete Onboarding Action (`/src/app/onboarding/investment/actions.ts`)

**Step-by-step process:**

```typescript
1. Verify user is authenticated via Clerk
2. Validate form data with Zod schema
3. Check if user already exists in database
   - If exists: Update existing record
   - If not exists: Create new User record
4. Set onboardingCompleted = true in Prisma
5. Update Clerk's public metadata:
   - onboardingCompleted: true
   - role: MEMBER
   - dbId: user's database ID
6. Revalidate cache paths
7. Return { success: true }
```

### 6. Middleware (`/src/middleware.ts`)

**Route Protection Logic:**

```typescript
// 1. Unauthenticated users
if (!userId && !isPublicRoute) → redirect to /sign-in

// 2. Public routes (accessible without login)
/, /about, /mmf, /contact, /sign-in, /sign-up

// 3. Admin routes (only for admins)
/admin/* → only if role = ADMIN

// 4. Member routes (only if onboarded)
/member/* → redirect to /onboarding if not onboarded

// 5. Onboarding routes (only if not onboarded)
/onboarding/* → redirect to /member/dashboard if already onboarded

// 6. Database sync (optional safety check)
- Occasionally verifies database state matches JWT claims
```

### 7. Protected Route Components (`/src/lib/auth-guard.ts`)

**Utility Functions:**

```typescript
// For protected pages - redirects if not onboarded
await requireOnboardingComplete()

// For getting current user without redirect
await getCurrentUserIfOnboarded()

// For admin-only pages
await requireAdmin()

// Check if user is admin
await isUserAdmin()
```

---

## Database Schema

```prisma
model User {
  id                  String   @id @map("_id") @default(auto()) @db.ObjectId
  clerkId             String   @unique          // Links to Clerk user
  email               String   @unique
  fullName            String?
  phone               String?
  nationalId          String?
  role                Role     @default(MEMBER)  // ADMIN or MEMBER
  onboardingCompleted Boolean  @default(false)   // KEY FLAG
  
  investments         Investment[]
  payments            Payment[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum Role {
  ADMIN
  MEMBER
}
```

---

## Key Implementation Details

### Why Two Onboarding Status Checks?

1. **Clerk JWT Metadata** (Fast, used in middleware)
   - Updated immediately after onboarding
   - Read from JWT claims, no database query
   - Used for quick route protection

2. **Prisma Database** (Authoritative, used on protected pages)
   - Single source of truth
   - Verified on every protected route
   - Prevents edge cases where JWT and DB are out of sync

### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| New user completes signup | → Onboarding page |
| New user skips onboarding | → Can't access dashboard (middleware blocks) |
| User completes onboarding | → Dashboard on next page load |
| User refreshes after onboarding | → Dashboard (middleware reads JWT) |
| User tries to re-onboard | → Redirected to dashboard |
| User's JWT expires | → Middleware verifies with database |
| Database out of sync with JWT | → Uses database as source of truth |

---

## Implementation Checklist

✅ Schema: `clerkId` field (not `clerkUserId`)
✅ PostSignupRedirect component
✅ `/api/auth/check-user` endpoint
✅ Enhanced onboarding actions with error handling
✅ Updated middleware with database sync
✅ Auth guard utilities (`/src/lib/auth-guard.ts`)
✅ Sign-up page includes PostSignupRedirect
✅ Dashboard uses `requireOnboardingComplete()`
✅ Proper enum values in queries (SUCCESS, not completed)

---

## Usage Examples

### Protecting a Server Component

```tsx
import { requireOnboardingComplete } from '@/lib/auth-guard';

export default async function ProtectedPage() {
  // Redirects if not authenticated or not onboarded
  const user = await requireOnboardingComplete();
  
  return <div>Welcome {user.fullName}</div>;
}
```

### Checking Admin Status

```tsx
import { requireAdmin } from '@/lib/auth-guard';

export default async function AdminPage() {
  // Only admins can access
  const user = await requireAdmin();
  
  return <div>Admin Panel</div>;
}
```

### In API Routes

```tsx
import { getCurrentUserIfOnboarded } from '@/lib/auth-guard';

export async function POST(req: Request) {
  const user = await getCurrentUserIfOnboarded();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process request for user
}
```

---

## Testing the Flow

### Test New User Registration

1. Go to `/sign-up`
2. Sign up with new email
3. Should see "Setting up your account..." loading
4. Should redirect to `/onboarding/investment`
5. Fill out form
6. Submit
7. Should redirect to `/member/dashboard`

### Test Existing User Login

1. Go to `/sign-in`
2. Sign in with existing account
3. Go to `/member/dashboard`
4. Should see dashboard (no redirect)

### Test Route Protection

1. Logout: Go to `/` → Sign out
2. Try to access `/member/dashboard` → Redirect to `/sign-in`
3. Log in
4. Try to access `/onboarding/investment` → Redirect to `/member/dashboard`

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| User stuck on onboarding | JWT metadata not updated | Check Clerk's updateUser call in actions.ts |
| Can't access dashboard | `onboardingCompleted` is false | Check completeOnboarding action executed |
| Redirect loop | Middleware and component conflicting | Ensure middleware handles all routes |
| Database out of sync | JWT updated but DB not | The sync check in middleware fixes this |

---

## Next Steps

1. **Test thoroughly** - Go through all user flows
2. **Monitor Clerk logs** - Ensure metadata updates work
3. **Check Prisma logs** - Ensure database operations complete
4. **Verify redirects** - Test all edge cases
5. **Add logging** - Log user onboarding completion for analytics
