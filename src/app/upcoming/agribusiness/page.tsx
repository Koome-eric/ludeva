import PublicHeader from '@/components/PublicHeader';
import PageHero from '@/components/PageHero';
import PublicFooter from '@/components/PublicFooter';

export default function AgribusinessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <PageHero eyebrow="Coming soon" title="Community Agriculture" description="Information on our community-based agribusiness projects is coming soon." />
      </main>
      <PublicFooter />
    </div>
  );
}
