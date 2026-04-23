import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import LeadershipTeam from "@/components/About/LeadershipTeam";
import StaffSection from "@/components/About/StaffSection";

export default function DirectorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        
        <LeadershipTeam />
        
      </main>
      <PublicFooter />
    </div>
  );
}
