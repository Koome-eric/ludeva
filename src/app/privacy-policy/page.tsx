import Breadcrumb from "@/components/Common/Breadcrumb";
import PrivacyPolicy from "@/components/legal/privacy-policy";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ludeva Public Ltd",
  description:
    "Review how Ludeva Public Ltd collects, uses, and protects your personal data when using our investment platform and services.",
};

const PrivacyPolicyPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Privacy Policy"
        description="Review how we collect, use, and safeguard your personal information while using Ludeva's investment platform and services."
      />

      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPolicyPage;
