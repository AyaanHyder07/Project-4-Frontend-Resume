import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const PublicPortfolioPage = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [contactForm, setContactForm] = useState({
    senderName: "",
    senderEmail: "",
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
        // FIX 1: Fetch profile separately using the resumeId from the portfolio response
        if (data?.resumeId) {
          profileAPI
            .getPublic(data.resumeId)
            .then((r) => setProfile(r.data))
            .catch(() => {}); // profile optional — don't block page
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
  const tc = theme?.themeConfig || {};

  // FIX 2: layoutConfigJson is stored as a JSON string — must parse it first
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

  const wrapperStyle = {
    background: tc.backgroundColor || "#fff",
    color: tc.textColor || "#333",
    fontFamily: tc.fontFamily || "sans-serif",
    minHeight: "100vh",
  };

  const handleContactSubmit = () => {
    if (
      !contactForm.senderName ||
      !contactForm.senderEmail ||
      !contactForm.message
    ) {
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

  // Build the main sections content (reused in different layout slots)
  const renderSections = () => (
    <>
      {sections?.EXPERIENCE && (
        <Section title="Experience" tc={tc}>
          {sections.EXPERIENCE.map((e) => (
            <div
              key={e.id}
              style={{
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: `1px solid ${tc.primaryColor}22`,
              }}
            >
              <div>
                <strong>{e.roleTitle || e.role}</strong> @{" "}
                {e.organizationName || e.company}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {e.startDate} — {e.currentlyWorking ? "Present" : e.endDate}
              </div>
              {e.roleDescription && (
                <p style={{ marginTop: "0.4rem" }}>{e.roleDescription}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.EDUCATION && (
        <Section title="Education" tc={tc}>
          {sections.EDUCATION.map((e) => (
            <div key={e.id} style={{ marginBottom: "0.75rem" }}>
              <div>
                <strong>{e.degree}</strong> —{" "}
                {e.institutionName || e.institution}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {e.specialization} | {e.startYear} — {e.endYear}
              </div>
            </div>
          ))}
        </Section>
      )}

      {sections?.SKILLS && (
        <Section title="Skills" tc={tc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {sections.SKILLS.map((s) => (
              <span
                key={s.id}
                style={{
                  background: tc.accentColor || "#eee",
                  color: "#fff",
                  padding: "0.25rem 0.6rem",
                  borderRadius: tc.borderRadius || "4px",
                  fontSize: "0.85rem",
                }}
              >
                {s.skillName || s.name} {s.proficiency && `· ${s.proficiency}`}
              </span>
            ))}
          </div>
        </Section>
      )}

      {sections?.PROJECTS && (
        <Section title="Projects" tc={tc}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1rem",
            }}
          >
            {sections.PROJECTS.map((p) => (
              <div
                key={p.id}
                style={{
                  border: `1px solid ${tc.primaryColor}33`,
                  padding: "1rem",
                  borderRadius: tc.borderRadius || "4px",
                }}
              >
                <div>
                  <strong>{p.title}</strong>
                </div>
                <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  {p.description}
                </p>
                {p.technologiesUsed && (
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {p.technologiesUsed}
                  </div>
                )}
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer">
                      Live ↗
                    </a>
                  )}
                  {p.sourceCodeUrl && (
                    <a href={p.sourceCodeUrl} target="_blank" rel="noreferrer">
                      Repo ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.CERTIFICATIONS && (
        <Section title="Certifications" tc={tc}>
          {sections.CERTIFICATIONS.map((c) => (
            <div key={c.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{c.title}</strong>
              {c.certificateUrl && (
                <>
                  {" "}
                  ·{" "}
                  <a href={c.certificateUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                </>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.PUBLICATIONS && (
        <Section title="Publications" tc={tc}>
          {sections.PUBLICATIONS.map((p) => (
            <div key={p.id} style={{ marginBottom: "0.75rem" }}>
              <strong>{p.title}</strong> — {p.publisher}
              {p.contentUrl && (
                <>
                  {" "}
                  ·{" "}
                  <a href={p.contentUrl} target="_blank" rel="noreferrer">
                    Read
                  </a>
                </>
              )}
            </div>
          ))}
        </Section>
      )}

      {sections?.TESTIMONIALS && (
        <Section title="Testimonials" tc={tc}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1rem",
            }}
          >
            {sections.TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                style={{
                  border: `1px solid ${tc.primaryColor}33`,
                  padding: "1rem",
                  borderRadius: tc.borderRadius || "4px",
                }}
              >
                <p style={{ fontStyle: "italic" }}>"{t.testimonialText}"</p>
                <div style={{ fontWeight: "bold" }}>{t.clientName}</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  {t.clientCompany}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.SERVICES && (
        <Section title="Services" tc={tc}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {sections.SERVICES.map((s) => (
              <div
                key={s.id}
                style={{
                  border: `1px solid ${tc.primaryColor}33`,
                  padding: "1rem",
                  borderRadius: tc.borderRadius || "4px",
                }}
              >
                <div>
                  <strong>{s.serviceTitle}</strong>
                </div>
                <p style={{ fontSize: "0.85rem" }}>{s.description}</p>
                {s.basePrice && (
                  <div style={{ fontWeight: "bold" }}>
                    {s.currency} {s.basePrice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {sections?.EXHIBITIONS && (
        <Section title="Exhibitions & Awards" tc={tc}>
          {sections.EXHIBITIONS.map((e) => (
            <div key={e.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{e.title}</strong>
              {e.awardType && (
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  {" "}
                  [{e.awardType}]
                </span>
              )}
              {" — "}
              {e.eventName} {e.year && `(${e.year})`}
            </div>
          ))}
        </Section>
      )}

      {sections?.BLOGS && (
        <Section title="Blog" tc={tc}>
          {sections.BLOGS.map((b) => (
            <div
              key={b.id}
              style={{
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #eee",
              }}
            >
              {b.coverImage && (
                <img
                  src={b.coverImage}
                  alt={b.title}
                  style={{
                    width: "100%",
                    maxHeight: "160px",
                    objectFit: "cover",
                    marginBottom: "0.5rem",
                  }}
                />
              )}
              <div>
                <strong>{b.title}</strong>
              </div>
              <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                {b.content?.slice(0, 200)}...
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* ── CONTACT FORM ── */}
      <Section title="Contact" tc={tc}>
        {contactSent ? (
          <p style={{ color: "green" }}>
            Message sent! I'll get back to you soon.
          </p>
        ) : (
          <div style={{ maxWidth: "480px" }}>
            {contactError && <p style={{ color: "red" }}>{contactError}</p>}
            {[
              { placeholder: "Your Name", key: "senderName", type: "text" },
              { placeholder: "Your Email", key: "senderEmail", type: "email" },
            ].map(({ placeholder, key, type }) => (
              <div key={key} style={{ marginBottom: "0.5rem" }}>
                <input
                  placeholder={placeholder}
                  type={type}
                  value={contactForm[key]}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, [key]: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    boxSizing: "border-box",
                    border: `1px solid ${tc.primaryColor}44`,
                    borderRadius: tc.borderRadius || "4px",
                    background: tc.backgroundColor,
                    color: tc.textColor,
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: "0.5rem" }}>
              <textarea
                placeholder="Your message..."
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  boxSizing: "border-box",
                  border: `1px solid ${tc.primaryColor}44`,
                  borderRadius: tc.borderRadius || "4px",
                  background: tc.backgroundColor,
                  color: tc.textColor,
                }}
              />
            </div>
            <button
              onClick={handleContactSubmit}
              style={{
                background: tc.primaryColor || "#333",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.5rem",
                cursor: "pointer",
                borderRadius: tc.borderRadius || "4px",
              }}
            >
              Send Message
            </button>
          </div>
        )}
      </Section>
    </>
  );

  // FIX 3: Apply actual layout structure based on layoutType
  const renderWithLayout = () => {
    const maxWidth = lc.maxWidth || "960px";
    const padding = lc.contentPadding || "2rem";
    const sidebarW = lc.sidebarWidth || "260px";

    const profileBlock = profile ? (
      <ProfileView data={profile} tc={tc} />
    ) : null;

    switch (layoutType) {
      case "LEFT_SIDEBAR":
        return (
          <div
            style={{
              maxWidth,
              margin: "0 auto",
              padding,
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
            }}
          >
            <aside
              style={{
                width: sidebarW,
                flexShrink: 0,
                position: "sticky",
                top: "1rem",
              }}
            >
              {profileBlock}
            </aside>
            <main style={{ flex: 1, minWidth: 0 }}>{renderSections()}</main>
          </div>
        );

      case "RIGHT_SIDEBAR":
        return (
          <div
            style={{
              maxWidth,
              margin: "0 auto",
              padding,
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
            }}
          >
            <main style={{ flex: 1, minWidth: 0 }}>{renderSections()}</main>
            <aside
              style={{
                width: sidebarW,
                flexShrink: 0,
                position: "sticky",
                top: "1rem",
              }}
            >
              {profileBlock}
            </aside>
          </div>
        );

      case "TWO_COLUMN": {
        const half = sections ? Object.entries(sections) : [];
        const leftSections = Object.fromEntries(
          half.slice(0, Math.ceil(half.length / 2)),
        );
        const rightSections = Object.fromEntries(
          half.slice(Math.ceil(half.length / 2)),
        );
        return (
          <div style={{ maxWidth, margin: "0 auto", padding }}>
            {profileBlock && (
              <div style={{ marginBottom: "2rem" }}>{profileBlock}</div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              <div>
                {/* render left half inline to avoid prop drilling complexity */}
                {renderSectionsSubset(
                  leftSections,
                  tc,
                  contactSent,
                  contactError,
                  contactForm,
                  setContactForm,
                  handleContactSubmit,
                )}
              </div>
              <div>
                {renderSectionsSubset(
                  rightSections,
                  tc,
                  contactSent,
                  contactError,
                  contactForm,
                  setContactForm,
                  handleContactSubmit,
                )}
              </div>
            </div>
          </div>
        );
      }

      case "MODERN_GRID":
        return (
          <div style={{ maxWidth, margin: "0 auto", padding }}>
            {profileBlock && (
              <div style={{ marginBottom: "2rem" }}>{profileBlock}</div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {sections &&
                Object.entries(sections).map(
                  ([key, data]) =>
                    data?.length > 0 && (
                      <div
                        key={key}
                        style={{
                          border: `1px solid ${tc.primaryColor}22`,
                          borderRadius: tc.borderRadius || "8px",
                          padding: "1rem",
                          background: tc.backgroundColor,
                        }}
                      >
                        <Section
                          title={key.charAt(0) + key.slice(1).toLowerCase()}
                          tc={tc}
                        >
                          <div style={{ fontSize: "0.85rem" }}>
                            {data.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                style={{ marginBottom: "0.4rem", opacity: 0.8 }}
                              >
                                {item.roleTitle ||
                                  item.skillName ||
                                  item.title ||
                                  item.degree ||
                                  item.serviceTitle ||
                                  "—"}
                              </div>
                            ))}
                            {data.length > 3 && (
                              <div style={{ opacity: 0.5 }}>
                                +{data.length - 3} more
                              </div>
                            )}
                          </div>
                        </Section>
                      </div>
                    ),
                )}
            </div>
          </div>
        );

      // SINGLE_COLUMN and all others
      default:
        return (
          <main style={{ maxWidth, margin: "0 auto", padding }}>
            {profileBlock}
            {renderSections()}
          </main>
        );
    }
  };

  return (
    <div style={wrapperStyle}>
      <header
        style={{
          background: tc.primaryColor || "#1a1a2e",
          color: "#fff",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontFamily: tc.fontFamily }}>{title}</h1>
        <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>{professionType}</p>
      </header>

      {renderWithLayout()}
    </div>
  );
};

/* ── Subset renderer for TWO_COLUMN layout ── */
const renderSectionsSubset = (sectionSubset, tc) => {
  return Object.entries(sectionSubset).map(([key, data]) => {
    if (!data?.length) return null;
    return (
      <Section
        key={key}
        title={key.charAt(0) + key.slice(1).toLowerCase()}
        tc={tc}
      >
        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            {item.roleTitle ||
              item.skillName ||
              item.title ||
              item.degree ||
              item.serviceTitle ||
              item.institutionName ||
              "—"}
          </div>
        ))}
      </Section>
    );
  });
};

/* ── Section wrapper ── */
const Section = ({ title, tc, children }) => (
  <section style={{ marginBottom: "3rem" }}>
    <h2
      style={{
        borderBottom: `2px solid ${tc.accentColor || "#333"}`,
        paddingBottom: "0.5rem",
        marginBottom: "1.5rem",
        fontFamily: tc.fontFamily,
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

/* ── Profile view ── */
const ProfileView = ({ data, tc }) => (
  <section style={{ display:"flex", gap:"1.5rem", alignItems:"flex-start", marginBottom:"3rem", flexWrap:"wrap" }}>
    
    {/* WRONG: data.avatarUrl  →  CORRECT: data.profilePhotoUrl */}
    {data.profilePhotoUrl && (
      <img src={data.profilePhotoUrl} alt={data.fullName}
        style={{ width:"120px", height:"120px", borderRadius:"50%", objectFit:"cover",
          border:`3px solid ${tc.accentColor || "#ccc"}` }} />
    )}

    <div style={{ flex:1 }}>
      {/* displayName falls back to fullName */}
      <h2 style={{ margin:"0 0 0.25rem" }}>{data.displayName || data.fullName}</h2>

      {/* WRONG: data.headline  →  CORRECT: data.professionalTitle */}
      <div style={{ color: tc.accentColor, fontWeight:"500", marginBottom:"0.5rem" }}>
        {data.professionalTitle}
      </div>

      {data.bio && <p style={{ opacity:0.8, maxWidth:"600px", lineHeight:1.6 }}>{data.bio}</p>}
      {data.detailedBio && <p style={{ opacity:0.7, maxWidth:"600px", fontSize:"0.9rem" }}>{data.detailedBio}</p>}

      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginTop:"0.75rem", fontSize:"0.85rem" }}>
        {data.location    && <span>📍 {data.location}</span>}
        {data.nationality && <span>🌍 {data.nationality}</span>}

        {/* NOTE: email/phone are NOT in PublicUserProfileResponse — backend intentionally omits them */}
        {data.availabilityStatus && (
          <span style={{ background: tc.accentColor+"22", color: tc.accentColor,
            padding:"2px 8px", borderRadius:"4px", fontSize:"0.8rem" }}>
            {data.availabilityStatus}
          </span>
        )}
        {data.linkedinUrl && <a href={data.linkedinUrl} target="_blank" rel="noreferrer"
          style={{ color: tc.accentColor }}>LinkedIn ↗</a>}
        {data.githubUrl   && <a href={data.githubUrl}   target="_blank" rel="noreferrer"
          style={{ color: tc.accentColor }}>GitHub ↗</a>}
      </div>
    </div>
  </section>
);

export default PublicPortfolioPage;
