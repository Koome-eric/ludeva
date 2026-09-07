import { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Zap, Wallet, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Savings Account | Ludeva PLC",
  description:
    "Earn up to 7% p.a. with the Ludeva Savings Account. A flexible, easy-access account with no lock-in period. Minimum deposit KES 500.",
};

const features = [
  {
    icon: <PiggyBank className="h-6 w-6 text-primary" />,
    title: "Up to 7% p.a.",
    desc: "Your balance earns a competitive return, credited to your account regularly.",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "No Lock-in Period",
    desc: "Top up or access your savings whenever you need to — this account is built for flexibility, not fixed terms.",
  },
  {
    icon: <Wallet className="h-6 w-6 text-primary" />,
    title: "Low Minimum Deposit",
    desc: "Start saving with as little as KES 500. There's no barrier to building the habit.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Simple & Transparent",
    desc: "No hidden fees or confusing terms — just a straightforward way to grow your everyday savings.",
  },
];

export default function SavingsAccountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1 rounded-full mb-4">
            Everyday Savings
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Savings Account</h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Earn up to <strong className="text-primary">7% p.a.</strong> on your everyday savings, with
            no lock-in and no complicated terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white">
              <Link href="/sign-up">Open a Savings Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Speak to an Advisor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12 px-4 bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Annual Return", value: "Up to 7%", sub: "p.a., variable" },
              { label: "Minimum Deposit", value: "KES 500", sub: "to get started" },
              { label: "Risk Profile", value: "Low", sub: "Capital protected" },
              { label: "Access", value: "Anytime", sub: "No lock-in period" },
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose the Savings Account?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="rounded-2xl">
                <CardContent className="p-6 flex gap-4">
                  <div className="mt-1 flex-shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <ol className="space-y-6">
            {[
              { step: "01", title: "Create Your Ludeva Account", desc: "Complete our quick online sign-up and investor registration." },
              { step: "02", title: "Open Your Savings Account", desc: "From your dashboard, open a Savings Account with a minimum deposit of KES 500." },
              { step: "03", title: "Top Up Anytime", desc: "Add to your savings whenever suits you — weekly, monthly, or as a lump sum." },
              { step: "04", title: "Watch it Grow", desc: "Your balance earns up to 7% p.a., with no lock-in period restricting your access." },
            ].map((s) => (
              <li key={s.step} className="flex gap-5 items-start">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Compare with other accounts */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Not sure which account fits you?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            If you want higher, long-term-linked returns, explore our{" "}
            <Link href="/stocks-bonds" className="text-primary font-medium underline">
              Shares Account
            </Link>
            . Saving on behalf of a child instead? See the{" "}
            <Link href="/junior-account" className="text-primary font-medium underline">
              Ludeva Junior Account
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs text-muted-foreground text-center border rounded-lg p-4">
            <strong>Disclaimer:</strong> The rate on the Savings Account is variable and may change based on
            prevailing market conditions and Ludeva PLC's policies. Terms and conditions apply. Please consult
            our advisors if you have any questions before opening an account.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Start Saving Today</h2>
          <p className="mb-6 text-primary-foreground/80">
            Open a Ludeva Savings Account in minutes and start earning on your everyday savings.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
