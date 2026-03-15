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
                {pj.technologiesUsed && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.7, color: acc }}>{pj.technologiesUsed}</div>
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

      {/* ── CONTACT FORM ── */}
      <Section title="Contact" tc={tc}>
        <div style={cardStOuter}>
          {contactSent ? (
            <p style={{ color: "green", fontWeight: 600 }}>Message sent! I'll get back to you soon.</p>
          ) : (
            <div style={{ maxWidth: "480px" }}>
              {contactError && <p style={{ color: "red", fontWeight: 600 }}>{contactError}</p>}
              {[
                { placeholder: "Your Name", key: "senderName", type: "text" },
                { placeholder: "Your Email", key: "senderEmail", type: "email" },
                { placeholder: "Subject", key: "subject", type: "text" },
              ].map(({ placeholder, key, type }) => (
                <div key={key} style={{ marginBottom: "0.8rem" }}>
                  <input
                    placeholder={placeholder}
                    type={type}
                    value={contactForm[key]}
                    onChange={(e) => setContactForm({ ...contactForm, [key]: e.target.value })}
                    style={{ width: "100%", padding: "0.8rem", boxSizing: "border-box", border: `2px solid ${cp.borderColor || '#ccc'}`, borderRadius: br, background: sur, color: tx, fontFamily: bf }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: "0.8rem" }}>
                <textarea
                  placeholder="Your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  style={{ width: "100%", padding: "0.8rem", boxSizing: "border-box", border: `2px solid ${cp.borderColor || '#ccc'}`, borderRadius: br, background: sur, color: tx, fontFamily: bf }}
                />
              </div>
              <button
                onClick={handleContactSubmit}
                style={{ background: p, color: bg.solidColor || bgCol, border: "none", padding: "0.8rem 1.8rem", cursor: "pointer", borderRadius: br, fontWeight: 700, transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.target.style.opacity=0.8}
                onMouseOut={(e) => e.target.style.opacity=1}
              >
                Send Message
              </button>
            </div>
          )}
        </div>
      </Section>
    </>
  );

  const ProfileView = () => {
    if (!profile) return null;
    return (
      <section style={{ display:"flex", gap:"2rem", alignItems:"flex-start", marginBottom:"3rem", flexWrap:"wrap" }}>
        {profile.profilePhotoUrl && (
          <img src={profile.profilePhotoUrl} alt={profile.fullName} style={{ width:"160px", height:"160px", borderRadius:"50%", objectFit:"cover", border:`4px solid ${sur}`, boxShadow: ef.cardShadow }} />
        )}
        <div style={{ flex:1 }}>
          <h2 style={{ ...headSt, fontSize: (ty.headingScale || 2.5) * (ty.baseSize || 1.0) * 14 + "px", margin: "0 0 0.5rem" }}>{profile.displayName || profile.fullName}</h2>
          <div style={{ fontSize: (ty.subheadingScale || 1.5) * (ty.baseSize || 1.0) * 11 + "px", color: acc, fontWeight: ty.headingWeight, marginBottom: "1rem", fontFamily: ff }}>{profile.professionalTitle}</div>
          {profile.bio && <p style={{ fontSize: "1.05rem", color: ts, maxWidth: "700px", lineHeight: ty.bodyLineHeight }}>{profile.bio}</p>}
          {profile.detailedBio && <p style={{ fontSize: "0.95rem", color: ts, maxWidth: "700px", opacity: 0.8 }}>{profile.detailedBio}</p>}
          
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginTop:"1.5rem", fontSize:"0.9rem" }}>
            {profile.location && <span style={{ background: sur, padding: "0.4rem 1rem", borderRadius: br, boxShadow: ef.cardShadow, color: tx }}>📍 {profile.location}</span>}
            {profile.nationality && <span style={{ background: sur, padding: "0.4rem 1rem", borderRadius: br, boxShadow: ef.cardShadow, color: tx }}>🌍 {profile.nationality}</span>}
            {profile.availabilityStatus && <span style={{ background: cp.tagBackground || acc, color: cp.tagText || "#fff", padding: "0.4rem 1rem", borderRadius: br, boxShadow: ef.cardShadow }}>{profile.availabilityStatus}</span>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ background: sur, padding: "0.4rem 1rem", borderRadius: br, color: p, textDecoration: "none", boxShadow: ef.cardShadow, fontWeight: "bold" }}>LinkedIn ↗</a>}
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ background: sur, padding: "0.4rem 1rem", borderRadius: br, color: p, textDecoration: "none", boxShadow: ef.cardShadow, fontWeight: "bold" }}>GitHub ↗</a>}
          </div>
        </div>
      </section>
    );
  };

  const renderSectionsSubset = (sectionSubset, tc) => {
    return Object.entries(sectionSubset).map(([key, data]) => {
      if (!data?.length) return null;
      return (
        <Section key={key} title={key.charAt(0) + key.slice(1).toLowerCase()} tc={tc}>
          <div style={cardStOuter}>
             {data.map((item, i) => (
              <div key={i} style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                <strong style={{ color: p }}>
                  {item.roleTitle || item.skillName || item.title || item.degree || item.serviceTitle || item.institutionName || "—"}
                </strong>
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
    
    switch (layoutType) {
      case "LEFT_SIDEBAR":
      case "SIDEBAR_LEFT":
      case "RIGHT_SIDEBAR":
      case "SIDEBAR_RIGHT":
        const isLeft = layoutType === "LEFT_SIDEBAR" || layoutType === "SIDEBAR_LEFT";
        return (
          <div style={{ maxWidth, margin: "0 auto", padding, display: "flex", gap: "4rem", alignItems: "flex-start", flexDirection: isLeft ? "row" : "row-reverse" }}>
            <aside style={{ width: lc.sidebarWidth || "320px", flexShrink: 0, position: "sticky", top: "2rem" }}>
               <ProfileView />
            </aside>
            <main style={{ flex: 1, minWidth: 0 }}>{renderSections()}</main>
          </div>
        );
      case "TWO_COLUMN": {
        const half = sections ? Object.entries(sections) : [];
        const leftSections = Object.fromEntries(half.slice(0, Math.ceil(half.length / 2)));
        const rightSections = Object.fromEntries(half.slice(Math.ceil(half.length / 2)));
        return (
          <div style={{ maxWidth, margin: "0 auto", padding }}>
            <div style={{ marginBottom: "3rem" }}><ProfileView /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
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
            <div style={{ marginBottom: "3rem" }}><ProfileView /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
              {sections && Object.entries(sections).map(([key, data]) => data?.length > 0 && (
                <div key={key} style={cardStOuter}>
                  <Section title={key.charAt(0) + key.slice(1).toLowerCase()} tc={tc}>
                    <div style={{ fontSize: "0.95rem" }}>
                      {data.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ marginBottom: "0.6rem" }}>
                           <strong style={{ color: p }}>
                            {item.roleTitle || item.skillName || item.title || item.degree || item.serviceTitle || "—"}
                           </strong>
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
        return (
          <main style={{ maxWidth, margin: "0 auto", padding }}>
            <ProfileView />
            {renderSections()}
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
      
      {layoutType === "BOLD_HEADER" ? (
        <header
          style={{
            background: p,
            color: bgCol,
            padding: "6rem 2rem",
            textAlign: "center",
            position: "relative",
            zIndex: 1
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {profile?.profilePhotoUrl && (
              <img src={profile.profilePhotoUrl} alt={profile.fullName} style={{ width:"120px", height:"120px", borderRadius:"50%", objectFit:"cover", border:`4px solid ${bgCol}`, boxShadow: ef.cardShadow, marginBottom: "1.5rem" }} />
            )}
            <h1 style={{ ...headSt, color: bgCol, fontSize: (ty.headingScale || 2.5) * (ty.baseSize || 1.0) * 14 + "px", margin: "0 0 1rem" }}>{title || profile?.fullName}</h1>
            <p style={{ margin: "0", opacity: 0.9, fontSize: "1.2rem", fontWeight: ty.bodyWeight }}>{professionType || profile?.professionalTitle}</p>
          </div>
        </header>
      ) : null}

      <div style={{ position: "relative", zIndex: 1 }}>
        {renderWithLayout()}
      </div>
    </div>
  );
};
export default PublicPortfolioPage;
