"use client";

import Image from "next/image";

const staff = [
  {
    name: "Ron Okelo",
    title: "AI & Technology Specialist",
    image: "/images/staff/ron-okelo.jpg",
    bio: "AI Prompt Designer and technology expert specializing in human-centered AI solutions.",
  },
  {
    name: "Bernard Obudo",
    title: "Telecommunication & Network Security",
    image: "/images/staff/bernard-obudo.jpg",
    bio: "Telecom and network security expert with 15+ years’ experience in multinational organizations and SME empowerment.",
  },
  {
    name: "Professor Nelson K. Olang’o Ojijo",
    title: "Agricultural & Food Systems Expert",
    image: "/images/staff/nelson-ojijo.jpg",
    bio: "Associate Professor with 30+ years of experience in food processing, post-harvest technology, and agricultural development.",
  },
  {
    name: "Dr. Pauline Otieno Kibisu",
    title: "Healthcare Professional",
    image: "/images/staff/pauline-kibisu.jpg",
    bio: "Healthcare provider with a DNP, serving Veterans and leading health initiatives locally and internationally.",
  },
  {
    name: "Mr. Seth Nyaranga",
    title: "Accounting & Financial Management",
    image: "/images/staff/seth-nyaranga.jpg",
    bio: "Accounting professional with over 20 years in financial management, internal audits, and reporting.",
  },
  {
    name: "Mr. Mordecai A. Ogembo",
    title: "Education & Strategic Leadership",
    image: "/images/staff/mordecai-ogembo.jpg",
    bio: "Educationist and strategist with 20+ years in academia, public procurement, and performance management.",
  },
  {
    name: "Mrs. Turfosa Otieno",
    title: "Supply Chain & Marketing",
    image: "/images/staff/turfosa-otieno.jpg",
    bio: "Expert in supply chain operations, procurement, and business development across multiple industries.",
  },
  {
    name: "Grace Odongo",
    title: "Network Marketing & Client Relations",
    image: "/images/staff/grace-odongo.jpg",
    bio: "Expert in network marketing, customer engagement, and relationship management.",
  },
];

const StaffSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-muted/10 dark:bg-gray-950">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ludeva Staff
          </h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Our experienced team is committed to serving investors and growing communities.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="rounded-full object-cover border-4 border-primary/20"
                  fill
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-sm text-primary font-medium mb-1">{member.title}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaffSection;
