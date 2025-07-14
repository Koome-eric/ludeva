"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const RealEstateInvestment = () => {
  return (
    <section id="real-estate" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Real Estate Investment"
            paragraph="Build long-term wealth through strategic and transparent real estate opportunities across Kenya’s high-growth regions."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="mb-6">
              At <strong>Ludeva</strong>, we believe real estate remains one of the most secure and reliable ways to grow your wealth. Our Real Estate Investment offering allows individuals, families, and groups to participate in carefully vetted residential, commercial, and mixed-use development projects across Kenya. We make investing in property simple, accessible, and transparent.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Why Invest in Real Estate with Ludeva?
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Tangible Asset Ownership:</strong> Gain access to projects where you co-own or hold shares in property-backed investments.
              </li>
              <li>
                <strong>Passive Rental Income:</strong> Earn monthly income from rental yields on selected developments.
              </li>
              <li>
                <strong>Appreciation in Value:</strong> Benefit from long-term property value growth in fast-developing urban and peri-urban areas.
              </li>
              <li>
                <strong>Due Diligence & Legal Clarity:</strong> All projects undergo thorough vetting and offer full legal documentation.
              </li>
              <li>
                <strong>Fractional Ownership:</strong> Start investing with as little as <strong>KES 5,000</strong> — no need to buy a whole plot or property.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              What Types of Projects Do We Offer?
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>Affordable housing developments</li>
              <li>Student housing near universities and colleges</li>
              <li>Commercial real estate (shops, offices, warehouses)</li>
              <li>Serviced plots in gated communities</li>
              <li>Mixed-use projects with blended residential and commercial use</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              How to Get Started
            </h3>
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Create an Account:</strong> Register on our platform and verify your email.
              </li>
              <li>
                <strong>Complete KYC:</strong> Provide your ID, KRA PIN, and proof of address for compliance.
              </li>
              <li>
                <strong>Choose a Project:</strong> Browse available investment properties or projects.
              </li>
              <li>
                <strong>Invest Securely:</strong> Fund your account via M-Pesa, bank, or card and allocate your funds to the project.
              </li>
              <li>
                <strong>Track Your Returns:</strong> Monitor appreciation, rental income, and reports via your dashboard.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Who Is This For?
            </h3>
            <p className="mb-6">
              Our real estate opportunities are ideal for:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>First-time investors looking for secure, long-term growth</li>
              <li>Working professionals seeking passive income streams</li>
              <li>Chamas or SACCOs pooling funds for group property ownership</li>
              <li>Kenyans in the diaspora seeking verified projects at home</li>
              <li>Retirees planning legacy property investments</li>
            </ul>

            <div className="mt-10 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ready to Start Investing in Real Estate?
              </h4>
              <p className="mb-6">
                Join hundreds of Ludeva clients already growing wealth through property.
              </p>
              <Link href="/https://ludeva-dashboard.vercel.app/signup">
                <button className="bg-[#D4AF37] hover:bg-[#b99b30] text-black font-medium px-6 py-3 rounded-lg transition duration-200">
                  Create Your Ludeva Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealEstateInvestment;
