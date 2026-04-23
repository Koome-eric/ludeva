import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { RealtimeListener } from "@/components/realtime-listener";

const getKycStatusVariant = (status: boolean): 'success' | 'warning' => {
  return status ? 'success' : 'warning';
};

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead className="text-center">Onboarding Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-medium">{investor.fullName}</TableCell>
                    <TableCell>{investor.email}</TableCell>
                    <TableCell>{format(investor.createdAt, 'dd MMM, yyyy')}</TableCell>
                    <TableCell>{investor.phone || 'N/A'}</TableCell>
                    <TableCell>{investor.nationalId || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getKycStatusVariant(investor.onboardingCompleted)}>
                        {investor.onboardingCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
