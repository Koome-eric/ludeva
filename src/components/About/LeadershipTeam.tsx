"use client";

import { motion } from "framer-motion";

/* ----------------------------- STAFF TEAM ----------------------------- */
/* Add real staff when ready */
const staff = [
  {
    name: "—",
    title: "Investor Relations Director",
    bio: "Profile coming soon.",
  },
  {
    name: "—",
    title: "Marketing Director",
    bio: "Profile coming soon.",
  },
  {
    name: "—",
    title: "Client Relationship Manager",
    bio: "Profile coming soon.",
  },
];

/* ------------------------ BOARD OF DIRECTORS ------------------------- */
/* Everyone else goes here */
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
    title: "Member of Technical Advisory Council", // updated title
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
    Former Executive Director of Access Agriculture and FARA specialist. Over three decades of academic, research, and donor project leadership.`,
  },
  {
    name: "Dr. Pauline Otieno Kibisu",
    title: "Healthcare Professional & Executive Director",
    bio: `A US-based Family Nurse Practitioner (FNP) and Doctor of Nursing Practice (DNP) with extensive leadership in healthcare systems. 
    Passionate about community service and global health equity.`,
  },
  {
    name: "Mr. Seth Nyaranga",
    title: "Executive Director",
    bio: `Over two decades in accounting and financial management with expertise in reporting, audits, and transaction management. 
    Experience spans the USA and Kenya, including roles at Lake Junaluska and Baraton University Sacco.`,
  },
  {
    name: "Mrs. Turfosa Otieno",
    title: "Director, Supply Chain & Marketing",
    bio: `Director at Trutery Catering, Agranpak Agencies, and See & Tee Logistics Ltd. 
    Expert in procurement, logistics, and strategic marketing with experience in East African pharmaceutical sectors.`,
  },
  {
    name: "Mr. Mordecai A. Ogembo",
    title: "Education & Ethics Specialist",
    bio: `Holds a Master’s in Economics and a Diploma in HR Management. 
    Brings 20+ years in academia, public procurement, and ethical leadership training.`,
  },
  {
    name: "Prof. Bernard Omolo",
    title: "Professor of Statistics",
    bio: `PhD in Mathematical Statistics (Texas Tech University). 
    Expert in genomics and biostatistics, funded by NIH and BWF. 
    Professor at the University of South Carolina – Upstate, with visiting roles in African universities.`,
  },
  {
    name: "Mr. Paul Okech",
    title: "Business Development Executive",
    bio: `Entrepreneur and economist with 25+ years in finance, tech, and consulting. 
    Chairman of Elloe AI and founder of Blackwealth Enterprises. 
    Renowned for driving fintech innovation and MSME empowerment.`,
  },
  {
    name: "Mrs. Grace Odongo",
    title: "Business Development Executive",
    bio: `Expert in Network Marketing and customer engagement. 
    Skilled in relationship management, conflict resolution, and client loyalty building through empathy and collaboration.`,
  },
];

export default function LeadershipTeam() {
  return (
    <section id="leadership" className="py-20 bg-[#FCFCFC] dark:bg-black">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Leadership & Governance
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Meet the visionary minds guiding Ludeva Public Ltd.
          </p>
        </div>

        {/* STAFF */}
        <div className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
            Staff Team
          </h3>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((person, index) => (
              <motion.div
                key={`staff-${index}`}
                className="bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-6 hover:shadow-lg transition duration-300 border border-gray-100 dark:border-neutral-800"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {person.name}
                </h3>
                <p className="text-sm text-[#D4AF37] mb-3">{person.title}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {person.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOARD */}
        <div>
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
            Board of Directors
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
  );
}
