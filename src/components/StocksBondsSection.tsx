"use client";

import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/PageHero";

const valuePropositions = [
  {
    title: "Enhanced Growth Potential",
    description:
      "Stocks offer capital appreciation as companies grow, creating powerful long-term wealth accumulation.",
    icon: TrendingUp,
  },
  {
    title: "Portfolio Diversification",
    description:
      "Diversify beyond Money Market Funds with equities and fixed-income assets that react differently to market conditions.",
    icon: BarChart3,
  },
  {
    title: "Broader Market Access",
    description:
      "Gain exposure to local and global markets across multiple industries and investment opportunities.",
    icon: Globe,
  },
];

const investmentBenefits = [
  "Long-term capital appreciation",
  "Access to broader equity markets",
  "Exposure to global and emerging markets",
  "Professional investment analysis and research",
  "Diversified portfolio strategies",
];

export default function StocksBondsSection() {
  return (
    <>
      <PageHero
        title="Ludeva Stocks Portfolio"
        description="Expand your investment potential with a diversified equity portfolio designed for long-term wealth creation."
        imageSrc="/images/hero3.jpg"
      />

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-card">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-2xl font-bold mb-4">Unlock Higher Growth Opportunities</h3>

              <p className="text-muted-foreground mb-6">
                The Ludeva Stocks portfolio provides investors access to
                high-growth investment opportunities beyond traditional
                savings and money market funds.
                <br />
                <br />
                Our equities-focused approach helps investors pursue higher
                long-term returns while maintaining diversified exposure
                across industries and markets.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/sign-up">Start Investing</Link>
              </Button>
            </div>

            <div className="bg-background p-8 rounded-lg border shadow-sm">
              <h3 className="text-xl font-bold mb-4">What Are Stocks?</h3>

              <p className="text-muted-foreground">
                Stocks represent ownership in companies, allowing investors to
                benefit from company growth through price appreciation and
                dividends.
                <br />
                <br />
                An equities-focused portfolio aims for long-term capital
                appreciation through diversified holdings across sectors.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Value Propositions */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold font-headline">Why Invest in Stocks?</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Our Stocks portfolio is designed for investors seeking higher
              returns, broader diversification, and long-term financial
              growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valuePropositions.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="shadow-sm hover:shadow-xl transition duration-300"
                >
                  <CardHeader className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-accent" />
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-card">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-4">Investment Benefits</h2>

              <p className="text-muted-foreground mb-6">
                The Ludeva Stocks portfolio allows investors to pursue
                ambitious financial goals through diversified and strategically
                managed equity investments.
              </p>

              <ul className="space-y-4">
                {investmentBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-lg font-semibold">Investment Risk Notice</h3>

              <p className="text-muted-foreground mt-2">
                Investments in stocks and bonds carry higher risks compared to
                money market funds. Market conditions may cause fluctuations in
                investment value, and returns are not guaranteed. Investors are
                encouraged to consider their financial objectives, risk
                tolerance, and investment horizon before investing.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Portfolio Comparison */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">MMF vs Stocks</h2>
          </div>

          {(() => {
            const rows = [
              { feature: "Risk Level", mmf: "Low", stocks: "High" },
              { feature: "Expected Returns", mmf: "Stable / Moderate", stocks: "High / Variable" },
              { feature: "Investment Horizon", mmf: "Short – Medium Term", stocks: "Long Term" },
              { feature: "Asset Types", mmf: "Treasury Bills & Short-Term Debt", stocks: "Equities & Corporate Bonds" },
            ];

            return (
              <>
                {/* Mobile & tablet: stacked comparison cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                  {rows.map((row) => (
                    <div
                      key={row.feature}
                      className="rounded-xl border bg-card p-5 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-muted-foreground mb-3">
                        {row.feature}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Money Market Fund</span>
                          <span className="font-medium text-right">{row.mmf}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Stocks & Bonds</span>
                          <span className="font-medium text-right">{row.stocks}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: full table */}
                <div className="hidden md:block overflow-x-auto border rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-4">Feature</th>
                        <th className="p-4">Money Market Fund</th>
                        <th className="p-4">Stocks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.feature} className="border-t">
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="p-4">{row.mmf}</td>
                          <td className="p-4">{row.stocks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </Container>
      </section>
    </>
  );
}