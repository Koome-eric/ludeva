"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const MoneyMarketFunds = () => {
  return (
    <section id="money-market" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Ludeva Money Market Fund"
            paragraph="A low-risk, income-generating investment designed to provide stable 14% gross annual returns through diversified short-term instruments."
            center
          />

          <div className="mt-10 max-w-5xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              The <strong>Ludeva Money Market Fund</strong> is a low-risk, income-generating investment
              vehicle designed to provide investors with stable returns of{" "}
              <strong>14% gross per annum</strong>. It pools funds from investors and strategically
              invests in high-yielding, short-term money market instruments such as treasury bills,
              commercial papers, fixed deposits, and equity funds with top-tier financial institutions.
            </p>

            <p>
              The fund is ideal for individuals and institutions seeking passive income, predictable
              cash flows, and capital preservation.
            </p>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Key Features
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Target Return:</strong> 14% gross per annum
              </li>
              <li>
                <strong>Starting Capital:</strong> Minimum investment KES 500
              </li>
              <li>
                <strong>Lock-in Period:</strong> 6 months to stabilize returns
              </li>
              <li>
                <strong>Income Distribution:</strong> Quarterly withdrawals of ROI (after lock-in)
              </li>
              <li>
                <strong>Liquidity:</strong> 24-hour access to funds after lock-in period
              </li>
              <li>
                <strong>Currency Options:</strong> Available in KES or USD
              </li>
              <li>
                <strong>Payments Integration:</strong> Supports M-Pesa Paybill, PesaLink, Visa Card, and cheque.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Lack Capital to Invest?
            </h3>
            <p>
              Don’t worry — <strong>Ludeva TEAMS</strong> has you covered. Join TEAMS, our online
              merry-go-round platform that helps you raise investment capital while building a
              savings discipline.
            </p>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Future Value Example
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <p>
                <strong>Investment:</strong> KES 1,000,000 for 3 years
              </p>
              <p>
                <strong>Future Value (FV):</strong> KES 1,481,544
              </p>
              <p>
                <strong>Total Gain:</strong> KES 481,544
              </p>
              <p className="text-sm mt-2 italic text-gray-500 dark:text-gray-400">
                (Calculated using compound growth at 14% gross p.a.)
              </p>
            </div>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Ludeva MMF Payout Table (Summary)
            </h3>
            <p>
              Below is an overview of projected year-by-year growth for a KES 500,000 investment over 15 years at 14% gross p.a. The figures account for management fees (1.5%) and annual compounding.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm md:text-base border-collapse border border-gray-300 dark:border-gray-700">
                <thead className="bg-[#D4AF37] text-black font-semibold">
                  <tr>
                    <th className="p-3 border border-gray-300 dark:border-gray-700">Year</th>
                    <th className="p-3 border border-gray-300 dark:border-gray-700">Opening Balance (KES)</th>
                    <th className="p-3 border border-gray-300 dark:border-gray-700">Interest (14%)</th>
                    <th className="p-3 border border-gray-300 dark:border-gray-700">Fee (1.5%)</th>
                    <th className="p-3 border border-gray-300 dark:border-gray-700">Closing Balance (KES)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right">500,000</td>
                    <td className="p-3 text-right">70,000</td>
                    <td className="p-3 text-right">7,500</td>
                    <td className="p-3 text-right">562,500</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center">5</td>
                    <td className="p-3 text-right">800,903</td>
                    <td className="p-3 text-right">112,126</td>
                    <td className="p-3 text-right">11,964</td>
                    <td className="p-3 text-right">901,065</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center">10</td>
                    <td className="p-3 text-right">1,282,961</td>
                    <td className="p-3 text-right">179,615</td>
                    <td className="p-3 text-right">19,244</td>
                    <td className="p-3 text-right">1,443,332</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center">15</td>
                    <td className="p-3 text-right">2,600,931</td>
                    <td className="p-3 text-right">364,130</td>
                    <td className="p-3 text-right">34,679</td>
                    <td className="p-3 text-right">2,926,047</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Why It Matters
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Passive Income Stream:</strong> Quarterly payouts directly to your account.
              </li>
              <li>
                <strong>Accessibility:</strong> Low entry point of just KES 500.
              </li>
              <li>
                <strong>Stability:</strong> Diversified portfolio ensures consistent performance.
              </li>
              <li>
                <strong>Flexibility:</strong> Choose to withdraw or reinvest your returns.
              </li>
              <li>
                <strong>Professional Management:</strong> Overseen by experienced fund managers.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Target Market
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Retail Investors:</strong> Individuals seeking passive income and growth.
              </li>
              <li>
                <strong>SMEs & Corporates:</strong> Businesses looking for secure short-term placements.
              </li>
              <li>
                <strong>SACCOs & Chamas:</strong> Groups pooling funds for higher collective returns.
              </li>
              <li>
                <strong>Diaspora Investors:</strong> Access from abroad with transparent fund oversight.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              Risk Disclaimer
            </h3>
            <p>
              While the Ludeva Money Market Fund seeks to deliver a consistent 14% gross return, actual
              performance may vary depending on market conditions. The fund does not guarantee returns,
              but aims to preserve capital while maximizing income.
            </p>

            <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-8 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ready to Invest?
              </h4>
              <p className="mb-6">
                Start growing your wealth safely with Ludeva Money Market Fund.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="bg-[#D4AF37] hover:bg-[#b99b30] text-black font-medium px-6 py-3 rounded-lg transition duration-200">
                  Create Your Ludeva Account
                </button>
              </Link>
              <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
                Need help? Contact our customer relations manager for personalized assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyMarketFunds;
