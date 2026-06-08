import Container from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Globe, TrendingUp, CalendarCheck } from "lucide-react";
import PageHero from "@/components/PageHero";
import TeamAnalyticsSection from "@/components/TeamAnalyticsSection";

export default function TeamsSection() {
  const corePrinciples = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Transparency",
      description:
        "Clear, open processes that allow members globally to understand and trust the system.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community",
      description:
        "Builds global connections through shared financial goals across borders.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Financial Discipline",
      description:
        "Encourages structured savings and consistent long-term wealth building.",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Accessibility",
      description:
        "Tiered structure allows participation from low-income to high-value investors.",
    },
  ];

  const tierData = [
    { tier: "Nyota",    monthly: "KES 1,000",   payout: "KES 10,000",    size: 10 },
    { tier: "Pepea",    monthly: "KES 2,000",   payout: "KES 20,000",    size: 10 },
    { tier: "Alpha",    monthly: "KES 3,000",   payout: "KES 30,000",    size: 10 },
    { tier: "Romeo",    monthly: "KES 3,000",   payout: "KES 30,000",    size: 10 },
    { tier: "Juliet",   monthly: "KES 5,000",   payout: "KES 50,000",    size: 10 },
    { tier: "Silver",   monthly: "KES 10,000",  payout: "KES 100,000",   size: 10 },
    { tier: "Bronze",   monthly: "KES 15,000",  payout: "KES 150,000",   size: 10 },
    { tier: "Diamond",  monthly: "KES 20,000",  payout: "KES 200,000",   size: 10 },
    { tier: "Gold",     monthly: "KES 30,000",  payout: "KES 300,000",   size: 10 },
    { tier: "Queens",   monthly: "KES 40,000",  payout: "KES 400,000",   size: 10 },
    { tier: "Kings",    monthly: "KES 50,000",  payout: "KES 500,000",   size: 10 },
    { tier: "Platinum", monthly: "KES 100,000", payout: "KES 1,000,000", size: 10 },
    { tier: "Rhodium",  monthly: "KES 200,000", payout: "KES 2,000,000", size: 10 },
  ];

  const targetAudience = [
    "Diaspora Communities – Individuals sending or receiving money globally who want a secure way to invest back home.",
    "Chamas & Social Groups – Table banking groups, families, SMEs, and community savings groups.",
    "Emerging Market Savers – Individuals with irregular income needing disciplined saving and investment.",
    "Financial Investors – High-value individuals attracted to 9–13% MMF returns and pooled capital.",
  ];

  return (
    <>
      <PageHero
        title="Ludeva Teams Global"
        description="A capital-raising, savings, and investment platform transforming traditional chamas into a secure global financial system."
        imageSrc="/images/hero-mmf.png"
      />

      {/* What Teams Global Is */}
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold mb-4 text-center">
            What Teams Global Is
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-center mb-6">
            Ludeva Teams Global is a modern financial platform designed by
            Ludeva Plc to digitize and enhance traditional savings groups
            (chamas). It combines structured savings, investment through a Money
            Market Fund (MMF), and a collateralized payout system to provide both
            security and growth.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto text-center">
            The platform enables short-term capital access and long-term wealth
            creation for individuals across Kenya and the diaspora, while
            reducing risk through a secure, tiered group system.
          </p>
        </Container>
      </section>

      {/* Core Principles */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Core Principles</h2>
            <p className="text-muted-foreground">
              Built on trust, discipline, and global accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {corePrinciples.map((principle) => (
              <Card key={principle.title}>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4 inline-block">
                    {principle.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Tiered Membership */}
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-6">
            Tiered Membership Structure
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            13 tiers designed for inclusive participation from low-value to
            high-value investors.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-300">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-4 py-2 border">Tier</th>
                  <th className="px-4 py-2 border">Monthly Contribution</th>
                  <th className="px-4 py-2 border">Payout Value</th>
                  <th className="px-4 py-2 border">Group Size</th>
                </tr>
              </thead>
              <tbody>
                {tierData.map((tier) => (
                  <tr key={tier.tier} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{tier.tier}</td>
                    <td className="px-4 py-2 border">{tier.monthly}</td>
                    <td className="px-4 py-2 border">{tier.payout}</td>
                    <td className="px-4 py-2 border">{tier.size}</td>
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

      {/* How It Works */}
      <section className="bg-card py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold mb-6 text-center">
            How Teams Global Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> First Cycle
                  (Collateral Phase)
                </h3>
                <p className="text-muted-foreground">
                  Contributions are invested in the Ludeva MMF account, earning
                  9%–13% annually. This serves as collateral and risk protection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Second Cycle
                  (Payout Phase)
                </h3>
                <p className="text-muted-foreground">
                  Members begin receiving payouts. Funds can be withdrawn or
                  reinvested. Payments are processed within 24 hours via team
                  coordination.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" /> Virtual
                  Meetings
                </h3>
                <p className="text-muted-foreground">
                  Mandatory bi-weekly meetings ensure accountability, manage
                  rotation, and strengthen group trust.
                </p>
              </CardContent>
            </Card>

            <Card>
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

      {/* ✅ TEAM ANALYTICS — auto-shows latest upload, hidden when no data exists */}
      <TeamAnalyticsSection />

      {/* Target Audience */}
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-bold mb-6 text-center">
            Target Audience
          </h2>
          <ul className="list-disc list-inside max-w-3xl mx-auto text-muted-foreground space-y-2">
            {targetAudience.map((aud) => (
              <li key={aud}>{aud}</li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
