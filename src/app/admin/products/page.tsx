import { prisma } from "@/lib/prisma";
import InvestmentProductsClient from "@/components/InvestmentProductsClient";

export default async function InvestmentProductsPage() {
  const products = await prisma.investmentProduct.findMany({
    orderBy: { createdAt: "desc" },
  });

  const mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category ?? "MMF",
    roi: p.roi,
    duration: p.duration,
    minAmount: p.minAmount ?? 0,
    nav: p.nav ?? null,
    inceptionDate: p.inceptionDate
      ? p.inceptionDate.toISOString().split("T")[0]
      : null,
    isActive: p.isActive,
    activeInvestors: p.activeInvestors ?? 0,
  }));

  return (
    <InvestmentProductsClient
      initialProducts={mappedProducts}
    />
  );
}