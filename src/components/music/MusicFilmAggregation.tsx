"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

export default function MusicFilmAggregation() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <SectionTitle
          title="Ludeva Music & Film Aggregation"
          paragraph="A structured creative investment initiative focused on discovering talent, producing commercial-ready content, and building long-term revenue assets through retained copyrights and master rights."
          center
        />

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-14 items-center mt-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Ludeva Music & Film Content Aggregation</strong> is an initiative
              by Ludeva Public Ltd designed to identify, nurture, and commercialize
              upcoming musicians, actors, and filmmakers across East Africa.
              Ludeva provides full financial backing for production while retaining
              copyrights and master rights to ensure sustainable return on investment.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Image
              src="/images/music.jpg"
              alt="Ludeva Music and Film Aggregation"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl object-cover"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </div>

        {/* Objectives */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Strategic Objectives
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Identify and onboard high-potential musicians and filmmakers",
              "Provide professional production for debut albums and film content",
              "Monetize content through digital distribution and licensing",
              "Create sustainable revenue for both Ludeva and artists",
              "Position Ludeva as a leading content aggregator in East Africa",
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
              >
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            Program Phases
          </h3>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                title: "Phase 1: Talent Search & Acquisition",
                text: "Auditions, social media scouting, referrals, shortlisting, and contracting artists with proven potential.",
              },
              {
                title: "Phase 2: Production & Content Creation",
                text: "Studio time, sound engineering, songwriting support, and delivery of 6–10 track debut albums.",
              },
              {
                title: "Phase 3: Contracting & Rights Management",
                text: "Exclusive copyright ownership, master rights retention, publishing, reproduction rights, and commission structures.",
              },
              {
                title: "Phase 4: Marketing & Distribution",
                text: "Distribution via Spotify, Apple Music, YouTube, Boomplay, Mdundo, Safaricom Baze, radio, TV, and influencers.",
              },
              {
                title: "Phase 5: Revenue Collection & ROI Recovery",
                text: "Streaming royalties, downloads, licensing, live performances, and capital recovery.",
              },
            ].map((phase, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {phase.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{phase.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Model */}
        <div className="mt-20 max-w-5xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Business Model & Returns
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Each artist debut project costs approximately <strong>KSH 175,000</strong> and is
            projected to generate around <strong>KSH 250,000 annually</strong>. Ludeva
            retains 100% of revenues until capital recovery. From Year 3 onward,
            revenue is shared on a <strong>70:30 split</strong> in favor of Ludeva,
            creating long-term recurring income through retained copyrights and
            master rights.
          </p>
        </div>

        {/* Risk & Outcomes */}
        {expanded && (
          <div className="mt-20 grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                Risk Management
              </h4>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Binding contracts before production</li>
                <li>Aggressive digital marketing and partnerships</li>
                <li>Copyright registration and secure distribution</li>
                <li>Staggered investments focused on high-potential talent</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                Expected Outcomes
              </h4>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Growing pool of managed creative talent</li>
                <li>Multiple diversified revenue streams</li>
                <li>Strong brand positioning in the creative economy</li>
                <li>Long-term compounding income from content assets</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition"
          >
            {expanded ? "Show Less" : "View Full Model & Risk Framework"}
          </button>
        </div>
      </div>
    </section>
  );
}
