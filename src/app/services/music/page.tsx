import Breadcrumb from "@/components/Common/Breadcrumb";
import Music from "@/components/music/MusicFilmAggregation";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music & Film Aggregation | Ludeva Public Ltd",
  description:
    "Discover Ludeva Music & Film Aggregation — a structured creative initiative focused on discovering talent, funding professional production, distributing content globally, and generating long-term revenue through retained copyrights and master rights.",
};

const MusicPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Music & Film Aggregation"
        description="Ludeva Music & Film Aggregation empowers upcoming musicians and filmmakers through full production funding, global distribution, and sustainable monetization built on retained copyrights and master rights."
      />

      <Music />
    </>
  );
};

export default MusicPage;
