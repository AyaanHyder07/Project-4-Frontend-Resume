import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "lenswork-template-styles";
const FONT_ID = "lenswork-template-font";

const css = `
.lenswork-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"Cormorant Garamond",serif}
.lenswork-root *{box-sizing:border-box}
.lenswork-hero{min-height:100vh;padding:34px 28px 28px;display:grid;grid-template-rows:auto 1fr auto;position:relative;overflow:hidden;background:radial-gradient(circle at 70% 20%,rgba(232,197,71,.16),transparent 32%),linear-gradient(180deg,rgba(255,255,255,.03),transparent)}
.lenswork-grain{position:absolute;inset:0;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")}
.lenswork-top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:20px}
.lenswork-brand{font-size:.86rem;letter-spacing:.38em;text-transform:uppercase;color:var(--color-accent)}
.lenswork-links{display:flex;gap:16px;flex-wrap:wrap}
.lenswork-links button,.lenswork-links a{background:none;border:none;color:var(--color-text);text-decoration:none;font:inherit;cursor:pointer;opacity:.78}
.lenswork-center{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1.08fr;gap:28px;align-items:end}
.lenswork-copy{max-width:520px}
.lenswork-kicker{font-size:.8rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,242,220,.68)}
.lenswork-title{font-size:clamp(3.4rem,8vw,7.6rem);line-height:.86;margin:.4rem 0 0;font-weight:700;color:#f7f2e8;text-shadow:0 14px 30px rgba(0,0,0,.28)}
.lenswork-subtitle{margin-top:14px;font-size:1.3rem;color:var(--color-accent)}
.lenswork-bio{font-size:1.08rem;line-height:1.8;color:rgba(255,242,220,.78);max-width:520px}
.lenswork-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.lenswork-btn{padding:12px 18px;border-radius:999px;text-decoration:none;border:1px solid rgba(255,255,255,.14);color:var(--color-text);font-weight:700}
.lenswork-btn.primary{background:var(--color-accent);color:#15120f;border-color:transparent}
.lenswork-stage{position:relative;height:min(74vh,720px);border-radius:34px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));box-shadow:0 28px 70px rgba(0,0,0,.36)}
.lenswork-stage::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.36));pointer-events:none}
.lenswork-stage-image{width:100%;height:100%;object-fit:cover}
.lenswork-stage-fallback{width:100%;height:100%;display:grid;place-items:center;font-size:5rem;font-weight:700;color:var(--color-accent);background:linear-gradient(135deg,rgba(232,197,71,.12),rgba(255,255,255,.02))}
.lenswork-filmstrip{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:24px}
.lenswork-frame{border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);min-height:180px}
.lenswork-frame-body{height:100%;padding:18px;display:grid;align-content:end;background:linear-gradient(180deg,transparent,rgba(0,0,0,.52))}
.lenswork-frame h3{margin:0;font-size:1.5rem}
.lenswork-frame p{margin:8px 0 0;color:rgba(255,242,220,.72);line-height:1.6}
.lenswork-contact{padding:30px 28px 42px;background:#090909;border-top:1px solid rgba(255,255,255,.08)}
.lenswork-contact-shell{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:24px}
.lenswork-contact-card{padding:24px;border:1px solid rgba(255,255,255,.08);border-radius:28px;background:rgba(255,255,255,.02)}
.lenswork-contact-card form{display:grid;gap:12px}
.lenswork-contact-card input,.lenswork-contact-card textarea{width:100%;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:var(--color-text);font:inherit}
.lenswork-contact-card button{padding:12px 16px;border:none;border-radius:999px;background:var(--color-accent);color:#15120f;font-weight:800;cursor:pointer}
@media (max-width: 980px){.lenswork-center,.lenswork-contact-shell{grid-template-columns:1fr}.lenswork-filmstrip{grid-template-columns:1fr}.lenswork-stage{height:420px}}
@media (max-width: 767px){.lenswork-hero{padding:22px 16px 20px}.lenswork-links{display:none}.lenswork-title{font-size:3.3rem}.lenswork-stage{height:360px}.lenswork-contact{padding:24px 16px 36px}}
`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LensWorkTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const rootStyle = injectThemeVars(portfolio?.themeData || {});
  const heroImage = resolveAssetUrl(profile.profilePhotoUrl);
  const initials = getInitials(profile.fullName || profile.displayName);
  const featuredProjects = Array.isArray(sections.projects) ? sections.projects.slice(0, 3) : [];

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await contactAPI.submit({
        resumeId: portfolio?.resumeId,
        senderName: form.get("senderName"),
        senderEmail: form.get("senderEmail"),
        senderPhone: form.get("senderPhone"),
        subject: form.get("subject"),
        message: form.get("message"),
      });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="lenswork-root" style={rootStyle}>
      <section className="lenswork-hero">
        <div className="lenswork-grain" />
        <div className="lenswork-top">
          <div className="lenswork-brand">LensWork</div>
          <div className="lenswork-links">
            <button type="button" onClick={() => scrollToSection("gallery")}>Gallery</button>
            <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
            {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
          </div>
        </div>

        <div className="lenswork-center">
          <div className="lenswork-copy">
            <div className="lenswork-kicker">Cinematic portfolio</div>
            <h1 className="lenswork-title">{profile.fullName || profile.displayName || "Your Name"}</h1>
            <div className="lenswork-subtitle">{profile.professionalTitle || portfolio?.title || "Photographer & Director"}</div>
            <p className="lenswork-bio">{profile.bio || "Gallery-first storytelling for photographers, directors, and artists who need a high-end visual frame."}</p>
            <div className="lenswork-actions">
              <button type="button" className="lenswork-btn primary" onClick={() => scrollToSection("gallery")}>View Gallery</button>
              <button type="button" className="lenswork-btn" onClick={() => scrollToSection("contact")}>Book a Shoot</button>
            </div>
          </div>

          <div className="lenswork-stage">
            {heroImage ? (
              <img className="lenswork-stage-image" src={heroImage} alt={profile.fullName || "Featured work"} />
            ) : (
              <div className="lenswork-stage-fallback">{initials}</div>
            )}
          </div>
        </div>

        <div className="lenswork-filmstrip" id="gallery">
          {featuredProjects.map((project, index) => (
            <article className="lenswork-frame" key={project.id || index}>
              <div className="lenswork-frame-body">
                <h3>{project.title || "Gallery story"}</h3>
                <p>{project.description || project.summary || "Project summary coming soon."}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lenswork-contact" id="contact">
        <div className="lenswork-contact-shell">
          <div className="lenswork-contact-card">
            <div style={{ fontSize: ".82rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--color-accent)" }}>Availability</div>
            <h2 style={{ fontSize: "2.6rem", margin: "10px 0 12px" }}>Selected commissions, campaigns, and editorial work.</h2>
            <p style={{ color: "rgba(255,242,220,.72)", lineHeight: 1.8 }}>{profile.location || "Available for destination and studio projects."}</p>
            <div style={{ marginTop: 18, display: "grid", gap: 10, color: "rgba(255,242,220,.88)" }}>
              {profile.email ? <div>{profile.email}</div> : null}
              {profile.phone ? <div>{profile.phone}</div> : null}
              {profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{profile.websiteUrl}</a> : null}
            </div>
          </div>
          <div className="lenswork-contact-card">
            <form onSubmit={handleSubmit}>
              <input name="senderName" placeholder="Your name" required />
              <input name="senderEmail" type="email" placeholder="Your email" required />
              <input name="senderPhone" placeholder="Phone number" />
              <input name="subject" placeholder="Project type" required />
              <textarea name="message" rows="5" placeholder="Tell me about the project, location, and timelines." required />
              <button type="submit">Send inquiry</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

