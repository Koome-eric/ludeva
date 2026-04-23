"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

/* ------------------------ BOARD OF DIRECTORS ------------------------- */
const board = [
  {
    name: "Mr. Gilbert Odongo",
    title: "Co-Founder & Director",
    bio: `A seasoned marketing expert with a proven track record of entrepreneurship that embodies innovation and resilience. 
    Founder of Braintap Enterprises (2020), he built a reputation for excellence with over 30 loyal outlets. 
    In 2023, he Co-founded Ludeva Public Ltd to offer individuals and organizations innovative investment solutions.`,
  },
  {
    name: "PS James Osano",
    title: "Non-Executive Director",
    bio: `Founder & CEO of Apollo & Associates (est. 2001), offering business planning, auditing, tax, and accounting services. 
    Former Finance Manager at TARDA (2008–2012) and an active member of ICPAK, ICPSK, and CFA Society East Africa.`,
  },
  {
    name: "Dr. Keziah Odemba",
    title: "Member of Technical Advisory Council",
    bio: `Renowned for her leadership in sustainable tourism development, policy formulation, and organizational strategy. 
    Honored among Africa’s Top 100 Travel and Tourism Personalities and recipient of the Head of State Commendation (HSC).`,
  },
  {
    name: "Mr. Ron Okelo",
    title: "AI Prompt Designer",
    bio: `An expert who transitioned from Mortgage Banking to AI System Design. 
    Blending analytical precision with storytelling, he ensures technology aligns with human clarity and purpose.`,
  },
  {
    name: "Mr. Bernard Obudo",
    title: "Telecommunication & Network Security Expert",
    bio: `With over 15 years’ experience in network configuration, communication, and digital signal processing. 
    Has consulted for EU-funded organizations and empowers SMEs at community level.`,
  },
  {
    name: "Prof. Nelson K. Olang’o Ojijo, PhD",
    title: "Non-Executive Director",
    bio: `Associate Professor at JKUAT and international expert in food processing, innovation systems, and post-harvest technology. 
    Former Executive Director of Access Agriculture and FARA specialist.`,
  },
  {
    name: "Dr. Pauline Otieno Kibisu",
    title: "Healthcare Professional & Executive Director",
    bio: `A US-based Family Nurse Practitioner (FNP) and Doctor of Nursing Practice (DNP) with extensive leadership in healthcare systems.`,
  },
  {
    name: "Mr. Seth Nyaranga",
    title: "Executive Director",
    bio: `Over two decades in accounting and financial management with expertise in reporting, audits, and transaction management.`,
  },
  {
    name: "Mrs. Turfosa Otieno",
    title: "Director, Supply Chain & Marketing",
    bio: `Director at Trutery Catering, Agranpak Agencies, and See & Tee Logistics Ltd with expertise in logistics and procurement.`,
  },
  {
    name: "Mr. Mordecai A. Ogembo",
    title: "Education & Ethics Specialist",
    bio: `Holds a Master’s in Economics and brings 20+ years in academia and ethical leadership training.`,
  },
  {
    name: "Prof. Bernard Omolo",
    title: "Professor of Statistics",
    bio: `PhD in Mathematical Statistics with expertise in genomics and biostatistics. Professor at University of South Carolina.`,
  },
  {
    name: "Mr. Paul Okech",
    title: "Business Development Executive",
    bio: `Entrepreneur with 25+ years in finance, tech, and consulting. Chairman of Elloe AI.`,
  },
  {
    name: "Mrs. Grace Odongo",
    title: "Business Development Executive",
    bio: `Expert in network marketing, client engagement, and relationship management.`,
  },
];

export default function LeadershipTeam() {
  return (
    <>
      {/* HERO SECTION */}
      <PageHero
        title="Ludeva Board of Directors & Staff"
        description="Meet the visionary minds guiding Ludeva Public Ltd."
        imageSrc="/images/hero-staff.png"
      />

      {/* MAIN SECTION */}
      <section id="leadership" className="py-20 bg-[#FCFCFC] dark:bg-black">
        <div className="container mx-auto px-4">

          
          {/* BOARD */}
          <div>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
              Board of Directors & Staff
            </h3>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {board.map((leader, index) => (
                <motion.div
                  key={`board-${index}`}
                  className="bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-6 hover:shadow-lg transition duration-300 border border-gray-100 dark:border-neutral-800"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {leader.name}
                  </h3>
                  <p className="text-sm text-[#D4AF37] mb-3">{leader.title}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {leader.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}