import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProfileForm } from "./ProfileForm";
import { getCurrentUserFromDB } from "@/lib/user";
import { redirect } from "next/navigation";

type KycStatus = "Completed" | "Pending";

function getKycStatus(onboardingCompleted: boolean): KycStatus {
  return onboardingCompleted ? "Completed" : "Pending";
}

function getKycStatusVariant(status: KycStatus): "success" | "warning" {
  return status === "Completed" ? "success" : "warning";
}

// ✅ Format Account Type for UI
function formatAccountType(type: string | undefined) {
  if (!type) return "Individual";
  return type.charAt(0) + type.slice(1).toLowerCase();
}

// ✅ Badge Variant Logic (UPGRADE)
function getAccountTypeVariant(type: string | undefined) {
  return type === "TEAM" ? "default" : "secondary";
}

export default async function ProfilePage() {
  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");

  const kycStatus = getKycStatus(user.onboardingCompleted);

  // ✅ SAFE ACCESS (fix TS edge cases)
  const rawAccountType = (user as any).accountType as string | undefined;

  const accountType = formatAccountType(rawAccountType);
  const accountTypeVariant = getAccountTypeVariant(rawAccountType);

  // Full KYC profile data
  const profileData = {
    fullName: user.fullName || "",
    phone: user.phone || "",
    nationalId: user.nationalId || "",
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split("T")[0]
      : "",
    countyOfBirth: user.countyOfBirth || "",
    countyOfResidence: user.countyOfResidence || "",
    ludevaNumber: user.ludevaNumber || "",
    maritalStatus: user.maritalStatus || "",
    numberOfKids: user.numberOfKids || 0,
    nextOfKinName: user.nextOfKinName || "",
    nextOfKinPhone: user.nextOfKinPhone || "",
    nextOfKinEmail: user.nextOfKinEmail || "",
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details and investor verification information.
        </p>
      </div>

      {/* Account Summary */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Your primary account details.
            </CardDescription>
          </div>

          <Badge
            variant={getKycStatusVariant(kycStatus)}
            className="self-start sm:self-center"
          >
            KYC Status: {kycStatus}
          </Badge>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-1">
            <Label>Email Address</Label>
            <p className="font-medium break-all">{user.email}</p>
          </div>

          {/* ✅ Account Type (UPGRADED UI) */}
          <div className="space-y-1">
            <Label>Account Type</Label>
            <div>
              <Badge variant={accountTypeVariant}>
                {rawAccountType === "TEAM" ? "👥 " : "🧑 "}
                {accountType}
              </Badge>
            </div>
          </div>

          {/* Investment */}
          {user.initialInvestment != null && (
            <div className="space-y-1">
              <Label>Initial Investment Intent</Label>
              <p className="text-2xl font-bold">
                KES{" "}
                {user.initialInvestment.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Declared during onboarding (non-binding).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Personal & Investor Details</CardTitle>
          <CardDescription>
            Ensure your information matches your official documents.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ProfileForm profileData={profileData} />
        </CardContent>
      </Card>
    </div>
  );
}