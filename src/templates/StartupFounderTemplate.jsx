import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getContactDetails, getContentWidth, getDensityStyles, getNavSections, getPrimaryProject, getPrimaryService, getTemplateLabel } from "./shared/templateData";

const STYLE_ID = "startupfounder-template-styles";
const FONT_ID = "startupfounder-template-font";
const css = `
.startupfounder-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),Syne,sans-serif}
.startupfounder-root *{box-sizing:border-box}
.startupfounder-shell{margin:0 auto;padding:26px 22px 48px}
.startupfounder-top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px}.startupfounder-kicker{font-size:.8rem;letter-spacing:.24em;text-transform:uppercase;color:var(--color-accent)}
.startupfounder-nav{display:flex;gap:16px;flex-wrap:wrap}.startupfounder-nav button{background:none;border:none;color:var(--color-text);font:inherit;cursor:pointer;opacity:.84}
.startupfounder-hero{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);gap:22px;align-items:stretch;padding:22px;border-radius:34px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015));box-shadow:0 26px 60px rgba(0,0,0,.22)}
.startupfounder-title{font-size:clamp(2.8rem,7vw,5.6rem);line-height:.92;margin:.5rem 0 0;font-weight:800;max-width:10ch;color:#f8f3ec;text-shadow:0 12px 28px rgba(0,0,0,.24)}
.startupfounder-copy{max-width:60ch;color:rgba(248,243,236,.8);line-height:1.78;font-size:1.04rem}
.startupfounder-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.startupfounder-btn{padding:12px 16px;border-radius:999px;border:none;font-weight:700;cursor:pointer}.startupfounder-btn.primary{background:var(--color-accent);color:#120c08}.startupfounder-btn.secondary{background:rgba(255,255,255,.06);color:var(--color-text);border:1px solid rgba(255,255,255,.1)}
.startupfounder-proof{display:grid;gap:14px}.startupfounder-card{border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:18px;background:rgba(255,255,255,.03)}
.startupfounder-card strong{display:block;font-size:.84rem;letter-spacing:.18em;text-transform:uppercase;color:var(--color-accent)}
.startupfounder-card h3{margin:10px 0 8px;font-size:1.45rem;color:#f8f3ec}.startupfounder-card p{margin:0;color:rgba(248,243,236,.74);line-height:1.7}
.startupfounder-metric{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.startupfounder-metric .startupfounder-card{padding:16px}.startupfounder-metric span{display:block;margin-top:10px;font-size:2rem;font-weight:800;color:#f8f3ec}
@media (max-width:980px){.startupfounder-hero,.startupfounder-metric{grid-template-columns:1fr}}
@media (max-width:767px){.startupfounder-shell{padding:18px 16px 34px}.startupfounder-title{font-size:3.2rem}}
`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function StartupFounderTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const style = injectThemeVars(portfolio?.themeData || {});
  const width = getContentWidth(portfolio, 1220);
  const density = getDensityStyles(portfolio);
  const navSections = getNavSections(portfolio, ["projects", "experience", "services", "testimonials", "contact", "custom-blocks"]);
  const primaryProject = getPrimaryProject(sections);
  const primaryService = getPrimaryService(sections);
  const contacts = getContactDetails(profile, sections.contact);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Founder portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "A sharper founder-facing layout that lets product work, operator experience, services, and proof tell the real story.");
  const avatar = resolveAssetUrl(profile.profilePhotoUrl);
  const initials = getInitials(profile.fullName || profile.displayName);
  const counts = {
    projects: Array.isArray(sections.projects) ? sections.projects.length : 0,
    experience: Array.isArray(sections.experience) ? sections.experience.length : 0,
    services: Array.isArray(sections.services) ? sections.services.length : 0,
  };

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const styleNode = document.createElement("style");
      styleNode.id = STYLE_ID;
      styleNode.textContent = css;
      document.head.appendChild(styleNode);
    }
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const submitContact = async (event) => {
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
    <div className="startupfounder-root" style={style}>
      <div className="startupfounder-shell" style={{ maxWidth: width }}>
        <div className="startupfounder-top">
          <div className="startupfounder-kicker">{heroEyebrow}</div>
          <div className="startupfounder-nav">
            {navSections.map((item) => (
              <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
            ))}
          </div>
        </div>

        <section className="startupfounder-hero" data-customize-region="section" data-region-key="hero" style={{ marginBottom: density.sectionGap }}>
          <div>
            <h1 className="startupfounder-title">{profile.fullName || profile.displayName || "Founder"}</h1>
            <div style={{ marginTop: 12, color: "var(--color-accent)", fontSize: "1.12rem", fontWeight: 700 }}>{profile.professionalTitle || portfolio?.title || "Founder / Operator"}</div>
            <p className="startupfounder-copy">{heroTagline}</p>
            <div className="startupfounder-actions">
              <button type="button" className="startupfounder-btn primary" onClick={() => scrollToSection(navSections.find((item) => item.key === "projects") ? "projects" : navSections[0]?.key || "contact")}>See Work</button>
              <button type="button" className="startupfounder-btn secondary" onClick={() => scrollToSection("contact")}>Get in Touch</button>
            </div>
            <div className="startupfounder-metric" style={{ marginTop: 18 }}>
              <div className="startupfounder-card"><strong>Projects</strong><span>{counts.projects}</span></div>
              <div className="startupfounder-card"><strong>Experience</strong><span>{counts.experience}</span></div>
              <div className="startupfounder-card"><strong>Services</strong><span>{counts.services}</span></div>
            </div>
          </div>

          <div className="startupfounder-proof">
            <div className="startupfounder-card">
              <strong>Featured work</strong>
              <h3>{primaryProject?.title || primaryService?.serviceTitle || primaryService?.title || profile.professionalTitle || "Operator story"}</h3>
              <p>{primaryProject?.summary || primaryProject?.description || primaryService?.description || contacts[0] || "Add projects, services, or custom blocks and this area will stay grounded in real user data."}</p>
            </div>
            <div className="startupfounder-card" style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 16, alignItems: "center" }}>
              {avatar ? <img src={avatar} alt={profile.fullName || "Profile"} style={{ width: 92, height: 92, borderRadius: 20, objectFit: "cover" }} /> : <div style={{ width: 92, height: 92, borderRadius: 20, display: "grid", placeItems: "center", background: "rgba(255,255,255,.05)", color: "var(--color-accent)", fontWeight: 800, fontSize: "2rem" }}>{initials}</div>}
              <div>
                <strong>Reach</strong>
                <h3 style={{ marginBottom: 4 }}>{profile.location || "Global"}</h3>
                <p>{contacts.slice(0, 2).join(" · ") || "Contact details appear here when present."}</p>
              </div>
            </div>
          </div>
        </section>

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
              <input name="subject" placeholder="What would you like to discuss?" required style={fieldInput} />
              <textarea name="message" rows="5" placeholder="Details" required style={{ ...fieldInput, resize: "vertical" }} />
              <button type="submit" style={submitButton}>Send message</button>
            </form>
          ) : null}
          onContactSubmit={submitContact}
        />
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
  color: "#160d08",
  fontWeight: 800,
  cursor: "pointer",
};
