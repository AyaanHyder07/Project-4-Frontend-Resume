import React from "react";
import PublicPortfolioRenderer from "../pages/public/PublicPortfolioRenderer";

export default function FallbackTemplate({ portfolio }) {
  return <PublicPortfolioRenderer portfolio={portfolio} profile={portfolio?.profile || null} />;
}
