// src/components/AboutSection.tsx
"use client";

import Container from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Shield, TrendingUp } from "lucide-react";
import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutSection() {
  const corePrinciples = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Governance & Protection",
      description:
        "We operate with the highest standards of corporate governance to ensure investor protection and build lasting trust.",
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Transparency",
      description:
        "You deserve to know how your money is being managed. We provide clear, regular updates on fund performance and strategy.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Long-Term Wealth Creation",
      description:
        "Our focus is not on short-term gains but on sustainable, long-term growth for your financial future.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <PageHero
        title="About Us"
        description="Ludeva PLC Founded in 2023"
        imageSrc="/images/hero-about.png"
      />

      {/* ABOUT SECTION */}
      <section className="py-16 md:py-24 bg-white dark:bg-black">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Who We Are
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Ludeva Public Ltd is a forward-thinking investment and financial
              services organization built on the principles of transparency,
              accessibility, and shared prosperity. Founded with a mission to
              democratize wealth creation in Kenya, Ludeva enables individuals
              and groups to grow their finances through structured, secure, and
              high-yield investment opportunities.
            </p>
          </div>
        </Container>
      </section>

      {/* IMPACT SECTION */}
      <section className="py-16 md:py-24 bg-[#FCFCFC] dark:bg-neutral-950">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* LEFT: TEXT */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Impact
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Since inception, Ludeva has continued to build trust and impact
                lives through innovative programs such as the{" "}
                <span className="font-semibold text-primary">
                  Ludeva TEAMS
                </span>{" "}
                — a structured group savings initiative that promotes financial
                discipline and passive income generation — and the{" "}
                <span className="font-semibold text-primary">
                  Money Market Fund
                </span>
                , offering stable annual returns of{" "}
                <span className="font-semibold text-[#D4AF37]">
                  9%–13% p.a.
                </span>
                .
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Our goal is to make investing not only possible but practical for
                all Kenyans.
              </p>
            </div>

            {/* RIGHT: IMAGE */}
            <div className="relative w-full h-[300px] md:h-[400px]">
              <Image
                src="/images/ludevainvestments.jpg" // 👉 replace with your actual image
                alt="Ludeva Impact"
                fill
                className="object-cover rounded-2xl shadow-lg"
                priority
              />
            </div>

          </div>
        </Container>
      </section>


      {/* CORE PRINCIPLES */}
      <section className="py-16 md:py-24 bg-card">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">
              Our Core Principles
            </h2>
            <p className="text-muted-foreground mt-2">
              Our commitment to you is built on these foundational values.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {corePrinciples.map((principle, index) => (
              <Card key={`${principle.title}-${index}`}>
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
    </>
  );
}