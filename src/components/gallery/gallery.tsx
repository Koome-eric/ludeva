"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Image from "next/image";

const GalleryPage = () => {
  const galleryImages = [
    "/images/gallery/gallery1 (1).jpeg",
    "/images/gallery/gallery1 (2).jpeg",
    "/images/gallery/gallery1 (3).jpeg",
    "/images/gallery/gallery1 (4).jpeg",
    "/images/gallery/gallery1 (5).jpeg",
    "/images/gallery/gallery1 (6).jpeg",
    // Add more image paths as needed
  ];

  return (
    <section id="gallery" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Ludeva Photo Gallery"
            paragraph="Explore key moments from our journey — community engagements, investor events, team highlights, and more."
            center
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((src, index) => (
              <div key={index} className="relative w-full h-64 overflow-hidden rounded-lg shadow-md group">
                <Image
                  src={src}
                  alt={`Ludeva event ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
              Want to be part of our next event?
            </h4>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Join our investor community or attend upcoming Ludeva engagements across Kenya.
            </p>
            <a
              href="https://ludeva-dashboard.vercel.app/signup"
              className="inline-block px-6 py-3 text-lg font-medium rounded-lg bg-[#D4AF37] hover:bg-[#b99b30] text-white transition duration-300"
            >
              Join Ludeva Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryPage;
