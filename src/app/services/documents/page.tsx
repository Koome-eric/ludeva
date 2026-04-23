import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import DocumentsSection from '@/components/DocumentsSection';

export default function DocumentsHubPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
          <PublicHeader />
          <main className="flex-1">
            <DocumentsSection />
          </main>
          <PublicFooter />
        </div>
  );
}
