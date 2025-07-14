import Breadcrumb from "@/components/Common/Breadcrumb";
import TermsOfService from "@/components/legal/terms-of-service";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Ludeva Public Ltd",
  description:
    "Understand the rules and conditions for using Ludeva’s investment platform, including user responsibilities and limitations of liability.",
};

const TermsOfServicePage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Terms of Service"
        description="Understand the rules and conditions for using Ludeva’s investment platform, including user responsibilities and limitations of liability."
      />

      <TermsOfService />
    </>
  );
};

export default TermsOfServicePage;
