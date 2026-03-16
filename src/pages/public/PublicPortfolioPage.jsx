import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicAPI, contactAPI } from "../../api/api";
import { profileAPI } from "../users/editorAPI";

const PublicPortfolioPage = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [contactForm, setContactForm] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    message: "",
  });
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    publicAPI
      .getPortfolio(slug)
      .then((res) => {
        const data = res.data;
        setPortfolio(data);
        if (data?.resumeId) {
          profileAPI
            .getPublic(data.resumeId)
            .then((r) => setProfile(r))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading portfolio...</div>;
  if (notFound)
    return <div style={{ padding: "2rem" }}>Portfolio not found.</div>;
  if (!portfolio) return null;

  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? `http://127.0.0.1:8081${url}` : `http://127.0.0.1:8081/${url}`;
  };

  const { theme, layout, sections, title, professionType } = portfolio;
  const _tc = theme?.themeConfig || {};
  
  // Destructure new advanced theme configuration
  const cp = _tc.colorPalette || {};
  const bg = _tc.background || {};
  const ty = _tc.typography || {};
  const ef = _tc.effects || {};

  const p = cp.primary || "#1C1C1C", acc = cp.accent || "#4A6FA5", sec = cp.secondary || "#8A8578";
  const bgCol = cp.pageBackground || "#F5F3EE", sur = cp.surfaceBackground || "#EDEBE6";
  const tx = cp.textPrimary || "#1C1C1C", ts = cp.textSecondary || "#5A5550";
  const br = ef.cardBorderRadius || "8px";

  const ff = ty.headingFont || "'Cormorant Garamond',Georgia,serif";
  const bf = ty.bodyFont || "'DM Sans',sans-serif";

  // Re-map for the generic Section component usages
  const tc = {
    primaryColor: p,
    accentColor: acc,
    backgroundColor: sur,
    textColor: tx,
    fontFamily: bf,
    borderRadius: br,
    ..._tc
  };

  const lc = (() => {
    try {
      const raw = layout?.layoutConfigJson;
      if (!raw) return {};
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  })();

  const layoutType = layout?.layoutType || "SINGLE_COLUMN";

  let bgCSS = {};
  if (bg.type === "SOLID") bgCSS = { background: bg.solidColor || bgCol };
  else if (bg.type === "GRADIENT" && bg.gradient) {
    const stops = (bg.gradient.stops || []).map((s) => `${s.color} ${s.position}%`).join(",");
    const g =
      bg.gradient.gradientType === "RADIAL"
        ? `radial-gradient(circle,${stops})`
        : bg.gradient.gradientType === "CONIC"
          ? `conic-gradient(${stops})`
          : `linear-gradient(${bg.gradient.angle || "135"}deg,${stops})`;
    bgCSS = { background: g };
  } else if (bg.type === "IMAGE" && bg.imageUrl) {
    bgCSS = {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundBlendMode: bg.imageBlendMode || "normal",
    };
  } else bgCSS = { background: bgCol };

  const headSt = {
    fontFamily: ff,
    fontWeight: ty.headingWeight || 700,
    fontStyle: ty.headingStyle || "normal",
    letterSpacing: (ty.headingLetterSpacing || 0) + "em",
    textTransform: ty.headingTransform || "none",
    lineHeight: ty.headingLineHeight || 1.1,
    transition: "all 0.3s",
  };

  const bodySt = {
    fontFamily: bf,
    fontWeight: ty.bodyWeight || 400,
    lineHeight: ty.bodyLineHeight || 1.65,
    color: tx,
  };

  const cardStOuter = {
    borderRadius: br,
    boxShadow: ef.cardShadow || "0 4px 16px rgba(0,0,0,0.08)",
    border: ef.cardBorderStyle || "1px solid rgba(0,0,0,0.06)",
    background: ef.enableGlassmorphism ? `${sur}cc` : sur,
    backdropFilter: ef.enableGlassmorphism ? (ef.cardBackdropFilter || "blur(10px)") : "none",
    transition: "all 0.3s",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };
  
  const cardStInner = {
    borderRadius: br,
    boxShadow: ef.cardShadow || "0 4px 16px rgba(0,0,0,0.08)",
    border: ef.cardBorderStyle || "1px solid rgba(0,0,0,0.06)",
    background: ef.enableGlassmorphism ? `${sur}cc` : sur,
    backdropFilter: ef.enableGlassmorphism ? (ef.cardBackdropFilter || "blur(10px)") : "none",
    transition: "all 0.3s",
    padding: "1rem",
  };

  const wrapperStyle = {
    ...bgCSS,
    ...bodySt,
    minHeight: "100vh",
    position: "relative",
  };

  const grainVisible = ef.enableGrain || (bg.type === "GRADIENT" && bg.gradient?.grainy);

  const handleContactSubmit = () => {
    if (!contactForm.senderName || !contactForm.senderEmail || !contactForm.subject || !contactForm.message) {
      setContactError("All fields are required.");
      return;
    }
    contactAPI
      .submit({ ...contactForm, resumeId: portfolio.resumeId })
      .then(() => {
        setContactSent(true);
        setContactError("");
      })
      .catch(() => setContactError("Failed to send. Try again."));
  };

  const Section = ({ title, tc, children }) => (
    <section style={{ marginBottom: "3rem" }}>
      <h2
        style={{
          ...headSt,
          fontSize: (ty.headingScale || 2.5) * (ty.baseSize || 1.0) * 10 + "px",
          color: p,
          borderBottom: ef.sectionDividerStyle !== "none" ? `2px solid ${acc}` : "none",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );

  const renderSections = () => (
    <>
      {sections?.EXPERIENCE && sections.EXPERIENCE.length > 0 && (
        <Section title="Experience" tc={tc}>
          {sections.EXPERIENCE.map((e, i) => (
            <div key={e.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              <div>
                <strong style={{ color: p, fontSize: "1.1rem" }}>{e.roleTitle || e.role}</strong> @ {e.organizationName || e.company}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7, color: ts }}>
                {e.startDate} — {e.currentlyWorking ? "Present" : e.endDate}
              </div>
              {e.roleDescription && (
                <p style={{ marginTop: "0.4rem", color: tx }}>{e.roleDescription}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.EDUCATION && sections.EDUCATION.length > 0 && (
        <Section title="Education" tc={tc}>
          {sections.EDUCATION.map((e, i) => (
            <div key={e.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              <div>
                <strong style={{ color: p, fontSize: "1.1rem" }}>{e.degree}</strong> — {e.institutionName || e.institution}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7, color: ts }}>
                {e.specialization} | {e.startYear} — {e.endYear}
              </div>
            </div>
          ))}
        </Section>
      )}

      {sections?.SKILLS && sections.SKILLS.length > 0 && (
        <Section title="Skills" tc={tc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", ...(layoutType === "MODERN_GRID" ? cardStInner : cardStOuter) }}>
            {sections.SKILLS.map((s, i) => (
              <span
                key={s.id || i}
                style={{
                  background: cp.tagBackground || acc,
                  color: cp.tagText || "#fff",
                  padding: "0.3rem 0.8rem",
                  borderRadius: br,
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                {s.skillName || s.name} {s.proficiency && `· ${s.proficiency}`}
              </span>
            ))}
          </div>
        </Section>
      )}

      {sections?.PROJECTS && sections.PROJECTS.length > 0 && (
        <Section title="Projects" tc={tc}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {sections.PROJECTS.map((pj, i) => (
              <div key={pj.id || i} style={cardStInner}>
                <div>
                  <strong style={{ color: p, fontSize: "1.1rem" }}>{pj.title}</strong>
                </div>
                <p style={{ fontSize: "0.85rem", opacity: 0.8, color: ts }}>{pj.description}</p>
                {pj.technologiesUsed && pj.technologiesUsed.length > 0 && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.7, color: acc }}>
                    {Array.isArray(pj.technologiesUsed) ? pj.technologiesUsed.join(", ") : pj.technologiesUsed}
                  </div>
                )}
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  {pj.liveUrl && <a href={pj.liveUrl} target="_blank" rel="noreferrer" style={{ color: p, fontWeight: "bold" }}>Live ↗</a>}
                  {pj.sourceCodeUrl && <a href={pj.sourceCodeUrl} target="_blank" rel="noreferrer" style={{ color: p, fontWeight: "bold" }}>Repo ↗</a>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.CERTIFICATIONS && sections.CERTIFICATIONS.length > 0 && (
        <Section title="Certifications" tc={tc}>
          {sections.CERTIFICATIONS.map((c, i) => (
            <div key={c.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              <strong style={{ color: p, fontSize: "1.1rem" }}>{c.title}</strong>
              {c.certificateUrl && (
                <><span style={{ margin: "0 0.5rem" }}>·</span><a href={c.certificateUrl} target="_blank" rel="noreferrer" style={{ color: acc }}>View</a></>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.PUBLICATIONS && sections.PUBLICATIONS.length > 0 && (
        <Section title="Publications" tc={tc}>
          {sections.PUBLICATIONS.map((pub, i) => (
            <div key={pub.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              <strong style={{ color: p, fontSize: "1.1rem" }}>{pub.title}</strong> — {pub.publisher}
              {pub.contentUrl && (
                <><span style={{ margin: "0 0.5rem" }}>·</span><a href={pub.contentUrl} target="_blank" rel="noreferrer" style={{ color: acc }}>Read</a></>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.TESTIMONIALS && sections.TESTIMONIALS.length > 0 && (
        <Section title="Testimonials" tc={tc}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {sections.TESTIMONIALS.map((t, i) => (
              <div key={t.id || i} style={cardStInner}>
                <p style={{ fontStyle: "italic", color: ts }}>"{t.testimonialText}"</p>
                <div style={{ fontWeight: "bold", color: p }}>{t.clientName}</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{t.clientCompany}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.SERVICES && sections.SERVICES.length > 0 && (
        <Section title="Services" tc={tc}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {sections.SERVICES.map((s, i) => (
              <div key={s.id || i} style={cardStInner}>
                <div><strong style={{ color: p, fontSize: "1.1rem" }}>{s.serviceTitle}</strong></div>
                <p style={{ fontSize: "0.85rem", color: ts }}>{s.description}</p>
                {s.basePrice && <div style={{ fontWeight: "bold", color: acc }}>{s.currency} {s.basePrice}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.EXHIBITIONS && sections.EXHIBITIONS.length > 0 && (
        <Section title="Exhibitions & Awards" tc={tc}>
          {sections.EXHIBITIONS.map((e, i) => (
            <div key={e.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              <strong style={{ color: p, fontSize: "1.1rem" }}>{e.title}</strong>
              {e.awardType && <span style={{ fontSize: "0.8rem", opacity: 0.7, color: ts }}> [{e.awardType}]</span>}
              {" — "} {e.eventName} {e.year && `(${e.year})`}
            </div>
          ))}
        </Section>
      )}

      {sections?.BLOGS && sections.BLOGS.length > 0 && (
        <Section title="Blog" tc={tc}>
          {sections.BLOGS.map((b, i) => (
            <div key={b.id || i} style={layoutType === "MODERN_GRID" ? cardStInner : cardStOuter}>
              {b.coverImage && (
                <img src={b.coverImage} alt={b.title} style={{ width: "100%", maxHeight: "160px", objectFit: "cover", marginBottom: "0.5rem", borderRadius: br }} />
              )}
              <div><strong style={{ color: p, fontSize: "1.1rem" }}>{b.title}</strong></div>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, color: ts }}>{b.content?.slice(0, 200)}...</p>
            </div>
          ))}
        </Section>
      )}

      {/* Removed Contact section from here so it can be universally applied */}
    </>
  );

  const ProfileView = () => {
    if (!profile) return null;
    return (
      <section style={{ display:"flex", gap:"2.5rem", alignItems:"flex-start", marginBottom:"3rem", flexWrap:"wrap" }}>
        {profile.profilePhotoUrl && (
          <img src={resolveUrl(profile.profilePhotoUrl)} alt={profile.fullName} style={{ width:"180px", height:"180px", borderRadius:"50%", objectFit:"cover", border:`4px solid ${sur}`, boxShadow: ef.cardShadow }} />
        )}
        <div style={{ flex:1, minWidth:"280px" }}>
          <h2 style={{ ...headSt, fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: p, margin: "0 0 0.5rem" }}>{profile.displayName || profile.fullName}</h2>
          <div style={{ fontSize: "1.3rem", color: acc, fontWeight: ty.headingWeight, marginBottom: "1rem", fontFamily: ff }}>{profile.professionalTitle}</div>
          {profile.detailedBio ? (
            <p style={{ fontSize: "1.05rem", color: tx, opacity: 0.9, lineHeight: 1.8, maxWidth: "700px" }}>{profile.detailedBio}</p>
          ) : profile.bio && (
            <p style={{ fontSize: "1.05rem", color: tx, opacity: 0.9, lineHeight: 1.8, maxWidth: "700px" }}>{profile.bio}</p>
          )}

          <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap", marginTop:"1.5rem", fontSize:"0.9rem" }}>
            {profile.location && <span style={{ background: sur, border:`1px solid ${cp.borderColor||'#e5e5e5'}`, padding: "0.4rem 1rem", borderRadius: "50px", color: tx }}>📍 {profile.location}</span>}
            {profile.nationality && <span style={{ background: sur, border:`1px solid ${cp.borderColor||'#e5e5e5'}`, padding: "0.4rem 1rem", borderRadius: "50px", color: tx }}>🌍 {profile.nationality}</span>}
            {profile.availabilityStatus && <span style={{ background: acc, color: cp.tagText || "#fff", padding: "0.4rem 1rem", borderRadius: "50px" }}>{profile.availabilityStatus.replace("_", " ")}</span>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ background: sur, padding: "0.4rem 1rem", borderRadius: "8px", border:`1px solid ${p}`, color: p, textDecoration: "none", fontWeight: "bold" }}>LinkedIn ↗</a>}
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ background: sur, padding: "0.4rem 1rem", borderRadius: "8px", border:`1px solid ${p}`, color: p, textDecoration: "none", fontWeight: "bold" }}>GitHub ↗</a>}
          </div>
        </div>
      </section>
    );
  };

  const renderSectionsSubset = (sectionSubset, tc) => {
    return Object.entries(sectionSubset).map(([key, data]) => {
      if (!data?.length) return null;
      
      const title = key.charAt(0) + key.slice(1).toLowerCase().replace(/s$/, '') + (key === "SKILLS" ? "s" : "s");

      // SPECIAL CASE: Skills, Languages should render as Badges
      if (key === "SKILLS" || key === "LANGUAGES") {
        return (
          <Section key={key} title={title} tc={tc}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {data.map((s, i) => (
                <span key={s.id || i} style={{ background: sur, color: p, border: `1px solid ${cp.borderColor||'#e5e5e5'}`, padding: "0.4rem 1rem", borderRadius: "100px", fontWeight: 600, fontSize: "0.85rem" }}>
                  {s.skillName || s.name} {s.proficiency && <span style={{ opacity: 0.6 }}>· {s.proficiency}</span>}
                </span>
              ))}
            </div>
          </Section>
        );
      }

      // SPECIAL CASE: Projects should render as styled Cards
      if (key === "PROJECTS" || key === "PROJECT_GALLERY") {
         return (
          <Section key={key} title={title} tc={tc}>
            <div style={{ display: "grid", gridTemplateColumns: layoutType.includes("COLUMN") ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {data.map((pj, i) => (
                <div key={pj.id || i} style={{...cardStInner, display:"flex", flexDirection:"column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <strong style={{ color: p, fontSize: "1.2rem", fontWeight: 700 }}>{pj.title}</strong>
                    <div style={{ display: "flex", gap: "0.8rem", fontSize: "0.85rem" }}>
                      {pj.liveUrl && <a href={pj.liveUrl} target="_blank" rel="noreferrer" style={{ color: acc, textDecoration: "none", fontWeight: 700 }}>Live ↗</a>}
                      {pj.sourceCodeUrl && <a href={pj.sourceCodeUrl} target="_blank" rel="noreferrer" style={{ color: acc, textDecoration: "none", fontWeight: 700 }}>Code ↗</a>}
                    </div>
                  </div>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: tx, flex: 1 }}>{pj.description}</p>
                  {pj.technologiesUsed && pj.technologiesUsed.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
                      {(Array.isArray(pj.technologiesUsed) ? pj.technologiesUsed : [pj.technologiesUsed]).map((tech, idx) => (
                        <span key={idx} style={{ background: sur, border:`1px solid ${acc}30`, color: acc, padding: "0.1rem 0.6rem", fontSize: "0.75rem", borderRadius: "100px" }}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
         );
      }

      // DEFAULT CASE: Experience, Education, Certifications, etc.
      return (
        <Section key={key} title={title} tc={tc}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
             {data.map((item, i) => (
              <div key={i} style={layoutType === "MODERN_GRID" || layoutType === "GRID" ? cardStInner : { borderLeft: `3px solid ${acc}`, paddingLeft: "1.2rem", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.2rem", color: p, fontWeight: 700 }}>
                  {item.roleTitle || item.title || item.degree || item.serviceTitle || "—"}
                </h3>
                {item.organizationName || item.company ? <div style={{ fontWeight: 600, color: acc, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{item.organizationName || item.company}</div> : null}
                {item.institutionName || item.institution ? <div style={{ fontWeight: 600, color: acc, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{item.institutionName || item.institution} {item.specialization && ` - ${item.specialization}`}</div> : null}
                
                {(item.startDate || item.startYear) && (
                  <div style={{ fontSize: "0.85rem", color: ts, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {item.startDate || item.startYear} — {item.currentlyWorking ? "Present" : (item.endDate || item.endYear)}
                  </div>
                )}
                
                {item.roleDescription && <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: tx }}>{item.roleDescription}</p>}
                {item.description && <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: tx }}>{item.description}</p>}
                
                {item.technologiesUsed && item.technologiesUsed.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                    {(Array.isArray(item.technologiesUsed) ? item.technologiesUsed : [item.technologiesUsed]).map((tech, idx) => (
                      <span key={idx} style={{ background: sur, color: acc, padding: "0.2rem 0.6rem", fontSize: "0.85rem", borderRadius: "4px", border: `1px solid ${acc}` }}>{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      );
    });
  };

  const renderWithLayout = () => {
    const maxWidth = lc.maxWidth || "1100px";
    const padding = lc.contentPadding || "4rem 2rem";

    // Helper to separate sections for two-column/sidebar layouts
    const splitSections = () => {
      const allEntries = sections ? Object.entries(sections) : [];
      const leftColKeys = ["SKILLS", "CERTIFICATIONS", "LANGUAGES", "FINANCIAL"];
      
      const leftMap = {};
      const rightMap = {};

      allEntries.forEach(([key, data]) => {
        if (!data || data.length === 0) return;
        if (leftColKeys.includes(key)) leftMap[key] = data;
        else rightMap[key] = data;
      });

      // Fallback: If one side is empty, just distribute somewhat evenly
      if (Object.keys(leftMap).length === 0 || Object.keys(rightMap).length === 0) {
        const leftArr = allEntries.slice(0, Math.ceil(allEntries.length / 3));
        const rightArr = allEntries.slice(Math.ceil(allEntries.length / 3));
        return { 
          leftSections: Object.fromEntries(leftArr), 
          rightSections: Object.fromEntries(rightArr) 
        };
      }

      return { leftSections: leftMap, rightSections: rightMap };
    };

    switch (layoutType) {
      case "LEFT_SIDEBAR":
      case "SIDEBAR_LEFT":
      case "RIGHT_SIDEBAR":
      case "SIDEBAR_RIGHT": {
        const isLeft = layoutType === "LEFT_SIDEBAR" || layoutType === "SIDEBAR_LEFT";
        const { leftSections, rightSections } = splitSections();

        return (
          <div style={{ maxWidth, margin: "0 auto", padding, display: "flex", gap: "4rem", alignItems: "flex-start", flexDirection: isLeft ? "row" : "row-reverse", flexWrap: "wrap" }}>
            <aside style={{ width: lc.sidebarWidth || "320px", flexShrink: 0, flexGrow: 1, position: "sticky", top: "2rem" }}>
               <ProfileView />
               <div style={{ marginTop: "3rem" }}>
                 {renderSectionsSubset(isLeft ? leftSections : rightSections, tc)}
               </div>
            </aside>
            <main style={{ flex: 2, minWidth: "320px" }}>
              {renderSectionsSubset(isLeft ? rightSections : leftSections, tc)}
            </main>
          </div>
        );
      }
      case "TWO_COLUMN": {
        const { leftSections, rightSections } = splitSections();
        return (
          <div style={{ maxWidth, margin: "0 auto", padding }}>
            <div style={{ marginBottom: "4rem" }}><ProfileView /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem" }}>
              <div>{renderSectionsSubset(leftSections, tc)}</div>
              <div>{renderSectionsSubset(rightSections, tc)}</div>
            </div>
          </div>
        );
      }
      case "MODERN_GRID":
      case "GRID":
      case "MASONRY":
        return (
          <div style={{ maxWidth, margin: "0 auto", padding }}>
            <div style={{ marginBottom: "4rem" }}><ProfileView /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "3rem" }}>
              {sections && Object.entries(sections).map(([key, data]) => data?.length > 0 && (
                <div key={key} style={cardStOuter}>
                  <Section title={key.charAt(0) + key.slice(1).toLowerCase().replace(/s$/, '') + "s"} tc={tc}>
                    <div style={{ fontSize: "0.95rem" }}>
                      {data.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ marginBottom: "1rem" }}>
                           <h3 style={{ color: p, margin: "0 0 0.2rem", fontSize: "1.1rem" }}>
                            {item.roleTitle || item.skillName || item.title || item.degree || item.serviceTitle || "—"}
                           </h3>
                           {item.organizationName && <div style={{ color: ts, fontSize: "0.9rem" }}>{item.organizationName}</div>}
                           {item.roleDescription && <p style={{ margin: "0.3rem 0 0", color: tx, fontSize: "0.9rem", opacity: 0.9 }}>{item.roleDescription}</p>}
                        </div>
                      ))}
                      {data.length > 3 && <div style={{ opacity: 0.8, color: ts }}>+{data.length - 3} more</div>}
                    </div>
                  </Section>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        // Single Column Default Devrushi style!
        return (
          <main style={{ maxWidth: "900px", margin: "0 auto", padding }}>
            <div style={{ marginBottom: "4rem" }}><ProfileView /></div>
            
            {sections?.SKILLS && sections.SKILLS.length > 0 && (
              <Section title="Technical Skills" tc={tc}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                  {sections.SKILLS.map((s, i) => (
                    <span key={s.id || i} style={{ background: sur, color: p, border: `1px solid ${cp.borderColor||'#e5e5e5'}`, padding: "0.5rem 1.2rem", borderRadius: "8px", fontWeight: 500, fontSize: "0.95rem" }}>
                      {s.skillName || s.name} {s.proficiency && <span style={{ opacity: 0.6 }}>· {s.proficiency}</span>}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {sections?.EXPERIENCE && sections.EXPERIENCE.length > 0 && (
              <Section title="Professional Experience" tc={tc}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>{renderSectionsSubset({EXPERIENCE: sections.EXPERIENCE}, tc)[0].props.children}</div>
              </Section>
            )}
            
            {sections?.PROJECTS && sections.PROJECTS.length > 0 && (
              <Section title="Major Projects" tc={tc}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>{renderSectionsSubset({PROJECTS: sections.PROJECTS}, tc)[0].props.children}</div>
              </Section>
            )}

            {sections?.EDUCATION && sections.EDUCATION.length > 0 && (
              <Section title="Education" tc={tc}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>{renderSectionsSubset({EDUCATION: sections.EDUCATION}, tc)[0].props.children}</div>
              </Section>
            )}

            {/* Render any remaining stuff */}
             {renderSectionsSubset(
                Object.fromEntries(Object.entries(sections).filter(([k]) => !["EXPERIENCE","PROJECTS","SKILLS","EDUCATION","CONTACT"].includes(k))), tc
             )}
          </main>
        );
    }
  };

  return (
    <div style={wrapperStyle}>
      {grainVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            opacity: ((ef.enableGrain ? ef.globalGrainIntensity : bg.gradient?.grainIntensity) || 30) / 200,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {renderWithLayout()}
      </div>
    </div>
  );
};
export default PublicPortfolioPage;
