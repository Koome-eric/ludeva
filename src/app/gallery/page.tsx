import Breadcrumb from "@/components/Common/Breadcrumb";
import GalleryPage from "@/components/gallery/gallery";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Ludeva Public Ltd",
  description:
    "Explore Ludeva’s gallery of events, partnerships, and community moments — showcasing our journey of impact and inclusive investment.",
};

const Gallery = () => {
  return (
    <>
      <Breadcrumb
        pageName="Company Gallery"
        description="Moments from our community projects, investor events, and Ludeva’s impact journey across Kenya."
      />

      <GalleryPage />
    </>
  );
};

export default Gallery;
