import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { publicAPI } from "../../api/api";
import { profileAPI } from "../users/editorAPI";

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
  SERVICES: "Services",
  EXHIBITIONS: "Exhibitions & Awards",
  BLOGS: "Blog",
  LANGUAGES: "Languages",
};

const SIDEBAR_KEYS = new Set(["SKILLS", "CERTIFICATIONS", "LANGUAGES", "SERVICES"]);

function parseLayoutConfig(layout) {
  try {
    if (!layout?.layoutConfigJson) return {};
    return typeof layout.layoutConfigJson === "string"
      ? JSON.parse(layout.layoutConfigJson)
      : layout.layoutConfigJson;
  } catch {
    return {};
  }
}

function normalizeTheme(theme) {
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
    return { background: `linear-gradient(${angle}deg, ${stops || `${colors.pageBackground}, ${colors.surfaceBackground}`})` };
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
    if (!Array.isArray(value) || value.length === 0) return;
    if (SIDEBAR_KEYS.has(key)) left[key] = value;
    else right[key] = value;
  });

  if (!Object.keys(left).length || !Object.keys(right).length) {
    const entries = Object.entries(sections || {}).filter(([, value]) => Array.isArray(value) && value.length);
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
    ? `http://127.0.0.1:8081${url}`
    : `http://127.0.0.1:8081/${url}`;
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

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    publicAPI
      .getPortfolio(slug)
      .then((res) => {
        if (!active) return;
        const data = res.data;
        setPortfolio(data);
        setProfile(data?.profile || null);
        if (data?.resumeId) {
          profileAPI
            .getPublic(data.resumeId)
            .then((nextProfile) => {
              if (active) setProfile(nextProfile);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const theme = useMemo(() => normalizeTheme(portfolio?.theme), [portfolio]);
  const layoutConfig = useMemo(() => parseLayoutConfig(portfolio?.layout), [portfolio]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading portfolio...</div>;
  if (notFound) return <div style={{ padding: "2rem" }}>Portfolio not found.</div>;
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
  const initials = getInitials(textName);
  const isHeroLayout = ["MODERN_GRID", "GRID", "BOLD_HEADER", "MAGAZINE", "SINGLE_COLUMN"].includes(layoutType);
  const heroBg = isHeroLayout ? colors.primary : colors.surfaceBackground;
  const heroText = getContrastText(heroBg, colors.textPrimary, "#fffaf2");
  const heroMuted = heroText === "#fffaf2" ? "rgba(255, 248, 235, 0.72)" : colors.textSecondary;
  const heroSoft = heroText === "#fffaf2" ? "rgba(255, 248, 235, 0.58)" : colors.textSecondary;

  const wrapperStyle = {
    ...backgroundStyle,
    minHeight: "100vh",
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
  };

  const titleFor = (key) => SECTION_LABELS[key] || key.replace(/_/g, " ");

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

    if (key === "PROJECTS" || key === "BLOGS" || key === "TESTIMONIALS" || key === "SERVICES") {
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
              {item.roleTitle ||
                item.degree ||
                item.title ||
                item.serviceTitle ||
                "Untitled"}
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

  const mainLayout = () => {
    if (layoutType === "LEFT_SIDEBAR" || layoutType === "RIGHT_SIDEBAR") {
      const sidebarFirst = layoutType === "LEFT_SIDEBAR";
      const aside = (
        <aside style={{ flex: "0 0 280px" }}>
          {renderSections(sidebarFirst ? sectionGroups.left : sectionGroups.right)}
        </aside>
      );
      const main = (
        <main style={{ flex: "1 1 0%" }}>
          {renderSections(sidebarFirst ? sectionGroups.right : sectionGroups.left)}
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
                  border: `1px solid ${heroText === "#fffaf2" ? "rgba(255,255,255,0.14)" : colors.borderColor}`,
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
      </div>
    </div>
  );
}
