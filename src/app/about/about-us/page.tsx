import Breadcrumb from "@/components/Common/Breadcrumb";
import LeadershipTeam from "@/components/About/LeadershipTeam";
import AboutLudeva from "@/components/About/AboutLudeva";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Ludeva Public Ltd – Invest in Kenya’s Future",
  description:
    "Learn more about Ludeva Public Ltd – a Kenyan investment company creating accessible opportunities in money markets, real estate, community agriculture, and SMEs.",
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About Ludeva"
        description="Ludeva Public Ltd is dedicated to unlocking inclusive, sustainable investment opportunities across Kenya. From money markets to agriculture and SME growth, we provide everyday people with access to high-potential ventures that build financial security and community wealth."
      />
      <AboutLudeva />
      <LeadershipTeam />

    </>
  );
};

export default AboutPage;
