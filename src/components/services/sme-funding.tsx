"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const SMEDevelopmentFunds = () => {
  return (
    <section id="sme-development" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="SME Development Funds"
            paragraph="Support the growth of small and medium enterprises across Kenya while earning competitive returns from structured business lending."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="mb-6">
              Ludeva&apos;s <strong>SME Development Fund</strong> is a powerful way to grow your wealth while helping businesses thrive. We allocate investor capital to vetted small and medium-sized enterprises (SMEs) that are ready to scale but need financing for equipment, stock, operations, or technology.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Why Invest in SME Development?
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Support Economic Growth:</strong> Help create jobs and stimulate the economy by empowering local entrepreneurs.
              </li>
              <li>
                <strong>Structured Monthly Returns:</strong> Receive fixed repayments based on agreed lending terms and interest.
              </li>
              <li>
                <strong>Risk-Mitigation:</strong> Each SME undergoes due diligence, financial analysis, and performance monitoring.
              </li>
              <li>
                <strong>Impact with Profit:</strong> Earn meaningful returns while creating real business impact in underserved markets.
              </li>
              <li>
                <strong>Diversification:</strong> Your funds are pooled into multiple businesses across different sectors.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              How to Start Investing
            </h3>
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Register:</strong> Create your Ludeva investor account.
              </li>
              <li>
                <strong>Choose a Fund Package:</strong> View SME portfolios available for funding and their expected return timelines.
              </li>
              <li>
                <strong>Fund Your Investment:</strong> Deposit capital through your preferred payment method (M-Pesa, card, bank).
              </li>
              <li>
                <strong>Track Progress:</strong> Monitor your portfolio performance and repayments via your investor dashboard.
              </li>
              <li>
                <strong>Get Paid Monthly:</strong> Receive interest payouts or compound your earnings by reinvesting.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Who Can Participate?
            </h3>
            <p className="mb-6">
              The SME Fund is suitable for:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Individuals seeking fixed-income investment opportunities</li>
              <li>Groups, SACCOs, and Chamas aiming to support local enterprise</li>
              <li>Professionals looking to invest beyond traditional markets</li>
              <li>Social impact investors balancing returns and purpose</li>
            </ul>

            <div className="mt-10 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Invest in Kenya&apos;s Future, One Business at a Time
              </h4>
              <p className="mb-6">
                Get started with as little as KES 2,500 and be part of powering business resilience and job creation.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="inline-block px-6 py-3 text-sm font-semibold bg-[#D4AF37] text-black rounded-lg shadow hover:bg-[#b99b30] transition duration-300">
                  Start Investing in SMEs
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SMEDevelopmentFunds;
