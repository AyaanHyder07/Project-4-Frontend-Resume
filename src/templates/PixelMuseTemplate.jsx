import React, { useEffect } from "react";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "pixelmuse-template-styles";
const FONT_ID = "pixelmuse-template-font";
const css = `
.pixelmuse-root{background:linear-gradient(180deg,#fff6ef 0%,var(--color-bg) 58%);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"DM Sans",sans-serif}.pixelmuse-root *{box-sizing:border-box}.pixelmuse-shell{max-width:1120px;margin:0 auto;padding:30px 20px 70px}.pixelmuse-hero{display:grid;grid-template-columns:1.08fr .92fr;gap:24px;align-items:end}.pixelmuse-copy{display:grid;gap:16px;padding:20px 0}.pixelmuse-tag{display:inline-flex;align-items:center;gap:8px;width:max-content;padding:8px 12px;border-radius:999px;background:#111;color:#fff;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.pixelmuse-title{font-size:clamp(3.2rem,6vw,6rem);line-height:.9;margin:0;color:#19120f}.pixelmuse-sub{font-size:1.08rem;color:#6f6058;max-width:620px;line-height:1.78}.pixelmuse-links{display:flex;flex-wrap:wrap;gap:12px}.pixelmuse-link{padding:11px 14px;border-radius:999px;border:1px solid rgba(25,18,15,.1);background:rgba(255,255,255,.7);text-decoration:none;color:#19120f;font-weight:700}.pixelmuse-art{position:relative;min-height:440px;border-radius:36px;background:#16110f;overflow:hidden;border:1px solid rgba(25,18,15,.08)}.pixelmuse-band{position:absolute;left:0;right:0;height:22%;background:#b8d8f6}.pixelmuse-orb{position:absolute;border-radius:50%}.pixelmuse-frame{position:absolute;left:12%;right:12%;top:10%;bottom:10%;display:grid;align-items:end;padding:20px}.pixelmuse-avatar{position:absolute;top:8%;left:10%;width:130px;height:130px;border-radius:50%;border:5px solid rgba(255,255,255,.9);overflow:hidden;background:#fff}.pixelmuse-avatar img{width:100%;height:100%;object-fit:cover}.pixelmuse-stamp{margin-left:auto;padding:14px 24px;border-radius:999px;background:#d9007c;color:#fff;font-weight:800;box-shadow:0 18px 40px rgba(217,0,124,.28)}.pixelmuse-bottom{padding:24px 28px;color:#fff}.pixelmuse-bottom h2{font-size:3rem;line-height:.94;margin:0 0 10px}.pixelmuse-feed{max-width:1120px;margin:34px auto 0;padding:0 20px}.pixelmuse-stack{display:grid;gap:26px}@media (max-width:960px){.pixelmuse-hero{grid-template-columns:1fr}.pixelmuse-art{min-height:360px}.pixelmuse-bottom h2{font-size:2.4rem}}
`;

export default function PixelMuseTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const style = injectThemeVars(portfolio?.themeData || {});
  const photo = resolveAssetUrl(profile.profilePhotoUrl);

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
      l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Syne:wght@500;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="pixelmuse-root" style={{ ...style, "--font-main": "'Syne', 'DM Sans', sans-serif" }}>
      <div className="pixelmuse-shell">
        <div className="pixelmuse-hero">
          <div className="pixelmuse-copy">
            <span className="pixelmuse-tag">Creative Portfolio</span>
            <h1 className="pixelmuse-title">{profile.fullName || "Your Name"}</h1>
            <p className="pixelmuse-sub">{profile.bio || "Playful, expressive, and still practical. This portfolio brings personality up front while keeping room for projects, services, experience, publications, and any other enabled sections."}</p>
            <div className="pixelmuse-links">
              {profile.websiteUrl ? <a className="pixelmuse-link" href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a> : null}
              {profile.linkedinUrl ? <a className="pixelmuse-link" href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
              {profile.githubUrl ? <a className="pixelmuse-link" href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
            </div>
          </div>
          <div className="pixelmuse-art">
            <div className="pixelmuse-band" />
            <div className="pixelmuse-orb" style={{ width: 180, height: 180, right: -40, bottom: -30, background: "rgba(255,255,255,0.06)" }} />
            <div className="pixelmuse-orb" style={{ width: 120, height: 120, right: 28, bottom: 20, border: "12px solid rgba(255,255,255,0.08)" }} />
            <div className="pixelmuse-frame">
              {photo ? <div className="pixelmuse-avatar"><img src={photo} alt={profile.fullName || "Profile"} /></div> : <div className="pixelmuse-avatar" style={{ display: "grid", placeItems: "center", fontSize: 42, fontWeight: 800 }}>{getInitials(profile.fullName)}</div>}
              <div className="pixelmuse-stamp">Follow</div>
              <div className="pixelmuse-bottom">
                <h2>{profile.displayName || profile.fullName || "Creator"}</h2>
                <div style={{ fontSize: 18, opacity: 0.88 }}>{profile.professionalTitle || portfolio?.title || "Artist, developer, storyteller"}</div>
                <div style={{ marginTop: 12, opacity: 0.72 }}>{profile.location || "Available worldwide"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pixelmuse-feed">
        <div className="pixelmuse-stack">
          <UniversalSectionStack portfolio={portfolio} variant="soft" />
        </div>
      </div>
    </div>
  );
}
