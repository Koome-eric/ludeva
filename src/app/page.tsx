import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import FAQ from "@/components/faq/faq";
import Teams from "@/components/Teams";
import MusicFilmAggregation from "@/components/music/MusicFilmAggregation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ludeva – Accessible Investments in Kenya",
  description:
    "Ludeva Public Ltd mobilizes capital to create accessible investment opportunities across money markets, real estate, agriculture, and SMEs in Kenya.",
  // Add more like openGraph, twitter, etc., if needed
};


export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <MusicFilmAggregation />
      <Teams />
      <Testimonials />
      <FAQ />
      
      <Blog />
      <Contact />
    </>
  );
}
