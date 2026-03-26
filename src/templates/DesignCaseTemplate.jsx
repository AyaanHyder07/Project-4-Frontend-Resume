import React, { useEffect } from "react";
import { contactAPI } from "../api/api";
import { formatDateRange, getInitials, injectThemeVars, resolveAssetUrl } from "./utils/templateHelpers";

const STYLE_ID = "designcase-template-styles";
const FONT_ID = "designcase-template-font";

const css = `
.designcase-root{background:var(--color-bg);color:var(--color-text);min-height:100vh;font-family:var(--font-main),"DM Sans",sans-serif}
.designcase-root *{box-sizing:border-box}
.designcase-shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh}
.designcase-sidebar{position:sticky;top:0;height:100vh;padding:34px 28px;background:#171311;color:#fff8f1;display:grid;grid-template-rows:auto auto 1fr auto;border-right:1px solid rgba(255,255,255,.08)}
.designcase-mark{font-size:.78rem;letter-spacing:.28em;text-transform:uppercase;color:var(--color-accent)}
.designcase-avatar{width:86px;height:86px;border-radius:22px;background:rgba(255,255,255,.08);display:grid;place-items:center;overflow:hidden;margin-top:20px;font-size:2rem;font-weight:800}
.designcase-avatar img{width:100%;height:100%;object-fit:cover}
.designcase-name{font-size:2rem;line-height:.92;margin-top:18px;font-weight:800}
.designcase-title{margin-top:10px;color:var(--color-accent);text-transform:uppercase;letter-spacing:.2em;font-size:.78rem}
.designcase-nav{display:grid;gap:10px;align-content:start;margin-top:30px}
.designcase-nav button,.designcase-nav a{background:none;border:none;text-align:left;color:#fff8f1;text-decoration:none;font:inherit;font-size:.96rem;opacity:.78;cursor:pointer;padding:0}
.designcase-nav button:hover,.designcase-nav a:hover{opacity:1;color:var(--color-accent)}
.designcase-side-foot{display:grid;gap:10px;font-size:.9rem}
.designcase-side-foot a{color:#fff8f1;text-decoration:none}
.designcase-main{padding:36px 40px 56px;background:linear-gradient(180deg,#f7f0e5 0%,#f4ede3 100%)}
.designcase-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:26px;align-items:end;padding-bottom:36px;border-bottom:1px solid rgba(22,17,15,.08)}
.designcase-kicker{font-size:.8rem;letter-spacing:.26em;text-transform:uppercase;color:#7c6a60}
.designcase-headline{font-size:clamp(3rem,7vw,6.4rem);line-height:.88;letter-spacing:-.05em;margin:.4rem 0 0;font-weight:800;color:#16110f}
.designcase-bio{max-width:560px;font-size:1.05rem;line-height:1.8;color:#4d433d}
.designcase-highlight{background:#fffaf3;border:1px solid rgba(22,17,15,.08);border-radius:28px;padding:22px;box-shadow:0 18px 50px rgba(22,17,15,.08)}
.designcase-highlight-label{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--color-accent)}
.designcase-highlight h3{font-size:1.65rem;margin:.8rem 0 .5rem}
.designcase-grid{display:grid;gap:22px;margin-top:34px}
.designcase-section{display:grid;gap:16px}
.designcase-section-head{display:flex;justify-content:space-between;align-items:end;gap:16px}
.designcase-section-head h2{font-size:1.05rem;letter-spacing:.2em;text-transform:uppercase;margin:0;color:#7c6a60}
.designcase-project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.designcase-card{background:#fffaf3;border:1px solid rgba(22,17,15,.08);border-radius:24px;padding:22px;box-shadow:0 18px 40px rgba(22,17,15,.06)}
.designcase-card-visual{height:220px;border-radius:18px;background:linear-gradient(135deg,rgba(255,90,54,.16),rgba(255,255,255,.72));border:1px solid rgba(255,90,54,.18);margin-bottom:18px}
.designcase-card h3{margin:0;font-size:1.4rem}
.designcase-card p{color:#564d48;line-height:1.7}
.designcase-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.designcase-tags span{padding:8px 10px;border-radius:999px;background:rgba(255,90,54,.1);color:#7d3728;font-size:.8rem;font-weight:700}
.designcase-link{display:inline-flex;margin-top:18px;color:#16110f;text-decoration:none;font-weight:700;border-bottom:1px solid rgba(22,17,15,.2)}
.designcase-story{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.designcase-panel{background:#fffaf3;border:1px solid rgba(22,17,15,.08);border-radius:24px;padding:20px}
.designcase-panel h3{margin:0 0 12px;font-size:1.1rem}
.designcase-timeline{display:grid;gap:14px}
.designcase-timeline-item{padding-bottom:14px;border-bottom:1px solid rgba(22,17,15,.08)}
.designcase-timeline-item:last-child{padding-bottom:0;border-bottom:none}
.designcase-range{font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:#8b7c72}
.designcase-contact{margin-top:10px;background:#171311;color:#fff8f1;border-radius:32px;padding:28px}
.designcase-contact p{color:rgba(255,248,241,.72)}
.designcase-contact form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}
.designcase-contact input,.designcase-contact textarea{width:100%;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff8f1;font:inherit}
.designcase-contact textarea{grid-column:1/-1}
.designcase-contact button{justify-self:start;padding:12px 16px;border:none;border-radius:999px;background:var(--color-accent);color:#fff8f1;font-weight:800;cursor:pointer}
@media (max-width: 980px){.designcase-shell{grid-template-columns:1fr}.designcase-sidebar{position:static;height:auto;grid-template-rows:auto}.designcase-main{padding:24px 18px 42px}.designcase-hero,.designcase-project-grid,.designcase-story,.designcase-contact form{grid-template-columns:1fr}}
`;

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
    <div className="designcase-root" style={rootStyle}>
      <div className="designcase-shell">
        <aside className="designcase-sidebar">
          <div>
            <div className="designcase-mark">Design Case</div>
            <div className="designcase-avatar">
              {avatar ? <img src={avatar} alt={profile.fullName || "Profile"} /> : initials}
            </div>
            <div className="designcase-name">{profile.fullName || profile.displayName || "Creative Name"}</div>
            <div className="designcase-title">{profile.professionalTitle || portfolio?.title || "Designer"}</div>
          </div>
          <nav className="designcase-nav">
            <button type="button" onClick={() => scrollToSection("projects")}>Selected Work</button>
            <button type="button" onClick={() => scrollToSection("story")}>Approach</button>
            <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
            {profile.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website</a> : null}
          </nav>
          <div />
          <div className="designcase-side-foot">
            {profile.email ? <a href={`mailto:${profile.email}`}>{profile.email}</a> : null}
            {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
            {profile.location ? <div>{profile.location}</div> : null}
          </div>
        </aside>

        <main className="designcase-main">
          <section className="designcase-hero">
            <div>
              <div className="designcase-kicker">Editorial portfolio</div>
              <h1 className="designcase-headline">{profile.fullName || profile.displayName || "Your Name"}</h1>
              <p className="designcase-bio">{profile.bio || "A premium case-study portfolio focused on art direction, structure, and sharper client-facing storytelling."}</p>
            </div>
            <div className="designcase-highlight">
              <div className="designcase-highlight-label">Positioning</div>
              <h3>{profile.professionalTitle || "Brand & Product Designer"}</h3>
              <p>{portfolio?.title || "Case studies, systems, and launch-ready visual work packaged in an editorial experience."}</p>
            </div>
          </section>

          <div className="designcase-grid">
            {Array.isArray(sections.projects) && sections.projects.length ? (
              <section className="designcase-section" id="projects">
                <div className="designcase-section-head">
                  <h2>Selected Work</h2>
                </div>
                <div className="designcase-project-grid">
                  {sections.projects.map((project, index) => (
                    <article className="designcase-card" key={project.id || index}>
                      <div className="designcase-card-visual" />
                      <h3>{project.title || "Case Study"}</h3>
                      <p>{project.description || project.summary || "Project summary coming soon."}</p>
                      <div className="designcase-tags">
                        {Array.isArray(project.techStack) ? project.techStack.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>{tag}</span>) : null}
                      </div>
                      {project.projectUrl || project.liveUrl ? <a className="designcase-link" href={project.projectUrl || project.liveUrl} target="_blank" rel="noreferrer">Open case study</a> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="designcase-section" id="story">
              <div className="designcase-section-head">
                <h2>Process & Proof</h2>
              </div>
              <div className="designcase-story">
                <div className="designcase-panel">
                  <h3>How I work</h3>
                  <p>{profile.bio || "I translate complex product and brand problems into clear visual systems with strong narrative structure and premium detail."}</p>
                  {Array.isArray(sections.testimonials) && sections.testimonials.length ? (
                    <div style={{ marginTop: 16 }}>
                      <div className="designcase-range">Testimonial</div>
                      <p style={{ marginBottom: 0 }}>{sections.testimonials[0].testimonialText || sections.testimonials[0].description}</p>
                    </div>
                  ) : null}
                </div>
                <div className="designcase-panel">
                  <h3>Experience</h3>
                  <div className="designcase-timeline">
                    {(sections.experience || []).map((item, index) => (
                      <div className="designcase-timeline-item" key={item.id || index}>
                        <div className="designcase-range">{formatDateRange(item.startDate || item.startYear, item.endDate || item.endYear, item.currentlyWorking)}</div>
                        <strong>{item.roleTitle || item.title}</strong>
                        <div>{item.organizationName || item.company}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="designcase-contact" id="contact">
              <div className="designcase-section-head" style={{ marginBottom: 14 }}>
                <h2 style={{ color: "rgba(255,248,241,.72)" }}>Start a project</h2>
              </div>
              <h3 style={{ fontSize: "2rem", margin: 0 }}>Let&apos;s build something refined and memorable.</h3>
              <p>{profile.email || "Tell me about your brand, launch, or product direction."}</p>
              <form onSubmit={handleSubmit}>
                <input name="senderName" placeholder="Your name" required />
                <input name="senderEmail" type="email" placeholder="Your email" required />
                <input name="senderPhone" placeholder="Phone number" />
                <input name="subject" placeholder="Subject" required />
                <textarea name="message" rows="5" placeholder="Project details" required />
                <button type="submit">Send inquiry</button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

