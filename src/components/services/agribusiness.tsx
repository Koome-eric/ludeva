"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const CommunityAgriculture = () => {
  return (
    <section id="community-agriculture" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Community Agriculture"
            paragraph="Invest in agriculture that nourishes both your portfolio and rural communities across Kenya. Support smallholder farmers, enhance food security, and earn from productive land."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="mb-6">
              Ludeva&rsquo;s <strong>Community Agriculture Investment Program</strong> connects your capital to real farming initiatives across Kenya. These projects empower rural farmers with inputs, equipment, and training &mdash; while offering you steady, seasonal returns tied to actual crop yield and agri-markets.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Why Invest in Community Agriculture?
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Social Impact:</strong> Your funds directly support smallholder farmers, improving livelihoods and food production.
              </li>
              <li>
                <strong>Real-World Asset Exposure:</strong> Investments are tied to tangible agricultural outputs like maize, vegetables, and dairy.
              </li>
              <li>
                <strong>Seasonal Payouts:</strong> Receive returns based on harvest cycles (3&ndash;6 months depending on crop).
              </li>
              <li>
                <strong>Insurance-Backed Projects:</strong> Farming projects are protected through weather-index or crop-insurance coverage.
              </li>
              <li>
                <strong>AgriTech Monitoring:</strong> Track farm progress via our digital dashboard powered by field data and satellite mapping.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              How to Participate
            </h3>
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Sign Up:</strong> Create a free Ludeva account to access available agriculture projects.
              </li>
              <li>
                <strong>Select a Farm Package:</strong> Choose the type of crop, project duration, and location you want to fund.
              </li>
              <li>
                <strong>Fund the Project:</strong> Make a one-time or monthly investment via M-Pesa, bank, or card.
              </li>
              <li>
                <strong>Monitor Progress:</strong> Track the project&rsquo;s milestones, weather, and updates from farmers.
              </li>
              <li>
                <strong>Receive Your Returns:</strong> After harvest, returns are distributed based on yields and market prices.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Who Is This For?
            </h3>
            <p className="mb-6">
              Community Agriculture is ideal for:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Impact-driven investors who want to support rural development</li>
              <li>Professionals looking to diversify into agriculture without owning a farm</li>
              <li>Groups, SACCOs, or Chamas interested in farming partnerships</li>
              <li>Youths and first-time investors starting small with KES 1,000</li>
            </ul>

            <div className="mt-10 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ready to Grow with Us?
              </h4>
              <p className="mb-6">
                Invest in the soil. Grow communities. Reap secure returns.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="inline-block px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-black rounded-lg shadow hover:bg-[#b99b30] transition duration-300">
                  Get Started with Agribusiness
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityAgriculture;
