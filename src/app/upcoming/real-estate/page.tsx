import PublicHeader from '@/components/PublicHeader';
import PageHero from '@/components/PageHero';
import PublicFooter from '@/components/PublicFooter';

export default function RealEstatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <PageHero eyebrow="Coming soon" title="Real Estate Investment" description="Details about our upcoming real estate investment opportunities will be posted here." />
      </main>
      <PublicFooter />
    </div>
  );
}
