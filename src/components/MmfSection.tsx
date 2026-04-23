// src/components/MmfSection.tsx
"use client";

import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/PageHero";

const keyFeatures = [
  {
    title: "Low Risk",
    description:
      "Your capital is protected through investments in high-quality, short-term government and corporate securities.",
  },
  {
    title: "High Liquidity",
    description:
      "Enjoy the flexibility to access your funds easily, typically within a few business days.",
  },
  {
    title: "Capital Preservation",
    description:
      "The primary objective is to protect your initial investment from market volatility.",
  },
  {
    title: "Competitive Returns",
    description:
      "Earn attractive returns that often outperform standard savings accounts.",
  },
];

const targetInvestors = [
  "Individuals",
  "Small & Medium Enterprises (SMEs)",
  "SACCOs & Chamas",
  "Diaspora Investors",
];

export default function MmfSection() {
  return (
    <>
      <PageHero
        title="The Ludeva Money Market Fund"
        description="A smart, stable, and secure foundation for your investment portfolio."
        imageSrc="/images/hero-mmf.png"
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-card">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Start Investing Today</h3>
              <p className="text-muted-foreground mb-6">
                The Ludeva MMF is designed for capital preservation and steady growth, making it an ideal choice for your savings.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/sign-up">Start Investing Today</Link>
              </Button>
            </div>

            <div className="bg-background p-8 rounded-lg border shadow-sm">
              <h3 className="text-xl font-bold mb-4">What is a Money Market Fund?</h3>
              <p className="text-muted-foreground">
                A Money Market Fund (MMF) is a type of collective investment scheme that invests in highly liquid, short-term debt instruments. These include treasury bills, commercial papers, and certificates of deposit.
                <br /><br />
                The goal is to provide investors with a low-risk vehicle to earn higher returns than a typical savings account while maintaining easy access to their money.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Features */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">
              Key Features of the Ludeva MMF
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature) => (
              <Card key={feature.title} className="shadow-sm hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Target Investors */}
      <section className="py-16 md:py-24 bg-card">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-4">Who is it for?</h2>
              <p className="text-muted-foreground mb-6">
                The Ludeva MMF is designed for a wide range of investors seeking stability and growth.
              </p>
              <ul className="space-y-4">
                {targetInvestors.map((investor) => (
                  <li key={investor} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="font-medium">{investor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-lg font-semibold">Simple Risk Disclaimer</h3>
              <p className="text-muted-foreground mt-2">
                Investments in the Money Market Fund are not guaranteed. The principal return and yield of the fund will fluctuate with market conditions. Past performance is not indicative of future results. Ludeva PLC and  partners are regulated by Capital Markets Authority ( CMA).
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
