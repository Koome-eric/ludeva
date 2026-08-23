import { auth } from "@clerk/nextjs/server";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import LChamaSection from "@/components/LChamaSection";

export default async function TeamsPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <LChamaSection hasAccount={!!userId} />
      </main>
      <PublicFooter />
    </div>
  );
}
