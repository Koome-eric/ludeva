import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeListener } from "@/components/realtime-listener";

export default async function MMFProductsPage() {
  const mmfProducts = await prisma.investmentProduct.findMany({
    where: { category: "MONEY_MARKET" }, // ✅ Updated enum value
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <RealtimeListener event="investmentproduct:update" />

      <Card>
        <CardHeader>
          <CardTitle>Money Market Funds (MMF)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Fund Name</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Current NAV</th>
                  <th className="p-4 text-left">Investors</th>
                  <th className="p-4 text-left">Inception Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mmfProducts.map((mmf) => (
                  <tr key={mmf.id} className="border-b last:border-none">
                    <td className="p-4 font-medium">{mmf.name}</td>
                    <td className="p-4">
                      <Badge className={mmf.isActive ? "bg-green-600" : "bg-yellow-500"}>
                        {mmf.isActive ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="p-4">{mmf.nav ? `KES ${mmf.nav.toFixed(2)}` : "N/A"}</td>
                    <td className="p-4">{mmf.activeInvestors || 0}</td>
                    <td className="p-4">{mmf.inceptionDate ? format(mmf.inceptionDate, "dd MMM, yyyy") : "N/A"}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}