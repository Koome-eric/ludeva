// app/admin/investors/kyc/page.tsx
import { prisma } from '@/lib/prisma';
import { KycTable } from '@/components/KycTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      kraPin: true,
      sourceOfFunds: true,
      dateOfBirth: true,
      placeOfBirthCounty: true,
      placeOfBirthSubCounty: true,
      placeOfBirthWard: true,
      countyOfBirth: true,
      countyOfResidence: true,
      residentialAddress: true,
      employmentStatus: true,
      professionalBackground: true,
      currentOccupation: true,
      ludevaNumber: true,
      maritalStatus: true,
      numberOfKids: true,
      teamName: true,
      selfieUrl: true,
      idCopyUrl: true,
      investmentFormUrl: true,
      lockInYears: true,
      primaryBeneficiaryName: true,
      primaryBeneficiaryPercentage: true,
      primaryBeneficiaryIdNumber: true,
      primaryBeneficiaryEmail: true,
      primaryBeneficiaryPhone: true,
      primaryBeneficiaryIdUrl: true,
      secondaryBeneficiaryName: true,
      secondaryBeneficiaryPercentage: true,
      secondaryBeneficiaryIdNumber: true,
      secondaryBeneficiaryPhone: true,
      secondaryBeneficiaryIdUrl: true,
      nextOfKinName: true,
      nextOfKinPhone: true,
      nextOfKinEmail: true,
      kycStatus: true,
      kycSubmittedAt: true,
      initialInvestment: true,
      role: true,
      onboardingCompleted: true,
      accountType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return <KycTable initialUsers={users as any} />;
}
