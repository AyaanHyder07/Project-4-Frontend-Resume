import { useEffect, useMemo, useState } from "react";
import { contactAPI } from "../../api/api";

const DEFAULT_THEME = {
  colorPalette: {
    primary: "#1f1d1a",
    accent: "#9f8557",
    secondary: "#c4b18b",
    pageBackground: "#f4efe6",
    surfaceBackground: "#fbf7f0",
    textPrimary: "#1f1d1a",
    textSecondary: "#6b6254",
    tagBackground: "#efe4d2",
    tagText: "#6d5634",
    dividerColor: "rgba(159, 133, 87, 0.22)",
    borderColor: "rgba(31, 29, 26, 0.08)",
  },
  background: { type: "SOLID", solidColor: "#f4efe6" },
  typography: {
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'DM Sans', sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
    bodyLineHeight: 1.7,
    headingLineHeight: 1.05,
  },
  effects: {
    cardBorderRadius: "22px",
    cardShadow: "0 18px 40px rgba(31, 29, 26, 0.08)",
    cardBorderStyle: "1px solid rgba(31, 29, 26, 0.08)",
    enableGlassmorphism: false,
  },
};

const SECTION_LABELS = {
  EXPERIENCE: "Experience",
  EDUCATION: "Education",
  SKILLS: "Skills",
  PROJECTS: "Projects",
  CERTIFICATIONS: "Certifications",
  PUBLICATIONS: "Publications",
  TESTIMONIALS: "Testimonials",
  SERVICE_OFFERINGS: "Services",
  EXHIBITIONS_AWARDS: "Exhibitions & Awards",
  BLOG_POSTS: "Blog Posts",
  MEDIA_APPEARANCES: "Media Appearances",
  FINANCIAL_CREDENTIALS: "Financial Credentials",
  CONTACT: "Contact",
};

const SIDEBAR_KEYS = new Set(["SKILLS", "CERTIFICATIONS", "SERVICE_OFFERINGS"]);

export function parseLayoutConfig(layout) {
  try {
    const rawConfig = layout?.structureConfig ?? layout?.layoutConfigJson ?? null;
    if (!rawConfig) return {};
    return typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
  } catch {
    return {};
  }
}

export function normalizeTheme(theme) {
  if (!theme) return DEFAULT_THEME;
  const source = theme.themeConfig || theme;
  return {
    colorPalette: { ...DEFAULT_THEME.colorPalette, ...(source.colorPalette || {}) },
    background: { ...DEFAULT_THEME.background, ...(source.background || {}) },
    typography: { ...DEFAULT_THEME.typography, ...(source.typography || {}) },
    effects: { ...DEFAULT_THEME.effects, ...(source.effects || {}) },
  };
}

