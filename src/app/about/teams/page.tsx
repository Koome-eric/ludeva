import Breadcrumb from "@/components/Common/Breadcrumb";
import Teams from "@/components/Teams";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ludeva TEAMS | Community Savings & Investment Program",
  description:
    "Discover Ludeva TEAMS — a structured group savings and investment initiative that combines disciplined monthly contributions with Money Market Fund growth to create long-term passive income.",
};

const TeamsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Ludeva TEAMS"
        description="Ludeva TEAMS is a structured group savings and investment initiative designed to promote financial discipline, transparency, and collective wealth creation. Members save together in small teams while growing their funds through Ludeva’s professionally managed Money Market Fund."
      />

      <Teams />
    </>
  );
};

export default TeamsPage;
