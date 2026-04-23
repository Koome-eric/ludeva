import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import AboutSection from "@/components/AboutSection";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <AboutSection />
        
      </main>
      <PublicFooter />
    </div>
  );
}
