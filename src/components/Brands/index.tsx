"use client";

const FinancialHighlight = () => {
  return (
    <section id="financial-highlight" className="py-16 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="block text-sm uppercase tracking-widest text-primary mb-2 dark:text-primary"
            data-aos="fade-up"
          >
            Q2 2025 Financial Report
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-dark dark:text-white"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Money Market Fund Performance
          </h2>
          <p
            className="text-gray-600 dark:text-gray-300"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            During the second quarter of 2025, the Ludeva Money Market Fund
            maintained strong performance, delivering competitive returns while
            preserving capital.
          </p>
        </div>

        {/* Metrics */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            {
              value: "3.3%",
              title: "Gross Interest Rate",
              desc: "A stable investment climate and careful partner selection.",
              delay: 0,
            },
            {
              value: "6%",
              title: "AUM Growth",
              desc: "Driven by increased member confidence in Ludeva MMF.",
              delay: 300,
            },
            {
              value: "KES 30M",
              title: "Assets Under Management",
              desc: "A testament to our growing community of investors.",
              delay: 600,
            },
            {
              value: "100%",
              title: "Capital Preservation",
              desc: "Your principal investment remains secure with us.",
              delay: 900,
            },
          ].map((metric, i) => (
            <div
              key={i}
              className="relative z-10"
              data-aos="fade-up"
              data-aos-delay={metric.delay}
            >
              <div className="text-4xl font-bold text-primary dark:text-primary mb-3">
                {metric.value}
              </div>
              <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white">
                {metric.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {metric.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialHighlight;
