"use client";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="block text-sm uppercase tracking-widest text-primary mb-2 dark:text-primary"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            How it works
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-dark dark:text-white"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            How It Works
          </h2>
          <p
            className="text-gray-600 dark:text-gray-300"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Our platform is designed to make managing your finances simple and efficient.
            Follow these easy steps to get started:
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            {
              number: "1",
              title: "Sign Up",
              desc: "Visit our website or download our app to sign up. Provide basic information to set up your secure account.",
              delay: 0,
            },
            {
              number: "2",
              title: "Set Up Your Profile",
              desc: "Add your personal or business details to tailor the platform to your specific needs.",
              delay: 300,
            },
            {
              number: "3",
              title: "Explore Features",
              desc: "Access your dashboard for a summary of your finances: balances, recent transactions, and insights.",
              delay: 600,
            },
            {
              number: "4",
              title: "Invest and Grow",
              desc: "Discover a variety of investment opportunities tailored to your financial goals.",
              delay: 900,
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative z-10"
              data-aos="fade-up"
              data-aos-delay={step.delay}
            >
              <div className="w-14 h-14 rounded-full bg-primary text-white mx-auto flex items-center justify-center mb-5 text-lg font-bold">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
