import React, { useEffect, useState } from "react";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { injectThemeVars } from "./utils/templateHelpers";

const STYLE_ID = "writersdesk-template-styles";
const FONT_ID = "writersdesk-template-font";
const css = `
.writersdesk-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"Playfair Display",serif}.writersdesk-root *{box-sizing:border-box}.writersdesk-bar{position:fixed;top:0;left:0;right:0;height:5px;background:rgba(146,64,14,.12);z-index:30}.writersdesk-progress{height:100%;background:var(--color-accent);transition:width .14s ease}.writersdesk-shell{max-width:1080px;margin:0 auto;padding:88px 20px 60px}.writersdesk-header{display:grid;gap:12px;border-bottom:1px solid rgba(28,25,23,.08);padding-bottom:26px}.writersdesk-kicker{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent);font-family:Inter,sans-serif}.writersdesk-title{font-size:clamp(3rem,6vw,5.4rem);line-height:.92;margin:0;color:#1c1917}.writersdesk-sub{font-size:1.18rem;color:#6b5b50}.writersdesk-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;margin-top:28px}.writersdesk-sidebar{position:sticky;top:96px;align-self:start;padding:20px;border-radius:24px;background:#fffaf3;border:1px solid rgba(28,25,23,.08);display:grid;gap:16px}.writersdesk-note{padding:18px;border-radius:20px;background:rgba(146,64,14,.06);border:1px solid rgba(146,64,14,.12)}@media (max-width:920px){.writersdesk-grid{grid-template-columns:1fr}.writersdesk-sidebar{position:static}}
`;

export default function WritersDeskTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const style = injectThemeVars(portfolio?.themeData || {});
  const [progress, setProgress] = useState(0);

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
      l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=Inter:wght@400;500;700&display=swap";
      document.head.appendChild(l);
    }
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const next = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, next)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="writersdesk-root" style={style}>
      <div className="writersdesk-bar"><div className="writersdesk-progress" style={{ width: `${progress}%` }} /></div>
      <div className="writersdesk-shell">
        <header className="writersdesk-header">
          <div className="writersdesk-kicker">Editorial Portfolio</div>
          <h1 className="writersdesk-title">{profile.fullName || "Your Name"}</h1>
          <div className="writersdesk-sub">{profile.professionalTitle || portfolio?.title || "Writer, researcher, clinician, builder, or creative"}</div>
          <p style={{ maxWidth: 760, color: "#5c5149", lineHeight: 1.9, margin: 0 }}>{profile.bio || "A calm, content-first portfolio that still adapts cleanly to experience, projects, services, credentials, and every section the user chooses to publish."}</p>
        </header>
        <div className="writersdesk-grid">
          <main>
            <UniversalSectionStack portfolio={portfolio} variant="warm" titleStyle={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", fontFamily: "Inter, sans-serif", fontWeight: 700 }} sectionGap={30} />
          </main>
          <aside className="writersdesk-sidebar">
            <div>
              <div className="writersdesk-kicker">At a glance</div>
              <div style={{ fontSize: 28, lineHeight: 1.05, marginTop: 6 }}>{profile.displayName || profile.fullName || "Profile"}</div>
            </div>
            <div style={{ display: "grid", gap: 8, color: "#5c5149" }}>
              {profile.email ? <div>{profile.email}</div> : null}
              {profile.location ? <div>{profile.location}</div> : null}
              {profile.phone ? <div>{profile.phone}</div> : null}
              {profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)", textDecoration: "none" }}>{profile.websiteUrl}</a> : null}
            </div>
            <div className="writersdesk-note">
              <strong style={{ display: "block", marginBottom: 8 }}>Works for more than writing</strong>
              <span style={{ color: "#6b5b50", lineHeight: 1.7 }}>This layout now supports experience, projects, services, research, awards, media, finance credentials, and any enabled sections instead of only writer-style content.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
