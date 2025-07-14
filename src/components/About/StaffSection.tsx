"use client";

import Image from "next/image";

const staff = [
  {
    name: "Lilian Wanjiru",
    title: "Client Relations Manager",
    image: "/images/testimonials/auth-03.png",
    bio: "Focused on investor success and portfolio satisfaction.",
  },
  {
    name: "Samuel Kimani",
    title: "Investment Analyst",
    image: "/images/testimonials/auth-01.png",
    bio: "Specialist in market research and opportunity analysis.",
  },
  {
    name: "Grace Muthoni",
    title: "Digital Communications Officer",
    image: "/images/testimonials/auth-02.png",
    bio: "Drives investor engagement and education through digital media.",
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
