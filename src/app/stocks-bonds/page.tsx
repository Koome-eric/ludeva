import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import StocksBondsSection from "@/components/StocksBondsSection";

export default function StocksBondsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <StocksBondsSection />
      </main>
      <PublicFooter />
    </div>
  );
}