// Force all onboarding routes to run in Node.js runtime
// This ensures Prisma works correctly for any child route that needs it
export const runtime = 'nodejs';

import React from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  );
}
