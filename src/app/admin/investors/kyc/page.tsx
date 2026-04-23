// app/admin/investors/kyc/page.tsx
import { prisma } from '@/lib/prisma';
import { KycTable } from '@/components/KycTableClient';

export default async function KYCManagementPage() {
  const users = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    orderBy: { kycSubmittedAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      nationalId: true,
      dateOfBirth: true,
      countyOfBirth: true,
      countyOfResidence: true,
      ludevaNumber: true,
      maritalStatus: true,
      numberOfKids: true,
      nextOfKinName: true,
      nextOfKinPhone: true,
      nextOfKinEmail: true,
      kycStatus: true,
      kycSubmittedAt: true,
      initialInvestment: true,
      role: true,
      onboardingCompleted: true,
      accountType: true, // ✅ added
      createdAt: true,
      updatedAt: true,
    },
  });

  return <KycTable initialUsers={users} />;
}