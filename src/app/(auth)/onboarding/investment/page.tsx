/**
 * Onboarding Investment Page (Server Component)
 * 
 * This page runs in Node.js runtime and wraps the client component.
 * It allows server-side logic and Prisma access via server actions.
 */
export const runtime = 'nodejs';

import InvestmentClient from './InvestmentClient';

export default function OnboardingInvestmentPage() {
  return <InvestmentClient />;
}
