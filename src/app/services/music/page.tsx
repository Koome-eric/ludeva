import Breadcrumb from "@/components/Common/Breadcrumb";
import Music from "@/components/music/MusicFilmAggregation";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music | Ludeva Public Ltd",
  description:
    "Explore Ludeva's Money Market Fund — a low-risk, high-liquidity investment designed to preserve your capital and generate stable daily returns.",
};

const MusicPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Music"
        description="Explore a secure and flexible investment option. Ludeva's Money Market Fund helps you grow your wealth with daily returns, minimal risk, and high liquidity."
      />

      <Music />
    </>
  );
};

export default MusicPage;
