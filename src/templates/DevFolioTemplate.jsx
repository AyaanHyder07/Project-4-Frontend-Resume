import React, { useEffect, useMemo, useRef, useState } from "react";
import { checkMotionPreference, getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getContactDetails, getContentWidth, getDensityStyles, getNavSections, getTemplateLabel } from "./shared/templateData";

const STYLE_ID = "devfolio-template-styles";
const FONT_ID = "devfolio-template-font";

const css = `
.devfolio-root{background:var(--color-bg);color:var(--color-text);font-family:var(--font-main),monospace;min-height:100vh;position:relative;overflow:hidden}.devfolio-root *{box-sizing:border-box}.devfolio-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,255,136,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.06) 1px,transparent 1px);background-size:60px 60px;animation:gridDrift 30s linear infinite;pointer-events:none}.devfolio-grain{position:absolute;inset:0;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E");pointer-events:none}.devfolio-shell{position:relative;margin:0 auto;padding:88px 24px 48px}.devfolio-nav{position:fixed;top:0;left:0;right:0;z-index:20;padding:16px 24px;transition:.25s ease;background:transparent}.devfolio-nav.scrolled{background:rgba(10,10,10,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,255,136,.16)}.devfolio-nav-inner{margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:18px}.devfolio-brand{color:var(--color-accent);font-weight:700;letter-spacing:.06em}.devfolio-links{display:flex;gap:18px;flex-wrap:wrap}.devfolio-links button,.devfolio-links a{background:none;border:none;color:var(--color-text);cursor:pointer;text-decoration:none;font:inherit;opacity:.8}.devfolio-links button:hover,.devfolio-links a:hover{opacity:1;color:var(--color-accent)}.devfolio-hero{min-height:calc(100vh - 88px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(300px,.95fr);align-items:center}.devfolio-kicker{opacity:.68;font-size:.85rem;text-transform:uppercase;letter-spacing:.16em}.devfolio-title{font-size:clamp(2.8rem,7vw,5.4rem);line-height:1.01;margin:.35rem 0 0;display:flex;align-items:center;gap:8px;color:var(--color-text);text-shadow:0 0 24px rgba(0,0,0,.38);max-width:10ch}.devfolio-cursor{display:inline-block;width:14px;height:1.2em;background:var(--color-accent);animation:blink 1s steps(1) infinite}.devfolio-type{margin-top:12px;font-size:1.1rem;color:var(--color-accent);min-height:28px}.devfolio-bio{max-width:62ch;margin-top:16px;opacity:.9;line-height:1.7;font-size:1.02rem}.devfolio-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}.devfolio-btn{padding:12px 18px;border-radius:10px;border:1px solid var(--color-accent);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font:inherit}.devfolio-btn.primary{background:var(--color-accent);color:#08110d}.devfolio-btn.secondary{color:var(--color-accent);background:transparent}.devfolio-badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.devfolio-badge{padding:8px 12px;border-radius:999px;border:1px solid rgba(0,255,136,.35);background:rgba(0,255,136,.08);color:var(--color-accent);font-size:.88rem}.devfolio-socials{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.devfolio-socials a{color:var(--color-text);text-decoration:none;border:1px solid rgba(255,255,255,.12);padding:10px 12px;border-radius:10px}.devfolio-terminal{position:relative;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;box-shadow:0 0 40px rgba(0,255,136,.12)}.devfolio-terminal::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.03),rgba(255,255,255,.03) 1px,transparent 2px,transparent 4px);pointer-events:none}.devfolio-terminal-top{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);color:#cbd5e1;font-size:.9rem}.devfolio-dot{width:10px;height:10px;border-radius:50%}.devfolio-terminal-body{aspect-ratio:4/4.2;display:grid;place-items:center;padding:20px}.devfolio-photo{width:100%;height:100%;object-fit:cover;border-radius:10px}.devfolio-initials{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(0,255,136,.12),rgba(255,255,255,.06));font-size:3rem;font-weight:700;color:var(--color-accent)}@keyframes blink{50%{opacity:0}}@keyframes gridDrift{from{transform:translate3d(0,0,0)}to{transform:translate3d(60px,60px,0)}}@media (max-width:767px){.devfolio-shell{padding:84px 18px 36px}.devfolio-links{display:none}.devfolio-hero{grid-template-columns:1fr}}@media (prefers-reduced-motion: reduce){.devfolio-grid,.devfolio-cursor{animation:none}}
`;

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DevFolioTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const themeData = portfolio?.themeData || {};
  const rootStyle = injectThemeVars(themeData);
  const initials = getInitials(profile.fullName || profile.displayName);
  const canAnimate = checkMotionPreference();
  const density = getDensityStyles(portfolio);
  const width = getContentWidth(portfolio, 1180);
  const navSections = getNavSections(portfolio, ["projects", "skills", "experience", "services", "contact", "custom-blocks"]);
  const contacts = getContactDetails(profile, portfolio?.sections?.contact);
  const heroEyebrow = getTemplateLabel(portfolio, "heroEyebrow", profile.professionalTitle || portfolio?.title || "Developer portfolio");
  const heroTagline = getTemplateLabel(portfolio, "heroTagline", profile.bio || "A developer portfolio that keeps the terminal energy but stays readable, compact, and data-driven.");
  const primaryCta = getTemplateLabel(portfolio, "primaryCta", navSections.find((item) => item.key === "projects") ? "View My Work" : "Explore Portfolio");
  const secondaryCta = getTemplateLabel(portfolio, "secondaryCta", "Contact");
  const phrases = useMemo(() => [profile.professionalTitle || profile.title || "Developer", portfolio?.openToWork ? "Open to Opportunities" : null, "Building useful systems"].filter(Boolean), [profile.professionalTitle, profile.title, portfolio?.openToWork]);
  const [typed, setTyped] = useState(phrases[0] || "Developer");
  const [navScrolled, setNavScrolled] = useState(false);
  const intervalRef = useRef(null);

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
      link.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!phrases.length || !canAnimate) {
      setTyped(phrases[0] || "Developer");
      return;
    }
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    intervalRef.current = window.setInterval(() => {
      const current = phrases[phraseIndex] || "";
      if (!deleting) {
        charIndex += 1;
        setTyped(current.slice(0, charIndex));
        if (charIndex >= current.length) deleting = true;
      } else {
        charIndex -= 1;
        setTyped(current.slice(0, Math.max(charIndex, 0)));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
    }, 110);
    return () => window.clearInterval(intervalRef.current);
  }, [canAnimate, phrases]);

  return (
    <div className="devfolio-root" style={rootStyle}>
      <div className="devfolio-grid" />
      <div className="devfolio-grain" />
      <nav className={`devfolio-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="devfolio-nav-inner" style={{ maxWidth: width }}>
          <div className="devfolio-brand">// {profile.fullName || profile.displayName || "Portfolio"}</div>
          <div className="devfolio-links">
            {navSections.map((item) => (
              <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
            ))}
            {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
          </div>
        </div>
      </nav>

      <div className="devfolio-shell" style={{ maxWidth: width }}>
        <section className="devfolio-hero" id="home" data-customize-region="section" data-region-key="hero" style={{ gap: density.heroGap }}>
          <div>
            <div className="devfolio-kicker">{heroEyebrow}</div>
            <h1 className="devfolio-title">{profile.fullName || profile.displayName || "Your Name"}<span className="devfolio-cursor" /></h1>
            <div className="devfolio-type">{typed}</div>
            <p className="devfolio-bio">{heroTagline}</p>
            <div className="devfolio-cta">
              <button type="button" className="devfolio-btn primary" onClick={() => scrollToSection(navSections.find((item) => item.key === 'projects') ? 'projects' : navSections[0]?.key || 'contact')}>{primaryCta}</button>
              <button type="button" className="devfolio-btn secondary" onClick={() => scrollToSection('contact')}>{secondaryCta}</button>
            </div>
            <div className="devfolio-badges">
              {portfolio?.openToWork ? <span className="devfolio-badge">Open to Work</span> : null}
              {profile.location ? <span className="devfolio-badge">{profile.location}</span> : null}
            </div>
            <div className="devfolio-socials">
              {contacts.slice(0, 3).map((item) => {
                const href = item.includes('@') ? `mailto:${item}` : item.startsWith('http') ? item : null;
                return href ? <a key={item} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{item.includes('@') ? 'Email' : item.startsWith('http') ? new URL(item).hostname.replace('www.', '') : item}</a> : null;
              })}
            </div>
          </div>

          <div className="devfolio-terminal">
            <div className="devfolio-terminal-top">
              <span className="devfolio-dot" style={{ background: "#ef4444" }} />
              <span className="devfolio-dot" style={{ background: "#f59e0b" }} />
              <span className="devfolio-dot" style={{ background: "#22c55e" }} />
              <span style={{ marginLeft: 8 }}>portfolio.exe</span>
            </div>
            <div className="devfolio-terminal-body">
              {resolveAssetUrl(profile.profilePhotoUrl) ? (
                <img className="devfolio-photo" src={resolveAssetUrl(profile.profilePhotoUrl)} alt={profile.fullName || "Profile"} />
              ) : (
                <div className="devfolio-initials">{initials}</div>
              )}
            </div>
          </div>
        </section>

        <UniversalSectionStack
          portfolio={portfolio}
          variant="panel"
          sectionGap={density.sectionGap}
          titleStyle={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}
        />
      </div>
    </div>
  );
}