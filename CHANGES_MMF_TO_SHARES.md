# MMF removed — replaced by the Shares Account

## Deploy order (important)
1. `npx tsx scripts/remove-mmf.ts`   (moves any stored MMF / MONEY_MARKET documents to the retired FIXED_DEPOSIT value and
   renames those products/investments "Legacy investment"; nothing is deleted)
2. `npx prisma db push`             (drops FundType.MMF and ProductCategory.MONEY_MARKET)
3. Google Sheet: rename Script Properties `MMF_API_URL` -> `INVESTMENTS_API_URL` and `MMF_API_KEY` -> `INVESTMENTS_API_KEY`
   and paste in `scripts/investments-push.gs`. Until then the push script has no URL/key.

## What changed
- Schema: `MMF` (FundType) and `MONEY_MARKET` (ProductCategory) removed; comments reworded.
- `/api/investments`: legacy/unknown category now falls back to STOCK; FIXED_DEPOSIT mapped explicitly.
- Admin: sidebar "MMF" -> "Shares Account" (`/admin/products/shares`, lists EQUITY products; fixed a missing comma in that page's
  query); product form no longer offers MMF / Money Market; `/admin/products/mmf` deleted.
- Public: `/mmf` page + `MmfSection` deleted, 301 `/mmf` -> `/stocks-bonds` (next.config.ts); `/mmf` removed from middleware;
  footer, home/about/auth/layout/dashboard copy updated. "MMF vs Stocks" table is now "Savings Account vs Shares Account".
  L Chama / Teams copy now refers to the Shares Account (12% p.a., matching AccountsOverviewSection).
- Blog: "money-market-funds" article rewritten as `shares-account` (URL changes); other posts reworded.
- `public/images/hero-mmf.png` deleted (byte-identical `hero-banner.png` already existed; 3 references updated).
- `scripts/mmf-push.gs` deleted (`investments-push.gs` is the same script with the renamed properties);
  `update-shares-and-retire-products.ts` no longer references MMF.
- Package renamed `ludeva-app`; README / QUICK_START / onboarding docs updated.
- Left alone: CHANGES_README.md (historical log), `public/documents/documents.zip`, `tsconfig.tsbuildinfo` (build cache),
  and `scripts/remove-mmf.ts` (it must name the old values to migrate them).
