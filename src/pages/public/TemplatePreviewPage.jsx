import React from "react";
import { Link, useParams } from "react-router-dom";
import TemplateRenderer from "../../templates/TemplateRenderer";
import { getSamplePortfolio } from "../../templates/preview/samplePortfolios";

export default function TemplatePreviewPage() {
  const { templateKey } = useParams();
  const portfolio = getSamplePortfolio(templateKey);

  return (
    <div style={{ minHeight: "100vh", background: "#0E0E0E" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "12px 18px", background: "rgba(10,10,10,0.88)", backdropFilter: "blur(12px)", color: "#F4EFE6", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div>
          <strong style={{ letterSpacing: "0.08em" }}>Previewing: {portfolio.templateKey}</strong>
          <div style={{ fontSize: 12, opacity: 0.72 }}>{portfolio.profile.professionalTitle} premium template preview</div>
        </div>
        <Link to="/resumes" style={{ color: "#F4EFE6", textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: 700 }}>
          Use This Template
        </Link>
      </div>
      <TemplateRenderer portfolio={portfolio} />
    </div>
  );
}
