# Visual Architecture Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER AUTHENTICATION                          │
│                      (Clerk Integration)                            │
└──────────────┬──────────────────────────────────────────────────────┘
               │
        ┌──────▼────────┐
        │  Sign-Up      │
        │  Page         │
        └──────┬────────┘
               │
        ┌──────▼────────────────────────────────┐
        │ PostSignupRedirect Component          │
        │ (NEW) Checks database status          │
        └──────┬─────────────────────────────────┘
               │
        ┌──────▼────────────────────────────────────┐
        │ /api/auth/check-user (NEW)               │
        │ • Checks if user exists in DB            │
        │ • Returns onboardingCompleted flag       │
        └──────┬─────────────────────┬─────────────┘
               │                     │
        ┌──────▼──────┐     ┌────────▼──────┐
        │   EXISTS?   │     │               │
        └──────┬──────┘     │               │
        ┌──────▼─────┐  ┌───▼───────────┐  │
        │   NO       │  │   YES         │  │
        └──────┬─────┘  └───┬───────────┘  │
               │            │              │
        ┌──────▼──────────────▼──────┐    │
        │  ONBOARDED?               │    │
        │  (from metadata)          │    │
        └──────┬───┬─────────┬──────┘    │
               │   │         │           │
      ┌────────▼───┴─────┐   │           │
      │      NO         │   │   YES     │
      └────────┬────────┘   │   (Skip)  │
      ┌────────▼──────────────────────────┐
      │  /onboarding/investment (NEW)     │
      │  • Onboarding Form                │
      │  • Data validation (Zod)          │
      │  • Create/Update User in DB       │
      │  • Update Clerk Metadata          │
      └────────┬─────────────────────────┘
               │
      ┌────────▼──────────────────────────┐
      │  completeOnboarding() Action (NEW)│
      │  • Sets onboardingCompleted=true  │
      │  • Updates JWT metadata           │
      │  • Revalidates paths              │
      └────────┬─────────────────────────┘
               │
      ┌────────▼──────────────────────────┐
      │  /member/dashboard (PROTECTED)    │
      │  • Uses requireOnboardingComplete()
      │  • Access granted to onboarded    │
      │    users only                     │
      └────────────────────────────────────┘
```

---

## Middleware Flow Diagram

```
┌────────────────────────────────────────────┐
│          HTTP Request Received             │
│       (to any route in application)        │
└──────────────────┬─────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  clerkMiddleware    │
        │ (Enhanced Version)  │
        └──────────┬──────────┘
                   │
   ┌───────────────▼────────────────┐
   │  Extract userId & JWT claims   │
   │  from Clerk auth context       │
   └───────────────┬────────────────┘
                   │
   ┌───────────────▼────────────────┐
   │ Is user authenticated?         │
   └───────┬────────────────────────┘
           │
      ┌────┴─────────────────────┐
      │ NO              YES       │
      │                          │
      ▼                          ▼
   ┌────────────────┐  ┌──────────────────────┐
   │ Is public      │  │ Read metadata from   │
   │ route?         │  │ JWT claims:          │
   │                │  │ • onboardingCompleted│
   │ YES → Allow    │  │ • role               │
   │ NO → Redirect  │  └──────────┬───────────┘
   │       to       │             │
   │     /sign-in   │  ┌──────────▼──────────┐
   └────────────────┘  │ Check route type   │
                       └┬──────┬──────┬─────┘
                        │      │      │
        ┌───────────────┴──┐   │      │
        │                  │   │      │
    ┌───▼─────────┐  ┌────▼──▼──┐  ┌┴────────────┐
    │  ADMIN      │  │ ONBOARDING│  │  MEMBER    │
    │  ROUTE?     │  │  ROUTE?   │  │  ROUTE?    │
    └───┬─────────┘  └────┬──────┘  └┬────────────┘
        │                 │          │
    Is  │            Should not      │ Should have
    Admin?           access if       │ completed
        │            already         │ onboarding
        │            onboarded       │
        │                 │          │
    ┌───▴─────┐  ┌────────▼────┐ ┌──┴──────┐
    │ YES → ✅│  │ YES → Reject │ │ YES → ✅│
    │ NO → ❌ │  │ NO → Allow ✅│ │ NO → ❌ │
    └────┬────┘  └─────────────┘ └──┬──────┘
         │                           │
    Redirect to           ┌──────────┴──┐
    Dashboard             │Redirect to  │
                    ┌─────┴────────────┐
                    │  /onboarding/    │
                    │  investment      │
                    └──────────────────┘

