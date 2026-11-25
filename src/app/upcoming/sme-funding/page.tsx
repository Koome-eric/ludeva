import PublicHeader from '@/components/PublicHeader';
import PageHero from '@/components/PageHero';
import PublicFooter from '@/components/PublicFooter';

export default function SmeFundingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <PageHero eyebrow="Coming soon" title="SME Development Funds" description="Our new fund to support Small and Medium Enterprises is in development. More details will be shared soon." />
      </main>
      <PublicFooter />
    </div>
  );
}
