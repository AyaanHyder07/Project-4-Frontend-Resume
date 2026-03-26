import React, { Suspense, lazy } from "react";

const DevFolioTemplate = lazy(() => import("./DevFolioTemplate"));
const ClassicProTemplate = lazy(() => import("./ClassicProTemplate"));
const FallbackTemplate = lazy(() => import("./FallbackTemplate"));

const templateMap = {
  DEVFOLIO: DevFolioTemplate,
  CLASSICPRO: ClassicProTemplate,
  DESIGNCASE: FallbackTemplate,
  LENSWORK: FallbackTemplate,
  MENTORHUB: FallbackTemplate,
  STARTUPFOUNDER: FallbackTemplate,
  FREELANCERKIT: FallbackTemplate,
  ARTCANVAS: FallbackTemplate,
  WRITERSDESK: FallbackTemplate,
  MLRESEARCH: FallbackTemplate,
  CAREPULSE: FallbackTemplate,
  LEGALLEDGER: FallbackTemplate,
};

export default function TemplateRenderer({ portfolio }) {
  const key = portfolio?.renderFamily || portfolio?.templateKey || "CLASSICPRO";
  const TemplateComponent = templateMap[key] || FallbackTemplate;

  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading portfolio...</div>}>
      <TemplateComponent portfolio={portfolio} />
    </Suspense>
  );
}
