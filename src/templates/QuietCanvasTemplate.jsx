import React, { useEffect } from "react";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { injectThemeVars } from "./utils/templateHelpers";

const STYLE_ID = "quietcanvas-template-styles";
const FONT_ID = "quietcanvas-template-font";
const css = `
.quietcanvas-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"Cormorant Garamond",serif}.quietcanvas-root *{box-sizing:border-box}.quietcanvas-shell{max-width:1040px;margin:0 auto;padding:48px 20px 76px}.quietcanvas-hero{padding:48px 0 34px}.quietcanvas-kicker{font-size:.82rem;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent);font-family:Inter,sans-serif}.quietcanvas-title{font-size:clamp(3.6rem,8vw,7rem);line-height:.88;margin:14px 0 10px;color:#171311}.quietcanvas-sub{max-width:700px;font-size:1.28rem;line-height:1.75;color:#5d534c}.quietcanvas-meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:22px;font-family:Inter,sans-serif;font-size:13px;color:#7b6c60}.quietcanvas-divider{height:1px;background:linear-gradient(90deg,rgba(23,19,17,.12),rgba(23,19,17,0));margin:18px 0 26px}.quietcanvas-stack{display:grid;gap:32px}.quietcanvas-foot{margin-top:36px;font-family:Inter,sans-serif;font-size:12px;color:#7b6c60}@media (max-width:780px){.quietcanvas-hero{padding-top:28px}.quietcanvas-title{font-size:3rem}.quietcanvas-sub{font-size:1.08rem}}
`;

export default function QuietCanvasTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const style = injectThemeVars(portfolio?.themeData || {});

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = css;
      document.head.appendChild(s);
    }
    if (!document.getElementById(FONT_ID)) {
      const l = document.createElement("link");
      l.id = FONT_ID;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="quietcanvas-root" style={{ ...style, "--font-main": "'Cormorant Garamond', serif" }}>
      <div className="quietcanvas-shell">
        <header className="quietcanvas-hero">
          <div className="quietcanvas-kicker">Minimal aesthetic portfolio</div>
          <h1 className="quietcanvas-title">{profile.fullName || "Your Name"}</h1>
          <p className="quietcanvas-sub">{profile.bio || "A simple, quiet, creative portfolio with no navbar, a strong first screen, and a softer presentation for designers, developers, doctors, writers, and anyone who wants elegance without visual noise."}</p>
          <div className="quietcanvas-meta">
            {profile.professionalTitle ? <span>{profile.professionalTitle}</span> : null}
            {profile.location ? <span>{profile.location}</span> : null}
            {profile.email ? <span>{profile.email}</span> : null}
          </div>
        </header>
        <div className="quietcanvas-divider" />
        <div className="quietcanvas-stack">
          <UniversalSectionStack portfolio={portfolio} variant="warm" titleStyle={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "Inter, sans-serif", fontWeight: 700 }} sectionGap={34} />
        </div>
        <div className="quietcanvas-foot">Everything below is driven by the sections the user chooses to show.</div>
      </div>
    </div>
  );
}
