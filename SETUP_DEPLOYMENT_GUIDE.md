# Setup & Deployment Guide

## Phase 1: Immediate Setup (Required)

### Step 1: Update Prisma Client
```bash
# Navigate to project root
cd c:\Users\erick\ludeva-main

# Regenerate Prisma client and update database
npm run postinstall

# OR manually if postinstall doesn't work:
npx prisma generate
npx prisma db push
```

### Step 2: Verify Database Changes
```bash
# Review your database
npx prisma studio

# Should see the User table with:
# - clerkId (String, Unique)
# - onboardingCompleted (Boolean, default: false)
```

### Step 3: Start Development Server
```bash
# Clear Next.js cache
rm -r .next

# Start dev server
npm run dev

# Server should run on http://localhost:9002
```

---

## Phase 2: Testing (Highly Recommended)

### Test Suite 1: New User Registration
```
1. Open http://localhost:3000/sign-up
2. Create account with:
   - Email: testuser@example.com
   - Password: [secure password]
3. After signup, should see "Setting up your account..."
4. Should redirect to http://localhost:3000/onboarding/investment
5. Fill out onboarding form:
   - Full Name: John Doe
   - Email: (auto-filled)
   - Phone: +254712345678
   - National ID: 12345678
   - Initial Investment: 5000
6. Click "Complete Account Setup"
7. Should see success toast
8. Should redirect to http://localhost:3000/member/dashboard
9. Should see dashboard with welcome message
```

### Test Suite 2: Existing User Login
```
1. Logout (click your profile → Sign Out)
2. Go to http://localhost:3000/sign-in
3. Log in with the account created in Test Suite 1
4. Should automatically redirect to /member/dashboard
5. Dashboard should load without redirect loop
```

### Test Suite 3: Route Protection
```
1. Logout completely
2. Try to access http://localhost:3000/member/dashboard
   → Should redirect to http://localhost:3000/sign-in
3. Try to access http://localhost:3000/onboarding/investment
   → Should redirect to http://localhost:3000/sign-in
4. Log in with a fresh account
5. Complete onboarding
6. Try to access /onboarding/investment again
   → Should redirect to http://localhost:3000/member/dashboard
```

### Test Suite 4: Error Handling
```
1. On onboarding form:
   - Leave fields empty → Should show validation errors
   - Enter invalid email → Should show email error
   - Enter investment < 1000 → Should show amount error
   - Enter phone < 10 digits → Should show phone error
2. All errors should be caught before submission
```

---

## Phase 3: Clerk Configuration (Optional but Recommended)

### Create Custom JWT Claims
```
1. Go to Clerk Dashboard (https://dashboard.clerk.com)
2. Select your application
3. Go to JWT Templates
4. Create new template or edit default
5. Add custom claims:
   {
     "onboardingCompleted": "{user.public_metadata.onboardingCompleted}",
     "role": "{user.public_metadata.role}",
     "dbId": "{user.public_metadata.dbId}"
   }
6. Save and refresh your app
```

### Verify Webhook Events (Optional)
```
1. In Clerk Dashboard → Webhooks
2. Check that user.created events are firing
3. Check that user.updated events are firing
4. This helps verify user creation in your system
```

---

## Phase 4: Verification Checklist

Before considering implementation complete, verify:

- ✅ `npm run postinstall` completes without errors
- ✅ `npx prisma studio` shows User table with clerkId field
- ✅ New user signup → onboarding → dashboard flow works
- ✅ Existing user login → dashboard flow works
- ✅ Cannot access dashboard without logging in
- ✅ Cannot access onboarding after onboarding
- ✅ Form validation works correctly
- ✅ Error messages display properly
- ✅ No console errors
- ✅ No infinite redirect loops
- ✅ Database records created correctly

---

## Phase 5: Environment Variables

### Verify These Are Set (`.env.local`)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=mongodb+srv://...

# Prisma
PRISMA_FIELD_ENCRYPTION_KEY=... (if using encryption)
```

### Verify These Are Set (`.env`)
```
# These should match your Clerk setup
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/investment
```

---

## Phase 6: Monitoring & Logs

### Check Middleware Logs
```typescript
// Add to src/middleware.ts if debugging
console.log(`[Middleware] User: ${userId}, Path: ${req.nextUrl.pathname}`);
console.log(`[Middleware] onboardingCompleted: ${onboardingCompleted}`);
```

### Check Database Operations
```typescript
// Enable Prisma logging
// In src/lib/prisma.ts
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Already enabled!
});
```

### Monitor Clerk Events
- Check Clerk Dashboard for sync events
- Verify user creation timestamps
- Verify metadata updates

---

## Phase 7: Deployment to Production

### Pre-Deployment Checklist
```
- ✅ All tests pass locally
- ✅ No console errors
- ✅ Database migrations applied
- ✅ Clerk keys set in production
- ✅ Database URL set to production DB
- ✅ Environment variables all set
```

### Deploy to Vercel (if using)
```bash
# Commit changes
git add .
git commit -m "feat: implement conditional onboarding flow"
git push origin main

