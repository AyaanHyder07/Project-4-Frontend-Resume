import React, { useEffect, useMemo } from "react";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import {
  getContactDetails,
  getContentWidth,
  getDensityStyles,
  getNavSections,
  getTemplateLabel,
  getTemplateOption,
} from "./shared/templateData";

const STYLE_ID = "designcase-template-styles";
const FONT_ID = "designcase-template-font";
const css = `
.designcase-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"DM Sans",sans-serif}.designcase-root *{box-sizing:border-box}.designcase-shell{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:100vh}.designcase-sidebar{position:sticky;top:0;height:100vh;padding:30px 24px;background:#171311;color:#fff8f1;display:grid;grid-template-rows:auto auto 1fr auto;border-right:1px solid rgba(255,255,255,.08)}.designcase-mark{font-size:.78rem;letter-spacing:.28em;text-transform:uppercase;color:var(--color-accent)}.designcase-avatar{width:82px;height:82px;border-radius:22px;background:rgba(255,255,255,.08);display:grid;place-items:center;overflow:hidden;margin-top:18px;font-size:2rem;font-weight:800}.designcase-avatar img{width:100%;height:100%;object-fit:cover}.designcase-name{font-size:clamp(1.8rem,3vw,2.4rem);line-height:.95;margin-top:18px;font-weight:800}.designcase-title{margin-top:8px;color:var(--color-accent);text-transform:uppercase;letter-spacing:.18em;font-size:.76rem}.designcase-nav{display:grid;gap:10px;align-content:start;margin-top:28px}.designcase-nav button,.designcase-nav a{background:none;border:none;text-align:left;color:#fff8f1;text-decoration:none;font:inherit;font-size:.94rem;opacity:.78;cursor:pointer;padding:0}.designcase-nav button:hover,.designcase-nav a:hover{opacity:1;color:var(--color-accent)}.designcase-side-foot{display:grid;gap:10px;font-size:.92rem}.designcase-side-foot a,.designcase-side-foot div{color:#fff8f1;text-decoration:none;overflow-wrap:anywhere}.designcase-main{padding:28px 30px 42px;background:linear-gradient(180deg,#f7f0e5 0%,#f4ede3 100%)}.designcase-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);align-items:start;padding-bottom:26px;border-bottom:1px solid rgba(22,17,15,.08)}.designcase-kicker{font-size:.8rem;letter-spacing:.24em;text-transform:uppercase;color:#7c6a60}.designcase-headline{font-size:clamp(3rem,6vw,5rem);line-height:.9;letter-spacing:-.05em;margin:.3rem 0 .55rem;font-weight:800;color:#16110f;max-width:10ch}.designcase-bio{max-width:50ch;font-size:1.02rem;line-height:1.75;color:#4d433d;margin:0}.designcase-highlight{background:#fffaf3;border:1px solid rgba(22,17,15,.08);border-radius:28px;padding:20px;box-shadow:0 18px 50px rgba(22,17,15,.08);display:grid;gap:12px}.designcase-highlight-label{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--color-accent)}.designcase-highlight h3{font-size:1.45rem;margin:0;color:#16110f}.designcase-highlight p{margin:0;color:#564d48;line-height:1.7}.designcase-project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.designcase-card{background:#fffaf3;border:1px solid rgba(22,17,15,.08);border-radius:24px;padding:20px;box-shadow:0 18px 40px rgba(22,17,15,.06);display:grid;gap:14px}.designcase-card-top{display:flex;justify-content:space-between;gap:12px;align-items:start}.designcase-card h3{margin:0;font-size:1.3rem;color:#16110f}.designcase-card p{margin:0;color:#564d48;line-height:1.7}.designcase-chip-wrap{display:flex;flex-wrap:wrap;gap:8px}.designcase-chip-wrap span{padding:8px 10px;border-radius:999px;background:rgba(255,90,54,.1);color:#7d3728;font-size:.78rem;font-weight:700}.designcase-link{display:inline-flex;color:#16110f;text-decoration:none;font-weight:700;border-bottom:1px solid rgba(22,17,15,.2);width:max-content}.designcase-stack section{scroll-margin-top:96px}@media (max-width:980px){.designcase-shell{grid-template-columns:1fr}.designcase-sidebar{position:static;height:auto;grid-template-rows:auto}.designcase-main{padding:22px 16px 38px}.designcase-hero,.designcase-project-grid{grid-template-columns:1fr}}`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DesignCaseTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const rootStyle = injectThemeVars(portfolio?.themeData || {});
  const avatar = resolveAssetUrl(profile.profilePhotoUrl);
  const initials = getInitials(profile.fullName || profile.displayName);
  const density = getDensityStyles(portfolio);
  const navMode = getTemplateOption(portfolio, "navMode", "sidebar");
  const navSections = navMode === "none" ? [] : getNavSections(portfolio, ["projects", "experience", "services", "testimonials", "contact"]);
  const contacts = getContactDetails(profile, sections.contact);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "Use this layout for structured work, sharper storytelling, and clearer positioning without fake filler blocks.");
  const width = getContentWidth(portfolio, 1360);

  const remainingSections = useMemo(() => {
    const next = { ...sections };
    delete next.projects;
    return next;
  }, [sections]);

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
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Cormorant+Garamond:wght@600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="designcase-root" style={rootStyle}>
      <div className="designcase-shell" style={{ maxWidth: width, margin: "0 auto" }}>
        <aside className="designcase-sidebar">
          <div>
            <div className="designcase-mark">Design Case</div>
            <div className="designcase-avatar">
              {avatar ? <img src={avatar} alt={profile.fullName || "Profile"} /> : initials}
            </div>
            <div className="designcase-name">{profile.fullName || profile.displayName || "Your Name"}</div>
            <div className="designcase-title">{profile.professionalTitle || portfolio?.title || "Professional"}</div>
          </div>
          {navSections.length ? (
            <nav className="designcase-nav">
              {navSections.map((item) => (
                <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
              ))}
              {profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a> : null}
            </nav>
          ) : null}
          <div />
          {contacts.length ? (
            <div className="designcase-side-foot">
              {contacts.map((item) => {
                const href = item.includes("@") ? `mailto:${item}` : item.startsWith("http") ? item : null;
                return href ? <a key={item} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item}</a> : <div key={item}>{item}</div>;
              })}
            </div>
          ) : null}
        </aside>

        <main className="designcase-main" style={{ display: "grid", gap: density.sectionGap }}>
          <section className="designcase-hero" style={{ gap: density.heroGap }}>
            <div>
              <div className="designcase-kicker">{heroEyebrow}</div>
              <h1 className="designcase-headline">{profile.fullName || profile.displayName || "Your Name"}</h1>
              <p className="designcase-bio">{heroTagline}</p>
            </div>
            <div className="designcase-highlight">
              <div className="designcase-highlight-label">Positioning</div>
              <h3>{profile.professionalTitle || portfolio?.title || "Professional"}</h3>
              <p>{profile.location || profile.email || "Use your title, contact details, and selected sections to position the portfolio cleanly."}</p>
            </div>
          </section>

          {Array.isArray(sections.projects) && sections.projects.length ? (
            <section id="projects" style={{ display: "grid", gap: 16 }}>
              <div className="designcase-kicker">{getTemplateLabel(portfolio, "projectsTitle", "Selected Work")}</div>
              <div className="designcase-project-grid">
                {sections.projects.map((project, index) => (
                  <article className="designcase-card" key={project.id || index}>
                    <div className="designcase-card-top">
                      <div>
                        <h3>{project.title || "Project"}</h3>
                        {project.projectType ? <div className="designcase-kicker" style={{ marginTop: 8 }}>{project.projectType}</div> : null}
                      </div>
                      {project.year || project.startYear ? <div className="designcase-kicker">{project.year || project.startYear}</div> : null}
                    </div>
                    {project.description || project.summary ? <p>{project.description || project.summary}</p> : null}
                    {Array.isArray(project.techStack) && project.techStack.length ? (
                      <div className="designcase-chip-wrap">
                        {project.techStack.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>{tag}</span>)}
                      </div>
                    ) : null}
                    {project.projectUrl || project.liveUrl ? <a className="designcase-link" href={project.projectUrl || project.liveUrl} target="_blank" rel="noreferrer">Open project</a> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="designcase-stack">
            <UniversalSectionStack
              portfolio={{ ...portfolio, sections: remainingSections }}
              variant="warm"
              sectionGap={density.sectionGap}
              titleStyle={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7c6a60", fontWeight: 700 }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}