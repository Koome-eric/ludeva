import Link from "next/link";
import {
  ArrowRight,
  Users2,
  ShieldCheck,
  LayoutDashboard,
  Wallet,
  Shield,
  Globe,
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamAnalyticsSection from "@/components/TeamAnalyticsSection";

// This page reuses the same design tokens (bg-background, bg-card, text-primary,
// text-muted-foreground, etc.) and typography (font-headline for headings) as the
// rest of the public site, so it follows the same light/dark theme automatically —
// no page-specific palette or fonts.

const CORE_PRINCIPLES = [
  {
    icon: <Shield className="h-7 w-7" />,
    title: "Transparency",
    description:
      "Clear, open processes that let every member understand and trust the system.",
  },
  {
    icon: <Users2 className="h-7 w-7" />,
    title: "Community",
    description:
      "Builds connections through shared financial goals — whether the chama is next door or across borders.",
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: "Financial Discipline",
    description:
      "Encourages structured savings and consistent long-term wealth building.",
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: "Accessibility",
    description:
      "A tiered structure allows participation from low-income to high-value investors.",
  },
];

const TIER_DATA = [
  { tier: "Nyota", monthly: "KES 1,000", payout: "KES 10,000", size: 10 },
  { tier: "Pepea", monthly: "KES 2,000", payout: "KES 20,000", size: 10 },
  { tier: "Alpha", monthly: "KES 3,000", payout: "KES 30,000", size: 10 },
  { tier: "Romeo", monthly: "KES 3,000", payout: "KES 30,000", size: 10 },
  { tier: "Juliet", monthly: "KES 5,000", payout: "KES 50,000", size: 10 },
  { tier: "Silver", monthly: "KES 10,000", payout: "KES 100,000", size: 10 },
  { tier: "Bronze", monthly: "KES 15,000", payout: "KES 150,000", size: 10 },
  { tier: "Diamond", monthly: "KES 20,000", payout: "KES 200,000", size: 10 },
  { tier: "Gold", monthly: "KES 30,000", payout: "KES 300,000", size: 10 },
  { tier: "Queens", monthly: "KES 40,000", payout: "KES 400,000", size: 10 },
  { tier: "Kings", monthly: "KES 50,000", payout: "KES 500,000", size: 10 },
  { tier: "Platinum", monthly: "KES 100,000", payout: "KES 1,000,000", size: 10 },
  { tier: "Rhodium", monthly: "KES 200,000", payout: "KES 2,000,000", size: 10 },
];

const TARGET_AUDIENCE = [
  "Diaspora Communities – Individuals sending or receiving money globally who want a secure way to invest back home.",
  "Social Groups – Table banking groups, families, SMEs, and community savings groups.",
  "Emerging Market Savers – Individuals with irregular income needing disciplined saving and investment.",
  "Financial Investors – High-value individuals attracted to 9–13% MMF returns and pooled capital.",
];

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: "Invest your way",
    body: "Every member contributes on their own terms — straight into the shared pool, or kept as a personal stake alongside it.",
  },
  {
    icon: ShieldCheck,
    title: "Roles, not hierarchy",
    body: "Decide who can invite, who can approve a withdrawal, who can see the full books. No single admin has to carry it all.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard",
    body: "The moment someone joins, they see the chama's numbers — no separate logins, no waiting on someone else to report back.",
  },
];

const MZUNGUKO = [
  {
    n: "Mzunguko 1",
    title: "Sign up",
    body: "Create your Ludeva account — the same sign-up every investor uses.",
  },
  {
    n: "Mzunguko 2",
    title: "Name your chama",
    body: "Choose Team / Group Account at step one of onboarding and give it a name.",
  },
  {
    n: "Mzunguko 3",
    title: "Get verified",
    body: "Complete KYC like any individual applicant — details, ID, and a selfie.",
  },
  {
    n: "Mzunguko 4",
    title: "Bring in your chama",
    body: "Invite members by email from L Chama and set exactly what each one can do.",
  },
];

const ROLE_CHIPS = [
  "Invite members",
  "Approve withdrawals",
  "View pooled funds",
  "View full reports",
  "Manage documents",
  "Contribute to the pool",
];