# Vercel will:
# 1. Build the app
# 2. Run migrations automatically (if configured)
# 3. Deploy to production
```

### Deploy to Other Platforms
```bash
# Build locally first to catch errors
npm run build

# If successful, deploy:
# For Netlify: netlify deploy --prod
# For Custom Server: rsync to server and run npm start
```

### Post-Deployment Verification
```
1. Go to https://yourdomain.com/sign-up
2. Test new user flow
3. Test existing user flow
4. Check Clerk Dashboard for any errors
5. Monitor server logs for errors
6. Verify database operations complete
```

---

## Troubleshooting During Setup

### Issue 1: Prisma Generate Fails
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Reinstall
npm install

# Try again
npm run postinstall
```

### Issue 2: Database Connection Error
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin < <(echo "db.adminCommand({ping: 1})")

# Or use Prisma Studio
npx prisma studio
```

### Issue 3: Middleware Not Triggering
```bash
# Verify middleware.ts is at src/middleware.ts (not nested)
# Verify export config has correct matcher
# Clear .next cache: rm -r .next
# Restart dev server: npm run dev
```

### Issue 4: Redirect Loop on Signup
```
This usually means PostSignupRedirect is running but 
/api/auth/check-user is failing.

Check:
1. API route exists at src/app/api/auth/check-user.ts
2. API route is not protected by middleware
3. Clerk is properly initialized
4. Check browser console for errors
```

### Issue 5: Onboarding Form Submission Fails
```
Check:
1. User is authenticated (can see user object)
2. All form fields are filled
3. Server action completes without error
4. Clerk metadata update succeeds
5. Check Next.js console for error details
```

---

## Performance Optimization (Optional)

### Reduce API Calls
```typescript
// Cache check-user response in localStorage
// Only call on first visit after signup
```

### Optimize Middleware
```typescript
// Option: Disable database sync in middleware
// Remove the sync check block if not needed
```

### Optimize Database
```typescript
// Use indexes on frequently queried fields
// Ensure clerkId is indexed (it is by default with @unique)
```

---

## Rollback Plan (If Needed)

### If You Need to Revert
```bash
# Revert to previous version
git checkout HEAD~1

# Restore previous schema
npx prisma migrate resolve --rolled-back <migration_name>

# Or restore from backup
# (Make sure you have database backups!)
```

---

## Final Checklist

```
SETUP PHASE:
- ✅ Ran npm run postinstall
- ✅ Verified Prisma schema updated
- ✅ Dev server runs without errors

TESTING PHASE:
- ✅ New user signup works
- ✅ Onboarding form works
- ✅ Dashboard accessible after onboarding
- ✅ Returning user login works
- ✅ Route protection works
- ✅ No redirect loops
- ✅ Error handling works

CONFIGURATION PHASE:
- ✅ Environment variables set
- ✅ Clerk JWT template configured (optional)
- ✅ Database logging enabled
- ✅ Middleware logging verified

DEPLOYMENT PHASE:
- ✅ All tests pass
- ✅ No console errors
- ✅ Production environment variables set
- ✅ Database backups created
- ✅ Monitoring set up

VERIFICATION PHASE:
- ✅ Production signup works
- ✅ Production login works
- ✅ No production errors
- ✅ Performance acceptable
```

---

## Support & References

### Documentation
- `docs/ONBOARDING_FLOW.md` - Full flow documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `QUICK_START.md` - Quick reference
- `BEFORE_AFTER.md` - Visual comparison
- Code comments throughout modified files

### External Resources
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Middleware Guide](https://nextjs.org/docs/advanced-features/middleware)
- [Zod Validation](https://zod.dev)

### Getting Help
```
1. Check the documentation files first
2. Review code comments
3. Check Clerk Dashboard for errors
4. Check Next.js console for errors
5. Check MongoDB Atlas for database errors
6. Enable debug logging in middleware and API routes
```

---

## Success! 🎉

If you've completed all phases and all tests pass, your conditional onboarding flow is:
- ✅ Fully implemented
- ✅ Production-ready
- ✅ Well-documented
- ✅ Thoroughly tested

**Deploy with confidence!**
