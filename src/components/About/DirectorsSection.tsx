"use client";

import Image from "next/image";

const directors = [
  {
    name: "Gilbert Odongo",
    title: "Co-founder & Marketing Lead",
    image: "/images/directors/gilbert-odongo.jpg",
    bio: "Seasoned marketing expert and entrepreneur, co-founded Ludeva Public Ltd to provide innovative investment solutions across Kenya.",
  },
  {
    name: "PS James Osano",
    title: "Founder & Finance Director",
    image: "/images/directors/james-osano.jpg",
    bio: "Founder of Apollo & Associates with expertise in auditing, risk management, and finance strategy for public and private sector organizations.",
  },
  {
    name: "Prof. Bernard Omolo",
    title: "Director of Research & Analytics",
    image: "/images/directors/bernard-omolo.jpg",
    bio: "Professor of Statistics with extensive experience in genomics, public health, and biostatistics research, advising Ludeva on data-driven strategy.",
  },
  {
    name: "Dr. Keziah Odemba",
    title: "Director – Policy & Strategic Planning",
    image: "/images/directors/keziah-odemba.jpg",
    bio: "Expert in policy formulation, strategic planning, and sustainable tourism development with numerous national leadership roles.",
  },
  {
    name: "Sam Ochieng",
    title: "Director – Diaspora & Operations",
    image: "/images/directors/sam-ochieng.jpg",
    bio: "UK-based entrepreneur and co-founder of SACOMA, experienced in operations, change management, and diaspora engagement.",
  },
  {
    name: "Mr Paul Okech",
    title: "Director – Business & Technology",
    image: "/images/directors/paul-okech.jpg",
    bio: "Entrepreneur and board executive driving innovation in fintech, enterprise AI, and MSME support platforms.",
  },
];

const DirectorsSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ludeva Directors
          </h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Meet the board guiding Ludeva’s strategic vision and integrity.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {directors.map((director, index) => (
            <div
              key={index}
              className="bg-muted dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-28 h-28 mx-auto mb-4">
                <Image
                  src={director.image}
                  alt={director.name}
                  className="rounded-full object-cover border-4 border-white dark:border-gray-700"
                  fill
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {director.name}
              </h3>
              <p className="text-sm text-primary font-medium mb-2">{director.title}</p>
              <p className="text-sm text-muted-foreground">{director.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DirectorsSection;
