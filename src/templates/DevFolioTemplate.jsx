import React, { useEffect, useMemo, useRef, useState } from "react";
import { contactAPI } from "../api/api";
import { checkMotionPreference, formatDateRange, getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "devfolio-template-styles";
const FONT_ID = "devfolio-template-font";

const css = `
.devfolio-root{background:var(--color-bg);color:var(--color-text);font-family:var(--font-main),monospace;min-height:100vh;position:relative;overflow:hidden}
.devfolio-root *{box-sizing:border-box}
.devfolio-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,255,136,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.06) 1px,transparent 1px);background-size:60px 60px;animation:gridDrift 30s linear infinite;pointer-events:none}
.devfolio-grain{position:absolute;inset:0;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E");pointer-events:none}
.devfolio-shell{position:relative;max-width:1180px;margin:0 auto;padding:88px 24px 48px}
.devfolio-nav{position:fixed;top:0;left:0;right:0;z-index:20;padding:16px 24px;transition:.25s ease;background:transparent}
.devfolio-nav.scrolled{background:rgba(10,10,10,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,255,136,.16)}
.devfolio-nav-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:18px}
.devfolio-brand{color:var(--color-accent);font-weight:700;letter-spacing:.06em}
.devfolio-links{display:flex;gap:18px;flex-wrap:wrap}
.devfolio-links button,.devfolio-links a{background:none;border:none;color:var(--color-text);cursor:pointer;text-decoration:none;font:inherit;opacity:.8}
.devfolio-links button.active{color:var(--color-accent);opacity:1}
.devfolio-hero{min-height:100vh;display:grid;grid-template-columns:1.1fr .9fr;gap:32px;align-items:center}
.devfolio-kicker{opacity:.65;font-size:.85rem;text-transform:uppercase;letter-spacing:.16em}
.devfolio-title{font-size:clamp(2.6rem,7vw,5.4rem);line-height:1.02;margin:.35rem 0 0;display:flex;align-items:center;gap:8px}
.devfolio-cursor{display:inline-block;width:14px;height:1.2em;background:var(--color-accent);animation:blink 1s steps(1) infinite}
.devfolio-type{margin-top:10px;font-size:1.05rem;color:var(--color-accent);min-height:28px}
.devfolio-bio{max-width:620px;margin-top:16px;opacity:.86;line-height:1.7}
.devfolio-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.devfolio-btn{padding:12px 18px;border-radius:10px;border:1px solid var(--color-accent);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.devfolio-btn.primary{background:var(--color-accent);color:#08110d}
.devfolio-btn.secondary{color:var(--color-accent);background:transparent}
.devfolio-badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.devfolio-badge{padding:8px 12px;border-radius:999px;border:1px solid rgba(0,255,136,.35);background:rgba(0,255,136,.08);color:var(--color-accent);font-size:.88rem}
.devfolio-socials{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}
.devfolio-socials a{color:var(--color-text);text-decoration:none;border:1px solid rgba(255,255,255,.12);padding:10px 12px;border-radius:10px}
.devfolio-terminal{position:relative;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;box-shadow:0 0 40px rgba(0,255,136,.12)}
.devfolio-terminal::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.03),rgba(255,255,255,.03) 1px,transparent 2px,transparent 4px);pointer-events:none}
.devfolio-terminal-top{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);color:#cbd5e1;font-size:.9rem}
.devfolio-dot{width:10px;height:10px;border-radius:50%}
.devfolio-terminal-body{aspect-ratio:4/4.4;display:grid;place-items:center;padding:20px}
.devfolio-photo{width:100%;height:100%;object-fit:cover;border-radius:10px}
.devfolio-initials{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(0,255,136,.12),rgba(255,255,255,.06));font-size:3rem;font-weight:700;color:var(--color-accent)}
.devfolio-section{padding:52px 0}
.devfolio-header{color:var(--color-accent);font-size:.82rem;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px}
.devfolio-skills{display:flex;flex-wrap:wrap;gap:10px}
.devfolio-pill{padding:8px 12px;border-radius:6px;border:1px solid rgba(0,255,136,.28);background:rgba(0,255,136,.08)}
.devfolio-timeline{display:grid;gap:16px;position:relative;padding-left:20px}
.devfolio-timeline::before{content:"";position:absolute;left:4px;top:6px;bottom:6px;width:1px;background:rgba(255,255,255,.14)}
.devfolio-item{position:relative;padding-left:16px}
.devfolio-item::before{content:"";position:absolute;left:-1px;top:9px;width:10px;height:10px;border-radius:50%;background:var(--color-accent);box-shadow:0 0 0 4px rgba(0,255,136,.12)}
.devfolio-role{font-size:1.08rem;font-weight:700}
.devfolio-company{color:var(--color-accent);margin-top:4px}
.devfolio-range{font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6;margin-top:6px}
.devfolio-projects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.devfolio-card{background:#111;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:18px;transition:.22s ease}
.devfolio-card:hover{transform:translateY(-4px);border-color:rgba(0,255,136,.3);box-shadow:0 18px 34px rgba(0,255,136,.08)}
.devfolio-card h3{margin:0 0 8px;font-size:1.08rem}
.devfolio-stack{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.devfolio-stack span{padding:6px 9px;border-radius:5px;background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.2);font-size:.82rem}
.devfolio-contact{max-width:640px;margin:0 auto;text-align:center}
.devfolio-contact form{display:grid;gap:12px;margin-top:22px}
.devfolio-contact input,.devfolio-contact textarea{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0f1312;color:var(--color-text);font:inherit}
.devfolio-contact button{padding:12px 18px;border-radius:10px;border:none;background:var(--color-accent);color:#08110d;font-weight:700;cursor:pointer}
@keyframes blink{50%{opacity:0}}
@keyframes gridDrift{from{transform:translate3d(0,0,0)}to{transform:translate3d(60px,60px,0)}}
@media (max-width: 767px){.devfolio-shell{padding:84px 18px 36px}.devfolio-links{display:none}.devfolio-hero{grid-template-columns:1fr}.devfolio-projects{grid-template-columns:1fr}}
@media (prefers-reduced-motion: reduce){.devfolio-grid,.devfolio-cursor,.devfolio-card{animation:none;transition:none}}
`;

function SectionList({ title, items, renderItem }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <section className="devfolio-section" id={title.toLowerCase()}>
      <div className="devfolio-header">// {title.toLowerCase()}</div>
      {items.map(renderItem)}
    </section>
  );
}

