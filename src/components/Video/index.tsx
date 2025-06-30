"use client";

import Link from "next/link";

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
                  Why Choose Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Experience the future of finance with our secure, efficient,
                  and user-friendly financial services. Our cutting-edge
                  platform ensures your transactions are safe, streamlined, and
                  easy to manage, empowering you to take control of your
                  financial journey with confidence and convenience.
                </p>
              </div>
              <div>
                <Link
                  href="https://www.youtube.com/watch?v=DQx96G4yHd8"
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-[#1d4f52] transition"
                >
                  <i className="bi bi-play-fill text-lg"></i>
                  <span className="font-semibold">Watch the Video</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Features Grid */}
          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  icon: "bi-person-check",
                  title: "User-Friendly Interface",
                  text: "Easy navigation with responsive design for various devices.",
                },
                {
                  icon: "bi-graph-up",
                  title: "Financial Analytics",
                  text: "Budget tracking, expense categorization, and personalized insights.",
                },
                {
                  icon: "bi-headset",
                  title: "Customer Support",
                  text: "24/7 service via chat, email, phone, and a detailed help center.",
                },
                {
                  icon: "bi-shield-lock",
                  title: "Security Features",
                  text: "Data encryption, fraud detection, and prevention mechanisms.",
                },
              ].map((feature, idx) => (
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
