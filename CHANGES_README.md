# Ludeva MMF — corrected fix (targets the actual Ludeva app)

The last round of changes added phone-number matching to L-CHAMA's own
`/api/member-reports/sync` route, on the assumption that's what
`Ludeva_MMF_Updated.xlsx` pushes to. It isn't — the sheet's Push Log
response shape (`{"processed":...,"results":[{"id","email","success"}]}`)
matches the real Ludeva app's `/api/member-reports` route exactly, not
L-CHAMA's. This package redoes the fix against the right target.

## What changed

- `prisma/schema.prisma` — `MemberReport.memberEmail` is now optional and
  `memberPhone` was added, so a phone-only row can be stored without an
  email. Run a migration after applying.
- `src/lib/phone.ts` — new helper. Generates the couple of forms a Kenyan
  number could be stored as (`0712...`, `+254712...`, `254712...`), matching
  the `2547XXXXXXXX` convention already used in `src/lib/mpesa.ts`.
- `src/app/api/member-reports/route.ts`:
  - `GET` now matches a member's own reports by email OR phone, so someone
    whose sheet row has a different or missing email still sees their data.
  - `POST` now accepts a row with only `memberPhone` (previously
    `memberEmail` was required). The upsert/dedup lookup falls back to
    phone + date + accountNo when the row has no email.
- `scripts/mmf-push.gs` — rewritten to match the real `savings-push.gs` in
  this repo: posts to `/api/member-reports` (not `/member-reports/sync`),
  uses the `x-sheets-secret` header and `MMF_API_URL` / `MMF_API_KEY`
  script properties, sends a single row object per push. **This file still
  isn't the actual script bound to the live sheet** — that wasn't included
  in what I was given, only the workbook and the API route. Diff this
  against whatever's live before replacing it.

## Still open: does the Savings spreadsheet belong here too?

`scripts/savings-push.gs` in this repo is word-for-word identical to the
one in the L-CHAMA upload, and posts to *this* app's `/api/savings` (same
response shape as MMF's). That's a second signal `LChama_Savings_Data.xlsx`
might also actually belong to Ludeva, not L-CHAMA — but you only flagged
MMF, so I've left `/api/savings` and `SavingsEntry` untouched here rather
than guess. If Savings turns out to be Ludeva's too, say so and I'll port
the same phone-matching fix over to `/api/savings/route.ts` and
`savings-push.gs` in this repo instead of (or alongside) the L-CHAMA one.

## Not touched, worth knowing about

- `MemberReport.memberEmail` going from required to optional may affect
  any other code that reads `report.memberEmail` assuming it's always a
  string (e.g. `/api/member-reports/admin-all`, `/api/admin/member-reports`)
  — worth a quick check before deploying.
- The "add a chama member directly" feature from the last round was built
  for L-CHAMA's Team/TeamMembership model, which this app doesn't have —
  that part of the earlier delivery stands as-is for L-CHAMA and isn't
  touched here.
