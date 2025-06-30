import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Ludeva Public Ltd",
  description:
    "Have questions or ready to start your investment journey with Ludeva? Get in touch with our team for support, partnership inquiries, or general assistance.",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Us"
        description="We’re here to help you grow your wealth. Reach out to the Ludeva team for inquiries about our investment options, partnerships, or support."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
