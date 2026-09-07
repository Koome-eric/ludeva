import { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Baby,
  ShieldCheck,
  GraduationCap,
  Heart,
  FileText,
  Image as ImageIcon,
  IdCard,
  Phone,
  Landmark,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ludeva Junior Account | Ludeva PLC",
  description:
    "Start saving for your child's future with the Ludeva Junior Account — earn up to 6% p.a. Opened by a parent or guardian, reviewed and activated by our team.",
};

const features = [
  {
    icon: <Baby className="h-6 w-6 text-primary" />,
    title: "Up to 6% p.a.",
    desc: "Your child's savings grow steadily over time, giving them a head start.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "Guardian-Controlled",
    desc: "Only the registered parent or guardian can manage and fund the account on the child's behalf.",
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-primary" />,
    title: "Built for Milestones",
    desc: "Save toward school fees, a first car, university, or whatever your child's future needs.",
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: "A Gift That Grows",
    desc: "A simple, meaningful way to start building financial security for your child from an early age.",
  },
];

const requiredDocuments = [
  {
    icon: <FileText className="h-5 w-5 text-primary" />,
    title: "Child's Birth Certificate",
    desc: "A clear copy confirming the child's identity and date of birth.",
  },
  {
    icon: <ImageIcon className="h-5 w-5 text-primary" />,
    title: "Child's Passport-size Photo",
    desc: "A recent, clear photo of the child.",
  },
  {
    icon: <IdCard className="h-5 w-5 text-primary" />,
    title: "Guardian's ID / Passport",
    desc: "The parent or guardian's national ID or passport number.",
  },
  {
    icon: <Phone className="h-5 w-5 text-primary" />,
    title: "Guardian's Phone Number",
    desc: "For account communication and verification.",
  },
  {
    icon: <Landmark className="h-5 w-5 text-primary" />,
    title: "Guardian's KRA PIN",
    desc: "Required for compliance purposes.",
  },
];

export default function JuniorAccountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-1 rounded-full mb-4">
            For Your Child's Future
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Ludeva Junior Account</h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Give your child a financial head start. Earn up to{" "}
            <strong className="text-primary">6% p.a.</strong> in an account opened and managed by you,
            on their behalf.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white">
              <Link href="/sign-up">Apply for a Junior Account</Link>
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
              { label: "Annual Return", value: "Up to 6%", sub: "p.a., variable" },
              { label: "Minimum Deposit", value: "KES 500", sub: "to get started" },
              { label: "Managed By", value: "Guardian", sub: "Parent or legal guardian" },
              { label: "Activation", value: "On Approval", sub: "After document review" },
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
          <h2 className="text-3xl font-bold text-center mb-10">Why Open a Junior Account?</h2>
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

      {/* Required Documents — this is the key info the client asked for */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Registration Documents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Since this account is opened on behalf of a minor, we require a few documents up front so
              our team can verify and approve the account before it's activated.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {requiredDocuments.map((doc) => (
              <div key={doc.title} className="flex gap-4 items-start bg-white dark:bg-gray-900 rounded-xl border p-5">
                <div className="mt-0.5 flex-shrink-0">{doc.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <ol className="space-y-6">
            {[
              { step: "01", title: "Create Your Ludeva Account", desc: "Sign up and complete your own investor registration as the parent/guardian." },
              { step: "02", title: "Apply for the Junior Account", desc: "From your dashboard, go to Accounts → Ludeva Junior Account and submit the child's details and required documents." },
              { step: "03", title: "We Review & Approve", desc: "Our team verifies the documents. You'll be notified once the account is approved — usually within a few business days." },
              { step: "04", title: "Fund the Account", desc: "Once approved, deposit any amount from KES 500 and watch it grow at up to 6% p.a." },
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
            <strong>Disclaimer:</strong> The Ludeva Junior Account must be opened and operated by a parent or
            legal guardian on behalf of the child. Approval is subject to successful verification of the
            submitted documents. The rate is variable and may change based on prevailing market conditions.
            Terms and conditions apply.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Start Building Their Future Today</h2>
          <p className="mb-6 text-primary-foreground/80">
            Open a Ludeva Junior Account and give your child a financial head start.
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
