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
          {/* Deposits via M-Pesa are not yet activated — show informational overlay */}
          <div className="relative">
            <div className="p-4 rounded-md border bg-yellow-50 text-yellow-900 mb-4">
              <strong>Notice:</strong> Depositing funds via M-Pesa is not yet activated.
              For now, please make manual deposits (bank transfer or cash) and upload your deposit records
              through the Member Reports. Our team will process deposits manually and update your account.
            </div>

            <div className="pointer-events-none opacity-50 select-none">
              <DepositForm />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-4 border text-center shadow">
                <p className="font-semibold">Deposits Temporarily Disabled</p>
                <p className="text-sm text-muted-foreground">M-Pesa deposits are not active yet. Follow the instructions above to deposit manually.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}