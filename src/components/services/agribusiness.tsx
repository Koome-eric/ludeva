"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import Link from "next/link";

const AgribusinessInvestment = () => {
  return (
    <section id="agribusiness" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="pb-16 md:pb-20 lg:pb-28">
          <SectionTitle
            title="Agribusiness Investment"
            paragraph="Discover how Ludeva bridges the gap between investors and rural farmers to create shared prosperity, climate resilience, and food security across Kenya."
            center
          />

          <div className="mt-10 max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              In Kenya, agriculture remains the heartbeat of the economy — contributing nearly
              one-third of GDP and employing over 70% of the rural population. Yet this vital
              sector continues to face systemic challenges such as climate change, limited access
              to financing, low productivity, and weak market linkages.{" "}
              <strong>Ludeva</strong> steps into this gap — not only as an investment company but
              as a trusted guide, connecting urban capital with rural farming communities to
              create inclusive prosperity and lasting food security.
            </p>

            <h3 className="text-2xl font-semibold mt-10 mb-4 text-black dark:text-white">
              The Power of Strategic Investment in Agriculture
            </h3>
            <p>
              Experts agree that strategic investment in climate-smart practices, organic farming,
              agri-tech, and innovative funding models is key to unlocking Kenya’s agricultural
              potential. Smallholder farmers need more than capital — they need structured support,
              technical expertise, and access to profitable markets. By combining investment with
              knowledge transfer, investors can help transform rural communities from subsistence
              to sustainable, commercialized farming.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              Blended Finance: Proven Models of Success
            </h4>
            <p>
              Across Africa, blended finance models have shown that rural productivity can thrive
              when risk-sharing frameworks and agricultural credit lines reduce lending risks for
              smallholders. With the right safeguards, financing rural agriculture becomes both
              impactful and profitable — proving that development and returns can go hand in hand.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              Building Resilience Through Community-Led Action
            </h4>
            <p>
              Climate change is one of the greatest threats to farming livelihoods. In Kenya’s arid
              and semi-arid zones, community-led practices such as agroforestry, water harvesting,
              and smart irrigation systems have proven vital in protecting ecosystems while
              improving yields. Involving women and youth ensures that these initiatives address
              both environmental and social dimensions of resilience and food security.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              Tech-Enabled, Impact-Driven Partnerships
            </h4>
            <p>
              Innovation is bridging the gap between investors and farmers. Agri-tech platforms now
              use mobile apps, AI, and digital wallets to provide financing, inputs, and agronomy
              advice directly to farmers. These solutions empower smallholders to increase yields,
              access fairer markets, and thrive in competitive agricultural value chains.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              Community Power: SACCOs, Chamas, and Cooperatives
            </h4>
            <p>
              Collective action remains a powerful tool in rural transformation. Farmer cooperatives,
              SACCOs, and chamas pool resources to invest in shared infrastructure such as cold
              storage, irrigation, and processing facilities. This cooperation strengthens market
              access, reduces post-harvest losses, spreads risk, and builds long-term community
              resilience.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              Ludeva’s Role: Connecting Investors with Real Impact
            </h4>
            <p>
              <strong>Ludeva</strong> acts as a catalyst — curating agricultural investment
              opportunities that are transparent, sustainable, and community-centered. From
              climate-smart horticulture to value-added processing, Ludeva identifies ventures that
              promise measurable social impact alongside financial returns. Through rigorous due
              diligence, Ludeva ensures investors’ capital supports viable projects that create jobs,
              empower farmers, and boost productivity.
            </p>
            <p>
              Beyond funding, Ludeva provides farmer training, financial literacy, and access to
              improved farming techniques. For investors — especially those in the diaspora —
              Ludeva offers peace of mind, ensuring that every shilling invested contributes to
              tangible growth and responsible stewardship.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              The Ripple Effects: Shared Prosperity and Food Security
            </h4>
            <p>
              This integrated approach yields ripple effects that extend far beyond individual
              farms. Communities gain resilience, infrastructure improves, incomes rise, and Kenya
              moves closer to achieving food security and rural development goals. Investors, in
              turn, benefit from meaningful returns and the satisfaction of making a lasting social
              impact.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">
              A Landmark Model for Wider Adoption
            </h4>
            <p>
              The model that Ludeva champions — combining capital investment, technical expertise,
              and community empowerment — aligns with the best global practices in agricultural
              development. By connecting investors with smallholders, Ludeva demonstrates that
              rural agriculture can be both profitable and transformative when approached
              collaboratively.
            </p>

            <h4 className="text-xl font-semibold text-black dark:text-white mt-8">Conclusion</h4>
            <p>
              Agriculture remains Kenya’s economic cornerstone and the foundation of food security.
              Yet farmers cannot thrive in isolation. They need an ecosystem where investors,
              advisors, and communities collaborate to unlock potential. By bridging capital with
              grassroots action, Ludeva is transforming rural farming into a driver of shared
              prosperity — empowering farmers, rewarding investors, and building a stronger,
              self-sufficient nation where everyone wins.
            </p>

            <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-8 text-center">
              <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ready to Invest in Agribusiness?
              </h4>
              <p className="mb-6">
                Join Ludeva in transforming rural agriculture into a profitable and sustainable
                future for Kenya.
              </p>
              <Link href="https://ludeva-dashboard.vercel.app/signup">
                <button className="bg-[#D4AF37] hover:bg-[#b99b30] text-black font-medium px-6 py-3 rounded-lg transition duration-200">
                  Start Your Agribusiness Journey
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgribusinessInvestment;
