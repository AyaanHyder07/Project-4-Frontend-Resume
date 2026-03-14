/**
 * LiveResumePreview.jsx
 * Right-side live preview panel for the Resume Creation Studio.
 *
 * Shows a real-time preview that updates as the user configures:
 * - Their name/profession (from cfg.professionType)
 * - Selected template layout style
 * - Selected theme colors + typography
 *
 * Click zones jump to relevant steps (same pattern as AdminThemeStudio).
 */

import { useState } from "react";

const LAYOUT_STYLES = {
  TWO_COLUMN: "split",
  LEFT_SIDEBAR: "sidebar",
  RIGHT_SIDEBAR: "sidebar",
  SINGLE_COLUMN: "single",
  BOLD_HEADER: "bold",
  MAGAZINE: "bold",
  MINIMALIST: "single",
  default: "single",
};

export default function LiveResumePreview({ cfg, theme, onZoneClick }) {
  const [hov, setHov] = useState(null);

  // Resolved colors — use theme if available, else sensible defaults
  const c = theme?.colorPalette || {};
  const ty = theme?.typography || {};
  const ef = theme?.effects || {};

  const primary = c.primary || "#1C1C1C";
  const accent = c.accent || "#4A6FA5";
  const secondary = c.secondary || "#8A8578";
  const pageBg = c.pageBackground || "#F5F3EE";
  const surfaceBg = c.surfaceBackground || "#EDEBE6";
  const textPrimary = c.textPrimary || "#1C1C1C";
  const textSecondary = c.textSecondary || "#5A5550";
  const tagBg = c.tagBackground || "#E5E8F0";
  const tagTxt = c.tagText || "#4A6FA5";

  const headingFont = ty.headingFont || "'Playfair Display', Georgia, serif";
  const bodyFont = ty.bodyFont || "'DM Sans', sans-serif";
  const headingWeight = ty.headingWeight || 700;
  const bodyLineHeight = ty.bodyLineHeight || 1.65;

  const borderRadius = ef.cardBorderRadius || "8px";
  const cardShadow = ef.cardShadow || "0 2px 8px rgba(0,0,0,0.06)";
  const cardBorder = ef.cardBorderStyle || "1px solid rgba(0,0,0,0.06)";

  const displayName =
    cfg.professionType
      ? `${cfg.professionType.split(" ").slice(0, 2).join(" ")}`
      : "Your Name";

  const profession = cfg.professionType || "Your Profession";
  const title = cfg.title || "My Portfolio";

  // Zone hover helper
  const zone = (id, jumpStep, label, children, extra = {}) => (
    <div
      onClick={() => onZoneClick(jumpStep)}
      onMouseEnter={() => setHov(id)}
      onMouseLeave={() => setHov(null)}
      title={`Click to edit: ${label}`}
      style={{
        cursor: "pointer",
        position: "relative",
        outline: hov === id ? `2px solid ${accent}` : "2px solid transparent",
        outlineOffset: 2,
        borderRadius: 6,
        transition: "outline 0.15s",
        ...extra,
      }}
    >
      {hov === id && (
        <div
          style={{
            position: "absolute",
            top: -18,
            left: 0,
            zIndex: 20,
            background: accent,
            color: "#fff",
            fontSize: 8,
            padding: "2px 7px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          ✏ {label}
        </div>
      )}
      {children}
    </div>
  );

  const cardSt = {
    borderRadius,
    boxShadow: cardShadow,
    border: cardBorder,
    background: surfaceBg,
    padding: "9px 11px",
    marginBottom: 7,
  };

  const headSt = {
    fontFamily: headingFont,
    fontWeight: headingWeight,
    color: textPrimary,
    lineHeight: 1.1,
  };

  const bodySt = {
    fontFamily: bodyFont,
    lineHeight: bodyLineHeight,
    color: textSecondary,
  };

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: `1.5px solid ${primary}22`,
        background: pageBg,
        fontSize: 10,
        minHeight: 340,
        position: "relative",
        transition: "all 0.3s",
      }}
    >
      {/* HEADER → Step 1: Basic Info */}
      {zone(
        "header",
        1,
        "Basic Info → Step 1",
        <div
          style={{
            background: primary,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              ...headSt,
              color: "#fff",
              fontSize: 16,
              marginBottom: 3,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              ...bodySt,
              color: "rgba(255,255,255,0.7)",
              fontSize: 8,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {profession}
          </div>
          <div
            style={{
              ...bodySt,
              color: "rgba(255,255,255,0.5)",
              fontSize: 7.5,
              marginTop: 5,
              fontStyle: "italic",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 7,
            }}
          >
            {["✉ hello@you.com", "✦ yoursite.com"].map((c, i) => (
              <span
                key={i}
                style={{
                  fontSize: 7.5,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: bodyFont,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", padding: "10px 12px", gap: 10 }}>
        {/* SIDEBAR (if template has sidebar layout) */}
        {cfg.templateId && (
          <div style={{ width: 72, flexShrink: 0 }}>
            {/* THEME ZONE → Step 3 */}
            {zone(
              "sidebar",
              3,
              "Theme → Step 3",
              <div>
                {/* Skills preview */}
                {["Skills", "Tools"].map((sec) => (
                  <div key={sec} style={{ marginBottom: 9 }}>
                    <div
                      style={{
                        fontSize: 6.5,
                        fontWeight: 700,
                        color: accent,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                        fontFamily: bodyFont,
                      }}
                    >
                      {sec}
                    </div>
                    {[80, 60, 90].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: 3,
                          background: primary + "15",
                          borderRadius: 2,
                          marginBottom: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: w + "%",
                            height: "100%",
                            background: `linear-gradient(90deg, ${primary}, ${accent})`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* TEMPLATE ZONE → Step 2 */}
          {zone(
            "template",
            2,
            "Template → Step 2",
            <div>
              {/* Experience */}
              <div style={cardSt}>
                <div
                  style={{
                    fontSize: 6.5,
                    fontWeight: 700,
                    color: accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderBottom: `1.5px solid ${accent}33`,
                    paddingBottom: 3,
                    marginBottom: 7,
                    fontFamily: bodyFont,
                  }}
                >
                  Experience
                </div>
                {["Senior Designer · Acme Corp", "UI Lead · StartupXYZ"].map(
                  (job, i) => (
                    <div key={i} style={{ marginBottom: 5 }}>
                      <div
                        style={{
                          ...headSt,
                          fontSize: 8,
                          marginBottom: 1,
                        }}
                      >
                        {job.split("·")[0]}
                      </div>
                      <div
                        style={{
                          ...bodySt,
                          fontSize: 7.5,
                          marginBottom: 3,
                        }}
                      >
                        {job.split("·").slice(1).join("·")}
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: primary + "10",
                          borderRadius: 2,
                          width: ["85%", "70%"][i],
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              {/* Education */}
              <div style={cardSt}>
                <div
                  style={{
                    fontSize: 6.5,
                    fontWeight: 700,
                    color: accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderBottom: `1.5px solid ${accent}33`,
                    paddingBottom: 3,
                    marginBottom: 7,
                    fontFamily: bodyFont,
                  }}
                >
                  Education
                </div>
                <div style={{ ...headSt, fontSize: 8 }}>
                  B.Design — University
                </div>
                <div style={{ ...bodySt, fontSize: 7.5 }}>
                  2015–2019 · GPA 3.9
                </div>
              </div>
            </div>
          )}

          {/* SKILLS CHIPS → Step 3: Theme */}
          {zone(
            "skills",
            3,
            "Theme → Step 3",
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Figma", "React", "UX", "Branding"].map((sk) => (
                <span
                  key={sk}
                  style={{
                    padding: "2px 7px",
                    borderRadius: 99,
                    background: tagBg,
                    color: tagTxt,
                    fontSize: 7.5,
                    border: `1px solid ${accent}33`,
                    fontFamily: bodyFont,
                  }}
                >
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint bar */}
      <div
        style={{
          padding: "5px 14px",
          background: `${primary}08`,
          borderTop: `1px solid ${primary}12`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#22c55e",
            animation: "shimmer 2s infinite",
          }}
        />
        <span
          style={{
            fontSize: 7.5,
            color: textSecondary,
            fontFamily: bodyFont,
            fontStyle: "italic",
          }}
        >
          Click any section to jump to its editor step
        </span>
      </div>

      {/* Palette strip */}
      {theme && (
        <div
          style={{
            display: "flex",
            height: 3,
          }}
        >
          {[primary, accent, secondary, surfaceBg, pageBg].map((col, i) => (
            <div
              key={i}
              style={{ flex: 1, background: col, transition: "background 0.3s" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}