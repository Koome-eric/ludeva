"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";
import Image from "next/image";

const Teams = () => {
  return (
    <section
      id="teams"
      className="relative bg-white dark:bg-gray-900 pt-20 md:pt-24 lg:pt-28"
    >
      <div className="container">
        <div className="pb-20 md:pb-24 lg:pb-28">
          <SectionTitle
            title="Ludeva TEAMS"
            paragraph="A structured group savings and investment initiative built to promote financial discipline, transparency, and long-term passive income."
            center
          />

          <div className="mt-14 max-w-5xl mx-auto space-y-14 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {/* Overview */}
            <div className="space-y-6">
              <p>
                <strong>Ludeva TEAMS</strong> is a structured group savings initiative
                under <strong>Ludeva Public Ltd</strong> designed to empower members
                through disciplined contributions and collective growth.
              </p>

              <p>
                Members are organized into small, trusted groups of
                <strong> 10 participants per TEAM</strong>. Each member contributes a
                fixed monthly amount into a shared pool, which is then allocated to
                one member every month on a rotational basis.
              </p>

              <p>
                Unlike traditional merry-go-round systems, all payouts are
                <strong> automatically deposited into the beneficiary’s Ludeva
                Money Market Fund (MMF)</strong>, allowing the funds to grow through
                interest accumulation and compounding returns.
              </p>
            </div>

            {/* Structure */}
            <div>
              <h3 className="text-2xl font-semibold mb-5 text-black dark:text-white">
                Structure & Participation Guidelines
              </h3>

              <ul className="list-disc ml-6 space-y-3">
                <li>Each TEAM consists of exactly <strong>10 registered Ludeva members</strong>.</li>
                <li>Membership is mandatory for verified Ludeva Organization members.</li>
                <li>Monthly contribution is agreed within the range of <strong>KES 3,000 – KES 10,000</strong>.</li>
                <li>All members contribute the same agreed amount.</li>
                <li>Payouts rotate monthly based on a pre-agreed slotting order.</li>
                <li>Funds are deposited directly into the beneficiary’s <strong>MMF account</strong>.</li>
                <li>The cycle continues until all members receive their payout.</li>
              </ul>
            </div>

            {/* Governance */}
            <div>
              <h3 className="text-2xl font-semibold mb-5 text-black dark:text-white">
                Governance, Oversight & Accountability
              </h3>

              <p className="mb-4">
                Each TEAM elects a <strong>Team Coordinator</strong> who oversees
                monthly contributions, slotting order, and member compliance.
              </p>

              <p>
                Ludeva provides institutional oversight by ensuring all funds are
                securely deposited into individual MMF accounts. Digital tracking
                tools ensure transparency, reduce disputes, and build trust among
                members.
              </p>
            </div>

            {/* Dashboard Preview */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                <h3 className="text-2xl font-semibold mb-5 text-black dark:text-white">
                  TEAMS Dashboard Preview
                </h3>

                <p className="mb-6">
                  Every Ludeva TEAMS member gains access to a personalized digital
                  dashboard that provides full visibility into their TEAM activity
                  and investment growth.
                </p>

                <ul className="list-disc ml-6 space-y-3">
                  <li>Monthly contribution tracking</li>
                  <li>TEAM members list and slotting order</li>
                  <li>Payout status and beneficiary schedule</li>
                  <li>MMF balance and interest growth</li>
                  <li>Contribution history and confirmations</li>
                  <li>Coordinator updates and notifications</li>
                </ul>
              </div>

              {/* Image */}
              <div className="relative">
                <Image
                  src="/images/dashboard/teams-dashboard-preview.png"
                  alt="Ludeva TEAMS Dashboard Preview"
                  width={700}
                  height={450}
                  className="rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-semibold mb-5 text-black dark:text-white">
                Key Benefits of Ludeva TEAMS
              </h3>

              <ul className="list-disc ml-6 space-y-3">
                <li><strong>Guaranteed Payouts:</strong> Every member receives a lump-sum MMF deposit.</li>
                <li><strong>Investment Growth:</strong> Funds earn <strong>14% gross p.a.</strong> under the MMF.</li>
                <li><strong>Financial Discipline:</strong> Monthly commitments build consistent saving habits.</li>
                <li><strong>Liquidity & Access:</strong> Quarterly withdrawals available after MMF lock-in.</li>
                <li><strong>Mutual Support:</strong> Small groups foster accountability and trust.</li>
              </ul>
            </div>

            {/* Projections */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8">
              <h3 className="text-2xl font-semibold mb-6 text-black dark:text-white">
                Future Value Projections
              </h3>

              <div className="space-y-4">
                <p>
                  <strong>KES 50,000</strong> payout → Approx.
                  <strong className="ml-2">KES 75,000</strong> after 3 years at 14% p.a.
                </p>
                <p>
                  <strong>KES 100,000</strong> payout → Approx.
                  <strong className="ml-2">KES 150,000</strong> after 3 years at 14% p.a.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8 border-t border-gray-300 dark:border-gray-700">
              <h4 className="text-2xl font-semibold text-black dark:text-white mb-4">
                Join a TEAMS Group & Grow Together
              </h4>

              <p className="max-w-2xl mx-auto mb-8">
                Turn disciplined group saving into a long-term wealth-building
                strategy powered by professional fund management.
              </p>

              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="rounded-lg bg-primary px-8 py-4 text-white font-medium transition hover:bg-primary/90">
                  Become a Ludeva Member
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Teams;
