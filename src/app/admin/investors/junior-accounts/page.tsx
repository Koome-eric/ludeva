import { prisma } from '@/lib/prisma';
import { JuniorAccountsTable } from '@/components/JuniorAccountsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JuniorAccountsPage() {
  const applications = await prisma.juniorAccountApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      guardian: { select: { fullName: true, email: true, phone: true } },
    },
  });

  const mapped = applications.map((a) => ({
    id: a.id,
    childFullName: a.childFullName,
    childDateOfBirth: a.childDateOfBirth ? a.childDateOfBirth.toISOString() : null,
    guardianName: a.guardian.fullName || a.guardian.email,
    guardianEmail: a.guardian.email,
    guardianPhoneOnFile: a.guardian.phone,
    guardianIdNumber: a.guardianIdNumber,
    guardianPhone: a.guardianPhone,
    guardianKraPin: a.guardianKraPin,
    birthCertUrl: a.birthCertUrl,
    childPhotoUrl: a.childPhotoUrl,
    status: a.status,
    reviewNotes: a.reviewNotes,
    createdAt: a.createdAt.toISOString(),
  }));

  return <JuniorAccountsTable initialApplications={mapped} />;
}
