"use client";

import Image from "next/image";

const directors = [
  {
    name: "Jane Mwangi",
    title: "Chairperson",
    image: "/images/testimonials/auth-01.png",
    bio: "Over 20 years of leadership in investment banking and governance.",
  },
  {
    name: "David Otieno",
    title: "Finance Director",
    image: "/images/testimonials/auth-02.png",
    bio: "Expert in corporate finance, risk analysis, and fund structuring.",
  },
];

const DirectorsSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Company Directors
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
              <p className="text-sm text-primary font-medium mb-2">
                {director.title}
              </p>
              <p className="text-sm text-muted-foreground">{director.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DirectorsSection;
