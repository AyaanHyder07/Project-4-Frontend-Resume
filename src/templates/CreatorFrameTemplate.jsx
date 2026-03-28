import React, { useEffect } from "react";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "creatorframe-template-styles";
const FONT_ID = "creatorframe-template-font";
const css = `
.creatorframe-root{background:#f3efe8;color:#f7f3ec;min-height:100vh;font-family:var(--font-main),Inter,sans-serif}.creatorframe-root *{box-sizing:border-box}.creatorframe-shell{max-width:1180px;margin:0 auto;padding:28px 20px 70px}.creatorframe-window{background:#121214;border-radius:28px;padding:16px;border:1px solid rgba(0,0,0,.08);box-shadow:0 26px 60px rgba(15,15,15,.18)}.creatorframe-top{height:28px;display:flex;gap:8px;align-items:center}.creatorframe-dot{width:11px;height:11px;border-radius:50%}.creatorframe-body{border-radius:22px;overflow:hidden;background:#141416}.creatorframe-cover{height:88px;background:linear-gradient(90deg,#7fc7ff,#d8ebff)}.creatorframe-inner{max-width:760px;margin:0 auto;padding:0 28px 34px}.creatorframe-avatar{width:132px;height:132px;border-radius:50%;margin-top:-58px;border:5px solid #f7f3ec;overflow:hidden;background:#fff}.creatorframe-avatar img{width:100%;height:100%;object-fit:cover}.creatorframe-follow{margin-left:auto;display:inline-flex;padding:14px 22px;border-radius:999px;background:#d6007a;color:#fff;font-weight:800;text-decoration:none}.creatorframe-profile{display:grid;gap:12px;margin-top:14px}.creatorframe-profile h1{font-size:clamp(3rem,5vw,4.5rem);line-height:.92;margin:0}.creatorframe-links{display:flex;flex-wrap:wrap;gap:10px;color:#9b96a3}.creatorframe-tabs{display:flex;gap:34px;padding:18px 0 0;border-bottom:1px solid rgba(255,255,255,.08);margin-top:18px}.creatorframe-tab{padding-bottom:14px;border-bottom:4px solid transparent;font-weight:700;color:#76717a}.creatorframe-tab.active{border-color:#ff00a8;color:#fff}.creatorframe-sections{max-width:760px;margin:24px auto 0;padding-bottom:20px}.creatorframe-sections section{scroll-margin-top:24px}@media (max-width:860px){.creatorframe-inner{padding:0 18px 24px}.creatorframe-profile h1{font-size:2.6rem}.creatorframe-tabs{gap:18px;overflow:auto}}
`;

export default function CreatorFrameTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const style = injectThemeVars(portfolio?.themeData || {});
  const photo = resolveAssetUrl(profile.profilePhotoUrl);
  const sections = Array.isArray(portfolio?.sectionOrder) ? portfolio.sectionOrder : [];

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
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Outfit:wght@500;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="creatorframe-root" style={{ ...style, "--font-main": "'Outfit', Inter, sans-serif" }}>
      <div className="creatorframe-shell">
        <div className="creatorframe-window">
          <div className="creatorframe-top">
            <span className="creatorframe-dot" style={{ background: "#ff5f57" }} />
            <span className="creatorframe-dot" style={{ background: "#febc2e" }} />
            <span className="creatorframe-dot" style={{ background: "#28c840" }} />
          </div>
          <div className="creatorframe-body">
            <div className="creatorframe-cover" />
            <div className="creatorframe-inner">
              <div style={{ display: "flex", alignItems: "end", gap: 18 }}>
                {photo ? <div className="creatorframe-avatar"><img src={photo} alt={profile.fullName || "Profile"} /></div> : <div className="creatorframe-avatar" style={{ display: "grid", placeItems: "center", color: "#111", fontSize: 38, fontWeight: 800 }}>{getInitials(profile.fullName)}</div>}
                <a className="creatorframe-follow" href={profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || "#contact"}>Follow</a>
              </div>
              <div className="creatorframe-profile">
                <h1>{profile.fullName || "Your Name"}</h1>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.professionalTitle || portfolio?.title || "Creator Portfolio"}</div>
                <div style={{ fontSize: 18, color: "#c6bfca", lineHeight: 1.65 }}>{profile.bio || "A creator-first, social-profile-inspired portfolio that puts identity and the strongest 60-70% of the story in the first frame, then lets the rest unfold below."}</div>
                <div className="creatorframe-links">
                  {profile.email ? <span>{profile.email}</span> : null}
                  {profile.websiteUrl ? <span>{profile.websiteUrl}</span> : null}
                  {profile.location ? <span>{profile.location}</span> : null}
                </div>
              </div>
              <div className="creatorframe-tabs">
                {(sections.length ? sections : ["projects", "about", "contact"]).slice(0, 4).map((item, index) => <div key={`${item}-${index}`} className={`creatorframe-tab ${index === 0 ? "active" : ""}`}>{String(item).replace(/_/g, " ")}</div>)}
              </div>
              <div className="creatorframe-sections">
                <UniversalSectionStack portfolio={portfolio} variant="panel" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