function buildBackgroundStyle(background, colors) {
  if (background?.type === "GRADIENT" && background.gradient) {
    const stops = (background.gradient.stops || [])
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    const angle = background.gradient.angle || 135;
    return {
      background: `linear-gradient(${angle}deg, ${stops || `${colors.pageBackground}, ${colors.surfaceBackground}`})`,
    };
  }

  if (background?.type === "IMAGE" && background.imageUrl) {
    return {
      backgroundImage: `url(${background.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: colors.pageBackground,
    };
  }

  return { background: background?.solidColor || colors.pageBackground };
}

function splitSections(sections) {
  const left = {};
  const right = {};

  Object.entries(sections || {}).forEach(([key, value]) => {
    if (key === "CONTACT" && value && typeof value === "object") {
      right[key] = value;
      return;
    }
    if (!Array.isArray(value) || value.length === 0) return;
    if (SIDEBAR_KEYS.has(key)) left[key] = value;
    else right[key] = value;
  });

  if (!Object.keys(left).length || !Object.keys(right).length) {
    const entries = Object.entries(sections || {}).filter(([key, value]) =>
      key === "CONTACT"
        ? value && typeof value === "object"
        : Array.isArray(value) && value.length
    );
    const midpoint = Math.max(1, Math.ceil(entries.length / 3));
    return {
      left: Object.fromEntries(entries.slice(0, midpoint)),
      right: Object.fromEntries(entries.slice(midpoint)),
    };
  }

  return { left, right };
}

function resolveAssetUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return url.startsWith("/")
    ? `http://127.0.0.1:8082${url}`
    : `http://127.0.0.1:8082/${url}`;
}

function hexToRgb(hex) {
  if (!hex) return null;
  const clean = hex.replace("#", "").trim();
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function getContrastText(color, dark = "#111111", light = "#fffaf2") {
  const rgb = hexToRgb(color);
  if (!rgb) return light;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 155 ? dark : light;
}

function getInitials(name) {
  return (name || "Portfolio")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function PublicPortfolioRenderer({
  portfolio,
  profile,
  shellStyle: shellStyleOverride,
  minHeight = "100vh",
  sectionTitles: sectionTitlesProp = {},
}) {
  const [contactForm, setContactForm] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    subject: "",
    message: "",
  });
  const [contactState, setContactState] = useState({ sending: false, error: "", success: "" });
  const theme = useMemo(() => normalizeTheme(portfolio?.theme), [portfolio]);
  const layoutConfig = useMemo(() => parseLayoutConfig(portfolio?.layout), [portfolio]);

  if (!portfolio) return null;

  const colors = theme.colorPalette;
  const typography = theme.typography;
  const effects = theme.effects;
  const layoutType = portfolio?.layout?.layoutType || "SINGLE_COLUMN";
  const backgroundStyle = buildBackgroundStyle(theme.background, colors);
  const cardRadius = effects.cardBorderRadius || "22px";
  const contentPadding = layoutConfig.contentPadding || "40px 22px 56px";
  const maxWidth = layoutConfig.maxWidth || "1120px";
  const shadow = effects.cardShadow || DEFAULT_THEME.effects.cardShadow;
  const border = effects.cardBorderStyle || DEFAULT_THEME.effects.cardBorderStyle;
  const textName = profile?.displayName || profile?.fullName || "Your Name";
  const profession = profile?.professionalTitle || portfolio?.professionType || "Your Profession";
  const strapline = profile?.bio || portfolio?.title || "My Portfolio";
  const email = profile?.email || "hello@you.com";
  const website = profile?.personalWebsite || profile?.portfolioWebsite || "yoursite.com";
  const location = profile?.location;
  const availability = profile?.availabilityStatus?.replace(/_/g, " ");
  const linkedin = profile?.linkedinUrl;
  const github = profile?.githubUrl;
  const avatar = resolveAssetUrl(profile?.profilePhotoUrl);
  const sectionGroups = splitSections(portfolio?.sections || {});
  const sectionTitles = portfolio?.sectionTitles || sectionTitlesProp;
  const initials = getInitials(textName);
  const isHeroLayout = ["MODERN_GRID", "GRID", "BOLD_HEADER", "MAGAZINE", "SINGLE_COLUMN"].includes(layoutType);
  const heroBg = isHeroLayout ? colors.primary : colors.surfaceBackground;
  const heroText = getContrastText(heroBg, colors.textPrimary, "#fffaf2");
  const heroMuted = heroText === "#fffaf2" ? "rgba(255, 248, 235, 0.72)" : colors.textSecondary;
  const heroSoft = heroText === "#fffaf2" ? "rgba(255, 248, 235, 0.58)" : colors.textSecondary;

  const wrapperStyle = {
    ...backgroundStyle,
    minHeight,
    color: colors.textPrimary,
    fontFamily: typography.bodyFont,
    lineHeight: typography.bodyLineHeight,
  };

  const headingStyle = {
    fontFamily: typography.headingFont,
    fontWeight: typography.headingWeight,
    lineHeight: typography.headingLineHeight,
    color: colors.textPrimary,
  };

  const surfaceStyle = {
    background: effects.enableGlassmorphism
      ? `${colors.surfaceBackground}dd`
      : colors.surfaceBackground,
    border,
    boxShadow: shadow,
    borderRadius: cardRadius,
    backdropFilter: effects.enableGlassmorphism
      ? effects.cardBackdropFilter || "blur(12px)"
      : "none",
  };

  const shellStyle = {
    maxWidth,
    margin: "0 auto",
    padding: contentPadding,
    ...(shellStyleOverride || {}),
  };

  const titleFor = (key) => sectionTitles[key] || SECTION_LABELS[key] || key.replace(/_/g, " ");

  useEffect(() => {
    setContactForm({
      senderName: "",
      senderEmail: "",
      senderPhone: "",
      subject: "",
      message: "",
    });
    setContactState({ sending: false, error: "", success: "" });
  }, [portfolio?.resumeId]);

  const sectionHeaderStyle = {
    color: colors.accent,
    fontSize: "0.72rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "1rem",
    paddingBottom: "0.7rem",
    borderBottom: `1px solid ${colors.dividerColor}`,
  };

  const handleContactChange = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
    setContactState((prev) => ({ ...prev, error: "", success: "" }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactState({ sending: true, error: "", success: "" });
    try {
      await contactAPI.submit({
        resumeId: portfolio?.resumeId,
        ...contactForm,
      });
      setContactForm({
        senderName: "",
        senderEmail: "",
        senderPhone: "",
        subject: "",
        message: "",
      });
      setContactState({ sending: false, error: "", success: "Message sent successfully." });
    } catch (error) {
      setContactState({
        sending: false,
        error: error?.response?.data?.message || error?.message || "Could not send message.",
        success: "",
      });
    }
  };

  const renderContactSection = (key, sectionValue) => (
    <section
      key={key}
      style={{
        ...surfaceStyle,
        padding: "1.4rem 1.5rem",
        marginBottom: "1rem",
      }}
    >
      <div style={sectionHeaderStyle}>{titleFor(key)}</div>
      <form onSubmit={handleContactSubmit} style={{ display: "grid", gap: "0.85rem" }}>
        <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input
            value={contactForm.senderName}
            onChange={(event) => handleContactChange("senderName", event.target.value)}
            placeholder="Your name"
            required
            style={inputStyle(colors)}
          />
          <input
            type="email"
            value={contactForm.senderEmail}
            onChange={(event) => handleContactChange("senderEmail", event.target.value)}
            placeholder="Your email"
            style={inputStyle(colors)}
          />
        </div>
        <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input
            value={contactForm.senderPhone}
            onChange={(event) => handleContactChange("senderPhone", event.target.value)}
            placeholder="Phone number"
            style={inputStyle(colors)}
          />
          <input
            value={contactForm.subject}
            onChange={(event) => handleContactChange("subject", event.target.value)}
            placeholder="Subject"
            required
            style={inputStyle(colors)}
          />
        </div>
        <textarea
          value={contactForm.message}
          onChange={(event) => handleContactChange("message", event.target.value)}
          placeholder="Tell me about your project or opportunity"
          required
          rows={5}
          style={{ ...inputStyle(colors), resize: "vertical", minHeight: 130 }}
        />
        {profile?.email || profile?.phone || profile?.whatsapp ? (
          <div style={{ fontSize: "0.9rem", color: colors.textSecondary }}>
            {profile?.email ? `Email: ${profile.email}` : ""}
            {profile?.phone ? `${profile?.email ? "  •  " : ""}Phone: ${profile.phone}` : ""}
            {profile?.whatsapp ? `${profile?.email || profile?.phone ? "  •  " : ""}WhatsApp: ${profile.whatsapp}` : ""}
          </div>
        ) : null}
        {contactState.error ? <div style={{ color: "#b42318", fontSize: "0.92rem" }}>{contactState.error}</div> : null}
        {contactState.success ? <div style={{ color: "#157f3b", fontSize: "0.92rem" }}>{contactState.success}</div> : null}
        <div>
          <button
            type="submit"
            disabled={contactState.sending || !portfolio?.resumeId || !sectionValue?.resumeId}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "0.82rem 1.25rem",
              background: colors.primary,
              color: getContrastText(colors.primary, colors.textPrimary, "#fffaf2"),
              fontWeight: 700,
              cursor: contactState.sending ? "wait" : "pointer",
            }}
          >
            {contactState.sending ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );

  const renderSectionItems = (key, items) => {
    if (!Array.isArray(items) || !items.length) return null;

    if (key === "SKILLS" || key === "LANGUAGES") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
          {items.map((item, index) => (
            <span
              key={item.id || index}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                background: colors.tagBackground,
                color: colors.tagText,
                border: `1px solid ${colors.dividerColor}`,
                fontSize: "0.88rem",
                fontWeight: 500,
              }}
            >
              {item.skillName || item.name}
              {item.proficiency ? ` . ${item.proficiency}` : ""}
            </span>
          ))}
        </div>
      );
    }

    if (key === "PROJECTS" || key === "BLOG_POSTS" || key === "TESTIMONIALS" || key === "SERVICE_OFFERINGS") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {items.map((item, index) => (
            <article
              key={item.id || index}
              style={{
                ...surfaceStyle,
                padding: "1.2rem",
                background: colors.pageBackground,
                boxShadow: "none",
              }}
            >
              <h3 style={{ ...headingStyle, fontSize: "1.05rem", margin: "0 0 0.45rem" }}>
                {item.title || item.serviceTitle || item.clientName || "Untitled"}
              </h3>
              {item.organizationName || item.clientCompany || item.publisher ? (
                <div style={{ color: colors.accent, fontWeight: 600, marginBottom: "0.4rem" }}>
                  {item.organizationName || item.clientCompany || item.publisher}
                </div>
              ) : null}
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.93rem" }}>
                {item.description ||
                  item.testimonialText ||
                  item.content?.slice(0, 180) ||
                  item.roleDescription ||
                  " "}
              </p>
            </article>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        {items.map((item, index) => (
          <article
            key={item.id || index}
            style={{
              padding: "0 0 0.2rem",
              borderLeft: `3px solid ${colors.dividerColor}`,
              paddingLeft: "1rem",
            }}
          >
            <h3 style={{ ...headingStyle, fontSize: "1.08rem", margin: "0 0 0.25rem" }}>
              {item.roleTitle || item.degree || item.title || item.serviceTitle || "Untitled"}
            </h3>
            {item.organizationName || item.company || item.institutionName || item.institution ? (
              <div style={{ color: colors.textSecondary, fontWeight: 500, marginBottom: "0.3rem" }}>
                {item.organizationName ||
                  item.company ||
                  item.institutionName ||
                  item.institution}
              </div>
            ) : null}
            {(item.startDate || item.startYear) && (
              <div
                style={{
                  color: colors.textSecondary,
                  fontSize: "0.82rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.55rem",
                }}
              >
                {item.startDate || item.startYear} -{" "}
                {item.currentlyWorking ? "Present" : item.endDate || item.endYear || ""}
              </div>
            )}
            {(item.roleDescription || item.description || item.specialization) && (
              <p style={{ margin: 0, color: colors.textSecondary }}>
                {item.roleDescription || item.description || item.specialization}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  };

  const renderSections = (sectionMap) =>
    Object.entries(sectionMap || {}).map(([key, items]) => {
      if (key === "CONTACT" && items && typeof items === "object") {
        return renderContactSection(key, items);
      }
      if (!Array.isArray(items) || !items.length) return null;
      return (
        <section
          key={key}
          style={{
            ...surfaceStyle,
            padding: "1.4rem 1.5rem",
            marginBottom: "1rem",
          }}
        >
          <div style={sectionHeaderStyle}>{titleFor(key)}</div>
          {renderSectionItems(key, items)}
        </section>
      );
    });

  const renderCustomBlock = (block) => {
    const payload = block?.payload || {};
    const title = block?.title || block?.blockType?.replace(/_/g, " ") || "Custom Block";
    const text = payload.text || payload.description || payload.content || "";
    const listItems = Array.isArray(payload.items) ? payload.items : [];
    return (
      <section
        key={block.id}
        style={{
          ...surfaceStyle,
          padding: "1.4rem 1.5rem",
          marginBottom: "1rem",
        }}
      >
        <div style={sectionHeaderStyle}>{title}</div>
        {text ? <p style={{ margin: 0, color: colors.textSecondary, whiteSpace: "pre-wrap" }}>{String(text)}</p> : null}
        {listItems.length ? (
          <div style={{ display: "grid", gap: "0.65rem", marginTop: text ? "1rem" : 0 }}>
            {listItems.map((item, index) => (
              <div key={index} style={{ paddingLeft: "1rem", borderLeft: `3px solid ${colors.dividerColor}`, color: colors.textSecondary }}>
                {typeof item === "string" ? item : item?.label || item?.title || JSON.stringify(item)}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  };

  const renderCustomBlocks = () => (portfolio?.customBlocks || []).filter((block) => block?.enabled !== false).map(renderCustomBlock);
  const mainLayout = () => {
    if (layoutType === "LEFT_SIDEBAR" || layoutType === "RIGHT_SIDEBAR") {
      const sidebarFirst = layoutType === "LEFT_SIDEBAR";
      const contactSection = portfolio?.sections?.CONTACT
        ? { CONTACT: portfolio.sections.CONTACT }
        : {};
      const sourceSidebarSections = sidebarFirst ? sectionGroups.left : sectionGroups.right;
      const sourceMainSections = sidebarFirst ? sectionGroups.right : sectionGroups.left;
      const sidebarSections = {
        ...contactSection,
        ...sourceSidebarSections,
      };
      const mainSections = { ...sourceMainSections };
      delete mainSections.CONTACT;
      const aside = (
        <aside style={{ flex: "0 0 280px" }}>
          {renderSections(sidebarSections)}
        </aside>
      );
      const main = (
        <main style={{ flex: "1 1 0%" }}>
          {renderSections(mainSections)}
        </main>
      );

      return (
        <div
          style={{
            display: "flex",
            gap: "1.2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {sidebarFirst ? aside : main}
          {sidebarFirst ? main : aside}
        </div>
      );
    }

    if (layoutType === "TWO_COLUMN" || layoutType === "MODERN_GRID" || layoutType === "GRID") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {renderSections(portfolio?.sections || {})}
        </div>
      );
    }

    return <main>{renderSections(portfolio?.sections || {})}</main>;
  };

  return (
    <div style={wrapperStyle}>
      <div style={shellStyle}>
        <header
          style={{
            ...surfaceStyle,
            overflow: "hidden",
            marginBottom: "1.25rem",
            background: heroBg,
            color: heroText,
          }}
        >
          <div
            style={{
              padding: "1.5rem 1.2rem 1.4rem",
              display: "flex",
              gap: "1.3rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={textName}
                style={{
                  width: isHeroLayout ? "88px" : "96px",
                  height: isHeroLayout ? "88px" : "96px",
                  objectFit: "cover",
                  borderRadius: isHeroLayout ? "22px" : "50%",
                  border: `1px solid ${
                    heroText === "#fffaf2" ? "rgba(255,255,255,0.14)" : colors.borderColor
                  }`,
                }}
              />
            ) : (
              <div
                style={{
                  width: isHeroLayout ? "88px" : "96px",
                  height: isHeroLayout ? "88px" : "96px",
                  borderRadius: isHeroLayout ? "22px" : "50%",
                  background: isHeroLayout ? `${colors.accent}22` : colors.pageBackground,
                  border: `1px solid ${colors.dividerColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: typography.headingFont,
                  fontWeight: 700,
                  fontSize: isHeroLayout ? "2rem" : "1.7rem",
                  color: isHeroLayout ? heroText : colors.accent,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}
            <div style={{ flex: "1 1 320px" }}>
              <h1
                style={{
                  ...headingStyle,
                  color: heroText,
                  fontSize: "clamp(2.1rem, 4vw, 3.2rem)",
                  margin: 0,
                }}
              >
                {textName}
              </h1>
              <div
                style={{
                  marginTop: "0.35rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.13em",
                  color: heroMuted,
                  fontSize: "0.86rem",
                  fontWeight: 700,
                }}
              >
                {profession}
              </div>
              <p
                style={{
                  margin: "0.7rem 0 0",
                  color: heroSoft,
                  fontStyle: "italic",
                  maxWidth: "640px",
                }}
              >
                {strapline}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginTop: "1rem",
                  color: heroMuted,
                  fontSize: "0.92rem",
                }}
              >
                <span>{email}</span>
                <span>{website}</span>
                {location ? <span>{location}</span> : null}
              </div>
            </div>
          </div>
        </header>

        {(availability || linkedin || github) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", marginBottom: "0.9rem" }}>
            {availability ? (
              <span
                style={{
                  padding: "0.48rem 0.92rem",
                  borderRadius: "999px",
                  background: colors.tagBackground,
                  color: colors.tagText,
                  border: `1px solid ${colors.dividerColor}`,
                  fontSize: "0.9rem",
                }}
              >
                {availability}
              </span>
            ) : null}
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "0.48rem 0.92rem",
                  borderRadius: "999px",
                  background: colors.surfaceBackground,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderColor}`,
                  textDecoration: "none",
                }}
              >
                LinkedIn
              </a>
            ) : null}
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "0.48rem 0.92rem",
                  borderRadius: "999px",
                  background: colors.surfaceBackground,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderColor}`,
                  textDecoration: "none",
                }}
              >
                GitHub
              </a>
            ) : null}
          </div>
        )}

        {mainLayout()}

        {renderCustomBlocks()}
      </div>
    </div>
  );
}

function inputStyle(colors) {
  return {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: "16px",
    border: `1px solid ${colors.borderColor}`,
    background: colors.pageBackground,
    color: colors.textPrimary,
    font: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };
}




