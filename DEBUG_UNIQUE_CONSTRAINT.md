# Debugging: User_clerkId_key Unique Constraint Error

## 🔍 Root Cause Analysis

The error `Unique constraint failed on the constraint: User_clerkId_key` occurs when:

1. ✅ **Correctly configured**: `clerkId` field is `@unique` in Prisma schema
2. ❌ **But upsert() fails**: Either:
   - Code uses wrong field name in `where` clause
   - Another unique constraint (like `email`) is being violated
   - Multiple users somehow got the same `clerkId`

---

## ✅ Current Schema (Correct)

```prisma
model User {
  id                  String   @id @map("_id") @default(auto()) @db.ObjectId
  clerkId             String   @unique
  email               String   @unique
  fullName            String?
  phone               String?
  nationalId          String?
  role                Role     @default(MEMBER)
  onboardingCompleted Boolean  @default(false)
  
  investments         Investment[]
  payments            Payment[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

---

## ✅ Current Upsert Code (Correct)

```typescript
const user = await prisma.user.upsert({
  where: { clerkId: clerkUser.id },  // ✅ Matches schema field name exactly
  update: {
    email: email,
    fullName: fullName,
    phone: phone,
    nationalId: nationalId,
    onboardingCompleted: true,
    role: 'MEMBER',
  },
  create: {
    clerkId: clerkUser.id,           // ✅ Always use clerkId
    email: email,
    fullName: fullName,
    phone: phone,
    nationalId: nationalId,
    onboardingCompleted: true,
    role: 'MEMBER',
  },
});
```

---

## 🚨 If Error STILL Occurs

### Scenario 1: Email Conflict (Most Likely)

If the error persists, it might be the `email` unique constraint:

**Problem**: User A has `email="test@example.com"` already in DB under different `clerkId`

**Solution**: Update the upsert to handle email safely

```typescript
const user = await prisma.user.upsert({
  where: { clerkId: clerkUser.id },
  update: {
    email: email,                    // ✅ Only update if safe
    fullName: fullName,
    phone: phone,
    nationalId: nationalId,
    onboardingCompleted: true,
    role: 'MEMBER',
  },
  create: {
    clerkId: clerkUser.id,
    email: email,
    fullName: fullName,
    phone: phone,
    nationalId: nationalId,
    onboardingCompleted: true,
    role: 'MEMBER',
  },
});
```

**Or remove email as @unique:**

```prisma
model User {
  id                  String   @id @map("_id") @default(auto()) @db.ObjectId
  clerkId             String   @unique          // ← This is the auth key
  email               String                    // ← No longer unique
  // ... rest
}
```

---

### Scenario 2: Duplicate clerkId in Database

**Check for this:**
```bash
# Connect to MongoDB and run:
db.User.find({ clerkId: "your_clerk_id_here" }).count()
```

If count > 1: You have a database corruption issue.

**Fix**: Manually clean up duplicates in MongoDB Atlas console.

---

### Scenario 3: Prisma Client Not Regenerated

After schema changes, you MUST regenerate:

```bash
npx prisma generate
```

---

## 📋 Complete Verification Checklist

- [ ] Prisma schema has `clerkId String @unique`
- [ ] No `@map("clerkId")` (it's redundant)
- [ ] Upsert uses `where: { clerkId: clerkUser.id }`
- [ ] Create block has `clerkId: clerkUser.id`
- [ ] All Clerk lookup queries use `clerkId` (not `clerkUserId`)
- [ ] Ran `npx prisma generate` after schema changes
- [ ] No other code creates User without upsert
- [ ] Email isn't being reused across different Clerk users

---

## 🔧 Nuclear Option: Reset & Sync

If none of the above works:

### 1. Verify Prisma Schema
```bash
npx prisma validate
```

### 2. Regenerate Prisma Client
```bash
npx prisma generate
```

### 3. View Current Database State
```bash
npx prisma studio
# Then inspect User table for duplicates/conflicts
```

### 4. Test Upsert Directly (optional)
```typescript
// In a test route
const result = await prisma.user.upsert({
  where: { clerkId: "test_clerk_id" },
  update: { email: "test@example.com" },
  create: {
    clerkId: "test_clerk_id",
    email: "test@example.com",
  },
});
console.log(result);
```

---

## 🎯 Field Name Summary

| Context | Correct Name | Wrong Name |
|---------|-------------|-----------|
| Prisma Schema | `clerkId` | `clerkUserId` |
| Upsert where | `clerkId: value` | `clerkUserId: value` |
| Get from Clerk | `clerkUser.id` | `clerkUser.userId` |
| Auth hook | `const { userId }` | `const { clerkId }` |

---

## ✅ Final Test

After making changes:

1. **Clear all test users from MongoDB**
2. **Restart dev server**: `npm run dev`
3. **Test signup flow**: Go to `/sign-up`
4. **Check user creation**: Run `npx prisma studio`
5. **Verify**: User created with `clerkId` matching Clerk ID ✅

---

## 📞 Still Stuck?

If error persists after all checks:

1. Check Prisma logs: `DEBUG="*" npm run dev`
2. Inspect MongoDB directly for conflicts
3. Check if another webhook/action is creating users
4. Verify `.env.local` has correct DATABASE_URL
