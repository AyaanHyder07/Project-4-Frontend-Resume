import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getContactDetails, getContentWidth, getDensityStyles, getNavSections, getPrimaryProject, getTemplateLabel } from "./shared/templateData";

const STYLE_ID = "lenswork-template-styles";
const FONT_ID = "lenswork-template-font";

const css = `
.lenswork-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"Cormorant Garamond",serif}
.lenswork-root *{box-sizing:border-box}
.lenswork-shell{margin:0 auto;padding:28px 24px 44px}
.lenswork-hero{min-height:78vh;padding:26px;border-radius:32px;display:grid;grid-template-rows:auto 1fr auto;position:relative;overflow:hidden;background:radial-gradient(circle at 70% 20%,rgba(232,197,71,.14),transparent 32%),linear-gradient(180deg,rgba(255,255,255,.03),transparent);border:1px solid rgba(255,255,255,.08)}
.lenswork-grain{position:absolute;inset:0;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")}
.lenswork-top,.lenswork-center,.lenswork-strip{position:relative;z-index:1}
.lenswork-top{display:flex;justify-content:space-between;align-items:center;gap:20px}
.lenswork-brand{font-size:.82rem;letter-spacing:.34em;text-transform:uppercase;color:var(--color-accent)}
.lenswork-links{display:flex;gap:16px;flex-wrap:wrap}
.lenswork-links button,.lenswork-links a{background:none;border:none;color:var(--color-text);text-decoration:none;font:inherit;cursor:pointer;opacity:.78}
.lenswork-center{display:grid;grid-template-columns:minmax(0,.95fr) minmax(320px,1.05fr);gap:26px;align-items:center;margin-top:26px}
.lenswork-copy{max-width:560px}
.lenswork-kicker{font-size:.78rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,242,220,.68)}
.lenswork-title{font-size:clamp(3.4rem,8vw,7rem);line-height:.9;margin:.4rem 0 0;font-weight:700;color:#f7f2e8;text-shadow:0 14px 30px rgba(0,0,0,.28);max-width:8ch}
.lenswork-subtitle{margin-top:14px;font-size:1.2rem;color:var(--color-accent)}
.lenswork-bio{font-size:1.04rem;line-height:1.78;color:rgba(255,242,220,.8);max-width:560px}
.lenswork-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.lenswork-btn{padding:12px 18px;border-radius:999px;text-decoration:none;border:1px solid rgba(255,255,255,.14);color:var(--color-text);font-weight:700;background:transparent;cursor:pointer}
.lenswork-btn.primary{background:var(--color-accent);color:#15120f;border-color:transparent}
.lenswork-stage{position:relative;min-height:480px;border-radius:30px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));box-shadow:0 28px 70px rgba(0,0,0,.36)}
.lenswork-stage::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.36));pointer-events:none}
.lenswork-stage-image{width:100%;height:100%;object-fit:cover}
.lenswork-stage-fallback{width:100%;height:100%;display:grid;place-items:center;font-size:clamp(3rem,8vw,5rem);font-weight:700;color:var(--color-accent);background:linear-gradient(135deg,rgba(232,197,71,.12),rgba(255,255,255,.02))}
.lenswork-stage-caption{position:absolute;left:22px;right:22px;bottom:18px;z-index:2;padding:16px 18px;border-radius:20px;background:rgba(10,10,10,.46);backdrop-filter:blur(10px)}
.lenswork-stage-caption h3{margin:0;font-size:1.35rem}.lenswork-stage-caption p{margin:8px 0 0;color:rgba(255,242,220,.72);line-height:1.6}
.lenswork-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
.lenswork-chip{padding:14px 16px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
.lenswork-chip strong{display:block;font-size:1rem;color:#f7f2e8}.lenswork-chip span{display:block;margin-top:6px;color:rgba(255,242,220,.68)}
.lenswork-sections{margin-top:26px}
@media (max-width:980px){.lenswork-center,.lenswork-strip{grid-template-columns:1fr}.lenswork-stage{min-height:360px}}
@media (max-width:767px){.lenswork-shell{padding:18px 16px 34px}.lenswork-hero{padding:18px}.lenswork-links{display:none}.lenswork-title{font-size:3.3rem}}
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
  const width = getContentWidth(portfolio, 1240);
  const density = getDensityStyles(portfolio);
  const navSections = getNavSections(portfolio, ["projects", "exhibitions", "mediaAppearances", "contact", "custom-blocks"]);
  const contacts = getContactDetails(profile, sections.contact);
  const primaryProject = getPrimaryProject(sections);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Visual portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "A cinematic layout for portfolios that need a bold first frame but still respect the real sections a user turns on.");

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
      <div className="lenswork-shell" style={{ maxWidth: width }}>
        <section className="lenswork-hero" data-customize-region="section" data-region-key="hero" style={{ marginBottom: density.sectionGap }}>
          <div className="lenswork-grain" />
          <div className="lenswork-top">
            <div className="lenswork-brand">{heroEyebrow}</div>
            <div className="lenswork-links">
              {navSections.map((item) => (
                <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
              ))}
              {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
            </div>
          </div>

          <div className="lenswork-center" style={{ gap: density.heroGap }}>
            <div className="lenswork-copy">
              <div className="lenswork-kicker">Cinematic portfolio</div>
              <h1 className="lenswork-title">{profile.fullName || profile.displayName || "Your Name"}</h1>
              <div className="lenswork-subtitle">{profile.professionalTitle || portfolio?.title || "Visual Creative"}</div>
              <p className="lenswork-bio">{heroTagline}</p>
              <div className="lenswork-actions">
                <button type="button" className="lenswork-btn primary" onClick={() => scrollToSection(navSections.find((item) => item.key === "projects") ? "projects" : navSections[0]?.key || "contact")}>View Work</button>
                <button type="button" className="lenswork-btn" onClick={() => scrollToSection("contact")}>Get in Touch</button>
              </div>
            </div>

            <div className="lenswork-stage">
              {heroImage ? <img className="lenswork-stage-image" src={heroImage} alt={profile.fullName || "Featured work"} /> : <div className="lenswork-stage-fallback">{initials}</div>}
              <div className="lenswork-stage-caption">
                <h3>{primaryProject?.title || profile.professionalTitle || "Featured Frame"}</h3>
                <p>{primaryProject?.description || primaryProject?.summary || contacts[0] || "Add projects, exhibitions, media appearances, or custom blocks and they will appear below."}</p>
              </div>
            </div>
          </div>

          <div className="lenswork-strip">
            {(contacts.slice(0, 3).length ? contacts.slice(0, 3) : [profile.location, profile.email, portfolio?.openToWork ? "Open to Work" : null].filter(Boolean)).map((item, index) => (
              <div className="lenswork-chip" key={`${item}-${index}`}>
                <strong>{index === 0 ? "Contact" : index === 1 ? "Base" : "Status"}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="lenswork-sections">
          <UniversalSectionStack
            portfolio={portfolio}
            variant="panel"
            sectionGap={density.sectionGap}
            titleStyle={{ fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--color-accent)", fontWeight: 700 }}
            formRenderer={sections?.contact?.showContactForm ? ({ onSubmit }) => (
              <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                <input name="senderName" placeholder="Your name" required style={fieldInput} />
                <input name="senderEmail" type="email" placeholder="Your email" required style={fieldInput} />
                <input name="senderPhone" placeholder="Phone number" style={fieldInput} />
                <input name="subject" placeholder="Project type" required style={fieldInput} />
                <textarea name="message" rows="5" placeholder="Tell me about the project, location, and timelines." required style={{ ...fieldInput, resize: "vertical" }} />
                <button type="submit" style={submitButton}>Send inquiry</button>
              </form>
            ) : null}
            onContactSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

const fieldInput = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,.1)",
  background: "rgba(255,255,255,.03)",
  color: "var(--color-text)",
  font: "inherit",
};

const submitButton = {
  padding: "12px 16px",
  border: "none",
  borderRadius: 999,
  background: "var(--color-accent)",
  color: "#15120f",
  fontWeight: 800,
  cursor: "pointer",
};
