"use client";

import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

const List = ({ text }: { text: string }) => (
  <p className="text-body-color mb-5 flex items-start text-base leading-relaxed">
    <span className="bg-primary/10 text-primary mr-4 mt-1 flex h-[28px] w-[28px] items-center justify-center rounded-md">
      {checkIcon}
    </span>
    {text}
  </p>
);

const TermsOfService = () => {
  return (
    <section id="terms-of-service" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="w-full px-4">
            <SectionTitle
              title="Ludeva Terms of Service"
              paragraph="These Terms of Service govern your use of Ludeva’s platform and services. By accessing our platform, you agree to comply with these terms."
              mb="10"
            />

            <div className="max-w-3xl">
              <List text="Users must be 18 years or older and provide accurate personal and financial information for compliance and investment purposes." />
              <List text="Ludeva reserves the right to modify or terminate services without prior notice if a user violates any terms or engages in fraudulent activity." />
              <List text="All content and tools provided on Ludeva are for informational purposes only and should not be considered financial advice." />
              <List text="Investments made through the platform carry risk. Ludeva is not liable for market fluctuations or investment losses." />
              <List text="Users are responsible for maintaining the confidentiality of their account credentials and all activities under their account." />
              <List text="Ludeva may update these terms periodically. Continued use of the platform signifies agreement to the updated terms." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
