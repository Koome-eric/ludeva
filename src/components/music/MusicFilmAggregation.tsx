"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function MusicFilmAggregation() {
  const [mounted, setMounted] = useState(false);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black py-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white"
          >
            Ludeva Music & Film Aggregation
          </motion.h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
            Empowering creative youth across Africa through digital music and film production, distribution, and fair monetization.
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Empowering Creative Talent Across Africa
            </h3>

            <p className={`text-gray-600 dark:text-gray-300 leading-relaxed ${showFull ? "" : "line-clamp-6"}`}>
              <strong>Ludeva Music & Film Aggregation</strong> discovers, nurtures, and commercializes musicians and filmmakers across East Africa, providing access to professional production, global distribution, and fair revenue sharing.
            </p>

            {showFull && (
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Production & Distribution:</strong> Professional recording, video creation, and global publishing.</li>
                <li><strong>Revenue Sharing:</strong> Transparent royalties with a sustainable profit model.</li>
                <li><strong>Youth Empowerment:</strong> Building the next generation of African creative stars.</li>
              </ul>
            )}

            <button
              onClick={() => setShowFull(!showFull)}
              className="text-primary font-medium underline mt-4 transition-colors hover:text-primary/80"
            >
              {showFull ? "Read Less" : "Read More"}
            </button>
          </motion.div>

          {/* Image / Banner */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <Image
              src="/images/music.jpg"
              alt="Ludeva Music and Film Aggregation"
              width={600}
              height={300}
              className="rounded-2xl shadow-2xl object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
