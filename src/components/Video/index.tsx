"use client";

import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";

const mmfFeatures = [
  {
    icon: "bi-graph-up",
    title: "Stable 14% Gross Returns",
    text: "Earn predictable returns through a diversified portfolio of short-term, high-yield instruments.",
  },
  {
    icon: "bi-currency-exchange",
    title: "Flexible Investment Options",
    text: "Start with KES 500 and invest in KES or USD, with quarterly income distribution.",
  },
  {
    icon: "bi-shield-lock",
    title: "Low Risk & Secure",
    text: "Investments are diversified across treasury bills, commercial papers, and top-tier institutions.",
  },
  {
    icon: "bi-clock-history",
    title: "High Liquidity",
    text: "Withdraw your earnings within 24 hours after the 6-month stabilization period.",
  },
  {
    icon: "bi-people",
    title: "Professional Management",
    text: "Managed by experienced fund managers ensuring transparency and optimal returns.",
  },
  {
    icon: "bi-wallet2",
    title: "Seamless Payments",
    text: "Supports M-Pesa Paybill, PesaLink, Visa, and cheque for smooth deposits and withdrawals.",
  },
];

const Choose = () => {
  return (
    <section id="choose" className="py-16 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-col lg:flex-row gap-8 bg-[#f5faf6] dark:bg-[#1a1f1d] rounded-2xl p-8"
          data-aos="fade-in"
        >
          {/* Left Content */}
          <div className="w-full lg:w-5/12" data-aos="fade-up">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white leading-snug">
                Why Choose Ludeva Money Market Fund
              </h2>

              <p className="text-sm sm:text-base text-body-color dark:text-gray-300 leading-relaxed">
                Ludeva Money Market Fund (MMF) offers a low-risk, income-generating investment
                designed to provide stable 14% gross annual returns. Ideal for individuals, SMEs,
                SACCOs, and diaspora investors seeking passive income and capital preservation.
              </p>

              <Link
                href="/mmf"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm rounded hover:bg-[#bf9c2f] transition"
              >
                <i className="bi bi-info-circle text-base"></i>
                <span className="font-medium">Learn More About MMF</span>
              </Link>
            </div>
          </div>

          {/* Right Features Grid */}
          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mmfFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="text-left"
                  data-aos="fade-up"
                  data-aos-delay={`${idx * 100}`}
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-[#d4eddc] dark:bg-[#2d3e36] p-2.5 rounded-full">
                      <i
                        className={`bi ${feature.icon} text-xl text-[#245C5F] dark:text-green-300`}
                      ></i>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold mb-1 text-dark dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Choose;
