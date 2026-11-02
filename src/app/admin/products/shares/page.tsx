import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealtimeListener } from "@/components/realtime-listener";

export default async function SharesProductsPage() {
  const sharesProducts = await prisma.investmentProduct.findMany({
    where: { category: "EQUITY" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <RealtimeListener event="investmentproduct:update" />

      <Card>
        <CardHeader>
          <CardTitle>Shares Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Product Name</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Current NAV</th>
                  <th className="p-4 text-left">Investors</th>
                  <th className="p-4 text-left">Inception Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sharesProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-none">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">
                      <Badge className={product.isActive ? "bg-green-600" : "bg-yellow-500"}>
                        {product.isActive ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="p-4">{product.nav ? `KES ${product.nav.toFixed(2)}` : "N/A"}</td>
                    <td className="p-4">{product.activeInvestors || 0}</td>
                    <td className="p-4">{product.inceptionDate ? format(product.inceptionDate, "dd MMM, yyyy") : "N/A"}</td>
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