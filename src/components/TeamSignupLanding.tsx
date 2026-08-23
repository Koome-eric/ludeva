import Link from "next/link";
import { ArrowRight, Users2, ShieldCheck, LayoutDashboard, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Uses the same theme tokens (bg-card, text-primary, text-muted-foreground, etc.)
// as the rest of the member dashboard, so it follows light/dark mode automatically.

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

export function TeamSignupLanding({ hasAccount = false }: { hasAccount?: boolean }) {
  return (
    <div className="space-y-6">
      {/* ── HERO ── */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium mb-3">
                A Ludeva Product
              </p>
              <h1 className="font-headline text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
                L <span className="text-primary">Chama</span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-xl">
                Invest as one. Grow as many.
              </p>
              <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
                A chama is a group of people who save and invest together. L Chama brings
                that tradition onto Ludeva — everyone contributes on their own terms, and
                the whole group shares one dashboard.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {hasAccount ? (
                  <Button asChild size="lg">
                    <Link href="/onboarding/investment">
                      Continue Onboarding <ArrowRight className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>

      {/* ── VALUE PROPS ── */}
      <div>
        <h2 className="font-headline text-xl sm:text-2xl font-bold">
          What makes it a chama, not just a shared login
        </h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {VALUE_PROPS.map((v) => (
            <Card key={v.title} className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-5">
                <v.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-headline font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS (Mzunguko 1–4) ── */}
      <div>
        <h2 className="font-headline text-xl sm:text-2xl font-bold">
          Four rounds to get your chama running
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MZUNGUKO.map((step) => (
            <Card key={step.n} className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  {step.n}
                </div>
                <h3 className="mt-3 font-headline font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── ROLES ── */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Users2 className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl sm:text-2xl font-bold">Everyone plays a role</h2>
          </div>
          <p className="max-w-lg text-muted-foreground leading-relaxed">
            When you invite someone, you choose exactly what they can do — from day one.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {ROLE_CHIPS.map((chip) => (
              <span
                key={chip}
                className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── FINAL CTA ── */}
      <Card className="rounded-2xl border-primary/30 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold">
              Ready to start your chama?
            </h2>
            <p className="mt-2 text-muted-foreground">
              {hasAccount
                ? "Finish onboarding to unlock invites, roles, and the shared dashboard."
                : "Sign up in minutes — you'll be the owner, and can invite the rest after verification."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            {hasAccount ? (
              <Button asChild size="lg">
                <Link href="/onboarding/investment">
                  Continue Onboarding <ArrowRight className="h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}
