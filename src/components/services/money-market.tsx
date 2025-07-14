"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const MoneyMarketFunds = () => {
  return (
    <section id="money-market" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Money Market Funds"
            paragraph="Discover a low-risk, high-liquidity investment avenue designed to preserve capital while earning competitive returns."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="mb-6">
              Ludeva&apos;s <strong>Money Market Fund</strong> provides investors with a stable
              and secure option to grow their funds while enjoying liquidity and
              minimal risk. These funds primarily invest in short-term,
              high-quality debt instruments like treasury bills, commercial
              papers, and certificates of deposit.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Why Choose Our Money Market Fund?
            </h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Capital Preservation:</strong> Your investment remains secure with minimal market fluctuations.
              </li>
              <li>
                <strong>Daily Liquidity:</strong> Withdraw or deposit funds at any time without penalties.
              </li>
              <li>
                <strong>Higher Returns than Savings Accounts:</strong> Earn competitive interest rates over traditional banking.
              </li>
              <li>
                <strong>Regulated and Transparent:</strong> Our fund is fully licensed and governed under Kenyan financial regulations.
              </li>
              <li>
                <strong>Flexible Entry:</strong> Start investing with as little as KES 500.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              How to Get Started
            </h3>
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Create an Account:</strong> Sign up on our platform to get started.
              </li>
              <li>
                <strong>Complete KYC:</strong> Upload your national ID and a recent utility bill or proof of address.
              </li>
              <li>
                <strong>Deposit Funds:</strong> Add money via M-Pesa, bank transfer, or card.
              </li>
              <li>
                <strong>Start Earning:</strong> Your funds will be allocated to our diversified money market portfolio and begin accruing daily returns.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-8 text-black dark:text-white">
              Who Is This For?
            </h3>
            <p className="mb-6">
              This fund is ideal for:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Individuals looking for a short-term investment option</li>
              <li>Businesses that want to earn on idle cash reserves</li>
              <li>Students or young professionals saving toward a goal</li>
              <li>Retirees looking for a conservative income stream</li>
            </ul>

            <div className="mt-10 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ready to Begin?
              </h4>
              <p className="mb-6">
                Take the first step toward consistent, secure returns.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="px-6 py-3 text-lg font-medium rounded-lg bg-[#D4AF37] hover:bg-[#b99b30] text-black transition duration-300">
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

export default MoneyMarketFunds;
