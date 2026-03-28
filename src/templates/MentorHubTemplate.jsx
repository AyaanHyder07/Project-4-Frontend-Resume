import React, { useEffect, useMemo } from "react";
import { injectThemeVars } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import {
  getContactDetails,
  getContentWidth,
  getDensityStyles,
  getNavSections,
  getPrimaryService,
  getSectionTitle,
  getTemplateLabel,
  getTemplateOption,
} from "./shared/templateData";

const STYLE_ID = "mentorhub-template-styles";
const FONT_ID = "mentorhub-template-font";
const css = `
.mentorhub-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),Inter,sans-serif;overflow:hidden}.mentorhub-root *{box-sizing:border-box}.mentorhub-shell{margin:0 auto;padding:28px 18px 48px;position:relative}.mentorhub-orb{position:absolute;border-radius:50%;filter:blur(18px);opacity:.38}.mentorhub-nav{position:sticky;top:18px;z-index:20;display:flex;justify-content:center;margin-bottom:18px}.mentorhub-pill{display:flex;gap:14px;align-items:center;padding:12px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(14px)}.mentorhub-pill button{background:none;border:none;color:var(--color-text);font:inherit;cursor:pointer;opacity:.86}.mentorhub-pill button:hover{opacity:1;color:var(--color-accent)}.mentorhub-grid{display:grid;gap:20px}.mentorhub-hero{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);gap:22px;align-items:start}.mentorhub-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:30px;padding:24px;box-shadow:0 24px 70px rgba(10,10,30,.18)}.mentorhub-kicker{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent)}.mentorhub-title{font-size:clamp(2.8rem,6vw,5.2rem);line-height:.92;margin:.45rem 0 .55rem;font-weight:800;color:#fff7ff}.mentorhub-role{margin:0;color:#f6efff;font-size:1.18rem;font-weight:700}.mentorhub-bio{margin:0;max-width:58ch;line-height:1.8;color:rgba(245,241,255,.82)}.mentorhub-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.mentorhub-btn{padding:12px 18px;border-radius:999px;border:none;text-decoration:none;font-weight:700;cursor:pointer;font:inherit}.mentorhub-btn.primary{background:var(--color-accent);color:#110f25}.mentorhub-btn.secondary{background:rgba(255,255,255,.1);color:var(--color-text);border:1px solid rgba(255,255,255,.14)}.mentorhub-side{display:grid;gap:14px}.mentorhub-mini{padding:18px;border-radius:22px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}.mentorhub-mini h3{margin:0 0 8px;font-size:1.02rem;color:#fff}.mentorhub-mini p{margin:0;color:rgba(245,241,255,.78);line-height:1.7}.mentorhub-contact-list{display:grid;gap:8px;margin-top:16px}.mentorhub-contact-list a,.mentorhub-contact-list div{color:#f5f1ff;text-decoration:none;overflow-wrap:anywhere}.mentorhub-stack section{scroll-margin-top:96px}@media (max-width:980px){.mentorhub-hero{grid-template-columns:1fr}.mentorhub-nav{position:static}}`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MentorHubTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const rootStyle = injectThemeVars(portfolio?.themeData || {});
  const density = getDensityStyles(portfolio);
  const navMode = getTemplateOption(portfolio, "navMode", "auto");
  const navSections = navMode === "none" ? [] : getNavSections(portfolio, ["services", "experience", "testimonials", "contact"]);
  const contacts = getContactDetails(profile, sections.contact);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Premium portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "Use a calm, high-trust hero with real services, testimonials, and contact options instead of fake promo copy.");
  const primaryCta = getTemplateLabel(portfolio, "primaryCta", Array.isArray(sections.services) && sections.services.length ? "Explore Services" : "Contact");
  const secondaryCta = getTemplateLabel(portfolio, "secondaryCta", "Get in Touch");
  const primaryService = getPrimaryService(sections);
  const width = getContentWidth(portfolio, 1200);

  const leadingCards = useMemo(() => {
    const cards = [];
    if (primaryService) {
      cards.push({
        title: primaryService.serviceTitle || primaryService.title || "Service",
        body: primaryService.description || [primaryService.serviceCategory, primaryService.pricingModel, primaryService.duration].filter(Boolean).join(" · "),
      });
    }
    if (Array.isArray(sections.testimonials) && sections.testimonials.length) {
      const testimonial = sections.testimonials[0];
      cards.push({
        title: testimonial.clientName || "Client feedback",
        body: testimonial.testimonialText || testimonial.description || "Add testimonials to build trust quickly.",
      });
    }
    if (Array.isArray(sections.experience) && sections.experience.length) {
      const item = sections.experience[0];
      cards.push({
        title: item.roleTitle || item.title || "Experience",
        body: item.organizationName || item.company || item.roleDescription || item.description || "Show relevant experience here.",
      });
    }
    return cards;
  }, [primaryService, sections]);

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
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="mentorhub-root" style={rootStyle}>
      <div className="mentorhub-shell" style={{ maxWidth: width }}>
        <div className="mentorhub-orb" style={{ width: 320, height: 320, top: -80, right: -60, background: "radial-gradient(circle, rgba(168,85,247,0.44), transparent 70%)" }} />
        <div className="mentorhub-orb" style={{ width: 240, height: 240, bottom: 120, left: -40, background: "radial-gradient(circle, rgba(59,130,246,0.22), transparent 70%)" }} />

        {navSections.length ? (
          <div className="mentorhub-nav">
            <div className="mentorhub-pill">
              {navSections.map((item) => (
                <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mentorhub-grid" style={{ gap: density.sectionGap }}>
          <section className="mentorhub-hero" style={{ gap: density.heroGap }}>
            <div className="mentorhub-card">
              <div className="mentorhub-kicker">{heroEyebrow}</div>
              <h1 className="mentorhub-title">{profile.fullName || profile.displayName || "Your Name"}</h1>
              <p className="mentorhub-role">{profile.professionalTitle || portfolio?.title || "Professional"}</p>
              <p className="mentorhub-bio">{heroTagline}</p>
              <div className="mentorhub-actions">
                <button type="button" className="mentorhub-btn primary" onClick={() => scrollToSection(primaryService ? "services" : "contact")}>{primaryCta}</button>
                <button type="button" className="mentorhub-btn secondary" onClick={() => scrollToSection("contact")}>{secondaryCta}</button>
              </div>
              {contacts.length ? (
                <div className="mentorhub-contact-list">
                  {contacts.map((item) => {
                    const href = item.includes("@") ? `mailto:${item}` : item.startsWith("http") ? item : null;
                    return href ? <a key={item} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item}</a> : <div key={item}>{item}</div>;
                  })}
                </div>
              ) : null}
            </div>

            <div className="mentorhub-side">
              {leadingCards.map((card, index) => (
                <article className="mentorhub-mini" key={`${card.title}-${index}`}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mentorhub-stack">
            <UniversalSectionStack
              portfolio={portfolio}
              variant="dark"
              sectionGap={density.sectionGap}
              titleStyle={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,241,255,.66)", fontWeight: 700 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}