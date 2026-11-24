// ─────────────────────────────────────────────
// Admin permissions — pure, client-safe (no prisma / next imports).
//
// Every admin-panel section is a "module". A super admin assigns each
// non-super admin one level per module:
//
//   none — section hidden from the sidebar; pages and APIs refuse them
//   view — can open the section and read data, but every create / update /
//          delete / approve action is refused (UI *and* server)
//   edit — full access to the section (implies view)
//
// Super admins (SUPER_ADMIN_CLERK_IDS) always have "edit" everywhere and are
// never stored here. Managing other admins (/admin/users) is super-admin
// only and deliberately NOT a module, so it can never be delegated.
// ─────────────────────────────────────────────

export const PERMISSION_LEVELS = ["none", "view", "edit"] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export interface PermissionModuleDef {
  key: string;
  label: string;
  description: string;
  /** Admin page path prefixes that belong to this module. */
  paths: string[];
}

export const PERMISSION_MODULES = [
  { key: "investors", label: "Investors & KYC", description: "Investor list, KYC approvals, junior accounts, deleting members", paths: ["/admin/investors"] },
  { key: "products", label: "Investment Products", description: "Create, edit and remove investment products", paths: ["/admin/products"] },
  { key: "investments", label: "Investments", description: "Investment overview and member investment entries", paths: ["/admin/investments"] },
  { key: "transactions", label: "Transactions", description: "Deposits, withdrawals and payment history", paths: ["/admin/transactions"] },
  { key: "documents", label: "Documents Management", description: "Upload, publish and delete documents", paths: ["/admin/documents"] },
  { key: "memberReports", label: "Member Reports", description: "Member performance reports", paths: ["/admin/member-reports"] },
  { key: "savings", label: "Savings Accounts", description: "Savings entries and balances", paths: ["/admin/savings"] },
  { key: "chat", label: "Messages", description: "Chat with members", paths: ["/admin/chat"] },
  { key: "reports", label: "Reports & Analytics", description: "Platform analytics", paths: ["/admin/reports"] },
  { key: "content", label: "Content Management", description: "Team analytics uploads and site content", paths: ["/admin/content"] },
  { key: "settings", label: "Settings", description: "Admin panel settings", paths: ["/admin/settings"] },
] as const satisfies readonly PermissionModuleDef[];

export type PermissionModule = (typeof PERMISSION_MODULES)[number]["key"];
export type AdminPermissionMap = Record<PermissionModule, PermissionLevel>;

export const MODULE_KEYS = PERMISSION_MODULES.map((m) => m.key) as PermissionModule[];

/** What a module resolves to when it is missing from a stored map. */
export const DEFAULT_ADMIN_LEVEL: PermissionLevel = "edit";

export function isPermissionLevel(v: unknown): v is PermissionLevel {
  return typeof v === "string" && (PERMISSION_LEVELS as readonly string[]).includes(v);
}

export function fullPermissions(): AdminPermissionMap {
  return Object.fromEntries(MODULE_KEYS.map((k) => [k, "edit"])) as AdminPermissionMap;
}

/**
 * Turns whatever is stored in AdminAccount.permissions (null, partial,
 * or containing junk) into a complete, valid map.
 */
export function normalizePermissions(raw: unknown): AdminPermissionMap {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return Object.fromEntries(
    MODULE_KEYS.map((k) => [k, isPermissionLevel(src[k]) ? src[k] : DEFAULT_ADMIN_LEVEL])
  ) as AdminPermissionMap;
}

/**
 * Validates a map sent by a client. Returns null if it contains an unknown
 * module or an invalid level, so bad input is rejected instead of silently
 * stored.
 */
export function parsePermissionsInput(raw: unknown): Partial<AdminPermissionMap> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Partial<AdminPermissionMap> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!(MODULE_KEYS as string[]).includes(k) || !isPermissionLevel(v)) return null;
    out[k as PermissionModule] = v;
  }
  return out;
}

const RANK: Record<PermissionLevel, number> = { none: 0, view: 1, edit: 2 };

export function levelAtLeast(have: PermissionLevel, need: PermissionLevel): boolean {
  return RANK[have] >= RANK[need];
}

export function canAccess(
  perms: AdminPermissionMap | null | undefined,
  module: PermissionModule,
  need: PermissionLevel = "view"
): boolean {
  if (!perms) return false;
  return levelAtLeast(perms[module], need);
}

/** Module that owns an /admin/... path, or null for always-open pages (dashboard, notifications). */
export function moduleForPath(pathname: string): PermissionModule | null {
  for (const m of PERMISSION_MODULES) {
    if (m.paths.some((p) => pathname === p || pathname.startsWith(p + "/"))) return m.key;
  }
  return null;
}
