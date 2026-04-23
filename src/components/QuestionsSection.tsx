// src/components/QuestionsSection.tsx
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuestionsSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline">
            Have Questions?
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
            Our team is ready to provide you with the information you need to
            make smart investment decisions.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
