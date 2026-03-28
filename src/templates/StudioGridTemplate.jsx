import React, { useEffect } from "react";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "studiogrid-template-styles";
const FONT_ID = "studiogrid-template-font";
const css = `
.studiogrid-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),Inter,sans-serif}.studiogrid-root *{box-sizing:border-box}.studiogrid-shell{max-width:1180px;margin:0 auto;padding:34px 22px 60px}.studiogrid-window{border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:rgba(9,12,15,.92);box-shadow:0 30px 80px rgba(0,0,0,.38)}.studiogrid-top{height:62px;display:flex;align-items:center;gap:14px;padding:0 18px;border-bottom:1px solid rgba(255,255,255,.07)}.studiogrid-dot{width:12px;height:12px;border-radius:50%}.studiogrid-main{display:grid;grid-template-columns:1.08fr .92fr;min-height:calc(100vh - 160px)}.studiogrid-copy{padding:56px 44px 44px;position:relative}.studiogrid-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,255,136,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.05) 1px,transparent 1px);background-size:68px 68px;pointer-events:none}.studiogrid-hero{position:relative;display:grid;gap:16px}.studiogrid-kicker{font-size:.82rem;letter-spacing:.26em;text-transform:uppercase;color:var(--color-accent)}.studiogrid-title{font-size:clamp(3.1rem,6vw,5.8rem);line-height:.92;margin:0;color:#f3f7f2}.studiogrid-sub{font-size:1.2rem;color:var(--color-accent);font-weight:700}.studiogrid-bio{max-width:620px;color:rgba(255,255,255,.8);line-height:1.82}.studiogrid-chips{display:flex;flex-wrap:wrap;gap:12px}.studiogrid-chip{padding:10px 14px;border-radius:999px;border:1px solid rgba(0,255,136,.22);background:rgba(0,255,136,.08)}.studiogrid-visual{padding:38px;display:grid;align-content:center;background:radial-gradient(circle at 50% 18%, rgba(0,255,136,.12), transparent 34%), rgba(255,255,255,.02)}.studiogrid-card{padding:22px;border-radius:26px;border:1px solid rgba(255,255,255,.08);background:rgba(6,8,8,.64);display:grid;gap:18px}.studiogrid-photo{height:360px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(0,255,136,.12),rgba(255,255,255,.03));display:grid;place-items:center;overflow:hidden}.studiogrid-photo img{width:100%;height:100%;object-fit:cover}.studiogrid-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.studiogrid-metrics div{padding:14px;border-radius:18px;background:rgba(255,255,255,.04);text-align:center}.studiogrid-sections{max-width:1180px;margin:28px auto 0;padding:0 22px 60px}.studiogrid-stack{display:grid;gap:28px}@media (max-width:980px){.studiogrid-main{grid-template-columns:1fr}.studiogrid-copy,.studiogrid-visual{padding:30px 22px}.studiogrid-photo{height:280px}}
`;

export default function StudioGridTemplate({ portfolio }) {
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
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="studiogrid-root" style={{ ...style, "--font-main": "'Space Grotesk', Inter, sans-serif" }}>
      <div className="studiogrid-shell">
        <div className="studiogrid-window">
          <div className="studiogrid-top">
            <span className="studiogrid-dot" style={{ background: "#ff5f57" }} />
            <span className="studiogrid-dot" style={{ background: "#febc2e" }} />
            <span className="studiogrid-dot" style={{ background: "#28c840" }} />
            <div style={{ marginLeft: 8, opacity: 0.72, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12 }}>Developer Studio</div>
          </div>
          <div className="studiogrid-main">
            <div className="studiogrid-copy">
              <div className="studiogrid-grid" />
              <div className="studiogrid-hero">
                <div className="studiogrid-kicker">Software Engineer Portfolio</div>
                <h1 className="studiogrid-title">{profile.fullName || "Your Name"}</h1>
                <div className="studiogrid-sub">{profile.professionalTitle || portfolio?.title || "Front-end & App Developer"}</div>
                <p className="studiogrid-bio">{profile.bio || "A premium developer portfolio with featured proof, clear expertise, and a strong first screen that still leaves room for every section you decide to publish."}</p>
                <div className="studiogrid-chips">
                  {profile.location ? <span className="studiogrid-chip">{profile.location}</span> : null}
                  {profile.availabilityStatus ? <span className="studiogrid-chip">{String(profile.availabilityStatus).replace(/_/g, " ")}</span> : null}
                  {profile.githubUrl ? <span className="studiogrid-chip">GitHub linked</span> : null}
                </div>
              </div>
            </div>
            <div className="studiogrid-visual">
              <div className="studiogrid-card">
                <div className="studiogrid-photo">
                  {photo ? <img src={photo} alt={profile.fullName || "Profile"} /> : <div style={{ fontSize: 76, fontWeight: 800, color: "var(--color-accent)" }}>{getInitials(profile.fullName)}</div>}
                </div>
                <div className="studiogrid-metrics">
                  <div><strong style={{ display: "block", fontSize: 24, color: "var(--color-accent)" }}>01</strong><span style={{ opacity: 0.74, fontSize: 12 }}>Featured intro</span></div>
                  <div><strong style={{ display: "block", fontSize: 24, color: "var(--color-accent)" }}>02</strong><span style={{ opacity: 0.74, fontSize: 12 }}>All sections</span></div>
                  <div><strong style={{ display: "block", fontSize: 24, color: "var(--color-accent)" }}>03</strong><span style={{ opacity: 0.74, fontSize: 12 }}>Premium layout</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="studiogrid-sections">
        <div className="studiogrid-stack">
          <UniversalSectionStack portfolio={portfolio} variant="dark" />
        </div>
      </div>
    </div>
  );
}
