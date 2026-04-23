import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import TeamsSection from "@/components/TeamsSection";

export default function TeamsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <TeamsSection />
      </main>
      <PublicFooter />
    </div>
  );
}