// src/components/WhyChooseLudevaSection.tsx
import Container from "@/components/ui/Container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ShieldCheck,
  GanttChartSquare,
  Users,
  Briefcase,
} from "lucide-react";

const reasons = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Strong Governance",
    description:
      "Our robust governance framework ensures that every decision is made with our investors' best interests at heart, promoting transparency and accountability.",
  },
  {
    icon: <GanttChartSquare className="h-10 w-10 text-primary" />,
    title: "Disciplined Risk Management",
    description:
      "We employ a rigorous, multi-layered approach to risk management to safeguard your capital while navigating market complexities.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Investor-Focused Approach",
    description:
      "You are our partner. We are committed to providing exceptional service, clear communication, and educational resources to support your financial journey.",
  },
  {
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    title: "Professional Fund Management",
    description:
      "Our team of seasoned investment professionals brings deep market expertise to manage the fund with diligence and a forward-looking perspective.",
  },
];

export default function WhyChooseLudevaSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <Container>
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline">
            Why Choose Ludeva?
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            We are built on a foundation of integrity, expertise, and a relentless
            focus on you, our investor.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <Card key={reason.title} className="text-center p-4">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {reason.icon}
                </div>
                <CardTitle>{reason.title}</CardTitle>
              </CardHeader>
              <CardDescription>{reason.description}</CardDescription>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