Optional: Database Sync Verification
┌──────────────────────────────────────────┐
│ For non-API routes:                      │
│ • Query DB for user record               │
│ • Compare DB state with JWT              │
│ • If mismatch, use DB as source of truth │
│ • Catches and prevents inconsistencies   │
└──────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────┐
│     Frontend (Client-Side)          │
├─────────────────────────────────────┤
│                                     │
│  Sign-Up Page                       │
│  ├─ Clerk SignUp Component          │
│  └─ PostSignupRedirect Component    │
│     (Calls /api/auth/check-user)    │
│                                     │
│  Onboarding Page                    │
│  ├─ Form Component (with Zod)       │
│  └─ completeOnboarding() Action     │
│                                     │
│  Protected Pages                    │
│  ├─ Dashboard                       │
│  ├─ Investments                     │
│  └─ Profile                         │
│     (All use requireOnboardingComplete)
│                                     │
└────────────┬────────────────────────┘
             │ HTTP Requests
             ▼
┌─────────────────────────────────────┐
│     Backend (Server-Side)           │
├─────────────────────────────────────┤
│                                     │
│  Middleware (src/middleware.ts)     │
│  ├─ Route protection logic          │
│  ├─ JWT claims verification         │
│  └─ Optional DB sync check          │
│                                     │
│  API Routes                         │
│  ├─ /api/auth/check-user            │
│  │  └─ Verifies user in DB          │
│  └─ Other API endpoints             │
│                                     │
│  Server Actions                     │
│  ├─ completeOnboarding()            │
│  │  ├─ Validates input (Zod)        │
│  │  ├─ Creates/updates user         │
│  │  ├─ Updates Clerk metadata       │
│  │  └─ Revalidates cache            │
│  └─ Other actions                   │
│                                     │
│  Server Components/Utilities        │
│  ├─ requireOnboardingComplete()     │
│  ├─ getCurrentUserIfOnboarded()     │
│  ├─ requireAdmin()                  │
│  └─ isUserAdmin()                   │
│                                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   External Services                 │
├─────────────────────────────────────┤
│                                     │
│  Clerk (Authentication)             │
│  ├─ User creation                   │
│  ├─ User authentication             │
│  ├─ Metadata management             │
│  └─ JWT token generation            │
│                                     │
│  Prisma ORM (Database)              │
│  ├─ User records                    │
│  ├─ Investments                     │
│  ├─ Payments                        │
│  └─ Other data                      │
│                                     │
│  MongoDB Atlas                      │
│  └─ Persistent data storage         │
│                                     │
└─────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER SIGNUP
──────────

┌─────────┐
│ Sign Up │
│ Form    │
└────┬────┘
     │ User submits
     │ (email, password)
     ▼
┌──────────────────┐
│ Clerk            │
│ createUser()     │
└────┬─────────────┘
     │ New Clerk user created
     │ JWT token generated
     ▼
┌───────────────────────────────┐
│ PostSignupRedirect            │
│ Runs automatically            │
└────┬────────────────────────────┘
     │ Calls /api/auth/check-user
     ▼
┌───────────────────────┐
│ Database Query        │
│ findUnique by clerkId │
└────┬──────────────────┘
     │ User NOT found (new user)
     ▼
┌──────────────────────────────┐
│ Redirect to                  │
│ /onboarding/investment       │
└──────────────────────────────┘


ONBOARDING COMPLETION
─────────────────────

┌──────────────────────┐
│ Onboarding Form      │
│ User fills:          │
│ • Full Name          │
│ • Phone              │
│ • National ID        │
│ • Investment Amount  │
└────┬─────────────────┘
     │ User submits
     ▼
┌──────────────────────────────┐
│ completeOnboarding()         │
│ Server Action                │
└────┬─────────────────────────┘
     │
     ├─ Validate form data (Zod)
     │
     ├─ Check if user exists in DB
     │
     ├─ Create User record in Prisma
     │  {
     │    clerkId: user.id,
     │    email: data.email,
     │    fullName: data.fullName,
     │    phone: data.phone,
     │    nationalId: data.nationalId,
     │    onboardingCompleted: true,
     │    role: "MEMBER"
     │  }
     │
     ├─ Update Clerk Metadata
     │  {
     │    onboardingCompleted: true,
     │    role: "MEMBER",
     │    dbId: user.id
     │  }
     │
     └─ Revalidate Cache Paths
        (dashboard, profile, etc.)
        │
        ▼
    ┌──────────────────────────────┐
    │ Redirect to                  │
    │ /member/dashboard            │
    └──────────────────────────────┘


USER LOGIN
──────────

┌──────────────────┐
│ Sign In Form     │
│ (email/password) │
└────┬─────────────┘
     │ User submits
     ▼