export default function DevFolioTemplate({ portfolio }) {
  const profile = portfolio?.profile || {};
  const sections = portfolio?.sections || {};
  const themeData = portfolio?.themeData || {};
  const rootStyle = injectThemeVars(themeData);
  const initials = getInitials(profile.fullName || profile.displayName);
  const canAnimate = checkMotionPreference();
  const phrases = useMemo(() => [profile.professionalTitle || profile.title || "Developer", "Problem Solver", "Open to Opportunities"].filter(Boolean), [profile.professionalTitle, profile.title]);
  const [typed, setTyped] = useState(phrases[0] || "Developer");
  const [navScrolled, setNavScrolled] = useState(false);
  const [contactState, setContactState] = useState({ sending: false, error: "", success: "" });
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
    const onScroll = () => setNavScrolled(window.scrollY > 50);
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

  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitContact = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setContactState({ sending: true, error: "", success: "" });
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
      setContactState({ sending: false, error: "", success: "Message sent successfully." });
    } catch (error) {
      setContactState({ sending: false, error: error?.response?.data?.message || error?.message || "Could not send message.", success: "" });
    }
  };

  return (
    <div className="devfolio-root" style={rootStyle}>
      <div className="devfolio-grid" />
      <div className="devfolio-grain" />
      <nav className={`devfolio-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="devfolio-nav-inner">
          <div className="devfolio-brand">// {profile.fullName || profile.displayName || "Portfolio"}</div>
          <div className="devfolio-links">
            <button type="button" onClick={() => scrollTo("projects")}>Work</button>
            <button type="button" onClick={() => scrollTo("skills")}>Skills</button>
            <button type="button" onClick={() => scrollTo("contact")}>Contact</button>
            {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
          </div>
        </div>
      </nav>
      <div className="devfolio-shell">
        <section className="devfolio-hero" id="home">
          <div>
            <div className="devfolio-kicker">Hello, I&apos;m</div>
            <h1 className="devfolio-title">{profile.fullName || profile.displayName || "Your Name"}<span className="devfolio-cursor" /></h1>
            <div className="devfolio-type">{typed}</div>
            <p className="devfolio-bio">{profile.bio || portfolio?.title || "A modern portfolio powered by a template-driven system."}</p>
            <div className="devfolio-cta">
              <button type="button" className="devfolio-btn primary" onClick={() => scrollTo("projects")}>View My Work</button>
              <button type="button" className="devfolio-btn secondary" onClick={() => scrollTo("contact")}>Let&apos;s Talk</button>
            </div>
            <div className="devfolio-badges">
              {portfolio?.openToWork ? <span className="devfolio-badge">Open to Work</span> : null}
              {profile.location ? <span className="devfolio-badge">{profile.location}</span> : null}
            </div>
            <div className="devfolio-socials">
              {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
              {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
              {profile.twitterUrl ? <a href={profile.twitterUrl} target="_blank" rel="noreferrer">Twitter</a> : null}
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

        <section className="devfolio-section" id="skills">
          <div className="devfolio-header">// skills</div>
          <div className="devfolio-skills">
            {(sections.skills || []).map((skill, index) => (
              <span key={skill.id || `${skill.skillName || skill.name}-${index}`} className="devfolio-pill">{skill.skillName || skill.name}</span>
            ))}
          </div>
        </section>

        <SectionList
          title="Experience"
          items={sections.experience}
          renderItem={(item, index) => (
            <div className="devfolio-item" key={item.id || index}>
              <div className="devfolio-role">{item.roleTitle || item.title}</div>
              <div className="devfolio-company">{item.organizationName || item.company}</div>
              <div className="devfolio-range">{formatDateRange(item.startDate || item.startYear, item.endDate || item.endYear, item.currentlyWorking)}</div>
              <p>{item.roleDescription || item.description}</p>
            </div>
          )}
        />

        <section className="devfolio-section" id="projects">
          <div className="devfolio-header">// projects</div>
          <div className="devfolio-projects">
            {(sections.projects || []).map((project, index) => (
              <article className="devfolio-card" key={project.id || index}>
                <h3>{project.title || "Project"}</h3>
                <p>{project.description || project.summary || "Project summary coming soon."}</p>
                <div className="devfolio-stack">
                  {Array.isArray(project.techStack) ? project.techStack.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>{tag}</span>) : null}
                </div>
                {project.projectUrl || project.liveUrl ? <a className="devfolio-btn secondary" style={{ marginTop: 16 }} href={project.projectUrl || project.liveUrl} target="_blank" rel="noreferrer">View Project</a> : null}
              </article>
            ))}
          </div>
        </section>

        <SectionList
          title="Education"
          items={sections.education}
          renderItem={(item, index) => (
            <div className="devfolio-item" key={item.id || index}>
              <div className="devfolio-role">{item.degree || item.title}</div>
              <div className="devfolio-company">{item.institutionName || item.institution}</div>
              <div className="devfolio-range">{formatDateRange(item.startDate || item.startYear, item.endDate || item.endYear, false)}</div>
            </div>
          )}
        />

        <SectionList
          title="Certifications"
          items={sections.certifications}
          renderItem={(item, index) => (
            <div className="devfolio-item" key={item.id || index}>
              <div className="devfolio-role">{item.title}</div>
              <p>{item.issuer || item.certificateUrl || "Certification"}</p>
            </div>
          )}
        />

        <section className="devfolio-section" id="contact">
          <div className="devfolio-header">// contact</div>
          <div className="devfolio-contact">
            <h2>{profile.email || "Let&apos;s build something together."}</h2>
            <p>{profile.phone || profile.linkedinUrl || "Send a note and I&apos;ll get back to you soon."}</p>
            <form onSubmit={submitContact}>
              <input name="senderName" placeholder="Your name" required />
              <input name="senderEmail" type="email" placeholder="Your email" required />
              <input name="senderPhone" placeholder="Phone number" />
              <input name="subject" placeholder="Subject" required />
              <textarea name="message" rows="5" placeholder="Tell me about your project" required />
              {contactState.error ? <div>{contactState.error}</div> : null}
              {contactState.success ? <div>{contactState.success}</div> : null}
              <button type="submit" disabled={contactState.sending}>{contactState.sending ? "Sending..." : "Send Message"}</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
