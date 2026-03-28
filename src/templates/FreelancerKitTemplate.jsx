import React, { useEffect, useMemo } from "react";
import { injectThemeVars } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import {
  getContactDetails,
  getContentWidth,
  getDensityStyles,
  getNavSections,
  getOrderedSectionEntries,
  getPrimaryService,
  getSectionTitle,
  getTemplateLabel,
  getTemplateOption,
} from "./shared/templateData";

const STYLE_ID = "freelancerkit-template-styles";
const FONT_ID = "freelancerkit-template-font";
const css = `
.freelancerkit-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"Plus Jakarta Sans",sans-serif}
.freelancerkit-root *{box-sizing:border-box}.freelancerkit-shell{margin:0 auto;padding:28px 18px 44px;display:grid;grid-template-columns:280px minmax(0,1fr);gap:18px}.freelancerkit-sidebar{position:sticky;top:24px;align-self:start;padding:24px;border-radius:30px;background:#0f172a;color:#f8fafc;display:grid;gap:18px}.freelancerkit-mark{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent)}.freelancerkit-name{font-size:clamp(2rem,4vw,3rem);line-height:.92;font-weight:800;margin:0}.freelancerkit-title{margin:0;color:var(--color-accent);font-size:1.2rem;font-weight:700}.freelancerkit-nav{display:grid;gap:10px}.freelancerkit-nav button{background:none;border:none;color:#f8fafc;text-align:left;font:inherit;cursor:pointer;opacity:.82;padding:0}.freelancerkit-nav button:hover{opacity:1;color:var(--color-accent)}.freelancerkit-contact-list{display:grid;gap:10px;font-size:.95rem}.freelancerkit-contact-list a,.freelancerkit-contact-list div{color:#e5edf8;text-decoration:none;overflow-wrap:anywhere}.freelancerkit-main{display:grid;gap:18px}.freelancerkit-hero,.freelancerkit-card{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:30px;padding:24px;box-shadow:0 18px 40px rgba(15,23,42,.06)}.freelancerkit-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);align-items:start}.freelancerkit-kicker{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:#6b7280}.freelancerkit-title-xl{font-size:clamp(2.6rem,6vw,5.4rem);line-height:.92;margin:.35rem 0 .55rem;font-weight:800;color:#0f172a;max-width:9ch}.freelancerkit-bio{margin:0;max-width:62ch;color:#334155;line-height:1.75;font-size:1.02rem}.freelancerkit-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.freelancerkit-btn{padding:12px 18px;border-radius:999px;border:none;font-weight:700;cursor:pointer;font:inherit}.freelancerkit-btn.primary{background:var(--color-accent);color:#062033}.freelancerkit-btn.secondary{background:#e2e8f0;color:#0f172a}.freelancerkit-proof{display:grid;gap:12px}.freelancerkit-proof-card{border-radius:22px;padding:18px;background:#f8fafc;border:1px solid rgba(15,23,42,.08)}.freelancerkit-proof-card h3{margin:0 0 8px;font-size:1.02rem;color:#0f172a}.freelancerkit-proof-card p{margin:0;color:#475569;line-height:1.7}.freelancerkit-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.freelancerkit-section-head h2{margin:0;font-size:.85rem;letter-spacing:.22em;text-transform:uppercase;color:#64748b}.freelancerkit-service-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}.freelancerkit-service{border-radius:22px;padding:18px;background:#f8fafc;border:1px solid rgba(15,23,42,.08);display:grid;gap:10px}.freelancerkit-service h3{margin:0;color:#0f172a}.freelancerkit-service-meta{font-size:.82rem;color:#64748b;text-transform:uppercase;letter-spacing:.12em}.freelancerkit-service p{margin:0;color:#475569;line-height:1.7}.freelancerkit-deliverables{display:flex;flex-wrap:wrap;gap:8px}.freelancerkit-deliverables span{padding:7px 10px;border-radius:999px;background:#eaf2ff;color:#1d4ed8;font-size:.78rem;font-weight:700}.freelancerkit-stack{display:grid}.freelancerkit-stack section{scroll-margin-top:96px}@media (max-width:1020px){.freelancerkit-shell{grid-template-columns:1fr}.freelancerkit-sidebar{position:static}.freelancerkit-hero,.freelancerkit-service-grid{grid-template-columns:1fr}}`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function FreelancerKitTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const style = injectThemeVars(portfolio?.themeData || {});
  const density = getDensityStyles(portfolio);
  const navMode = getTemplateOption(portfolio, "navMode", "auto");
  const navSections = navMode === "none" ? [] : getNavSections(portfolio, ["services", "projects", "experience", "testimonials", "contact"]);
  const contacts = getContactDetails(profile, sections.contact);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Professional portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "Use this page to explain what you do, show proof, and make it easy for the right client to reach out.");
  const primaryCta = getTemplateLabel(portfolio, "primaryCta", Array.isArray(sections.services) && sections.services.length ? "Explore Services" : "View Projects");
  const secondaryCta = getTemplateLabel(portfolio, "secondaryCta", "Contact");
  const primaryService = getPrimaryService(sections);
  const projectCount = Array.isArray(sections.projects) ? sections.projects.length : 0;
  const serviceCount = Array.isArray(sections.services) ? sections.services.length : 0;
  const width = getContentWidth(portfolio, 1220);

  const remainingSections = useMemo(() => {
    const next = { ...sections };
    delete next.services;
    return next;
  }, [sections]);

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
      l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="freelancerkit-root" style={style}>
      <div className="freelancerkit-shell" style={{ maxWidth: width }}>
        <aside className="freelancerkit-sidebar">
          <div className="freelancerkit-mark">Freelancer Kit</div>
          <div>
            <h1 className="freelancerkit-name">{profile.fullName || profile.displayName || "Your Name"}</h1>
            <p className="freelancerkit-title">{profile.professionalTitle || portfolio?.title || "Independent professional"}</p>
          </div>
          {navSections.length ? (
            <div className="freelancerkit-nav">
              {navSections.map((item) => (
                <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
              ))}
            </div>
          ) : null}
          {contacts.length ? (
            <div className="freelancerkit-contact-list">
              {contacts.map((item) => {
                const href = item.includes("@") ? `mailto:${item}` : item.startsWith("http") ? item : null;
                return href ? <a key={item} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item}</a> : <div key={item}>{item}</div>;
              })}
            </div>
          ) : null}
        </aside>

        <main className="freelancerkit-main" style={{ gap: density.sectionGap }}>
          <section className="freelancerkit-hero" style={{ gap: density.heroGap }}>
            <div>
              <div className="freelancerkit-kicker">{heroEyebrow}</div>
              <h2 className="freelancerkit-title-xl">{profile.fullName || profile.displayName || "Your Name"}</h2>
              <p className="freelancerkit-bio">{heroTagline}</p>
              <div className="freelancerkit-actions">
                <button className="freelancerkit-btn primary" type="button" onClick={() => scrollToSection(serviceCount ? "services" : projectCount ? "projects" : "contact")}>{primaryCta}</button>
                <button className="freelancerkit-btn secondary" type="button" onClick={() => scrollToSection("contact")}>{secondaryCta}</button>
              </div>
            </div>
            <div className="freelancerkit-proof">
              {serviceCount ? (
                <article className="freelancerkit-proof-card">
                  <h3>{serviceCount} service{serviceCount > 1 ? "s" : ""} available</h3>
                  <p>{primaryService?.description || "Show your offers, pricing model, and delivery style without filler text."}</p>
                </article>
              ) : null}
              {projectCount ? (
                <article className="freelancerkit-proof-card">
                  <h3>{projectCount} project{projectCount > 1 ? "s" : ""} ready to review</h3>
                  <p>{Array.isArray(sections.projects) && sections.projects[0]?.description ? sections.projects[0].description : "Use your best work to prove fit quickly."}</p>
                </article>
              ) : null}
              {Array.isArray(sections.testimonials) && sections.testimonials.length ? (
                <article className="freelancerkit-proof-card">
                  <h3>{sections.testimonials[0].clientName || "Client feedback"}</h3>
                  <p>{sections.testimonials[0].testimonialText || sections.testimonials[0].description}</p>
                </article>
              ) : null}
            </div>
          </section>

          {serviceCount ? (
            <section className="freelancerkit-card" id="services">
              <div className="freelancerkit-section-head">
                <h2>{getTemplateLabel(portfolio, "servicesTitle", getSectionTitle(portfolio, "services"))}</h2>
              </div>
              <div className="freelancerkit-service-grid">
                {sections.services.map((service, index) => (
                  <article className="freelancerkit-service" key={service.id || index}>
                    <h3>{service.serviceTitle || service.title || "Service"}</h3>
                    <div className="freelancerkit-service-meta">
                      {[service.serviceCategory, service.pricingModel, service.currency && service.basePrice ? `${service.currency} ${service.basePrice}` : null, service.duration].filter(Boolean).join(" · ")}
                    </div>
                    {service.description ? <p>{service.description}</p> : null}
                    {Array.isArray(service.deliverables) && service.deliverables.length ? (
                      <div className="freelancerkit-deliverables">
                        {service.deliverables.map((item, itemIndex) => <span key={`${item}-${itemIndex}`}>{item}</span>)}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="freelancerkit-stack">
            <UniversalSectionStack
              portfolio={{ ...portfolio, sections: remainingSections }}
              variant="soft"
              sectionGap={density.sectionGap}
              titleStyle={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}