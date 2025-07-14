import Breadcrumb from "@/components/Common/Breadcrumb";
import RealEstateInvestment from "@/components/services/real-estate";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Investment | Ludeva Public Ltd",
  description:
    "Explore Ludeva’s Real Estate Investment opportunities — from affordable housing to commercial properties. Start building wealth through secure property-backed investments.",
};

const RealEstateInvestmentPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Real Estate Investment"
        description="Discover Ludeva’s real estate investment options — vetted, transparent, and built for long-term wealth. Participate in residential, commercial, and mixed-use projects starting from KES 5,000."
      />

      <RealEstateInvestment />
    </>
  );
};

export default RealEstateInvestmentPage;
