import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import HeroSection from "@/components/HeroSection";
import AccountsOverviewSection from "@/components/AccountsOverviewSection";
import GrowthSection from "@/components/GrowthSection";
import WhyChooseLudevaSection from "@/components/WhyChooseLudevaSection";
import QuestionsSection from "@/components/QuestionsSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <div className="flex-1 w-full">
        <HeroSection />
        <div id="explore" className="scroll-mt-0">
          <AccountsOverviewSection />
        </div>
        <GrowthSection />
        <WhyChooseLudevaSection />
        <QuestionsSection />
      </div>

      <PublicFooter />
    </div>
  );
}
