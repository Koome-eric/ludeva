import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { RealtimeListener } from "@/components/realtime-listener";
import InvestorsTableClient from './InvestorsTableClient';

export default async function InvestorsPage() {
  const investors = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
       <RealtimeListener event="user:update" />
       <Card>
        <CardHeader>
          <CardTitle>Investor List</CardTitle>
          <CardDescription>View and manage all investors on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvestorsTableClient
            investors={investors.map((inv) => ({
              id: inv.id,
              fullName: inv.fullName,
              email: inv.email,
              createdAt: inv.createdAt,
              phone: inv.phone,
              nationalId: inv.nationalId,
              onboardingCompleted: inv.onboardingCompleted,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
