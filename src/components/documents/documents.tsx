"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionTitle from "@/components/Common/SectionTitle";

interface DocumentItem {
  id: number;
  name: string;
  type: "folder" | "file";
  link?: string;
}

const documents: DocumentItem[] = [
  { id: 1, name: "Annual Report 2025", type: "file", link: "#" },
  { id: 2, name: "Financial Statements", type: "file", link: "#" },
  { id: 3, name: "Policy & Guidelines", type: "folder" },
  { id: 4, name: "Investor Presentations", type: "folder" },
  { id: 5, name: "Audit Reports", type: "file", link: "#" },
];

export default function DocumentsHub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen py-24 bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative w-full h-80 md:h-96 lg:h-[28rem] mb-16 rounded-2xl overflow-hidden">
        <Image
          src="/images/documents.jpg"
          alt="Documents Hub Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30 z-10"></div>
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-6 md:px-12 lg:px-20 text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Ludeva Documents Hub
          </h1>
          <p className="max-w-2xl text-lg md:text-xl">
            Explore Ludeva&apos;s key documents, reports, and resources. View, download, or export files with ease in a fully responsive and modern interface.
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
            >
              {doc.type === "folder" ? (
                <svg
                  className="w-12 h-12 text-yellow-500 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 text-blue-500 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                </svg>
              )}
              <span className="text-center font-medium text-gray-800 dark:text-white mb-4">
                {doc.name}
              </span>
              <div className="flex space-x-3">
                {doc.type === "file" && (
                  <>
                    <button className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition">
                      View
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                      Export
                    </button>
                  </>
                )}
                {doc.type === "folder" && (
                  <button className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition">
                    Open
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
