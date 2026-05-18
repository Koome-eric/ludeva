import { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Fixed Deposit Account | Ludeva PLC",
  description: "Earn 12.5% Net p.a. with Ludeva Fixed Deposit Account. Safe, guaranteed returns for conservative investors. Minimum investment KES 1,000,000.",
};

const features = [
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "12.5% Net p.a.",
    desc: "Guaranteed annual return, paid out at maturity or periodically as agreed.",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Capital Protected",
    desc: "Your principal is secure. Ideal for risk-averse investors seeking stable growth.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Flexible Tenure",
    desc: "Choose from 3, 6, or 12-month fixed terms aligned to your financial goals.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Transparent Terms",
    desc: "No hidden fees. What you see is what you earn — net of all charges.",
  },
];

export default function FixedDepositPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1 rounded-full mb-4">
            Conservative Investment
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Fixed Deposit Account
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Earn a guaranteed <strong className="text-primary">12.5% Net p.a.</strong> on your savings.
            Designed for conservative investors who value certainty and security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white">
              <Link href="/sign-up">Open an Account</Link>
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
              { label: "Annual Return", value: "12.5%", sub: "Net p.a. guaranteed" },
              { label: "Minimum Investment", value: "KES 1M", sub: "KES 1,000,000" },
              { label: "Risk Profile", value: "Low", sub: "Conservative" },
              { label: "Tenures", value: "3 – 12", sub: "months available" },
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
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose Fixed Deposit?</h2>
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
              { step: "01", title: "Create Your Ludeva Account", desc: "Complete our online KYC and investor registration form." },
              { step: "02", title: "Choose Your Fixed Deposit", desc: "Select your preferred tenure (3, 6, or 12 months) and deposit a minimum of KES 1,000,000." },
              { step: "03", title: "Earn Guaranteed Returns", desc: "Your funds are invested and grow at a guaranteed 12.5% Net p.a. No market risk." },
              { step: "04", title: "Receive Your Payout", desc: "At maturity, your principal plus interest is paid directly to your account." },
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

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs text-muted-foreground text-center border rounded-lg p-4">
            <strong>Disclaimer:</strong> The 12.5% Net p.a. return is based on current market conditions and Ludeva's investment strategy.
            Fixed deposits are subject to Ludeva PLC's terms and conditions. Past performance is not a guarantee of future results.
            Capital may be at risk. Please consult our advisors before investing.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="mb-6 text-primary-foreground/80">
            Join hundreds of conservative investors already growing their wealth with Ludeva Fixed Deposits.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/sign-up">Get Started Today</Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
