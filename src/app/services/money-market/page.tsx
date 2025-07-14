import Breadcrumb from "@/components/Common/Breadcrumb";
import MoneyMarketFunds from "@/components/services/money-market";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money Market Funds | Ludeva Public Ltd",
  description:
    "Explore Ludeva's Money Market Fund — a low-risk, high-liquidity investment designed to preserve your capital and generate stable daily returns.",
};

const MoneyMarketPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Money Market Funds"
        description="Explore a secure and flexible investment option. Ludeva's Money Market Fund helps you grow your wealth with daily returns, minimal risk, and high liquidity."
      />

      <MoneyMarketFunds />
    </>
  );
};

export default MoneyMarketPage;
