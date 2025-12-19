import Breadcrumb from "@/components/Common/Breadcrumb";
import CommunityAgriculture from "@/components/services/agribusiness";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Agriculture | Ludeva Public Ltd",
  description:
    "Empower rural communities and grow your wealth through Ludeva’s agriculture investment programs — supporting food security, sustainability, and inclusive returns.",
};

const CommunityAgriculturePage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Community Agriculture"
        description="Partner with Ludeva to invest in sustainable agribusiness. Support rural farming, food production, and earn steady returns from agriculture-backed projects."
      />

      <CommunityAgriculture />
    </>
  );
};

export default CommunityAgriculturePage;
