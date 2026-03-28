import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";
import UniversalSectionStack from "./shared/UniversalSectionStack";
import { getContactDetails, getContentWidth, getDensityStyles, getNavSections } from "./shared/templateData";

const STYLE_ID = "classicpro-template-styles";
const css = `
.classicpro-root{background:var(--color-bg,#fff);color:var(--color-text,#111);font-family:var(--font-main),Inter,sans-serif;min-height:100vh}
.classicpro-root *{box-sizing:border-box}
.classicpro-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid rgba(15,23,42,.08)}
.classicpro-header-inner{margin:0 auto;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.classicpro-header-meta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.classicpro-header a,.classicpro-header button{background:none;border:none;padding:0;color:#334155;text-decoration:none;font:inherit;cursor:pointer}
.classicpro-header strong{color:#0f172a}
.classicpro-shell{margin:0 auto;padding:28px 24px 44px}
.classicpro-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;align-items:start}
.classicpro-sidebar{position:sticky;top:88px;padding:22px;border:1px solid rgba(15,23,42,.08);border-radius:24px;background:#fff;box-shadow:0 18px 40px rgba(15,23,42,.06)}
.classicpro-photo,.classicpro-initials{width:88px;height:88px;border-radius:50%}
.classicpro-photo{object-fit:cover;border:4px solid rgba(15,23,42,.06)}
.classicpro-initials{display:grid;place-items:center;background:rgba(15,23,42,.06);font-size:1.9rem;font-weight:800;color:#0f172a}
.classicpro-name{font-size:2rem;line-height:1.02;font-weight:800;margin-top:16px;color:#0f172a}
.classicpro-title{margin-top:8px;color:var(--color-accent);font-weight:700;font-size:1.04rem}
.classicpro-badge{display:inline-flex;padding:7px 11px;border-radius:999px;background:rgba(14,165,233,.08);color:var(--color-accent);font-size:.86rem;margin-top:14px}
.classicpro-bio{margin-top:14px;color:#475569;line-height:1.75}
.classicpro-divider{height:1px;background:rgba(15,23,42,.08);margin:18px 0}
.classicpro-list{display:grid;gap:10px;font-size:.95rem;color:#334155}
.classicpro-list a{color:inherit;text-decoration:none;word-break:break-word}
.classicpro-main{min-width:0}
.classicpro-section{padding:0}
.classicpro-side-title{margin:0 0 10px;font-size:.76rem;letter-spacing:.18em;text-transform:uppercase;color:#64748b}
.classicpro-nav{display:flex;gap:14px;flex-wrap:wrap}
.classicpro-nav button{background:none;border:none;padding:0;color:#64748b;font:inherit;cursor:pointer}
.classicpro-nav button:hover{color:var(--color-accent)}
@media (max-width:900px){.classicpro-layout{grid-template-columns:1fr}.classicpro-sidebar{position:static}.classicpro-header-inner,.classicpro-shell{padding-left:16px;padding-right:16px}}
`;

function scrollToSection(id) {
  const node = document.getElementById(id);
  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function ClassicProTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const theme = injectThemeVars(portfolio?.themeData || {});
  const avatar = resolveAssetUrl(profile.profilePhotoUrl);
  const initials = getInitials(profile.fullName || profile.displayName);
  const width = getContentWidth(portfolio, 1160);
  const density = getDensityStyles(portfolio);
  const navSections = getNavSections(portfolio);
  const contacts = getContactDetails(profile, portfolio?.sections?.contact);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
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
    <div className="classicpro-root" style={theme}>
      <header className="classicpro-header">
        <div className="classicpro-header-inner" style={{ maxWidth: width }}>
          <div>
            <strong>{profile.fullName || profile.displayName || "Portfolio"}</strong>
            <span style={{ color: "#64748b" }}> - {profile.professionalTitle || portfolio?.title || "Professional Portfolio"}</span>
          </div>
          <div className="classicpro-header-meta">
            <div className="classicpro-nav">
              {navSections.map((item) => (
                <button key={item.key} type="button" onClick={() => scrollToSection(item.key)}>{item.title}</button>
              ))}
            </div>
            {profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null}
          </div>
        </div>
      </header>

      <div className="classicpro-shell" style={{ maxWidth: width }}>
        <div className="classicpro-layout" style={{ gap: density.heroGap }}>
          <aside className="classicpro-sidebar" data-customize-region="section" data-region-key="identity">
            {avatar ? <img className="classicpro-photo" src={avatar} alt={profile.fullName || "Profile"} /> : <div className="classicpro-initials">{initials}</div>}
            <div className="classicpro-name">{profile.fullName || profile.displayName || "Your Name"}</div>
            <div className="classicpro-title">{profile.professionalTitle || portfolio?.title || "Professional"}</div>
            {portfolio?.openToWork ? <div className="classicpro-badge">Open to Work</div> : null}
            {profile.bio ? <p className="classicpro-bio">{profile.bio}</p> : null}

            {contacts.length ? <><div className="classicpro-divider" /><div className="classicpro-side-title">Contact</div><div className="classicpro-list">{contacts.map((item) => {
              const href = item.includes("@") ? `mailto:${item}` : item.startsWith("http") ? item : null;
              return href ? <a key={item} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item}</a> : <div key={item}>{item}</div>;
            })}</div></> : null}
          </aside>

          <main className="classicpro-main">
            <UniversalSectionStack
              portfolio={portfolio}
              variant="classic"
              sectionGap={density.sectionGap}
              titleStyle={{ fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}
              formRenderer={portfolio?.sections?.contact?.showContactForm ? ({ onSubmit }) => (
                <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                  <input name="senderName" placeholder="Your name" required style={fieldInput} />
                  <input name="senderEmail" type="email" placeholder="Your email" required style={fieldInput} />
                  <input name="senderPhone" placeholder="Phone number" style={fieldInput} />
                  <input name="subject" placeholder="Subject" required style={fieldInput} />
                  <textarea name="message" rows="5" placeholder="Your message" required style={{ ...fieldInput, resize: "vertical" }} />
                  <button type="submit" style={submitButton}>Send message</button>
                </form>
              ) : null}
              onContactSubmit={handleSubmit}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

const fieldInput = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,.08)",
  background: "#fff",
  color: "#0f172a",
  font: "inherit",
};

const submitButton = {
  padding: "12px 14px",
  border: "none",
  borderRadius: 12,
  background: "var(--color-accent)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
