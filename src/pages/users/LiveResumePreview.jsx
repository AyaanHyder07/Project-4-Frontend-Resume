import { useMemo } from "react";

const FAMILY_VARIANTS = {
  DEVFOLIO: "dev",
  STARTUPFOUNDER: "dev",
  CLASSICPRO: "classic",
  MLRESEARCH: "classic",
  LEGALLEDGER: "classic",
  CAREPULSE: "classic",
  DESIGNCASE: "editorial",
  WRITERSDESK: "editorial",
  LENSWORK: "gallery",
  ARTCANVAS: "gallery",
  MENTORHUB: "services",
  FREELANCERKIT: "services",
};

export default function LiveResumePreview({ cfg, onZoneClick }) {
  const theme = useMemo(() => resolveTheme(cfg?.defaultTheme), [cfg?.defaultTheme]);
  const sections = cfg?.sectionOrder?.length ? cfg.sectionOrder : cfg?.enabledSections || [];
  const templateKey = cfg?.templateKey || cfg?.renderFamily || "CLASSICPRO";
  const familyVariant = FAMILY_VARIANTS[templateKey] || "classic";
  const displayName = humanizeProfession(cfg?.professionType) || "Your Name";
  const profession = cfg?.professionType?.replace(/_/g, " ") || "Your profession";
  const title = cfg?.title?.trim() || "My Portfolio";

  return (
    <div style={{ ...styles.frame, background: theme.pageBackground, color: theme.textPrimary }}>
      <button type="button" onClick={() => onZoneClick(2)} style={{ ...styles.hero, background: theme.primary }}>
        <div>
          <div style={{ ...styles.eyebrow, color: rgba(theme.textOnPrimary, 0.72) }}>{templateKey}</div>
          <div style={{ ...styles.heroName, color: theme.textOnPrimary }}>{displayName}</div>
          <div style={{ ...styles.heroMeta, color: rgba(theme.textOnPrimary, 0.58) }}>{profession}</div>
          <div style={{ ...styles.heroTitle, color: rgba(theme.textOnPrimary, 0.78) }}>{title}</div>
        </div>
        <div style={styles.heroAccentWrap}>
          <span style={{ ...styles.heroAccent, background: theme.accent }} />
          <span style={{ ...styles.heroAccentLabel, color: rgba(theme.textOnPrimary, 0.72) }}>{cfg?.navStyle || "TOP_FIXED"}</span>
        </div>
      </button>

      <div style={styles.body}>
        <button type="button" onClick={() => onZoneClick(1)} style={styles.infoPill}>
          <span style={{ ...styles.infoLabel, color: theme.textMuted }}>Profession</span>
          <span style={{ ...styles.infoValue, color: theme.textPrimary }}>{profession}</span>
        </button>

        <button type="button" onClick={() => onZoneClick(2)} style={{ ...styles.templateCard, background: theme.surface }}>
          <div style={styles.sectionHeaderRow}>
            <span style={{ ...styles.sectionEyebrow, color: theme.accent }}>Template Structure</span>
            <span style={{ ...styles.planBadge, color: theme.textMuted }}>{cfg?.templatePlanLevel || "FREE"}</span>
          </div>
          <div style={styles.variantWrap}>
            {familyVariant === "dev" ? <DevVariant theme={theme} sections={sections} /> : null}
            {familyVariant === "classic" ? <ClassicVariant theme={theme} sections={sections} /> : null}
            {familyVariant === "editorial" ? <EditorialVariant theme={theme} sections={sections} /> : null}
            {familyVariant === "gallery" ? <GalleryVariant theme={theme} sections={sections} /> : null}
            {familyVariant === "services" ? <ServicesVariant theme={theme} sections={sections} /> : null}
          </div>
        </button>

        <button type="button" onClick={() => onZoneClick(3)} style={styles.infoBlock}>
          <div style={styles.sectionHeaderRow}>
            <span style={{ ...styles.sectionEyebrow, color: theme.accent }}>Included Sections</span>
            <span style={{ ...styles.infoHint, color: theme.textMuted }}>{sections.length || 0} blocks</span>
          </div>
          <div style={styles.sectionChips}>
            {(sections.length ? sections : ["PROFILE", "CONTACT", "PROJECTS"]).slice(0, 8).map((section) => (
              <span
                key={section}
                style={{
                  ...styles.sectionChip,
                  background: rgba(theme.accent, 0.1),
                  borderColor: rgba(theme.accent, 0.24),
                  color: theme.textPrimary,
                }}
              >
                {section.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </button>
      </div>

      <div style={styles.paletteBar}>
        {[theme.primary, theme.accent, theme.surface, theme.pageBackground, theme.textPrimary].map((color) => (
          <span key={color} style={{ ...styles.paletteSwatch, background: color }} />
        ))}
      </div>
    </div>
  );
}

function DevVariant({ theme, sections }) {
  return (
    <div style={styles.devWrap}>
      <div style={{ ...styles.devConsole, background: "#090909", color: "#F9FAFB", borderColor: rgba(theme.accent, 0.35) }}>
        <div style={styles.windowDots}>
          <span style={{ ...styles.windowDot, background: "#FF5F57" }} />
          <span style={{ ...styles.windowDot, background: "#FEBC2E" }} />
          <span style={{ ...styles.windowDot, background: "#28C840" }} />
        </div>
        <div style={{ ...styles.codeLine, width: "78%", background: rgba(theme.accent, 0.95) }} />
        <div style={{ ...styles.codeLine, width: "54%", background: "rgba(255,255,255,0.22)" }} />
        <div style={{ ...styles.codeLine, width: "66%", background: "rgba(255,255,255,0.16)" }} />
      </div>
      <div style={styles.devFooter}>
        {(sections.slice(0, 3).length ? sections.slice(0, 3) : ["SKILLS", "EXPERIENCE", "PROJECTS"]).map((section) => (
          <span key={section} style={{ ...styles.devTag, color: theme.textPrimary }}>{section.replace(/_/g, " ")}</span>
        ))}
      </div>
    </div>
  );
}

function ClassicVariant({ theme, sections }) {
  return (
    <div style={styles.classicWrap}>
      <div style={{ ...styles.classicSidebar, background: rgba(theme.primary, 0.08) }} />
      <div style={styles.classicMain}>
        {(sections.slice(0, 3).length ? sections.slice(0, 3) : ["EXPERIENCE", "EDUCATION", "SKILLS"]).map((section, index) => (
          <div key={section} style={{ ...styles.classicRow, opacity: 1 - index * 0.12 }}>
            <span style={{ ...styles.classicDate, color: theme.textMuted }}>202{index}</span>
            <span style={{ ...styles.classicLine, background: rgba(theme.textPrimary, 0.16) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorialVariant({ theme, sections }) {
  return (
    <div style={styles.editorialWrap}>
      <div style={{ ...styles.editorialRail, background: rgba(theme.accent, 0.12) }}>
        <span style={{ ...styles.editorialWord, color: theme.accent }}>Case Study</span>
      </div>
      <div style={styles.editorialMain}>
        <div style={{ ...styles.editorialHeadline, color: theme.textPrimary }}>Story-led blocks with a strong intro rail.</div>
        <div style={styles.editorialGrid}>
          {(sections.slice(0, 4).length ? sections.slice(0, 4) : ["PROJECTS", "SKILLS", "EXPERIENCE", "CONTACT"]).map((section) => (
            <span key={section} style={{ ...styles.editorialCard, background: rgba(theme.primary, 0.06) }}>{section.replace(/_/g, " ")}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryVariant({ theme, sections }) {
  return (
    <div style={styles.galleryWrap}>
      <div style={{ ...styles.galleryHero, background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 160%)` }} />
      <div style={styles.galleryGrid}>
        {(sections.slice(0, 3).length ? sections.slice(0, 3) : ["PROJECTS", "EXHIBITIONS", "CONTACT"]).map((section, index) => (
          <span key={section} style={{ ...styles.galleryTile, opacity: 1 - index * 0.12 }}>{section.replace(/_/g, " ")}</span>
        ))}
      </div>
    </div>
  );
}

function ServicesVariant({ theme, sections }) {
  return (
    <div style={styles.servicesWrap}>
      <div style={styles.servicesRow}>
        {[1, 2, 3].map((card) => (
          <span key={card} style={{ ...styles.serviceCard, background: rgba(theme.accent, 0.08), borderColor: rgba(theme.accent, 0.2) }} />
        ))}
      </div>
      <div style={styles.sectionChips}>
        {(sections.slice(0, 4).length ? sections.slice(0, 4) : ["SERVICES", "TESTIMONIALS", "EXPERIENCE", "CONTACT"]).map((section) => (
          <span key={section} style={{ ...styles.sectionChip, background: rgba(theme.primary, 0.06), borderColor: rgba(theme.primary, 0.12), color: theme.textPrimary }}>
            {section.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

function resolveTheme(defaultTheme) {
  const flat = defaultTheme || {};
  return {
    primary: flat.primaryColor || "#1C1C1C",
    accent: flat.accentColor || "#4A6FA5",
    pageBackground: flat.backgroundColor || "#F5F3EE",
    surface: rgba(flat.primaryColor || "#1C1C1C", 0.06),
    textPrimary: flat.textColor || "#1C1C1C",
    textMuted: rgba(flat.textColor || "#1C1C1C", 0.6),
    textOnPrimary: isDark(flat.primaryColor || "#1C1C1C") ? "#FFFFFF" : "#111111",
  };
}

function humanizeProfession(value) {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function rgba(hex, alpha) {
  const normalized = (hex || "#000000").replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  const red = Number.parseInt(safe.slice(0, 2), 16);
  const green = Number.parseInt(safe.slice(2, 4), 16);
  const blue = Number.parseInt(safe.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function isDark(hex) {
  const normalized = (hex || "#000000").replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  const red = Number.parseInt(safe.slice(0, 2), 16);
  const green = Number.parseInt(safe.slice(2, 4), 16);
  const blue = Number.parseInt(safe.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance < 0.55;
}

const styles = {
  frame: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(28,28,28,0.08)",
    minHeight: 420,
    display: "flex",
    flexDirection: "column",
  },
  hero: {
    border: "none",
    textAlign: "left",
    padding: "18px 18px 16px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    cursor: "pointer",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 18,
    lineHeight: 1.05,
    fontWeight: 800,
    marginBottom: 4,
  },
  heroMeta: {
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 6,
    fontWeight: 700,
  },
  heroTitle: {
    fontSize: 10,
    fontStyle: "italic",
  },
  heroAccentWrap: {
    display: "grid",
    justifyItems: "end",
    gap: 7,
  },
  heroAccent: {
    width: 42,
    height: 6,
    borderRadius: 999,
  },
  heroAccentLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  body: {
    padding: 14,
    display: "grid",
    gap: 12,
  },
  infoPill: {
    border: "1px solid rgba(28,28,28,0.08)",
    borderRadius: 12,
    background: "rgba(255,255,255,0.82)",
    padding: "10px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
  },
  infoLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontWeight: 700,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  templateCard: {
    border: "1px solid rgba(28,28,28,0.08)",
    borderRadius: 14,
    padding: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  infoBlock: {
    border: "1px solid rgba(28,28,28,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.82)",
    padding: 12,
    textAlign: "left",
    cursor: "pointer",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  planBadge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  infoHint: {
    fontSize: 10,
    fontWeight: 600,
  },
  variantWrap: {
    borderRadius: 12,
    overflow: "hidden",
    background: "rgba(255,255,255,0.88)",
  },
  devWrap: {
    display: "grid",
    gap: 10,
  },
  devConsole: {
    border: "1px solid",
    borderRadius: 12,
    padding: 10,
    minHeight: 106,
  },
  windowDots: {
    display: "flex",
    gap: 5,
    marginBottom: 12,
  },
  windowDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    display: "inline-block",
  },
  codeLine: {
    height: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  devFooter: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  devTag: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  classicWrap: {
    display: "grid",
    gridTemplateColumns: "72px 1fr",
    gap: 12,
    minHeight: 120,
  },
  classicSidebar: {
    borderRadius: 10,
  },
  classicMain: {
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  classicRow: {
    display: "grid",
    gridTemplateColumns: "48px 1fr",
    gap: 8,
    alignItems: "center",
  },
  classicDate: {
    fontSize: 9,
    fontWeight: 700,
  },
  classicLine: {
    height: 8,
    borderRadius: 999,
  },
  editorialWrap: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gap: 12,
    minHeight: 120,
  },
  editorialRail: {
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
  },
  editorialWord: {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  editorialMain: {
    display: "grid",
    gap: 10,
  },
  editorialHeadline: {
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: 700,
  },
  editorialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  editorialCard: {
    borderRadius: 10,
    padding: "10px 8px",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  galleryWrap: {
    display: "grid",
    gap: 8,
    minHeight: 120,
  },
  galleryHero: {
    height: 74,
    borderRadius: 12,
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr",
    gap: 8,
  },
  galleryTile: {
    borderRadius: 10,
    background: "rgba(17,17,17,0.12)",
    color: "#fff",
    minHeight: 44,
    display: "grid",
    placeItems: "center",
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  servicesWrap: {
    display: "grid",
    gap: 10,
    minHeight: 120,
  },
  servicesRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  serviceCard: {
    borderRadius: 12,
    height: 74,
    border: "1px solid",
    display: "block",
  },
  sectionChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
  },
  sectionChip: {
    borderRadius: 999,
    padding: "5px 8px",
    border: "1px solid",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  paletteBar: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    height: 8,
    marginTop: "auto",
  },
  paletteSwatch: {
    display: "block",
  },
};
