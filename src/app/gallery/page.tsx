import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import GallerySection from "@/components/GallerySection";

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <GallerySection />
      </main>
      <PublicFooter />
    </div>
  );
}
