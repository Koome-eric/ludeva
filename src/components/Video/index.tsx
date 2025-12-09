"use client";

import Link from "next/link";

const mmfFeatures = [
  {
    icon: "bi-graph-up",
    title: "Stable 14% Gross Returns",
    text: "Earn predictable returns through a diversified portfolio of short-term, high-yield money market instruments.",
  },
  {
    icon: "bi-currency-exchange",
    title: "Flexible Investment Options",
    text: "Start with as little as KES 500 and choose to invest in KES or USD, with quarterly income distribution.",
  },
  {
    icon: "bi-shield-lock",
    title: "Low Risk & Secure",
    text: "Investments are diversified across treasury bills, commercial papers, fixed deposits, and top-tier financial institutions.",
  },
  {
    icon: "bi-clock-history",
    title: "High Liquidity",
    text: "Access your funds within 24 hours after the 6-month lock-in period for stable returns and capital preservation.",
  },
  {
    icon: "bi-people",
    title: "Professional Management",
    text: "Fund is overseen by experienced financial managers, ensuring transparency and optimal income generation.",
  },
  {
    icon: "bi-wallet2",
    title: "Seamless Payments",
    text: "Supports M-Pesa Paybill, PesaLink, Visa Card, and cheque for easy funding and withdrawals.",
  },
];

const Choose = () => {
  return (
    <section id="choose" className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="flex flex-col lg:flex-row gap-10 bg-[#f5faf6] dark:bg-[#1a1f1d] rounded-3xl p-12"
          data-aos="fade-in"
          data-aos-delay="0"
        >
          {/* Left Content */}
          <div
            className="w-full lg:w-5/12"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-dark dark:text-white">
                  Why Choose Ludeva Money Market Fund
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Ludeva Money Market Fund (MMF) offers a low-risk, income-generating investment designed to provide stable 14% gross annual returns. 
                  Ideal for individuals, SMEs, SACCOs, and diaspora investors seeking passive income, capital preservation, and predictable cash flows.
                </p>
              </div>
              <div>
                <Link
                  href="/mmf"
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-md hover:bg-[#1d4f52] transition"
                >
                  <i className="bi bi-play-fill text-lg"></i>
                  <span className="font-semibold">Learn More About MMF</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Features Grid */}
          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {mmfFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="text-left"
                  data-aos="fade-up"
                  data-aos-delay={`${idx * 100}`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#d4eddc] dark:bg-[#2d3e36] p-3 rounded-full">
                      <i
                        className={`bi ${feature.icon} text-2xl text-[#245C5F] dark:text-green-300`}
                      ></i>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-dark dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
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