┌─────────────────────────┐
│ Clerk                   │
│ authenticateUser()      │
└────┬────────────────────┘
     │ Clerk returns JWT token
     │ with metadata claims:
     │ • onboardingCompleted: true/false
     │ • role: ADMIN/MEMBER
     ▼
┌──────────────────────────────┐
│ Middleware Checks            │
│ (No DB query needed!)        │
├──────────────────────────────┤
│ Read JWT metadata            │
│ onboardingCompleted === true?│
│                              │
│ YES → Allow to /member/dash  │
│ NO  → Redirect to onboarding │
└──────────────────────────────┘
```

---

## State Verification Diagram

```
DUAL-LAYER VERIFICATION
─────────────────────

Layer 1: JWT Claims (Fast)
┌──────────────────────────────────────┐
│ In Middleware:                       │
│ • Read from JWT                      │
│ • No database query                  │
│ • Fast, suitable for redirects       │
│ • Used for initial route protection  │
└──────────────────────────────────────┘

Layer 2: Database Query (Authoritative)
┌──────────────────────────────────────┐
│ In Protected Pages:                  │
│ • Query Prisma for user              │
│ • Single source of truth             │
│ • Ensures consistency                │
│ • Catches JWT/DB mismatches          │
└──────────────────────────────────────┘

Optional Layer 3: Database Sync Check
┌──────────────────────────────────────┐
│ In Middleware (optional):            │
│ • Compare JWT vs Database            │
│ • Detect inconsistencies             │
│ • Use DB as authoritative source     │
│ • Catch edge cases                   │
└──────────────────────────────────────┘


CONSISTENCY VERIFICATION FLOW
────────────────────────────

User logs in
    ↓
JWT generated with metadata
    ↓
Middleware checks JWT
    ↓
Route allowed/denied based on JWT
    ↓
User navigates to protected page
    ↓
Server component calls requireOnboardingComplete()
    ↓
Queries database for user
    ↓
Compares DB.onboardingCompleted with JWT.onboardingCompleted
    ↓
IF DIFFERENT:
    • Use DB as source of truth
    • Redirect if DB says not onboarded
    • Log the discrepancy
    ↓
IF SAME:
    • Proceed normally
    • User granted access
```

---

## Error Handling Flow

```
ERROR SCENARIOS AND RESPONSES
──────────────────────────────

1. USER NOT AUTHENTICATED
   Middleware detects no userId
   ↓
   Redirect to /sign-in
   ↓
   Display login form

2. USER NOT IN DATABASE (NEW USER)
   PostSignupRedirect checks DB
   ↓
   User not found
   ↓
   Redirect to /onboarding/investment
   ↓
   Display onboarding form

3. ONBOARDING INCOMPLETE (EDGE CASE)
   User tries /member/dashboard
   ↓
   requireOnboardingComplete() checks DB
   ↓
   onboardingCompleted === false
   ↓
   Redirect to /onboarding/investment

4. FORM VALIDATION ERROR
   User submits incomplete form
   ↓
   Zod schema validation fails
   ↓
   Error messages returned
   ↓
   User sees validation errors
   ↓
   User corrects and resubmits

5. DATABASE ERROR
   completeOnboarding() fails
   ↓
   Try-catch block catches error
   ↓
   Log error with context
   ↓
   Return error message to user
   ↓
   User sees toast notification
   ↓
   User can retry

6. ADMIN-ONLY ROUTE
   Non-admin tries /admin/dashboard
   ↓
   Middleware checks role
   ↓
   role !== "ADMIN"
   ↓
   Redirect to /member/dashboard

7. RE-ONBOARDING ATTEMPT
   Onboarded user tries /onboarding/investment
   ↓
   Middleware checks onboardingCompleted
   ↓
   onboardingCompleted === true
   ↓
   Redirect to /member/dashboard
```

---

## Integration Points

```
INTEGRATION MAP
───────────────

Next.js App
├─ Layout & Pages
├─ API Routes
├─ Server Actions
├─ Middleware
└─ Hooks & Utilities

Clerk Integration
├─ SignUp Component
├─ SignIn Component
├─ useUser Hook
├─ currentUser() Server Function
├─ auth() Server Function
└─ Metadata Management

Prisma Integration
├─ User Model
├─ Investment Model
├─ Payment Model
├─ Database Operations
└─ Connection Pool

MongoDB
├─ Data Storage
├─ User Records
├─ Investments
├─ Payments
└─ Audit Logs

Authentication Flow
├─ Clerk (JWT Generation)
├─ Middleware (Route Protection)
├─ Server Components (Page Protection)
└─ API Routes (Endpoint Protection)
```

---

**Visual Architecture Complete!** 🎨

This diagram shows how all components work together to create a seamless, secure onboarding flow.
