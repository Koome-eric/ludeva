import { phoneLookupVariants } from "@/lib/phone";

// A member's rows in MemberReport / SavingsEntry are keyed on EMAIL first and
// PHONE second: a sheet row (or admin entry) may carry an email, a phone
// number, or both. These helpers keep that rule in one place so the member
// pages, the webhooks and the admin screens all agree on it.

export type MemberIdentity = { email?: string | null; phone?: string | null };

/** Prisma `where` that finds every row belonging to this member — by email OR phone. */
export function memberRowsWhere(who: MemberIdentity) {
  const or: any[] = [];
  const email = who.email?.toLowerCase().trim();
  if (email) or.push({ memberEmail: email });
  const phones = phoneLookupVariants(who.phone);
  if (phones.length) or.push({ memberPhone: { in: phones } });
  // No identifier at all: match nothing rather than everything.
  return or.length ? { OR: or } : { id: "__none__" };
}

/** Stable per-member key for grouping rows in the admin screens: email, else normalised phone. */
export function memberKey(row: { memberEmail?: string | null; memberPhone?: string | null }) {
  if (row.memberEmail) return row.memberEmail.toLowerCase().trim();
  if (row.memberPhone) return row.memberPhone.replace(/[\s-]+/g, "");
  return "";
}

/** Same member, whatever form the phone was typed in (0712…, +254712…, 254712…). */
export function samePhone(a?: string | null, b?: string | null) {
  const va = phoneLookupVariants(a);
  const vb = phoneLookupVariants(b);
  return va.length > 0 && va.some((x) => vb.includes(x));
}
