// src/components/GallerySection.tsx
"use client";

import Image from "next/image";
import Container from "@/components/ui/Container";
import PageHero from "@/components/PageHero";

const galleryImages = [
  "/images/gallery/gallery1 (1).jpeg",
  "/images/gallery/gallery1 (2).jpeg",
  "/images/gallery/gallery1 (3).jpeg",
  "/images/gallery/gallery1 (4).jpeg",
  "/images/gallery/gallery1 (5).jpeg",
  "/images/gallery/gallery1 (6).jpeg",
];

export default function GallerySection() {
  return (
    <>
      <PageHero
        title="Ludeva Photo Gallery"
        description="Explore key moments from our journey — community engagements, investor events, team highlights, and more."
        imageSrc="/images/hero-about.png"
      />
      <section className="py-16 md:py-24 bg-background">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {galleryImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 shadow-sm bg-card group hover:shadow-lg hover:-translate-y-1 transition-transform duration-300"
              >
                <Image
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
