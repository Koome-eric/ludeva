import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function RealEstatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground font-headline mt-2">
                Real Estate Investment
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Details about our upcoming real estate investment opportunities will be posted here.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
