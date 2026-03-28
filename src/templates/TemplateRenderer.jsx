import React, { Suspense, lazy } from "react";

const DevFolioTemplate = lazy(() => import("./DevFolioTemplate"));
const ClassicProTemplate = lazy(() => import("./ClassicProTemplate"));
const DesignCaseTemplate = lazy(() => import("./DesignCaseTemplate"));
const LensWorkTemplate = lazy(() => import("./LensWorkTemplate"));
const MentorHubTemplate = lazy(() => import("./MentorHubTemplate"));
const FreelancerKitTemplate = lazy(() => import("./FreelancerKitTemplate"));
const StartupFounderTemplate = lazy(() => import("./StartupFounderTemplate"));
const WritersDeskTemplate = lazy(() => import("./WritersDeskTemplate"));
const StudioGridTemplate = lazy(() => import("./StudioGridTemplate"));
const PixelMuseTemplate = lazy(() => import("./PixelMuseTemplate"));
const CreatorFrameTemplate = lazy(() => import("./CreatorFrameTemplate"));
const QuietCanvasTemplate = lazy(() => import("./QuietCanvasTemplate"));
const FallbackTemplate = lazy(() => import("./FallbackTemplate"));

const templateMap = {
  DEVFOLIO: DevFolioTemplate,
  CLASSICPRO: ClassicProTemplate,
  DESIGNCASE: DesignCaseTemplate,
  LENSWORK: LensWorkTemplate,
  MENTORHUB: MentorHubTemplate,
  FREELANCERKIT: FreelancerKitTemplate,
  STARTUPFOUNDER: StartupFounderTemplate,
  WRITERSDESK: WritersDeskTemplate,
  STUDIOGRID: StudioGridTemplate,
  PIXELMUSE: PixelMuseTemplate,
  CREATORFRAME: CreatorFrameTemplate,
  QUIETCANVAS: QuietCanvasTemplate,
};

export default function TemplateRenderer({ portfolio }) {
  const key = String(portfolio?.renderFamily || portfolio?.templateKey || "CLASSICPRO").toUpperCase();
  const TemplateComponent = templateMap[key] || FallbackTemplate;

  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading portfolio...</div>}>
      <TemplateComponent portfolio={portfolio} />
    </Suspense>
  );
}
