import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import MusicAggregation from "@/components/MusicAggregation";

export default function MusicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <MusicAggregation />
      </main>
      <PublicFooter />
    </div>
  );
}
