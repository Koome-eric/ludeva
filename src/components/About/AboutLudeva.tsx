"use client";

import { motion } from "framer-motion";

const aboutContent = {
  mission: {
    title: "Our Mission",
    text: "Our mission is to empower communities by providing accessible and transparent investment solutions that promote financial independence and economic inclusion. We strive to make every Kenyan — from entrepreneurs to professionals and the diaspora — part of a collective journey toward prosperity.",
  },
  vision: {
    title: "Our Vision",
    text: "To become Kenya’s leading inclusive investment platform — inspiring a generation of financially literate and independent citizens who actively participate in building sustainable wealth.",
  },
  coreValues: {
    title: "Our Core Values",
    values: [
      { name: "Integrity", description: "Upholding transparency and accountability in all operations." },
      { name: "Innovation", description: "Leveraging modern technology to create accessible investment pathways." },
      { name: "Inclusivity", description: "Ensuring every Kenyan, regardless of income, can invest and grow wealth." },
      { name: "Growth", description: "Building long-term value for our members and communities." },
    ],
  },
};

export default function AboutLudeva() {
  return (
    <section id="about-ludeva" className="py-20 bg-[#FCFCFC] dark:bg-black">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            About Ludeva Public Ltd
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-lg max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            Ludeva Public Ltd is a forward-thinking investment and financial
            services organization built on the principles of transparency,
            accessibility, and shared prosperity. Founded with a mission to
            democratize wealth creation in Kenya, Ludeva enables individuals and
            groups to grow their finances through structured, secure, and
            high-yield investment opportunities.
          </motion.p>
        </div>

        
        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Impact
          </h3>
          <p className="max-w-4xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            Since inception, Ludeva has continued to build trust and impact
            lives through innovative programs such as the{" "}
            <span className="text-brand-gold font-semibold">Ludeva TEAMS</span>{" "}
            — a structured group savings initiative that promotes financial
            discipline and passive income generation — and the{" "}
            <span className="text-brand-gold font-semibold">
              Money Market Fund
            </span>
            , offering stable annual returns of 14% gross p.a. Our goal is to
            make investing not only possible but practical for all Kenyans.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
