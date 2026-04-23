import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import MmfSection from "@/components/MmfSection";

export default function MmfPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <MmfSection />
      </main>
      <PublicFooter />
    </div>
  );
}
