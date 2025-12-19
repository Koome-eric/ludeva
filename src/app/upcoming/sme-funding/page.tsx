import Breadcrumb from "@/components/Common/Breadcrumb";
import SMEDevelopmentFunds from "@/components/services/sme-funding";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SME Development Funds | Ludeva Public Ltd",
  description:
    "Fuel the growth of Kenya’s small and medium enterprises through structured funding. Ludeva’s SME Development Fund enables stable returns and economic empowerment.",
};

const SMEDevelopmentPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="SME Development Funds"
        description="Invest in local businesses with Ludeva’s SME Development Fund. Earn structured returns while empowering Kenyan entrepreneurs and SMEs."
      />

      <SMEDevelopmentFunds />
    </>
  );
};

export default SMEDevelopmentPage;
