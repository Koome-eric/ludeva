// Phone numbers on User.phone can be stored in whichever form the person
// signed up with — Clerk hands us E.164 (+2547XXXXXXXX), while a hand-typed
// number (onboarding forms, Sheets rows) might be local (07XXXXXXXX /
// 01XXXXXXXX) or missing the "+". Rather than requiring every existing
// record to already match, this generates the small set of forms a given
// number could plausibly be stored as, and callers match against any of
// them.
//
// Used by /api/member-reports and /api/savings to look a member's own rows
// up by phone when their account email doesn't match what's on the Sheets
// row (e.g. a phone-only sign-up, or a typo in the sheet).
export function phoneLookupVariants(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = String(raw).replace(/[\s-]+/g, '');
  if (!trimmed) return [];

  let local = trimmed; // target: 0-prefixed local form, e.g. 0712345678
  if (trimmed.startsWith('+254')) local = `0${trimmed.slice(4)}`;
  else if (trimmed.startsWith('254') && trimmed.length === 12) local = `0${trimmed.slice(3)}`;

  if (!/^0[17]\d{8}$/.test(local)) {
    // Not a recognizable Kenyan mobile number — just try it verbatim rather
    // than guessing at a format.
    return [trimmed];
  }

  const withoutLeadingZero = local.slice(1);
  return [...new Set([local, `+254${withoutLeadingZero}`, `254${withoutLeadingZero}`])];
}
