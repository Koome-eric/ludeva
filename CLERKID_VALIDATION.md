# Quick Validation: clerkId Configuration

## ✅ Current State (VERIFIED)

### 1. Prisma Schema
```prisma
clerkId String @unique
```
✅ **Status**: Correct - field name matches code

### 2. Upsert Code
```typescript
where: { clerkId: clerkUser.id }
```
✅ **Status**: Correct - uses exact field name from schema

### 3. Create Block
```typescript
create: {
  clerkId: clerkUser.id,
  email: email,
  fullName: fullName,
  // ...
}
```
✅ **Status**: Correct - clerkId always provided

### 4. All Query Locations
- ✅ `src/lib/user.ts`: `where: { clerkId }`
- ✅ `src/lib/auth-guard.ts`: `where: { clerkId }` (all 4 instances)
- ✅ `src/app/api/auth/check-user.ts`: `where: { clerkId }`
- ✅ `src/app/(auth)/onboarding/investment/actions.ts`: `where: { clerkId }`

---

## 🚀 If Error Still Occurs

The constraint error might be from:

1. **Email uniqueness conflict** - Another user has same email
   - Solution: Don't make email unique if Clerk handles it
   
2. **Database corruption** - Multiple users with same clerkId
   - Solution: Check MongoDB directly, remove duplicates

3. **Prisma Client stale** - Old compiled client
   - Solution: `npx prisma generate`

---

## 🔧 Regenerate & Test

```bash
# 1. Regenerate Prisma client
npx prisma generate

# 2. Restart dev server
npm run dev

# 3. Test signup flow
# Go to http://localhost:3000/sign-up
# Watch console for errors
```

---

## 📊 Field Name Audit

```
Prisma Schema Field:     clerkId ✅
MongoDB Constraint:      User_clerkId_key ✅
Upsert where clause:     clerkId ✅
Create block:            clerkId ✅
All queries:             clerkId ✅
Clerk hook:              clerkUser.id ✅
Auth hook:               userId ✅
```

Everything is aligned. If error persists, it's likely a data issue (duplicate clerkId or email conflict in MongoDB).
