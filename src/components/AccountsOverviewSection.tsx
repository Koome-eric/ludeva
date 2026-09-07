// src/components/AccountsOverviewSection.tsx
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, PiggyBank, Baby, ArrowRight } from "lucide-react";

// Money Market Fund and Fixed Deposit were retired — see
// scripts/update-shares-and-retire-products.ts. Keeping this list to the
// currently-offered accounts only.
const accounts = [
  {
    icon: Landmark,
    title: "Shares Account",
    rate: "12% p.a.",
    description: "Own a stake in company growth through a diversified equities portfolio built for long-term returns.",
    href: "/stocks-bonds",
    tone: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: PiggyBank,
    title: "Savings Account",
    rate: "Up to 7% p.a.",
    description: "A flexible, easy-access account with no lock-in period — perfect for everyday saving habits.",
    href: "/savings",
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Baby,
    title: "Ludeva Junior Account",
    rate: "Up to 6% p.a.",
    description: "Opened by a parent or guardian to start saving for a child's future — school fees, milestones, and beyond.",
    href: "/junior-account",
    tone: "bg-rose-500/10 text-rose-600",
  },
];

export default function AccountsOverviewSection() {
  return (
    <section className="relative bg-muted/30 py-20 md:py-28">
      <Container>
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
            Accounts Built for Every Goal
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Whether you're growing your everyday savings, investing for the long term, or securing your
            child's future — Ludeva has an account for you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <Card
                key={account.title}
                className="group flex flex-col rounded-2xl border border-border/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${account.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{account.title}</CardTitle>
                  <p className="text-sm font-semibold text-primary">{account.rate}</p>
                  <CardDescription className="pt-1">{account.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button asChild variant="ghost" className="px-0 text-primary hover:bg-transparent hover:text-primary/80">
                    <Link href={account.href} className="flex items-center gap-1.5">
                      Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
