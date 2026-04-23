export const SUPER_ADMIN_CLERK_ID = "user_38qCNW1RIEGrQ6rORph6s2348NX";

export function isSuperAdmin(user: any) {
  return user?.clerkId === SUPER_ADMIN_CLERK_ID;
}