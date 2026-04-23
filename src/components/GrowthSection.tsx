// src/components/GrowthSection.tsx
import Container from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Briefcase, Landmark } from "lucide-react";

export default function GrowthSection() {
  return (
    <section className="relative bg-background py-20 md:py-28">
      <Container>
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
            A Smarter Way to Grow Your Money
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Our Money Market Fund is built on principles of security and steady
            growth, making it ideal for both new and seasoned investors.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Low Risk, Stable Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                We prioritize capital preservation by investing in
                high-quality, short-term securities.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
                <Landmark className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-semibold">
                High Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Access your funds when you need them with our fast and
                transparent withdrawal process.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
                <Briefcase className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Professional Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Our experienced investment professionals ensure your money
                works efficiently for you.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}
