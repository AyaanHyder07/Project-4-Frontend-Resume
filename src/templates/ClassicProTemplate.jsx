import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { formatDateRange, getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "classicpro-template-styles";
const css = `
.classicpro-root{background:var(--color-bg,#fff);color:var(--color-text,#111);font-family:var(--font-main),Inter,sans-serif;min-height:100vh}
.classicpro-root *{box-sizing:border-box}
.classicpro-shell{max-width:1180px;margin:0 auto;padding:84px 24px 40px}
.classicpro-header{position:fixed;top:0;left:0;right:0;background:#fff;border-bottom:1px solid rgba(15,23,42,.08);z-index:20}
.classicpro-header-inner{max-width:1180px;margin:0 auto;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.classicpro-header a{text-decoration:none;color:var(--color-accent)}
.classicpro-layout{display:grid;grid-template-columns:280px 1fr;gap:26px;align-items:start}
.classicpro-sidebar{position:sticky;top:92px;padding:20px;border:1px solid rgba(15,23,42,.08);border-radius:18px;background:#fff}
.classicpro-photo{width:84px;height:84px;border-radius:50%;object-fit:cover;border:4px solid rgba(15,23,42,.06)}
.classicpro-initials{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:rgba(15,23,42,.06);font-size:1.8rem;font-weight:700}
.classicpro-name{font-size:1.45rem;font-weight:800;margin-top:14px;color:#0f172a}
.classicpro-title{color:var(--color-accent);font-weight:700;margin-top:4px}
.classicpro-badge{display:inline-flex;padding:7px 10px;border-radius:999px;background:rgba(14,165,233,.08);color:var(--color-accent);font-size:.85rem;margin-top:12px}
.classicpro-divider{height:1px;background:rgba(15,23,42,.08);margin:18px 0}
.classicpro-list{display:grid;gap:8px;font-size:.94rem;color:#475569}
.classicpro-pillset{display:flex;flex-wrap:wrap;gap:8px}
.classicpro-pill{padding:6px 9px;border-radius:999px;background:#f8fafc;border:1px solid rgba(15,23,42,.08);font-size:.82rem}
.classicpro-main{display:grid;gap:24px}
.classicpro-section{padding:18px 0;border-bottom:1px solid rgba(15,23,42,.08)}
.classicpro-section:last-child{border-bottom:none}
.classicpro-section h2{margin:0 0 14px;font-size:1.05rem;letter-spacing:.08em;text-transform:uppercase;color:#475569}
.classicpro-row{display:grid;grid-template-columns:120px 1fr;gap:16px;padding:10px 0}
.classicpro-date{font-size:.84rem;color:#64748b}
.classicpro-role{font-size:1rem;font-weight:700}
.classicpro-company{color:var(--color-accent);font-weight:600;margin-top:3px}
.classicpro-contact-form{display:grid;gap:10px}
.classicpro-contact-form input,.classicpro-contact-form textarea{width:100%;padding:11px 12px;border-radius:12px;border:1px solid rgba(15,23,42,.08);background:#fff;color:#0f172a;font:inherit}
.classicpro-contact-form button{padding:12px 14px;border:none;border-radius:12px;background:var(--color-accent);color:#fff;font-weight:700;cursor:pointer}
@media (max-width: 767px){.classicpro-shell{padding:78px 16px 30px}.classicpro-layout{grid-template-columns:1fr}.classicpro-sidebar{position:static}.classicpro-row{grid-template-columns:1fr}}
`;

function renderRows(items, rowRenderer) {
  if (!Array.isArray(items) || !items.length) return null;
  return items.map(rowRenderer);
}

export default function ClassicProTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const theme = injectThemeVars(portfolio?.themeData || {});
  const avatar = resolveAssetUrl(profile.profilePhotoUrl);
  const initials = getInitials(profile.fullName || profile.displayName);

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
        <div className="classicpro-header-inner">
          <div>
            <strong>{profile.fullName || profile.displayName || "Portfolio"}</strong>
            <span style={{ color: "#64748b" }}> - {profile.professionalTitle || portfolio?.title || "Professional Portfolio"}</span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null}
            {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
          </div>
        </div>
      </header>
      <div className="classicpro-shell">
        <div className="classicpro-layout">
          <aside className="classicpro-sidebar">
            {avatar ? <img className="classicpro-photo" src={avatar} alt={profile.fullName || "Profile"} /> : <div className="classicpro-initials">{initials}</div>}
            <div className="classicpro-name">{profile.fullName || profile.displayName || "Your Name"}</div>
            <div className="classicpro-title">{profile.professionalTitle || portfolio?.title || "Professional"}</div>
            {portfolio?.openToWork ? <div className="classicpro-badge">Open to Work</div> : null}
            <div className="classicpro-divider" />
            <div className="classicpro-list">
              {profile.email ? <div>{profile.email}</div> : null}
              {profile.phone ? <div>{profile.phone}</div> : null}
              {profile.location ? <div>{profile.location}</div> : null}
              {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
              {profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a> : null}
            </div>
            {Array.isArray(sections.skills) && sections.skills.length ? <><div className="classicpro-divider" /><div className="classicpro-pillset">{sections.skills.map((skill, index) => <span className="classicpro-pill" key={skill.id || index}>{skill.skillName || skill.name}</span>)}</div></> : null}
            {Array.isArray(sections.certifications) && sections.certifications.length ? <><div className="classicpro-divider" /><div className="classicpro-list">{sections.certifications.map((item, index) => <div key={item.id || index}>{item.title}</div>)}</div></> : null}
            {Array.isArray(sections.services) && sections.services.length ? <><div className="classicpro-divider" /><div className="classicpro-list">{sections.services.map((item, index) => <div key={item.id || index}>{item.title || item.serviceTitle}</div>)}</div></> : null}
          </aside>
          <main className="classicpro-main">
            {Array.isArray(sections.experience) && sections.experience.length ? <section className="classicpro-section"><h2>Experience</h2>{renderRows(sections.experience, (item, index) => <div className="classicpro-row" key={item.id || index}><div className="classicpro-date">{formatDateRange(item.startDate || item.startYear, item.endDate || item.endYear, item.currentlyWorking)}</div><div><div className="classicpro-role">{item.roleTitle || item.title}</div><div className="classicpro-company">{item.organizationName || item.company}</div><div>{item.roleDescription || item.description}</div></div></div>)}</section> : null}
            {Array.isArray(sections.education) && sections.education.length ? <section className="classicpro-section"><h2>Education</h2>{renderRows(sections.education, (item, index) => <div className="classicpro-row" key={item.id || index}><div className="classicpro-date">{formatDateRange(item.startDate || item.startYear, item.endDate || item.endYear, false)}</div><div><div className="classicpro-role">{item.degree || item.title}</div><div className="classicpro-company">{item.institutionName || item.institution}</div></div></div>)}</section> : null}
            {Array.isArray(sections.projects) && sections.projects.length ? <section className="classicpro-section"><h2>Projects</h2>{renderRows(sections.projects, (item, index) => <div className="classicpro-row" key={item.id || index}><div className="classicpro-date">Project</div><div><div className="classicpro-role">{item.title}</div><div>{item.description || item.summary}</div>{item.projectUrl || item.liveUrl ? <a href={item.projectUrl || item.liveUrl} target="_blank" rel="noreferrer">View project</a> : null}</div></div>)}</section> : null}
            {Array.isArray(sections.publications) && sections.publications.length ? <section className="classicpro-section"><h2>Publications</h2>{renderRows(sections.publications, (item, index) => <div className="classicpro-row" key={item.id || index}><div className="classicpro-date">Publication</div><div><div className="classicpro-role">{item.title}</div><div>{item.publisher || item.publicationName}</div></div></div>)}</section> : null}
            {Array.isArray(sections.testimonials) && sections.testimonials.length ? <section className="classicpro-section"><h2>Testimonials</h2>{renderRows(sections.testimonials, (item, index) => <div className="classicpro-row" key={item.id || index}><div className="classicpro-date">Client</div><div><div className="classicpro-role">{item.clientName || "Testimonial"}</div><div>{item.testimonialText || item.description}</div></div></div>)}</section> : null}
            <section className="classicpro-section"><h2>Contact</h2><form className="classicpro-contact-form" onSubmit={handleSubmit}><input name="senderName" placeholder="Your name" required /><input name="senderEmail" type="email" placeholder="Your email" required /><input name="senderPhone" placeholder="Phone number" /><input name="subject" placeholder="Subject" required /><textarea name="message" rows="5" placeholder="Your message" required /><button type="submit">Send message</button></form></section>
          </main>
        </div>
      </div>
    </div>
  );
}

