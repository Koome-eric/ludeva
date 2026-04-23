import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function AgribusinessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground font-headline mt-2">
                Community Agriculture
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Information on our community-based agribusiness projects is coming soon.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
