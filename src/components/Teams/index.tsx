"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const Teams = () => {
  return (
    <section id="teams" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Ludeva TEAMS"
            paragraph="A community savings initiative that promotes financial growth, discipline, and passive income for members."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              <strong>Ludeva TEAMS</strong> empowers members through group savings. 
              Each team of <strong>10 members</strong> contributes a fixed monthly amount to a shared pool. 
              Payouts rotate monthly, ensuring fairness, transparency, and collective progress.
            </p>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              How It Works
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>Each team has exactly 10 members.</li>
              <li>Monthly contributions range from <strong>KES 3,000 – KES 10,000</strong>.</li>
              <li>Payouts rotate to each member and are deposited into their <strong>MMF account</strong> earning 14% p.a.</li>
              <li>Team Coordinators manage contributions and track progress digitally.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Benefits
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li><strong>Guaranteed payouts:</strong> Receive a lump-sum deposit each rotation.</li>
              <li><strong>Investment growth:</strong> Funds grow with 14% gross p.a. in the MMF.</li>
              <li><strong>Financial discipline:</strong> Monthly contributions encourage consistency.</li>
              <li><strong>Community support:</strong> Build trust and social bonds with your team.</li>
            </ul>

            <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-8 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Explore Ludeva TEAMS
              </h4>
              <p className="mb-6">
                Join a transparent, community-driven savings model that rewards you while helping others grow.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="bg-[#D4AF37] hover:bg-[#b99b30] text-black font-medium px-6 py-3 rounded-lg transition duration-200">
                  Become a Member
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