export default function LChamaSection({ hasAccount = false }: { hasAccount?: boolean }) {
  return (
    <>
      {/* ── HERO — reuses the site's existing PageHero + hero image ── */}
      <PageHero
        title="L Chama"
        description="Invest as one. Grow as many. A chama is a group of people who save and invest together — L Chama brings that tradition onto Ludeva, with everyone contributing on their own terms under one shared dashboard."
        imageSrc="/images/hero-mmf.png"
      />

      {/* ── WHAT L CHAMA IS ── */}
      <section className="bg-background py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold font-headline mb-4 text-center">
            What L Chama Is
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-center mb-6">
            L Chama is Ludeva&rsquo;s modern take on the traditional savings group.
            It combines structured savings, investment through a Money Market Fund
            (MMF), and a collateralized payout system to provide both security and
            growth for every member — individually verified before they join the
            circle.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto text-center">
            The platform enables short-term capital access and long-term wealth
            creation for individuals across Kenya and the diaspora, while reducing
            risk through a secure, tiered group system.
          </p>
        </Container>
      </section>

      {/* ── CORE PRINCIPLES ── */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline mb-2">Core Principles</h2>
            <p className="text-muted-foreground">
              Built on trust, discipline, and accessibility for every chama.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {CORE_PRINCIPLES.map((principle) => (
              <Card
                key={principle.title}
                className="rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg">
                    {principle.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="bg-background py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold font-headline max-w-lg text-center mx-auto">
            What makes it a chama, not just a shared login
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="border-t-2 border-primary pt-4">
                <v.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-headline font-semibold text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── TIERED MEMBERSHIP ── */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold font-headline text-center mb-6">
            Tiered Membership Structure
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            13 tiers designed for inclusive participation from low-value to
            high-value investors.
          </p>

          {/* Mobile & tablet: card list */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {TIER_DATA.map((tier) => (
              <div
                key={tier.tier}
                className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold font-headline text-primary">
                    {tier.tier}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {tier.size} members
                  </span>
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Monthly Contribution</dt>
                    <dd className="font-semibold">{tier.monthly}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Payout Value</dt>
                    <dd className="font-semibold">{tier.payout}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-left">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-4 py-2">Tier</th>
                  <th className="px-4 py-2">Monthly Contribution</th>
                  <th className="px-4 py-2">Payout Value</th>
                  <th className="px-4 py-2">Group Size</th>
                </tr>
              </thead>
              <tbody className="bg-background">
                {TIER_DATA.map((tier) => (
                  <tr key={tier.tier} className="border-t border-border/50 hover:bg-muted/40">
                    <td className="px-4 py-2">{tier.tier}</td>
                    <td className="px-4 py-2">{tier.monthly}</td>
                    <td className="px-4 py-2">{tier.payout}</td>
                    <td className="px-4 py-2">{tier.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4 text-center">
            Payout values are based on a 10-member group over a 10-month cycle.
            First cycle contributions are invested in the Ludeva MMF earning
            approximately 9%–13% annually.
          </p>
        </Container>
      </section>

      {/* ── HOW IT WORKS (Mzunguko 1–4) + the ring illustration ── */}
      <section className="bg-background py-16 md:py-24">
        <Container>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            {/* Signature: the Mzunguko Ring — a rotating table-banking circle */}
            <div className="relative mx-auto w-full max-w-[280px] aspect-square" aria-hidden>
              <div className="absolute inset-0 rounded-full border border-border" />
              <div className="absolute inset-8 rounded-full border border-border/60" />

              <div className="absolute inset-0 animate-chama-rotate motion-reduce:animate-none">
                {["N", "K", "W", "A", "M", "J"].map((initial, i, arr) => {
                  const angle = (360 / arr.length) * i;
                  return (
                    <div
                      key={initial}
                      className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transform: `rotate(${angle}deg) translate(120px) rotate(-${angle}deg)`,
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {initial}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* the rotating "whose turn" marker */}
              <div className="absolute inset-0 animate-chama-rotate-reverse motion-reduce:animate-none">
                <div
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.5)]"
                  style={{ transform: "translate(-50%, -50%) translateY(-120px)" }}
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                    Round
                  </div>
                  <div className="font-headline text-2xl">Mzunguko</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold font-headline max-w-lg">
                Four rounds to get your chama running
              </h2>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {MZUNGUKO.map((step) => (
                  <Card
                    key={step.n}
                    className="rounded-2xl border border-border/50 bg-card shadow-sm"
                  >
                    <CardContent className="p-6">
                      <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                        {step.n}
                      </div>
                      <h3 className="mt-3 font-headline font-semibold text-lg">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {step.body}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── HOW L CHAMA WORKS ── */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold font-headline mb-6 text-center">
            How L Chama Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-2xl border border-border/50 bg-background shadow-sm">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> First Cycle (Collateral Phase)
                </h3>
                <p className="text-muted-foreground">
                  Contributions are invested in the Ludeva MMF account, earning
                  9%–13% annually. This serves as collateral and risk protection.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-background shadow-sm">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Second Cycle (Payout Phase)
                </h3>
                <p className="text-muted-foreground">
                  Members begin receiving payouts. Funds can be withdrawn or
                  reinvested. Payments are processed within 24 hours via chama
                  coordination.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-background shadow-sm">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" /> Virtual Meetings
                </h3>
                <p className="text-muted-foreground">
                  Mandatory bi-weekly meetings ensure accountability, manage
                  rotation, and strengthen group trust.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/50 bg-background shadow-sm">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Risk Management
                </h3>
                <p className="text-muted-foreground">
                  If a member defaults, their MMF collateral is used to cover the
                  payout. The member is removed and must reinvest to rejoin.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* ✅ L CHAMA ANALYTICS — auto-shows latest upload, hidden when no data exists */}
      <TeamAnalyticsSection />

      {/* ── ROLES ── */}
      <section className="bg-background py-16 md:py-24">
        <Container>
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Users2 className="h-5 w-5 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Everyone plays a role</h2>
          </div>
          <p className="max-w-lg mx-auto text-center text-muted-foreground leading-relaxed">
            When you invite someone, you choose exactly what they can do — from day one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ROLE_CHIPS.map((chip) => (
              <span
                key={chip}
                className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* ── TARGET AUDIENCE ── */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold font-headline mb-6 text-center">
            Who L Chama Is For
          </h2>
          <ul className="list-disc list-inside max-w-3xl mx-auto text-muted-foreground space-y-2">
            {TARGET_AUDIENCE.map((aud) => (
              <li key={aud}>{aud}</li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-background py-16 md:py-24 border-t border-border">
        <Container>
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-bold font-headline">Ready to start your chama?</h2>
            <p className="mt-2 text-muted-foreground">
              {hasAccount
                ? "Head to L Chama in your dashboard to finish onboarding and set up your group."
                : "Sign up in minutes — you'll be the owner, and can invite the rest after verification."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {hasAccount ? (
                <Button asChild size="lg">
                  <Link href="/member/team">
                    Go to L Chama <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/sign-up">
                      Sign Up <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
