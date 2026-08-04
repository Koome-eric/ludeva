import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DepositForm } from "@/components/DepositForm"
import { getCurrentUserFromDB } from "@/lib/user"
import { assertKycApproved } from "@/lib/auth-guard"
import { redirect } from "next/navigation"

export default async function DepositPage() {
  const user = await getCurrentUserFromDB();
  if (!user) redirect("/sign-in");
  assertKycApproved(user);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">Add Investment</h1>
        <p className="text-muted-foreground">
          Securely fund your investment account using M-Pesa.
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Enter an amount and confirm the M-Pesa STK prompt.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <DepositForm />
        </CardContent>
      </Card>
    </div>
  )
}