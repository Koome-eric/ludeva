import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Container from "@/components/ui/Container";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Privacy Policy & Terms | Ludeva",
  description:
    "How Ludeva collects, uses and protects your personal data, and the terms that govern your investment account.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <PageHero
          title="Privacy Policy & Terms"
          description="How we collect, use and protect your personal data, and the terms that govern your Ludeva investment account."
        />

        <section className="py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-sm text-muted-foreground mb-10">
                Last updated: {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
              </p>

              {/* ───────────── PRIVACY POLICY ───────────── */}
              <div id="privacy-policy" className="space-y-10 scroll-mt-24">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">Privacy Policy</h1>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Ludeva. We value your trust and are committed to protecting your personal
                    data and privacy. This Privacy Policy explains how Ludeva collects, uses, discloses and
                    protects the personal information of investors, guardians and administrators using our
                    investment platform.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    By registering for an account, completing our KYC (Know Your Customer) onboarding, or
                    otherwise using the Ludeva platform, you agree to the collection and use of information
                    in accordance with this policy and applicable data protection laws, including Kenya&apos;s
                    Data Protection Act.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To verify your identity, process your investment and comply with financial regulations,
                    we collect specific personal identification details from investors and, where
                    applicable, their guardians and team members, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>National ID number, KRA PIN and place of birth</li>
                    <li>Full name, contact email address and phone number</li>
                    <li>Residential and postal address</li>
                    <li>A selfie photo and a copy of your National ID, submitted during KYC</li>
                    <li>Employment status, occupation and source of funds</li>
                    <li>Investment amount, lock-in period, and beneficiary or next-of-kin details</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. Purpose of Collection and Usage</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Ludeva collects and uses your information strictly to perform platform operations and
                    fulfill our financial and regulatory duties. Specifically, your data is used to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Verify Identity &amp; Enforce KYC:</span>{" "}
                      authenticate investors to prevent identity theft, unauthorized account access and
                      fraudulent financial activity before an application is approved.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Facilitate Financial Transactions:</span>{" "}
                      process deposits, dividend or return payouts, and mobile money or bank transfers
                      (e.g. M-Pesa / bank transfers).
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Maintain Auditable Records:</span>{" "}
                      generate accurate member statements, investment histories and account ledgers.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Provide Communication &amp; Alerts:</span>{" "}
                      send transactional notifications, payment receipts, KYC status updates and account
                      security notices via SMS or email.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Legal &amp; Contractual Obligations:</span>{" "}
                      establish legal enforceability for investment agreements and, for team accounts, the
                      records governing the group.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. Strict Limitation of Data Use</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Your personal details are used strictly for Ludeva&apos;s company operations and, for
                    team accounts, your team&apos;s internal management.
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">No Data Selling or Renting:</span> Ludeva
                      does not sell, rent, trade or lease investor data to third parties, advertising
                      networks or external marketers under any circumstances.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Authorized Access Only:</span> access to
                      investor data is restricted to authorized system processes and designated Ludeva staff
                      (e.g. KYC reviewers and administrators) approved to review your application.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Third-Party Service Providers:</span>{" "}
                      information is shared with third-party vendors (such as mobile money payment gateways,
                      document storage and SMS infrastructure providers) solely to the extent necessary to
                      complete your requested transactions. These partners are bound by strict
                      non-disclosure and security agreements.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. Data Protection and Security</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We employ industry-standard technical and organizational security measures to protect
                    your personal data, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Encryption:</span> data in transit is
                      encrypted using SSL/TLS, and sensitive data at rest (including KYC documents) is
                      stored using advanced encryption protocols.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Access Controls:</span> role-based access
                      permissions prevent unauthorized internal or external access to your records.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Regular Audits:</span> continuous
                      monitoring and vulnerability assessments to safeguard our systems against potential
                      cyber threats.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Subject to applicable data protection legislation, you reserve the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>Access and request a copy of the personal information Ludeva holds about you.</li>
                    <li>Request corrections to inaccurate or outdated personal details.</li>
                    <li>
                      Request the deletion or restriction of your data, provided there are no pending legal
                      or financial liabilities tied to your account.
                    </li>
                  </ul>
                </div>
              </div>

              {/* ───────────── TERMS & CONDITIONS ───────────── */}
              <div id="terms-and-conditions" className="space-y-10 mt-16 pt-16 border-t scroll-mt-24">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">Terms &amp; Conditions</h1>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms &amp; Conditions govern your application for, and use of, an investment
                    account on the Ludeva platform. Please read them together with the Privacy Policy above
                    before you submit your KYC application.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. Eligibility &amp; Application</h2>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>
                      You must provide accurate, complete and up-to-date information during onboarding,
                      including a valid National ID, a clear selfie photo and honest details of your
                      employment and source of funds.
                    </li>
                    <li>
                      Submitting an application does not guarantee approval. All applications are reviewed
                      by Ludeva and subject to KYC verification before an account is activated.
                    </li>
                    <li>
                      Ludeva may request additional documentation or clarification at any point during
                      review, and may decline an application that fails verification.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. Investment Terms</h2>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>The minimum initial investment and available lock-in periods are as shown at onboarding.</li>
                    <li>
                      Funds committed to a lock-in period are held for that duration; early withdrawal
                      requests are handled at Ludeva&apos;s discretion and may be subject to conditions
                      communicated separately.
                    </li>
                    <li>
                      Returns are not guaranteed and are subject to the performance of the underlying
                      investment products.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. Team Accounts</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Where you apply as a Team / Group account, you become the team owner and are responsible
                    for inviting and managing your team members. Each invited member who joins must
                    independently complete their own KYC and accept these Terms before their membership is
                    active.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. Your Responsibilities</h2>
                  <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                    <li>Keep your login credentials confidential and notify Ludeva promptly of any suspected unauthorized access.</li>
                    <li>Notify Ludeva of any change to your personal, contact or beneficiary details.</li>
                    <li>Use the platform only for lawful purposes and in accordance with these Terms.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. Changes to These Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ludeva may update this Privacy Policy and these Terms from time to time. Material
                    changes will be communicated to active investors, and continued use of the platform
                    after such changes constitutes acceptance of the updated terms.
                  </p>
                </div>
              </div>

              {/* ───────────── CONTACT ───────────── */}
              <div className="mt-16 pt-10 border-t">
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  If you have questions, concerns, or requests regarding this Privacy Policy, these Terms,
                  or how Ludeva manages your data, please reach out to us at:
                </p>
                <div className="text-muted-foreground space-y-1">
                  <p>Email: info@ludevaplc.co.ke</p>
                  <p>Customer Support: 0732 722 101 / 0712 940 012</p>
                  <p>Diaspora Investment: +44 7944 618740 / 0716 747 445</p>
                  <p>Office Address: Ludeva Public Ltd., P.O Box 596-4043, Homabay, Kenya</p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
