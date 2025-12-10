"use client";

import { useState } from "react";
import SectionTitle from "../Common/SectionTitle";

const faqs = [

  {
    question: "What is Ludeva and what do you offer?",
    answer:
      "Ludeva is an investment platform that provides access to high-impact, regulated opportunities such as money market funds, real estate, agribusiness, and SME development funds. We aim to make wealth-building inclusive and secure for all Kenyans.",
  },
  {
    question: "How can I start investing with Ludeva?",
    answer:
      "Simply sign up for an account, complete your KYC verification, fund your wallet through M-Pesa, card, or bank transfer, and choose the investment product that fits your goals.",
  },
  {
    question: "Is my money safe with Ludeva?",
    answer:
      "Yes. All our financial products comply with local regulations and are backed by licensed financial institutions and partners. We also ensure transparency and due diligence on all investment portfolios.",
  },
  {
    question: "What is the minimum amount I can invest?",
    answer:
      "You can begin your investment journey with as little as KES 500, depending on the investment option you choose.",
  },
  {
    question: "Can I monitor my investments in real time?",
    answer:
      "Absolutely. Once logged in, you can access your investor dashboard to monitor performance, returns, and track your funding activity in real time.",
  },
  {
    question: "How often do I earn returns?",
    answer:
      "Returns vary by product. Money Market Funds typically yield daily interest, while SME and Real Estate Funds may offer monthly or quarterly payouts depending on the product.",
  },
  
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section
      id="faq"
      className="pt-16 md:pt-20 lg:pt-28 bg-white dark:bg-gray-900 mb-16"
    >
      <div className="container max-w-4xl mx-auto px-4">

        <SectionTitle
                          title="Frequently Asked Questions"
                          paragraph="Find quick answers to common questions about Ludeva&apos;s investment platform and services."
                          center
                        />

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-gray-50 dark:bg-gray-800 transition duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left text-gray-900 dark:text-white text-lg font-medium focus:outline-none"
              >
                {faq.question}
                <span className="text-xl font-bold">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>
              {activeIndex === index && (
                <div className="mt-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
