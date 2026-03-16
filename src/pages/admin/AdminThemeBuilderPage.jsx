// AdminThemeStudioPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full Theme Studio  •  Steps: Colors → Typography → Background → Effects →
//                             Layout → Audience → Publish
// • Real-time live preview (click any zone to jump to that editor step)
// • html2canvas screenshot → /api/admin/upload/preview → Cloudinary URL stored
// • Maps to new backend DTOs: colorPalette, background (gradient/texture),
//   typography (every property), effects (grain, glass, neumorphism, dividers)
// • Layout + Template created atomically in one publish flow
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useRef, useCallback } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminThemeAPI, adminLayoutAPI, adminTemplateAPI } from "../../api/api";

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES INJECTION
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&family=Raleway:wght@300;400;600;700&family=Josefin+Sans:wght@300;400;600&family=Merriweather:wght@300;400;700&family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

@keyframes studioFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes studioPop { 0%{transform:scale(0.85);opacity:0} 65%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes studioSlide { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
@keyframes checkBounce { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }

.ts-fade  { animation: studioFadeUp  0.38s cubic-bezier(0.16,1,0.3,1) both; }
.ts-pop   { animation: studioPop     0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
.ts-slide { animation: studioSlide   0.28s cubic-bezier(0.16,1,0.3,1) both; }

input[type=range] { -webkit-appearance:none; height:5px; border-radius:99px; outline:none; cursor:pointer; background:transparent; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#1a1a2e; border:2.5px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.25); cursor:pointer; transition:transform 0.15s; }
input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.2); }

.studio-scroll::-webkit-scrollbar { width:4px; }
.studio-scroll::-webkit-scrollbar-track { background:transparent; }
.studio-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
`;

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const STEP_CFG = [
  { id: 1, icon: "🎨", label: "Colors", short: "Palette & Mood" },
  { id: 2, icon: "Aa", label: "Typography", short: "Fonts & Sizes" },
  { id: 3, icon: "🖼", label: "Background", short: "Gradients & Texture" },
  { id: 4, icon: "✨", label: "Effects", short: "Cards & Motion" },
  { id: 5, icon: "📐", label: "Layout", short: "Structure & Zones" },
  { id: 6, icon: "🎯", label: "Audience", short: "Who It's For" },
  { id: 7, icon: "🚀", label: "Publish", short: "Review & Launch" },
];

const FONTS = [
  {
    label: "Fraunces",
    val: "'Fraunces',Georgia,serif",
    cat: "Serif",
    vibe: "Unique · Literary",
  },
  {
    label: "Cormorant Garamond",
    val: "'Cormorant Garamond',Georgia,serif",
    cat: "Serif",
    vibe: "Editorial · Luxury",
  },
  {
    label: "Playfair Display",
    val: "'Playfair Display',Georgia,serif",
    cat: "Serif",
    vibe: "Classic · Magazine",
  },
  {
    label: "Lora",
    val: "'Lora',Georgia,serif",
    cat: "Serif",
    vibe: "Academic · Warm",
  },
  {
    label: "Merriweather",
    val: "'Merriweather',Georgia,serif",
    cat: "Serif",
    vibe: "Corporate · Trust",
  },
  {
    label: "DM Sans",
    val: "'DM Sans',sans-serif",
    cat: "Sans",
    vibe: "Tech · Startup",
  },
  {
    label: "Outfit",
    val: "'Outfit',sans-serif",
    cat: "Sans",
    vibe: "Modern · Clean",
  },
  {
    label: "Raleway",
    val: "'Raleway',sans-serif",
    cat: "Sans",
    vibe: "Design · Agency",
  },
  {
    label: "Josefin Sans",
    val: "'Josefin Sans',sans-serif",
    cat: "Sans",
    vibe: "Minimal · Swedish",
  },
  {
    label: "Bebas Neue",
    val: "'Bebas Neue',sans-serif",
    cat: "Display",
    vibe: "Fashion · Sports",
  },
  {
    label: "Space Mono",
    val: "'Space Mono',monospace",
    cat: "Mono",
    vibe: "Developer · Cyber",
  },
];

const QUICK_PALETTES = [
  {
    name: "Obsidian",
    bg: "#F5F3EE",
    pri: "#1C1C1C",
    sec: "#8A8578",
    acc: "#4A6FA5",
    txt: "#1C1C1C",
    sur: "#EDEBE6",
  },
  {
    name: "Midnight",
    bg: "#0f172a",
    pri: "#e2e8f0",
    sec: "#94a3b8",
    acc: "#38bdf8",
    txt: "#f1f5f9",
    sur: "#1e293b",
  },
  {
    name: "Rose Noir",
    bg: "#FFF1F2",
    pri: "#881337",
    sec: "#be123c",
    acc: "#f43f5e",
    txt: "#1c0a0d",
    sur: "#FFE4E6",
  },
  {
    name: "Amethyst",
    bg: "#FAF5FF",
    pri: "#4c1d95",
    sec: "#7c3aed",
    acc: "#a78bfa",
    txt: "#1e1b4b",
    sur: "#EDE9FE",
  },
  {
    name: "Forest",
    bg: "#F0F4F0",
    pri: "#1a3320",
    sec: "#4a7a5a",
    acc: "#22c55e",
    txt: "#1a2e1a",
    sur: "#DCFCE7",
  },
  {
    name: "Copper",
    bg: "#FEFCE8",
    pri: "#713f12",
    sec: "#a16207",
    acc: "#d97706",
    txt: "#422006",
    sur: "#FEF9C3",
  },
  {
    name: "Glacier",
    bg: "#F0F9FF",
    pri: "#0c4a6e",
    sec: "#0284c7",
    acc: "#38bdf8",
    txt: "#082f49",
    sur: "#E0F2FE",
  },
  {
    name: "Neon Noir",
    bg: "#0a0a10",
    pri: "#ff2d78",
    sec: "#8b5cf6",
    acc: "#00f5d4",
    txt: "#f0f0ff",
    sur: "#16162a",
  },
];

const MOODS = [
  {
    id: "CLEAN_MINIMAL",
    label: "Clean Minimal",
    emoji: "○",
    desc: "Whitespace, light",
  },
  {
    id: "BOLD_VIBRANT",
    label: "Bold Vibrant",
    emoji: "⚡",
    desc: "High contrast, vivid",
  },
  {
    id: "DARK_DRAMATIC",
    label: "Dark Dramatic",
    emoji: "🌑",
    desc: "Dark, glows, depth",
  },
  {
    id: "EARTHY_ORGANIC",
    label: "Earthy Organic",
    emoji: "🌿",
    desc: "Muted, natural",
  },
  {
    id: "LUXURY_ELEGANT",
    label: "Luxury Elegant",
    emoji: "✦",
    desc: "Gold, serif, editorial",
  },
  {
    id: "PLAYFUL_QUIRKY",
    label: "Playful Quirky",
    emoji: "🎈",
    desc: "Pastels, rounded, fun",
  },
  {
    id: "CORPORATE_FORMAL",
    label: "Corporate Formal",
    emoji: "🏢",
    desc: "Navy, structured",
  },
  {
    id: "RETRO_VINTAGE",
    label: "Retro Vintage",
    emoji: "📼",
    desc: "Aged, worn textures",
  },
  {
    id: "FUTURISTIC_TECH",
    label: "Futuristic Tech",
    emoji: "🤖",
    desc: "Neon, grid, dark",
  },
  {
    id: "ARTISTIC_EXPRESSIVE",
    label: "Artistic Expressive",
    emoji: "🖌",
    desc: "Painterly, creative",
  },
];

const TEXTURE_TYPES = [
  { id: "NONE", label: "None", emoji: "○" },
  { id: "GRAIN", label: "Film Grain", emoji: "◌" },
  { id: "PAPER", label: "Paper", emoji: "📄" },
  { id: "CANVAS", label: "Canvas", emoji: "🎨" },
  { id: "CONCRETE", label: "Concrete", emoji: "🪨" },
  { id: "MARBLE", label: "Marble", emoji: "💎" },
  { id: "WATERCOLOR_WASH", label: "Watercolor", emoji: "🌊" },
  { id: "HALFTONE", label: "Halftone", emoji: "◉" },
  { id: "TOPOGRAPHIC", label: "Topographic", emoji: "🗺" },
  { id: "GLASS_FROSTED", label: "Frosted Glass", emoji: "🔮" },
];

const GRADIENT_TYPES = [
  { id: "LINEAR", label: "Linear", emoji: "↗" },
  { id: "RADIAL", label: "Radial", emoji: "◎" },
  { id: "CONIC", label: "Conic", emoji: "🌀" },
];

const LAYOUT_TYPES = [
  {
    id: "SINGLE_COLUMN",
    label: "Classic",
    emoji: "📄",
    desc: "ATS-safe, universal",
  },
  { id: "TWO_COLUMN", label: "Split", emoji: "⚡", desc: "Equal balance" },
  {
    id: "LEFT_SIDEBAR",
    label: "Sidebar L",
    emoji: "◧",
    desc: "Dark sidebar + main",
  },
  {
    id: "RIGHT_SIDEBAR",
    label: "Sidebar R",
    emoji: "◨",
    desc: "Content first",
  },
  { id: "MODERN_GRID", label: "Grid", emoji: "⊞", desc: "Structured sections" },
  { id: "MASONRY", label: "Masonry", emoji: "🧱", desc: "Dynamic flow" },
  { id: "GALLERY", label: "Gallery", emoji: "🖼", desc: "Visual-first" },
  { id: "TIMELINE", label: "Timeline", emoji: "📅", desc: "Career story" },
  {
    id: "INFOGRAPHIC",
    label: "Infographic",
    emoji: "📊",
    desc: "Stats & data",
  },
  {
    id: "BOLD_HEADER",
    label: "Bold Header",
    emoji: "🎯",
    desc: "Full-bleed hero",
  },
  { id: "MINIMALIST", label: "Minimalist", emoji: "◻", desc: "Ultra refined" },
  { id: "MAGAZINE", label: "Magazine", emoji: "📖", desc: "Editorial drama" },
];

const AUDIENCES = [
  "ARTIST",
  "PHOTOGRAPHER",
  "ILLUSTRATOR",
  "GRAPHIC_DESIGNER",
  "MUSICIAN",
  "SINGER",
  "DANCER",
  "ACTOR",
  "FILMMAKER",
  "WRITER",
  "JOURNALIST",
  "SOFTWARE_ENGINEER",
  "DATA_SCIENTIST",
  "PRODUCT_MANAGER",
  "UX_DESIGNER",
  "GAME_DEVELOPER",
  "DOCTOR",
  "NURSE",
  "THERAPIST",
  "LAWYER",
  "ACADEMIC",
  "RESEARCHER",
  "FINANCIAL_ANALYST",
  "CONSULTANT",
  "ARCHITECT",
  "ENGINEER",
  "ENTREPRENEUR",
  "FOUNDER",
  "COACH",
  "SPEAKER",
  "STUDENT",
  "EXECUTIVE",
  "FREELANCER",
];

const SECTIONS_ALL = [
  "PROFILE",
  "EXPERIENCE",
  "EDUCATION",
  "PROJECTS",
  "PROJECT_GALLERY",
  "SKILLS",
  "CERTIFICATIONS",
  "FINANCIAL_CREDENTIALS",
  "PUBLICATIONS",
  "BLOG_POSTS",
  "MEDIA_APPEARANCES",
  "EXHIBITIONS_AWARDS",
  "TESTIMONIALS",
  "SERVICE_OFFERINGS",
  "CONTACT",
];

const PLAN_LEVELS = [
  { id: "FREE", emoji: "🆓", label: "Free", desc: "Everyone" },
  { id: "BASIC", emoji: "⭐", label: "Basic", desc: "Basic plan+" },
  { id: "PRO", emoji: "💎", label: "Pro", desc: "Pro subscribers" },
  { id: "PREMIUM", emoji: "👑", label: "Premium", desc: "Top tier only" },
];

/* ══════════════════════════════════════════════════════════════
   DEFAULT STATE
══════════════════════════════════════════════════════════════ */
const DEF = {
  name: "",
  description: "",
  tagline: "",
  featured: false,
  mood: "CLEAN_MINIMAL",
  requiredPlan: "FREE",
  targetAudiences: [],
  // color palette (all 14 fields)
  primary: "#1C1C1C",
  secondary: "#8A8578",
  accent: "#4A6FA5",
  surfaceBackground: "#EDEBE6",
  pageBackground: "#F5F3EE",
  textPrimary: "#1C1C1C",
  textSecondary: "#5A5550",
  textMuted: "#9A9590",
  borderColor: "#D5D3CE",
  dividerColor: "#E5E3DE",
  glowColor: "#4A6FA5",
  shadowColor: "rgba(0,0,0,0.15)",
  tagBackground: "#E5E8F0",
  tagText: "#4A6FA5",
  // background
  bgType: "SOLID",
  solidColor: "#F5F3EE",
  gradientType: "LINEAR",
  gradientAngle: 135,
  gradientStops: [
    { color: "#4A6FA5", position: 0 },
    { color: "#1C1C1C", position: 100 },
  ],
  grainy: false,
  grainIntensity: 30,
  textureType: "NONE",
  textureOpacity: 40,
  textureBlendMode: "overlay",
  imageUrl: "",
  imageBlendMode: "normal",
  imageOpacity: 100,
  // typography
  headingFont: "'Cormorant Garamond',Georgia,serif",
  bodyFont: "'DM Sans',sans-serif",
  accentFont: "",
  baseSize: 1.0,
  headingScale: 2.5,
  subheadingScale: 1.5,
  headingWeight: 700,
  bodyWeight: 400,
  headingTransform: "none",
  headingStyle: "normal",
  headingLetterSpacing: 0,
  bodyLineHeight: 1.65,
  headingLineHeight: 1.1,
  // effects
  cardBorderRadius: "8px",
  cardShadow: "0 4px 16px rgba(0,0,0,0.08)",
  cardBorderStyle: "1px solid rgba(0,0,0,0.06)",
  cardBackdropFilter: "",
  enableScrollReveal: true,
  enableHoverLift: true,
  enableParallax: false,
  transitionSpeed: "medium",
  enableGlassmorphism: false,
  enableNeumorphism: false,
  enableGrain: false,
  globalGrainIntensity: 25,
  sectionDividerStyle: "none",
  // layout
  layoutType: "LEFT_SIDEBAR",
  supportedSections: [...SECTIONS_ALL],
  requiredSections: ["PROFILE", "CONTACT"],
};

/* ══════════════════════════════════════════════════════════════
   PAYLOAD BUILDER
══════════════════════════════════════════════════════════════ */
function buildPayload(cfg, previewUrl) {
  return {
    name: cfg.name,
    description: cfg.description,
    tagline: cfg.tagline,
    featured: cfg.featured,
    mood: cfg.mood,
    targetAudiences: cfg.targetAudiences,
    requiredPlan: cfg.requiredPlan,
    previewImageUrl: previewUrl || null,
    colorPalette: {
      primary: cfg.primary,
      secondary: cfg.secondary,
      accent: cfg.accent,
      surfaceBackground: cfg.surfaceBackground,
      pageBackground: cfg.pageBackground,
      textPrimary: cfg.textPrimary,
      textSecondary: cfg.textSecondary,
      textMuted: cfg.textMuted,
      borderColor: cfg.borderColor,
      dividerColor: cfg.dividerColor,
      glowColor: cfg.glowColor,
      shadowColor: cfg.shadowColor,
      tagBackground: cfg.tagBackground,
      tagText: cfg.tagText,
    },
    background: {
      type: cfg.bgType,
      solidColor: cfg.bgType === "SOLID" ? cfg.solidColor : null,
      gradient:
        cfg.bgType === "GRADIENT"
          ? {
              gradientType: cfg.gradientType,
              angle: cfg.gradientAngle + "deg",
              stops: cfg.gradientStops.map((s) => ({
                color: s.color,
                position: s.position + "%",
              })),
              grainy: cfg.grainy,
              grainIntensity: cfg.grainy ? cfg.grainIntensity : null,
            }
          : null,
      textureOverlay:
        cfg.textureType !== "NONE"
          ? {
              textureType: cfg.textureType,
              opacity: cfg.textureOpacity,
              blendMode: cfg.textureBlendMode,
            }
          : null,
      imageUrl: cfg.bgType === "IMAGE" ? cfg.imageUrl : null,
      imageBlendMode: cfg.imageBlendMode,
      imageOpacity: cfg.imageOpacity,
    },
    typography: {
      headingFont: cfg.headingFont,
      bodyFont: cfg.bodyFont,
      accentFont: cfg.accentFont || null,
      baseSize: cfg.baseSize,
      headingScale: cfg.headingScale,
      subheadingScale: cfg.subheadingScale,
      headingWeight: cfg.headingWeight,
      bodyWeight: cfg.bodyWeight,
      headingTransform: cfg.headingTransform,
      headingStyle: cfg.headingStyle,
      headingLetterSpacing: cfg.headingLetterSpacing,
      bodyLineHeight: cfg.bodyLineHeight,
      headingLineHeight: cfg.headingLineHeight,
    },
    effects: {
      cardBorderRadius: cfg.cardBorderRadius,
      cardShadow: cfg.cardShadow,
      cardBorderStyle: cfg.cardBorderStyle,
      cardBackdropFilter: cfg.cardBackdropFilter || null,
      enableScrollReveal: cfg.enableScrollReveal,
      enableHoverLift: cfg.enableHoverLift,
      enableParallax: cfg.enableParallax,
      transitionSpeed: cfg.transitionSpeed,
      enableGlassmorphism: cfg.enableGlassmorphism,
      enableNeumorphism: cfg.enableNeumorphism,
      enableGrain: cfg.enableGrain,
      globalGrainIntensity: cfg.enableGrain ? cfg.globalGrainIntensity : null,
      sectionDividerStyle: cfg.sectionDividerStyle,
    },
  };
}

/* ══════════════════════════════════════════════════════════════
   UI ATOMS
══════════════════════════════════════════════════════════════ */
const iBase = {
  width: "100%",
  border: "1.5px solid #e8eaf0",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "#1a1a2e",
  outline: "none",
  background: "#f8f9fc",
  fontFamily: "system-ui",
  transition: "border-color 0.15s",
  display: "block",
};

const SLabel = ({ children, sub }) => (
  <div style={{ marginBottom: 7 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#1a1a2e",
        fontFamily: "'Outfit',sans-serif",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </div>
    {sub && (
      <div
        style={{
          fontSize: 10,
          color: "#94a3b8",
          marginTop: 2,
          fontFamily: "system-ui",
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

const SInput = ({ value, onChange, placeholder, style = {} }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ ...iBase, ...style }}
  />
);

const SSlider = ({
  label,
  val,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
      }}
    >
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "#374151",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Space Mono',monospace",
          color: "#4f46e5",
          fontWeight: 700,
          background: "#eef2ff",
          padding: "2px 8px",
          borderRadius: 6,
        }}
      >
        {val}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: "100%",
        background: `linear-gradient(to right,#1a1a2e ${((val - min) / (max - min)) * 100}%,#e2e8f0 0%)`,
      }}
    />
    <div
      style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}
    >
      <span style={{ fontSize: 9, color: "#cbd5e1", fontFamily: "system-ui" }}>
        {min}
        {unit}
      </span>
      <span style={{ fontSize: 9, color: "#cbd5e1", fontFamily: "system-ui" }}>
        {max}
        {unit}
      </span>
    </div>
  </div>
);

const SToggle = ({ val, onChange, label, sub, accent = "#1a1a2e" }) => (
  <div
    onClick={() => onChange(!val)}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 14px",
      borderRadius: 12,
      background: val ? accent : "#f8f9fc",
      border: `1.5px solid ${val ? accent : "#e8eaf0"}`,
      cursor: "pointer",
      transition: "all 0.2s",
      marginBottom: 8,
    }}
  >
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: val ? "#fff" : "#374151",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: val ? "rgba(255,255,255,0.7)" : "#94a3b8",
            fontFamily: "system-ui",
          }}
        >
          {sub}
        </div>
      )}
    </div>
    <div
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: val ? "rgba(255,255,255,0.35)" : "#d1d5db",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: val ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  </div>
);

const SSelect = ({ label, val, onChange, options, sub }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <SLabel sub={sub}>{label}</SLabel>}
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...iBase, cursor: "pointer" }}
    >
      {options.map((o) => (
        <option key={o.id || o} value={o.id || o}>
          {o.label || o}
        </option>
      ))}
    </select>
  </div>
);

const CPicker = ({ val, onChange, label }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
    }}
  >
    <div style={{ position: "relative", width: 40, height: 40 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: val,
          border: "2.5px solid rgba(0,0,0,0.08)",
          boxShadow: `0 2px 10px ${val}55`,
          cursor: "pointer",
          transition: "box-shadow 0.2s",
        }}
      />
      <input
        type="color"
        value={val}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          cursor: "pointer",
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
    {label && (
      <div
        style={{
          fontSize: 9,
          color: "#64748b",
          textAlign: "center",
          maxWidth: 44,
          lineHeight: 1.3,
          fontFamily: "system-ui",
        }}
      >
        {label}
      </div>
    )}
  </div>
);

const BtnPrimary = ({ children, onClick, disabled, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: "#1a1a2e",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "12px 24px",
      fontSize: 13,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'Outfit',sans-serif",
      boxShadow: "0 4px 16px rgba(26,26,46,0.22)",
      transition: "all 0.2s",
      opacity: disabled ? 0.65 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

const BtnGhost = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      background: "#f1f5f9",
      color: "#475569",
      border: "none",
      borderRadius: 12,
      padding: "12px 20px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Outfit',sans-serif",
      ...style,
    }}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════════
   LIVE PREVIEW
══════════════════════════════════════════════════════════════ */
function LivePreview({ cfg, onZoneClick }) {
  const [hov, setHov] = useState(null);
  const ff = cfg.headingFont,
    bf = cfg.bodyFont;
  const p = cfg.primary,
    acc = cfg.accent,
    sec = cfg.secondary;
  const bg = cfg.pageBackground,
    sur = cfg.surfaceBackground;
  const tx = cfg.textPrimary,
    ts = cfg.textSecondary;
  const br = cfg.cardBorderRadius;

  let bgCSS = {};
  if (cfg.bgType === "SOLID") bgCSS = { background: cfg.solidColor };
  else if (cfg.bgType === "GRADIENT") {
    const stops = cfg.gradientStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(",");
    const g =
      cfg.gradientType === "RADIAL"
        ? `radial-gradient(circle,${stops})`
        : cfg.gradientType === "CONIC"
          ? `conic-gradient(${stops})`
          : `linear-gradient(${cfg.gradientAngle}deg,${stops})`;
    bgCSS = { background: g };
  } else if (cfg.bgType === "IMAGE" && cfg.imageUrl)
    bgCSS = {
      backgroundImage: `url(${cfg.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  else bgCSS = { background: bg };

  const headSt = {
    fontFamily: ff,
    fontWeight: cfg.headingWeight,
    fontStyle: cfg.headingStyle,
    letterSpacing: cfg.headingLetterSpacing + "em",
    textTransform: cfg.headingTransform,
    lineHeight: cfg.headingLineHeight,
    transition: "all 0.3s",
  };
  const bodySt = {
    fontFamily: bf,
    fontWeight: cfg.bodyWeight,
    lineHeight: cfg.bodyLineHeight,
  };

  const zoneBtn = (zone, jumpStep, title, children, extraStyle = {}) => (
    <div
      onClick={() => onZoneClick(jumpStep)}
      title={`Click to edit: ${title}`}
      onMouseEnter={() => setHov(zone)}
      onMouseLeave={() => setHov(null)}
      style={{
        cursor: "pointer",
        position: "relative",
        outline: hov === zone ? "2.5px solid #4f46e5" : "2px solid transparent",
        outlineOffset: 2,
        borderRadius: 6,
        transition: "outline 0.2s",
        ...extraStyle,
      }}
    >
      {hov === zone && (
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 0,
            zIndex: 20,
            background: "#4f46e5",
            color: "#fff",
            fontSize: 8.5,
            padding: "2px 8px",
            borderRadius: 4,
            fontFamily: "system-ui",
            whiteSpace: "nowrap",
          }}
        >
          ✏ Edit: {title}
        </div>
      )}
      {children}
    </div>
  );

  const cardSt = {
    borderRadius: br,
    boxShadow: cfg.cardShadow,
    border: cfg.cardBorderStyle,
    background: cfg.enableGlassmorphism ? `${sur}cc` : sur,
    backdropFilter: cfg.enableGlassmorphism
      ? cfg.cardBackdropFilter || "blur(10px)"
      : "none",
    transition: "all 0.3s",
  };

  const grainVisible =
    cfg.enableGrain || (cfg.bgType === "GRADIENT" && cfg.grainy);

  return (
    <div
      style={{
        ...bgCSS,
        borderRadius: 14,
        overflow: "hidden",
        border: `1.5px solid ${p}22`,
        boxShadow: "0 6px 32px rgba(0,0,0,0.12)",
        position: "relative",
        fontSize: 11,
        minHeight: 360,
      }}
    >
      {grainVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 5,
            opacity:
              (cfg.enableGrain
                ? cfg.globalGrainIntensity
                : cfg.grainIntensity) / 200,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* HEADER → step 1: Colors */}
      {zoneBtn(
        "header",
        1,
        "Colors → Step 1",
        <div
          style={{
            background: p,
            padding: "16px 18px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              ...headSt,
              color: "#fff",
              fontSize: cfg.headingScale * cfg.baseSize * 8 + "px",
              marginBottom: 3,
            }}
          >
            Alexandra Chen
          </div>
          <div
            style={{
              ...bodySt,
              color: "rgba(255,255,255,0.72)",
              fontSize: 8,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            Senior Designer · New York
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {["✉ hi@alex.co", "✦ +1 555 0101"].map((c, i) => (
              <span
                key={i}
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "system-ui",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>,
        { zIndex: 2 },
      )}

      <div
        style={{ display: "flex", ...bgCSS, position: "relative", zIndex: 2 }}
      >
        {/* SIDEBAR → step 4: Effects */}
        {(cfg.layoutType === "LEFT_SIDEBAR" ||
          cfg.layoutType === "RIGHT_SIDEBAR") &&
          zoneBtn(
            "sidebar",
            4,
            "Effects → Step 4",
            <div
              style={{
                ...cardSt,
                width: 90,
                padding: "12px 10px",
                borderRadius: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: acc + "33",
                  border: `2px solid ${acc}77`,
                  marginBottom: 10,
                }}
              />
              {["Skills", "Languages", "Contact"].map((label, i) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      color: acc,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 3,
                      fontFamily: bf,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: tx + "18",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: [80, 60, 95][i] + "%",
                        height: "100%",
                        background: `linear-gradient(90deg,${p},${acc})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>,
          )}

        <div style={{ flex: 1, padding: "12px 14px" }}>
          {/* EXPERIENCE → step 5: Layout */}
          {zoneBtn(
            "exp",
            5,
            "Layout → Step 5",
            <div style={{ ...cardSt, padding: "10px 12px", marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  color: acc,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  borderBottom: `1.5px solid ${acc}44`,
                  paddingBottom: 3,
                  marginBottom: 8,
                  fontFamily: bf,
                }}
              >
                Experience
              </div>
              {[
                "Senior Designer · Acme Corp · 2021–Now",
                "UI Engineer · StartupXYZ · 2019–21",
              ].map((j, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      ...headSt,
                      fontSize: 9,
                      color: tx,
                      marginBottom: 1,
                    }}
                  >
                    {j.split("·")[0]}
                  </div>
                  <div
                    style={{
                      ...bodySt,
                      fontSize: 8,
                      color: ts,
                      marginBottom: 3,
                    }}
                  >
                    {j.split("·").slice(1).join("·")}
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: tx + "10",
                      borderRadius: 2,
                      width: ["88%", "72%"][i],
                    }}
                  />
                </div>
              ))}
            </div>,
          )}

          {/* EDUCATION → step 2: Typography */}
          {zoneBtn(
            "typo",
            2,
            "Typography → Step 2",
            <div style={{ ...cardSt, padding: "10px 12px", marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  color: acc,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  borderBottom: `1.5px solid ${acc}44`,
                  paddingBottom: 3,
                  marginBottom: 8,
                  fontFamily: bf,
                }}
              >
                Education
              </div>
              <div style={{ ...headSt, fontSize: 9, color: tx }}>
                B.Design — State University
              </div>
              <div style={{ ...bodySt, fontSize: 8, color: ts }}>
                2015–2019 · GPA 3.9
              </div>
            </div>,
          )}

          {/* SKILLS CHIPS → step 3: Background */}
          {zoneBtn(
            "skills",
            3,
            "Background → Step 3",
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Figma", "React", "UX Research", "Branding"].map((sk) => (
                <span
                  key={sk}
                  style={{
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: cfg.tagBackground,
                    color: cfg.tagText,
                    fontSize: 8,
                    border: `1px solid ${acc}44`,
                    fontFamily: bf,
                    transition: "all 0.3s",
                  }}
                >
                  {sk}
                </span>
              ))}
            </div>,
          )}
        </div>
      </div>

      <div
        style={{
          padding: "7px 18px",
          background: `${p}08`,
          borderTop: `1px solid ${p}12`,
          display: "flex",
          alignItems: "center",
          gap: 7,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
            animation: "shimmer 2s infinite",
          }}
        />
        <span
          style={{
            fontSize: 8.5,
            color: ts,
            fontFamily: "system-ui",
            fontStyle: "italic",
          }}
        >
          Click any section to jump to its editor
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP PANELS
══════════════════════════════════════════════════════════════ */
function PanelColors({ cfg, set }) {
  return (
    <div className="ts-fade">
      <SInput
        value={cfg.name}
        onChange={(v) => set("name", v)}
        placeholder="Theme name e.g. Obsidian Noir…"
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 10,
          fontFamily: "'Outfit',sans-serif",
        }}
      />
      <SInput
        value={cfg.description}
        onChange={(v) => set("description", v)}
        placeholder="Brief description (optional)"
        style={{ marginBottom: 20 }}
      />

      <SLabel sub="Tap any to apply all colors instantly">
        Quick Palettes
      </SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}
      >
        {QUICK_PALETTES.map((pal) => (
          <button
            key={pal.name}
            onClick={() => {
              set("primary", pal.pri);
              set("secondary", pal.sec);
              set("accent", pal.acc);
              set("pageBackground", pal.bg);
              set("surfaceBackground", pal.sur);
              set("textPrimary", pal.txt);
              set("textSecondary", pal.sec);
              set("solidColor", pal.bg);
            }}
            style={{
              background: "#fff",
              border: "1.5px solid #e8eaf0",
              borderRadius: 10,
              padding: "7px 10px",
              cursor: "pointer",
              minWidth: 72,
              transition: "all 0.15s",
              fontFamily: "system-ui",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                display: "flex",
                height: 14,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              {[pal.pri, pal.acc, pal.sec, pal.bg].map((c, i) => (
                <div key={i} style={{ flex: 1, background: c }} />
              ))}
            </div>
            <div style={{ fontSize: 9, color: "#475569" }}>{pal.name}</div>
          </button>
        ))}
      </div>

      <SLabel sub="Fine-tune every color — 14 total controls">
        Full Color Control
      </SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 10,
          marginBottom: 22,
        }}
      >
        {[
          { k: "primary", l: "Primary" },
          { k: "secondary", l: "Secondary" },
          { k: "accent", l: "Accent" },
          { k: "pageBackground", l: "Page BG" },
          { k: "surfaceBackground", l: "Surface" },
          { k: "textPrimary", l: "Text" },
          { k: "textSecondary", l: "Text 2" },
          { k: "textMuted", l: "Muted" },
          { k: "borderColor", l: "Border" },
          { k: "dividerColor", l: "Divider" },
          { k: "glowColor", l: "Glow" },
          { k: "tagBackground", l: "Tag BG" },
          { k: "tagText", l: "Tag Text" },
          { k: "shadowColor", l: "Shadow" },
        ].map(({ k, l }) => (
          <CPicker
            key={k}
            val={cfg[k] || "#cccccc"}
            onChange={(v) => set(k, v)}
            label={l}
          />
        ))}
      </div>

      <SLabel sub="Sets the overall personality of this theme">
        Visual Mood
      </SLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {MOODS.map((m) => {
          const on = cfg.mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => set("mood", m.id)}
              style={{
                padding: "9px 11px",
                borderRadius: 11,
                textAlign: "left",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700 }}>{m.label}</div>
              <div
                style={{ fontSize: 9, opacity: 0.6, fontFamily: "system-ui" }}
              >
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PanelTypography({ cfg, set }) {
  return (
    <div className="ts-fade">
      {/* Live preview card */}
      <div
        style={{
          background: cfg.pageBackground,
          borderRadius: 12,
          padding: "16px 18px",
          border: `1.5px solid ${cfg.primary}20`,
          marginBottom: 22,
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            fontFamily: cfg.headingFont,
            fontWeight: cfg.headingWeight,
            fontStyle: cfg.headingStyle,
            letterSpacing: cfg.headingLetterSpacing + "em",
            textTransform: cfg.headingTransform,
            lineHeight: cfg.headingLineHeight,
            color: cfg.primary,
            fontSize: cfg.headingScale * cfg.baseSize * 10 + "px",
            marginBottom: 4,
            transition: "all 0.3s",
          }}
        >
          Alexandra Chen
        </div>
        <div
          style={{
            fontFamily: cfg.bodyFont,
            fontWeight: cfg.bodyWeight,
            lineHeight: cfg.bodyLineHeight,
            fontSize: cfg.baseSize * 11 + "px",
            color: cfg.textSecondary,
            transition: "all 0.3s",
          }}
        >
          Senior Designer building products that delight.
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          {["React", "Figma", "Motion"].map((sk) => (
            <span
              key={sk}
              style={{
                padding: "2px 8px",
                borderRadius: 99,
                background: cfg.tagBackground,
                color: cfg.tagText,
                fontSize: 9,
                fontFamily: cfg.bodyFont,
                border: `1px solid ${cfg.accent}44`,
                transition: "all 0.3s",
              }}
            >
              {sk}
            </span>
          ))}
        </div>
      </div>

      <SLabel sub="Click to see it in the preview above">Heading Font</SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 7,
          marginBottom: 20,
        }}
      >
        {FONTS.map((f) => {
          const on = cfg.headingFont === f.val;
          return (
            <button
              key={f.val}
              onClick={() => set("headingFont", f.val)}
              style={{
                padding: "11px 12px",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div
                style={{
                  fontFamily: f.val,
                  fontSize: 22,
                  fontWeight: 700,
                  color: on ? "#fff" : "#1a1a2e",
                  marginBottom: 2,
                  lineHeight: 1.1,
                }}
              >
                Aa
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: on ? "#fff" : "#1a1a2e",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: on ? "rgba(255,255,255,0.55)" : "#94a3b8",
                  fontFamily: "system-ui",
                }}
              >
                {f.cat} · {f.vibe}
              </div>
            </button>
          );
        })}
      </div>

      <SLabel sub="For descriptions, body copy, labels">Body Font</SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 7,
          marginBottom: 22,
        }}
      >
        {FONTS.map((f) => {
          const on = cfg.bodyFont === f.val;
          return (
            <button
              key={f.val}
              onClick={() => set("bodyFont", f.val)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "left",
                border: on ? "2.5px solid #4f46e5" : "1.5px solid #e8eaf0",
                background: on ? "#4f46e5" : "#f8f9fc",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontFamily: f.val,
                  fontSize: 16,
                  fontWeight: 400,
                  color: on ? "#fff" : "#374151",
                  marginBottom: 2,
                }}
              >
                Aa
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: on ? "#fff" : "#374151",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {f.label}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
        }}
      >
        <SSlider
          label="Base Font Size"
          val={cfg.baseSize}
          onChange={(v) => set("baseSize", v)}
          min={0.7}
          max={1.5}
          step={0.05}
          unit="rem"
        />
        <SSlider
          label="Heading Scale"
          val={cfg.headingScale}
          onChange={(v) => set("headingScale", v)}
          min={1.2}
          max={4.5}
          step={0.1}
          unit="×"
        />
        <SSlider
          label="Heading Weight"
          val={cfg.headingWeight}
          onChange={(v) => set("headingWeight", v)}
          min={300}
          max={900}
          step={100}
        />
        <SSlider
          label="Body Weight"
          val={cfg.bodyWeight}
          onChange={(v) => set("bodyWeight", v)}
          min={300}
          max={700}
          step={100}
        />
        <SSlider
          label="Letter Spacing"
          val={cfg.headingLetterSpacing}
          onChange={(v) => set("headingLetterSpacing", v)}
          min={-0.05}
          max={0.5}
          step={0.01}
          unit="em"
        />
        <SSlider
          label="Body Line Height"
          val={cfg.bodyLineHeight}
          onChange={(v) => set("bodyLineHeight", v)}
          min={1.1}
          max={2.5}
          step={0.05}
        />
        <SSlider
          label="Heading Line Height"
          val={cfg.headingLineHeight}
          onChange={(v) => set("headingLineHeight", v)}
          min={0.9}
          max={1.8}
          step={0.05}
        />
        <SSlider
          label="Subheading Scale"
          val={cfg.subheadingScale}
          onChange={(v) => set("subheadingScale", v)}
          min={1.0}
          max={2.0}
          step={0.05}
          unit="×"
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
      >
        <SSelect
          val={cfg.headingTransform}
          onChange={(v) => set("headingTransform", v)}
          label="Transform"
          options={[
            { id: "none", label: "None" },
            { id: "uppercase", label: "UPPER" },
            { id: "capitalize", label: "Title" },
            { id: "lowercase", label: "lower" },
          ]}
        />
        <SSelect
          val={cfg.headingStyle}
          onChange={(v) => set("headingStyle", v)}
          label="Style"
          options={[
            { id: "normal", label: "Normal" },
            { id: "italic", label: "Italic" },
          ]}
        />
        <SSelect
          val={cfg.accentFont || ""}
          onChange={(v) => set("accentFont", v)}
          label="Accent Font"
          options={[
            { id: "", label: "None (auto)" },
            ...FONTS.map((f) => ({ id: f.val, label: f.label })),
          ]}
        />
      </div>
    </div>
  );
}

function PanelBackground({ cfg, set }) {
  return (
    <div className="ts-fade">
      <SLabel>Background Type</SLabel>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 4,
          background: "#f1f5f9",
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        {[
          { id: "SOLID", l: "○ Solid" },
          { id: "GRADIENT", l: "◐ Gradient" },
          { id: "IMAGE", l: "🖼 Image" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => set("bgType", t.id)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 9,
              border: "none",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              background: cfg.bgType === t.id ? "#1a1a2e" : "transparent",
              color: cfg.bgType === t.id ? "#fff" : "#64748b",
              transition: "all 0.2s",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {cfg.bgType === "SOLID" && (
        <div className="ts-slide">
          <SLabel sub="The main page background color">Solid Color</SLabel>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <CPicker
              val={cfg.solidColor}
              onChange={(v) => {
                set("solidColor", v);
                set("pageBackground", v);
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 13,
                  color: "#1a1a2e",
                  fontWeight: 700,
                }}
              >
                {cfg.solidColor}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontFamily: "system-ui",
                }}
              >
                Page background
              </div>
            </div>
          </div>
        </div>
      )}

      {cfg.bgType === "GRADIENT" && (
        <div className="ts-slide">
          <SLabel>Gradient Style</SLabel>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {GRADIENT_TYPES.map((g) => {
              const on = cfg.gradientType === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => set("gradientType", g.id)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    borderRadius: 11,
                    cursor: "pointer",
                    border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                    background: on ? "#1a1a2e" : "#f8f9fc",
                    color: on ? "#fff" : "#334155",
                    fontFamily: "'Outfit',sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{g.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{g.label}</div>
                </button>
              );
            })}
          </div>
          {cfg.gradientType === "LINEAR" && (
            <SSlider
              label="Angle"
              val={cfg.gradientAngle}
              onChange={(v) => set("gradientAngle", v)}
              min={0}
              max={360}
              step={5}
              unit="°"
            />
          )}

          <SLabel sub="Click + to add more stops">Color Stops</SLabel>
          {cfg.gradientStops.map((stop, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <CPicker
                val={stop.color}
                onChange={(c) => {
                  const s = [...cfg.gradientStops];
                  s[i] = { ...s[i], color: c };
                  set("gradientStops", s);
                }}
              />
              <div style={{ flex: 1 }}>
                <SSlider
                  label={`Stop ${i + 1}`}
                  val={stop.position}
                  onChange={(pos) => {
                    const s = [...cfg.gradientStops];
                    s[i] = { ...s[i], position: pos };
                    set("gradientStops", s);
                  }}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                />
              </div>
              {cfg.gradientStops.length > 2 && (
                <button
                  onClick={() =>
                    set(
                      "gradientStops",
                      cfg.gradientStops.filter((_, j) => j !== i),
                    )
                  }
                  style={{
                    background: "#fee2e2",
                    border: "none",
                    borderRadius: 8,
                    padding: "4px 10px",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              set("gradientStops", [
                ...cfg.gradientStops,
                { color: "#888", position: 50 },
              ])
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 10,
              border: "1.5px dashed #d1d5db",
              background: "transparent",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
              marginBottom: 16,
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            + Add Color Stop
          </button>

          {/* Live gradient preview */}
          <div
            style={{
              height: 32,
              borderRadius: 10,
              marginBottom: 16,
              border: "1.5px solid #e8eaf0",
              background:
                cfg.gradientType === "RADIAL"
                  ? `radial-gradient(circle,${cfg.gradientStops.map((s) => `${s.color} ${s.position}%`).join(",")})`
                  : `linear-gradient(${cfg.gradientAngle}deg,${cfg.gradientStops.map((s) => `${s.color} ${s.position}%`).join(",")})`,
            }}
          />

          <SToggle
            val={cfg.grainy}
            onChange={(v) => set("grainy", v)}
            label="◌ Film Grain on Gradient"
            sub="Organic noise over the gradient"
          />
          {cfg.grainy && (
            <SSlider
              label="Grain Intensity"
              val={cfg.grainIntensity}
              onChange={(v) => set("grainIntensity", v)}
              min={5}
              max={100}
              unit="%"
            />
          )}
        </div>
      )}

      {cfg.bgType === "IMAGE" && (
        <div className="ts-slide">
          <SLabel sub="Paste a direct image URL">Image URL</SLabel>
          <SInput
            value={cfg.imageUrl}
            onChange={(v) => set("imageUrl", v)}
            placeholder="https://res.cloudinary.com/…"
            style={{ marginBottom: 12 }}
          />
          <SSlider
            label="Image Opacity"
            val={cfg.imageOpacity}
            onChange={(v) => set("imageOpacity", v)}
            min={10}
            max={100}
            unit="%"
          />
          <SSelect
            label="Blend Mode"
            val={cfg.imageBlendMode}
            onChange={(v) => set("imageBlendMode", v)}
            options={[
              "normal",
              "multiply",
              "overlay",
              "screen",
              "soft-light",
              "color-burn",
              "luminosity",
            ].map((id) => ({ id, label: id }))}
          />
        </div>
      )}

      <div style={{ height: 1, background: "#f0f2f8", margin: "20px 0" }} />
      <SLabel sub="Applied on top of any background type">
        Texture Overlay
      </SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 7,
          marginBottom: 16,
        }}
      >
        {TEXTURE_TYPES.map((t) => {
          const on = cfg.textureType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => set("textureType", t.id)}
              style={{
                padding: "9px 5px",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "center",
                border: on ? "2.5px solid #4f46e5" : "1.5px solid #e8eaf0",
                background: on ? "#4f46e5" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 3 }}>{t.emoji}</div>
              <div
                style={{
                  fontSize: 8.5,
                  fontWeight: 600,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {t.label}
              </div>
            </button>
          );
        })}
      </div>
      {cfg.textureType !== "NONE" && (
        <>
          <SSlider
            label="Texture Opacity"
            val={cfg.textureOpacity}
            onChange={(v) => set("textureOpacity", v)}
            min={5}
            max={85}
            unit="%"
          />
          <SSelect
            label="Blend Mode"
            val={cfg.textureBlendMode}
            onChange={(v) => set("textureBlendMode", v)}
            options={[
              "multiply",
              "overlay",
              "soft-light",
              "screen",
              "normal",
            ].map((id) => ({ id, label: id }))}
          />
        </>
      )}
    </div>
  );
}

function PanelEffects({ cfg, set }) {
  const radii = [
    { v: "0px", l: "Sharp" },
    { v: "4px", l: "Tiny" },
    { v: "8px", l: "Soft" },
    { v: "14px", l: "Round" },
    { v: "22px", l: "Pill" },
  ];
  const shadows = [
    { v: "none", l: "None" },
    { v: "0 1px 4px rgba(0,0,0,0.07)", l: "Subtle" },
    { v: "0 4px 16px rgba(0,0,0,0.10)", l: "Medium" },
    { v: "0 8px 32px rgba(0,0,0,0.18)", l: "Deep" },
    { v: "0 16px 48px rgba(0,0,0,0.28)", l: "Dramatic" },
  ];
  return (
    <div className="ts-fade">
      <SLabel sub="Applied to all cards, chips, sections">
        Card Roundness
      </SLabel>
      <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
        {radii.map((r) => {
          const on = cfg.cardBorderRadius === r.v;
          return (
            <button
              key={r.v}
              onClick={() => set("cardBorderRadius", r.v)}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 11,
                cursor: "pointer",
                textAlign: "center",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                transition: "all 0.2s",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 20,
                  background: on ? "rgba(255,255,255,0.25)" : "#dde1ea",
                  borderRadius: r.v,
                  margin: "0 auto 5px",
                }}
              />
              <div style={{ fontSize: 9, fontWeight: 700 }}>{r.l}</div>
            </button>
          );
        })}
      </div>

      <SLabel sub="Drop shadow depth for cards">Card Shadow</SLabel>
      <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
        {shadows.map((sh) => {
          const on = cfg.cardShadow === sh.v;
          return (
            <button
              key={sh.l}
              onClick={() => set("cardShadow", sh.v)}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 11,
                cursor: "pointer",
                textAlign: "center",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                transition: "all 0.2s",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 20,
                  background: on ? "rgba(255,255,255,0.25)" : "#dde1ea",
                  borderRadius: cfg.cardBorderRadius,
                  boxShadow: sh.v,
                  margin: "0 auto 5px",
                }}
              />
              <div style={{ fontSize: 9, fontWeight: 700 }}>{sh.l}</div>
            </button>
          );
        })}
      </div>

      <SSelect
        label="Card Border Style"
        val={cfg.cardBorderStyle}
        onChange={(v) => set("cardBorderStyle", v)}
        options={[
          { id: "none", label: "None" },
          { id: "1px solid rgba(0,0,0,0.06)", label: "1px Subtle" },
          { id: "1px solid rgba(0,0,0,0.12)", label: "1px Visible" },
          { id: "2px solid rgba(0,0,0,0.08)", label: "2px Medium" },
          { id: "1.5px dashed rgba(0,0,0,0.12)", label: "Dashed" },
        ]}
      />
      <SSelect
        label="Section Dividers"
        val={cfg.sectionDividerStyle}
        onChange={(v) => set("sectionDividerStyle", v)}
        options={[
          { id: "none", label: "None" },
          { id: "line", label: "Line" },
          { id: "wave", label: "Wave" },
          { id: "diagonal", label: "Diagonal" },
          { id: "zigzag", label: "Zigzag" },
        ]}
      />
      <SSelect
        label="Transition Speed"
        val={cfg.transitionSpeed}
        onChange={(v) => set("transitionSpeed", v)}
        options={[
          { id: "fast", label: "Fast (150ms)" },
          { id: "medium", label: "Medium (300ms)" },
          { id: "slow", label: "Slow (600ms)" },
        ]}
      />

      <div style={{ height: 1, background: "#f0f2f8", margin: "14px 0" }} />
      <SLabel sub="Toggle special visual effects">Effect Layers</SLabel>
      <SToggle
        val={cfg.enableScrollReveal}
        onChange={(v) => set("enableScrollReveal", v)}
        label="✦ Scroll Reveal Animations"
        sub="Elements fade in as user scrolls"
      />
      <SToggle
        val={cfg.enableHoverLift}
        onChange={(v) => set("enableHoverLift", v)}
        label="⬆ Hover Lift on Cards"
        sub="Cards lift on mouse hover"
      />
      <SToggle
        val={cfg.enableParallax}
        onChange={(v) => set("enableParallax", v)}
        label="🎬 Parallax Scrolling"
        sub="Background moves slower than content"
      />
      <SToggle
        val={cfg.enableGlassmorphism}
        onChange={(v) => set("enableGlassmorphism", v)}
        label="🔮 Glassmorphism"
        sub="Frosted glass on cards"
        accent="#0c4a6e"
      />
      {cfg.enableGlassmorphism && (
        <SInput
          value={cfg.cardBackdropFilter}
          onChange={(v) => set("cardBackdropFilter", v)}
          placeholder="blur(12px) saturate(140%)"
          style={{ marginBottom: 12 }}
        />
      )}
      <SToggle
        val={cfg.enableNeumorphism}
        onChange={(v) => set("enableNeumorphism", v)}
        label="◉ Neumorphism"
        sub="Soft embossed card surfaces"
        accent="#374151"
      />
      <SToggle
        val={cfg.enableGrain}
        onChange={(v) => set("enableGrain", v)}
        label="◌ Global Film Grain"
        sub="Organic noise texture over everything"
        accent="#1a1a2e"
      />
      {cfg.enableGrain && (
        <SSlider
          label="Grain Intensity"
          val={cfg.globalGrainIntensity}
          onChange={(v) => set("globalGrainIntensity", v)}
          min={5}
          max={80}
          unit="%"
        />
      )}
    </div>
  );
}

function PanelLayout({ cfg, set }) {
  return (
    <div className="ts-fade">
      <SLabel sub="How the resume page is structured">Layout Style</SLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 9,
          marginBottom: 22,
        }}
      >
        {LAYOUT_TYPES.map((l) => {
          const on = cfg.layoutType === l.id;
          return (
            <button
              key={l.id}
              onClick={() => set("layoutType", l.id)}
              style={{
                padding: "11px 7px",
                borderRadius: 13,
                cursor: "pointer",
                textAlign: "center",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{l.emoji}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700 }}>{l.label}</div>
              <div
                style={{
                  fontSize: 8,
                  opacity: 0.6,
                  fontFamily: "system-ui",
                  marginTop: 2,
                }}
              >
                {l.desc}
              </div>
            </button>
          );
        })}
      </div>

      <SLabel sub="Sections available in this template">
        Supported Sections
      </SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}
      >
        {SECTIONS_ALL.map((sk) => {
          const on = cfg.supportedSections.includes(sk);
          return (
            <button
              key={sk}
              onClick={() =>
                set(
                  "supportedSections",
                  on
                    ? cfg.supportedSections.filter((s) => s !== sk)
                    : [...cfg.supportedSections, sk],
                )
              }
              style={{
                padding: "5px 11px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 10.5,
                border: on ? "2px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#475569",
                fontFamily: "'Outfit',sans-serif",
                transition: "all 0.15s",
              }}
            >
              {sk.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      <SLabel sub="Users cannot remove these sections">
        Required Sections 🔒
      </SLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {cfg.supportedSections.map((sk) => {
          const req = cfg.requiredSections.includes(sk);
          return (
            <button
              key={sk}
              onClick={() =>
                set(
                  "requiredSections",
                  req
                    ? cfg.requiredSections.filter((s) => s !== sk)
                    : [...cfg.requiredSections, sk],
                )
              }
              style={{
                padding: "5px 11px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 10.5,
                border: req ? "2px solid #4f46e5" : "1.5px solid #e8eaf0",
                background: req ? "#4f46e5" : "#f8f9fc",
                color: req ? "#fff" : "#94a3b8",
                fontFamily: "'Outfit',sans-serif",
                transition: "all 0.15s",
              }}
            >
              {sk.replace(/_/g, " ")}
              {req ? " 🔒" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PanelAudience({ cfg, set }) {
  return (
    <div className="ts-fade">
      <SLabel
        sub={`Select all that apply — ${cfg.targetAudiences.length} selected`}
      >
        Target Audiences *
      </SLabel>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}
      >
        {AUDIENCES.map((a) => {
          const on = cfg.targetAudiences.includes(a);
          return (
            <button
              key={a}
              onClick={() =>
                set(
                  "targetAudiences",
                  on
                    ? cfg.targetAudiences.filter((x) => x !== a)
                    : [...cfg.targetAudiences, a],
                )
              }
              style={{
                padding: "6px 13px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 11,
                border: on ? "2px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#475569",
                fontFamily: "'Outfit',sans-serif",
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                transform: on ? "scale(1.06)" : "scale(1)",
              }}
            >
              {a.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      <SLabel sub="Minimum subscription plan required">Plan Access</SLabel>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {PLAN_LEVELS.map((pl) => {
          const on = cfg.requiredPlan === pl.id;
          return (
            <button
              key={pl.id}
              onClick={() => set("requiredPlan", pl.id)}
              style={{
                flex: 1,
                padding: "14px 8px",
                borderRadius: 14,
                cursor: "pointer",
                textAlign: "center",
                border: on ? "2.5px solid #1a1a2e" : "1.5px solid #e8eaf0",
                background: on ? "#1a1a2e" : "#f8f9fc",
                color: on ? "#fff" : "#334155",
                fontFamily: "'Outfit',sans-serif",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                transform: on ? "scale(1.05)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 5 }}>{pl.emoji}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700 }}>{pl.label}</div>
              <div
                style={{ fontSize: 9, opacity: 0.65, fontFamily: "system-ui" }}
              >
                {pl.desc}
              </div>
            </button>
          );
        })}
      </div>

      <SLabel>Tagline (shown in template gallery)</SLabel>
      <SInput
        value={cfg.tagline}
        onChange={(v) => set("tagline", v)}
        placeholder="e.g. Built for creatives who stand out"
        style={{ marginBottom: 14 }}
      />
      <SToggle
        val={cfg.featured}
        onChange={(v) => set("featured", v)}
        label="⭐ Mark as Featured Template"
        sub="Shows prominently in template explorer"
        accent="#d97706"
      />
    </div>
  );
}

function PanelPublish({ cfg, saving, saveMsg, uploading, onPublish }) {
  const LT =
    LAYOUT_TYPES.find((l) => l.id === cfg.layoutType)?.label || cfg.layoutType;
  const HF = cfg.headingFont.split(",")[0].replace(/'/g, "").slice(0, 18);
  const BF = cfg.bodyFont.split(",")[0].replace(/'/g, "").slice(0, 18);
  const valid = cfg.name.trim() && cfg.targetAudiences.length > 0;

  return (
    <div className="ts-fade">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          ["✦", "Name", cfg.name || "(unnamed)"],
          ["🌊", "Mood", cfg.mood?.replace(/_/g, " ") || "—"],
          ["📐", "Layout", LT],
          ["💎", "Plan", cfg.requiredPlan],
          ["🎯", "Audiences", cfg.targetAudiences.length + " selected"],
          ["Aa", "Heading Font", HF],
          ["Aa", "Body Font", BF],
          ["📋", "Sections", cfg.supportedSections.length + " supported"],
          ["⭐", "Featured", cfg.featured ? "Yes" : "No"],
          [
            "✨",
            "Effects",
            [
              cfg.enableGlassmorphism && "Glass",
              cfg.enableGrain && "Grain",
              cfg.enableHoverLift && "Hover",
            ]
              .filter(Boolean)
              .join(", ") || "Standard",
          ],
        ].map(([ic, k, v]) => (
          <div
            key={k}
            style={{
              background: "#f8f9fc",
              borderRadius: 11,
              padding: "10px 13px",
              border: "1px solid #e8eaf0",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#94a3b8",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "system-ui",
                marginBottom: 3,
              }}
            >
              {ic} {k}
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#1a1a2e",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          borderRadius: 10,
          overflow: "hidden",
          height: 26,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: 20,
        }}
      >
        {[
          cfg.primary,
          cfg.accent,
          cfg.secondary,
          cfg.surfaceBackground,
          cfg.pageBackground,
        ].map((c, i) => (
          <div
            key={i}
            style={{ flex: 1, background: c, transition: "background 0.3s" }}
          />
        ))}
      </div>

      <div
        style={{
          background: "#f0f7ff",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 20,
          border: "1.5px solid #bfdbfe",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#1d4ed8",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: "system-ui",
          }}
        >
          3 things will be created atomically:
        </div>
        {[
          ["🎨", "Theme", "colorPalette + background + typography + effects"],
          ["📐", "Layout", LT + " structure + section zones"],
          [
            "📋",
            "Template",
            cfg.requiredPlan +
              " plan · " +
              cfg.targetAudiences.length +
              " audience(s)",
          ],
        ].map(([ic, title, desc]) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              marginBottom: 9,
            }}
          >
            <span style={{ fontSize: 20 }}>{ic}</span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1e3a5f",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#3b82f6",
                  fontFamily: "system-ui",
                }}
              >
                {desc}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 9,
            background: "#dbeafe",
            fontSize: 10,
            color: "#1d4ed8",
            fontFamily: "system-ui",
            display: "flex",
            gap: 7,
            alignItems: "center",
          }}
        >
          <span>📸</span>
          <span>
            Preview screenshot via html2canvas → uploaded to Cloudinary
            automatically
          </span>
        </div>
      </div>

      {!cfg.name.trim() && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#fef3c7",
            border: "1.5px solid #fde68a",
            fontSize: 11,
            color: "#92400e",
            marginBottom: 10,
            fontFamily: "system-ui",
          }}
        >
          ⚠ Please enter a theme name (Step 1)
        </div>
      )}
      {cfg.targetAudiences.length === 0 && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#fef3c7",
            border: "1.5px solid #fde68a",
            fontSize: 11,
            color: "#92400e",
            marginBottom: 10,
            fontFamily: "system-ui",
          }}
        >
          ⚠ Select at least one audience (Step 6)
        </div>
      )}

      {saving && (
        <div
          style={{
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: 11,
            padding: "11px 16px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontFamily: "'Outfit',sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              animation: "spin 1s linear infinite",
              display: "inline-block",
            }}
          >
            ⏳
          </span>
          {saveMsg || "Publishing…"}
        </div>
      )}

      <button
        onClick={onPublish}
        disabled={saving || !valid}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: 14,
          border: "none",
          background: saving ? "#4f46e5" : "#1a1a2e",
          color: "#fff",
          fontSize: 15,
          fontWeight: 800,
          cursor: saving || !valid ? "not-allowed" : "pointer",
          fontFamily: "'Outfit',sans-serif",
          opacity: saving || !valid ? 0.7 : 1,
          transition: "all 0.2s",
          letterSpacing: "-0.01em",
        }}
      >
        {uploading
          ? "📸 Capturing Preview…"
          : saving
            ? saveMsg || "Publishing…"
            : "🚀 Publish Theme + Layout + Template"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   THEME CARD
══════════════════════════════════════════════════════════════ */
function ThemeCard({ theme, onEdit, onDeactivate }) {
  const [hov, setHov] = useState(false);
  const c = theme.colorPalette || {},
    ty = theme.typography || {},
    bg = theme.background || {};
  let cardBg = c.pageBackground || "#f5f5f5";
  if (bg.type === "GRADIENT" && bg.gradient?.stops?.length) {
    const stops = bg.gradient.stops
      .map((s) => `${s.color} ${s.position}`)
      .join(",");
    cardBg = `linear-gradient(${bg.gradient.angle || "135deg"},${stops})`;
  }
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onEdit(theme)}
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        border: "1.5px solid #eaedf2",
        transition: "all 0.32s cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hov
          ? "0 18px 44px rgba(0,0,0,0.13)"
          : "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ height: 6, display: "flex" }}>
        {[c.primary, c.accent, c.secondary, c.pageBackground]
          .filter(Boolean)
          .map((col, i) => (
            <div key={i} style={{ flex: 1, background: col }} />
          ))}
      </div>
      {theme.previewImageUrl ? (
        <img
          src={theme.previewImageUrl}
          alt={theme.name}
          style={{
            width: "100%",
            height: 110,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            height: 96,
            background: cardBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: ty.headingFont || "Georgia,serif",
                fontSize: 15,
                fontWeight: ty.headingWeight || 700,
                color: c.primary || "#1a1a1a",
                marginBottom: 3,
              }}
            >
              Alex Chen
            </div>
            <div
              style={{
                fontFamily: ty.bodyFont || "system-ui",
                fontSize: 9,
                color: c.textSecondary || "#64748b",
              }}
            >
              Senior Designer
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                justifyContent: "center",
                marginTop: 6,
              }}
            >
              {[c.primary, c.accent, c.secondary]
                .filter(Boolean)
                .map((col, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: col,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: "11px 14px 14px" }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "#1a1a2e",
            marginBottom: 2,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          {theme.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#64748b",
            marginBottom: 2,
            fontFamily: "system-ui",
          }}
        >
          {theme.mood?.replace(/_/g, " ") || "—"}
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#cbd5e1",
            marginBottom: 10,
            fontFamily: "system-ui",
          }}
        >
          {ty.headingFont?.split(",")[0]?.replace(/'/g, "") || "—"}
        </div>
        {theme.featured && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#d97706",
              background: "#fef3c7",
              borderRadius: 8,
              padding: "2px 8px",
              marginBottom: 9,
              display: "inline-block",
            }}
          >
            ⭐ Featured
          </span>
        )}
        <div style={{ display: "flex", gap: 7 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(theme);
            }}
            style={{
              background: "#f1f5f9",
              color: "#374151",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "5px 13px",
              fontSize: 10.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            ✏ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeactivate(theme.id);
            }}
            style={{
              background: "#fff1f2",
              color: "#ef4444",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 10.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function AdminThemeStudioPage() {
  const [cfg, setCfg] = useState({ ...DEF });
  const [step, setStep] = useState(1);
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [themes, setThemes] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const previewRef = useRef(null);

  const set = useCallback((k, v) => setCfg((p) => ({ ...p, [k]: v })), []);
  const markDone = (n) => setDoneSteps((p) => new Set([...p, n]));
  const goNext = () => {
    markDone(step);
    setStep((s) => Math.min(s + 1, 7));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 4200);
  };

  const loadThemes = () => {
    setLoadingThemes(true);
    adminThemeAPI
      .getAll()
      .then((r) => setThemes(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingThemes(false));
  };
  useEffect(() => {
    loadThemes();
  }, []);

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    try {
      setUploading(true);
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const blob = await new Promise((res) =>
        canvas.toBlob(res, "image/png", 0.93),
      );
      const fd = new FormData();
      fd.append("file", blob, "theme-preview.png");
      const res = await fetch("/api/admin/upload/preview?type=theme", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      return data.secureUrl || null;
    } catch (e) {
      console.warn("Preview capture failed:", e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!cfg.name.trim()) {
      notify("Please enter a theme name (Step 1)", false);
      return;
    }
    if (cfg.targetAudiences.length === 0) {
      notify("Select at least one audience (Step 6)", false);
      return;
    }
    setSaving(true);
    try {
      setSaveMsg("📸 Capturing preview screenshot…");
      const previewUrl = await capturePreview();
      const payload = buildPayload(cfg, previewUrl);

      if (editId) {
        setSaveMsg("Updating theme…");
        await adminThemeAPI.update(editId, payload);
        notify("✓ Theme updated successfully!");
        loadThemes();
        setSaving(false);
        setSaveMsg("");
        return;
      }

      setSaveMsg("🎨 Creating theme…");
      const themeRes = await adminThemeAPI.create(payload);
      const themeId = themeRes.data.id;

      setSaveMsg("📐 Creating layout…");
      const layoutRes = await adminLayoutAPI.create({
        name: cfg.name,
        layoutType: cfg.layoutType,
        targetAudiences: cfg.targetAudiences,
        compatibleMoods: [cfg.mood],
        requiredPlan: cfg.requiredPlan,
        previewImageUrl: previewUrl,
        structureConfig: {
          columnCount:
            cfg.layoutType.includes("COLUMN") || cfg.layoutType === "MINIMALIST"
              ? 1
              : 2,
          hasHeroSection:
            cfg.layoutType === "BOLD_HEADER" || cfg.layoutType === "MAGAZINE",
          sidebarPosition:
            cfg.layoutType === "LEFT_SIDEBAR"
              ? "LEFT"
              : cfg.layoutType === "RIGHT_SIDEBAR"
                ? "RIGHT"
                : null,
          zones: [
            {
              zoneId: "header",
              label: "Header",
              allowedSections: ["PROFILE"],
              defaultWidth: "100%",
              optional: false,
              displayOrder: 0,
            },
            {
              zoneId: "main",
              label: "Main",
              allowedSections: cfg.supportedSections,
              defaultWidth: "100%",
              optional: false,
              displayOrder: 1,
            },
          ],
        },
      });

      setSaveMsg("📋 Publishing template…");
      await adminTemplateAPI.create({
        name: cfg.name,
        description:
          cfg.description || `${cfg.name} — a beautiful resume template`,
        tagline:
          cfg.tagline ||
          `Perfect for ${cfg.targetAudiences
            .slice(0, 2)
            .map((a) => a.replace(/_/g, " ").toLowerCase())
            .join(" & ")}`,
        previewImageUrl: previewUrl,
        planLevel: cfg.requiredPlan,
        layoutId: layoutRes.data.id,
        defaultThemeId: themeId,
        targetAudiences: cfg.targetAudiences,
        primaryMood: cfg.mood,
        supportedSections: cfg.supportedSections,
        requiredSections: cfg.requiredSections,
        featured: cfg.featured,
        isNew: true,
      });

      notify("🎉 Theme + Layout + Template published successfully!");
      markDone(7);
      loadThemes();
      setTimeout(() => {
        setCfg({ ...DEF });
        setStep(1);
        setEditId(null);
        setDoneSteps(new Set());
      }, 2800);
    } catch (err) {
      notify(
        err?.response?.data?.message || "Publish failed — check console.",
        false,
      );
      console.error(err);
    } finally {
      setSaving(false);
      setSaveMsg("");
    }
  };

  const startEdit = (t) => {
    const c = t.colorPalette || {},
      bg = t.background || {},
      ty = t.typography || {},
      ef = t.effects || {};
    setCfg({
      ...DEF,
      name: t.name,
      description: t.description || "",
      tagline: t.tagline || "",
      featured: t.featured || false,
      mood: t.mood || "CLEAN_MINIMAL",
      requiredPlan: t.requiredPlan || "FREE",
      targetAudiences: t.targetAudiences || [],
      primary: c.primary || DEF.primary,
      secondary: c.secondary || DEF.secondary,
      accent: c.accent || DEF.accent,
      surfaceBackground: c.surfaceBackground || DEF.surfaceBackground,
      pageBackground: c.pageBackground || DEF.pageBackground,
      textPrimary: c.textPrimary || DEF.textPrimary,
      textSecondary: c.textSecondary || DEF.textSecondary,
      textMuted: c.textMuted || DEF.textMuted,
      borderColor: c.borderColor || DEF.borderColor,
      dividerColor: c.dividerColor || DEF.dividerColor,
      glowColor: c.glowColor || DEF.glowColor,
      tagBackground: c.tagBackground || DEF.tagBackground,
      tagText: c.tagText || DEF.tagText,
      bgType: bg.type || "SOLID",
      solidColor: bg.solidColor || DEF.solidColor,
      gradientType: bg.gradient?.gradientType || "LINEAR",
      gradientAngle: parseInt(bg.gradient?.angle || "135"),
      gradientStops:
        bg.gradient?.stops?.map((s) => ({
          color: s.color,
          position: parseInt(s.position),
        })) || DEF.gradientStops,
      grainy: bg.gradient?.grainy || false,
      grainIntensity: bg.gradient?.grainIntensity || 30,
      textureType: bg.textureOverlay?.textureType || "NONE",
      textureOpacity: bg.textureOverlay?.opacity || 40,
      imageUrl: bg.imageUrl || "",
      imageBlendMode: bg.imageBlendMode || "normal",
      imageOpacity: bg.imageOpacity || 100,
      headingFont: ty.headingFont || DEF.headingFont,
      bodyFont: ty.bodyFont || DEF.bodyFont,
      accentFont: ty.accentFont || "",
      baseSize: ty.baseSize || 1,
      headingScale: ty.headingScale || 2.5,
      subheadingScale: ty.subheadingScale || 1.5,
      headingWeight: ty.headingWeight || 700,
      bodyWeight: ty.bodyWeight || 400,
      headingTransform: ty.headingTransform || "none",
      headingStyle: ty.headingStyle || "normal",
      headingLetterSpacing: ty.headingLetterSpacing || 0,
      bodyLineHeight: ty.bodyLineHeight || 1.65,
      headingLineHeight: ty.headingLineHeight || 1.1,
      cardBorderRadius: ef.cardBorderRadius || "8px",
      cardShadow: ef.cardShadow || DEF.cardShadow,
      cardBorderStyle: ef.cardBorderStyle || DEF.cardBorderStyle,
      cardBackdropFilter: ef.cardBackdropFilter || "",
      enableScrollReveal: ef.enableScrollReveal ?? true,
      enableHoverLift: ef.enableHoverLift ?? true,
      enableParallax: ef.enableParallax || false,
      transitionSpeed: ef.transitionSpeed || "medium",
      enableGlassmorphism: ef.enableGlassmorphism || false,
      enableNeumorphism: ef.enableNeumorphism || false,
      enableGrain: ef.enableGrain || false,
      globalGrainIntensity: ef.globalGrainIntensity || 25,
      sectionDividerStyle: ef.sectionDividerStyle || "none",
    });
    setEditId(t.id);
    setStep(1);
    setDoneSteps(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Deactivate this theme?")) return;
    adminThemeAPI
      .deactivate(id)
      .then(() => {
        notify("Deactivated.");
        loadThemes();
      })
      .catch(() => notify("Failed.", false));
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {toast.msg && (
        <div
          className="ts-pop"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 99999,
            background: toast.ok ? "#1a1a2e" : "#dc2626",
            color: "#fff",
            padding: "13px 22px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 36px rgba(0,0,0,0.28)",
            fontFamily: "'Outfit',sans-serif",
            maxWidth: 360,
          }}
        >
          {toast.msg}
        </div>
      )}

      <AdminDashboardLayout
        title={
          editId ? `✏️ Editing: ${cfg.name || "Theme"}` : "🎨 Theme Studio"
        }
        subtitle={
          editId
            ? "Making changes — live preview updates in real-time"
            : "Design themes, layouts & templates — publish in one click"
        }
        rightAction={
          editId && (
            <button
              onClick={() => {
                setCfg({ ...DEF });
                setEditId(null);
                setStep(1);
                setDoneSteps(new Set());
              }}
              style={{
                background: "#fef2f2",
                color: "#ef4444",
                border: "1.5px solid #fecaca",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              ✕ Discard
            </button>
          )
        }
      >
        {/* STUDIO WORKSPACE */}
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "flex-start",
            marginBottom: 64,
          }}
        >
          {/* ── STEP NAV ── */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              position: "sticky",
              top: 80,
              width: 158,
            }}
          >
            {STEP_CFG.map((st) => {
              const isActive = step === st.id,
                isDone = doneSteps.has(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => setStep(st.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 13,
                    border: "none",
                    background: isActive
                      ? "#1a1a2e"
                      : isDone
                        ? "#f0fdf4"
                        : "#f8f9fc",
                    color: isActive ? "#fff" : isDone ? "#15803d" : "#475569",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                    boxShadow: isActive
                      ? "0 4px 18px rgba(26,26,46,0.25)"
                      : "0 1px 4px rgba(0,0,0,0.05)",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  <span style={{ fontSize: isActive ? 18 : 16, flexShrink: 0 }}>
                    {isDone && !isActive ? "✅" : st.icon}
                  </span>
                  <div>
                    <div
                      style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}
                    >
                      {st.label}
                    </div>
                    <div
                      style={{
                        fontSize: 9.5,
                        opacity: 0.6,
                        fontFamily: "system-ui",
                        lineHeight: 1.2,
                      }}
                    >
                      {st.short}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── EDITOR PANEL ── */}
          <div style={{ flex: "0 0 460px", minWidth: 0 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1.5px solid #eaedf2",
                padding: "26px 28px",
                boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
                minHeight: 520,
              }}
            >
              {/* Step header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingBottom: 18,
                  marginBottom: 22,
                  borderBottom: "2px solid #f0f2f8",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#1a1a2e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {STEP_CFG[step - 1]?.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#1a1a2e",
                      fontFamily: "'Outfit',sans-serif",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {STEP_CFG[step - 1]?.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontFamily: "system-ui",
                    }}
                  >
                    Step {step} of 7 · {STEP_CFG[step - 1]?.short}
                  </div>
                </div>
                {/* Progress dots */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  {STEP_CFG.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        width: st.id === step ? 22 : 7,
                        height: 7,
                        borderRadius: 99,
                        transition: "width 0.3s,background 0.3s",
                        background:
                          st.id === step
                            ? "#1a1a2e"
                            : doneSteps.has(st.id)
                              ? "#22c55e"
                              : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Panel content */}
              <div
                className="studio-scroll"
                style={{
                  maxHeight: "58vh",
                  overflowY: "auto",
                  paddingRight: 2,
                }}
              >
                {step === 1 && <PanelColors cfg={cfg} set={set} />}
                {step === 2 && <PanelTypography cfg={cfg} set={set} />}
                {step === 3 && <PanelBackground cfg={cfg} set={set} />}
                {step === 4 && <PanelEffects cfg={cfg} set={set} />}
                {step === 5 && <PanelLayout cfg={cfg} set={set} />}
                {step === 6 && <PanelAudience cfg={cfg} set={set} />}
                {step === 7 && (
                  <PanelPublish
                    cfg={cfg}
                    saving={saving}
                    saveMsg={saveMsg}
                    uploading={uploading}
                    onPublish={handlePublish}
                  />
                )}
              </div>

              {/* Nav buttons */}
              {step < 7 && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    paddingTop: 18,
                    borderTop: "1.5px solid #f0f2f8",
                  }}
                >
                  {step > 1 && <BtnGhost onClick={goPrev}>← Back</BtnGhost>}
                  <BtnPrimary onClick={goNext} style={{ flex: 1 }}>
                    {step === 6
                      ? "Review & Publish →"
                      : `Next: ${STEP_CFG[step]?.label} →`}
                  </BtnPrimary>
                </div>
              )}
            </div>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div style={{ flex: 1, minWidth: 270, position: "sticky", top: 80 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1.5px solid #eaedf2",
                boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Chrome bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 16px",
                  background: "#fafbff",
                  borderBottom: "1.5px solid #f0f2f8",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                    <div
                      key={c}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      marginLeft: 7,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    Live Preview
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9.5,
                      color: "#94a3b8",
                      fontFamily: "system-ui",
                      fontStyle: "italic",
                    }}
                  >
                    real-time
                  </span>
                </div>
              </div>

              {/* Preview target (html2canvas captures this div) */}
              <div ref={previewRef} style={{ padding: 16 }}>
                <LivePreview cfg={cfg} onZoneClick={(s) => setStep(s)} />
              </div>

              {/* Hint */}
              <div
                style={{
                  padding: "9px 16px",
                  background: "#f0f7ff",
                  borderTop: "1.5px solid #dbeafe",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14 }}>👆</span>
                <span
                  style={{
                    fontSize: 9.5,
                    color: "#3b82f6",
                    fontFamily: "system-ui",
                  }}
                >
                  Header→Colors · Sidebar→Effects · Experience→Layout ·
                  Skills→Background
                </span>
              </div>

              {/* Typography strip */}
              <div
                style={{
                  margin: "0 14px 14px",
                  padding: "12px 14px",
                  borderRadius: 11,
                  background: "#fafbff",
                  border: "1px solid #eaedf2",
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                    fontFamily: "system-ui",
                  }}
                >
                  Typography
                </div>
                <div
                  style={{
                    fontFamily: cfg.headingFont,
                    fontSize: cfg.headingScale * cfg.baseSize * 9 + "px",
                    fontWeight: cfg.headingWeight,
                    fontStyle: cfg.headingStyle,
                    letterSpacing: cfg.headingLetterSpacing + "em",
                    textTransform: cfg.headingTransform,
                    color: cfg.primary,
                    marginBottom: 3,
                    transition: "all 0.3s",
                  }}
                >
                  Alexandra Chen
                </div>
                <div
                  style={{
                    fontFamily: cfg.bodyFont,
                    fontSize: cfg.baseSize * 10 + "px",
                    lineHeight: cfg.bodyLineHeight,
                    color: cfg.textSecondary,
                    transition: "all 0.3s",
                  }}
                >
                  Senior Designer · New York
                </div>
              </div>

              {/* Palette strip */}
              <div style={{ margin: "0 14px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    borderRadius: 8,
                    overflow: "hidden",
                    height: 10,
                  }}
                >
                  {[
                    cfg.primary,
                    cfg.accent,
                    cfg.secondary,
                    cfg.surfaceBackground,
                    cfg.pageBackground,
                  ].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background: c,
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", marginTop: 4 }}>
                  {["Primary", "Accent", "Secondary", "Surface", "BG"].map(
                    (l, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          fontSize: 7.5,
                          color: "#94a3b8",
                          textAlign: "center",
                          fontFamily: "system-ui",
                        }}
                      >
                        {l}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PUBLISHED THEMES */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1a1a2e",
                  fontFamily: "'Fraunces',Georgia,serif",
                  letterSpacing: "-0.03em",
                  marginBottom: 4,
                }}
              >
                Published Themes
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  fontFamily: "system-ui",
                }}
              >
                Click any theme to edit — studio loads with all its values
              </p>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
                background: "#f1f5f9",
                borderRadius: 20,
                padding: "4px 16px",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {themes.length} theme{themes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingThemes && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#94a3b8",
                fontFamily: "system-ui",
              }}
            >
              <div
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                  fontSize: 26,
                  marginBottom: 10,
                }}
              >
                ⏳
              </div>
              <div style={{ fontSize: 13 }}>Loading themes…</div>
            </div>
          )}

          {!loadingThemes && themes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "72px 0",
                color: "#cbd5e1",
                border: "2px dashed #e8eaf0",
                borderRadius: 22,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎨</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  marginBottom: 7,
                  color: "#94a3b8",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                No themes yet
              </div>
              <div style={{ fontSize: 13, fontFamily: "system-ui" }}>
                Create your first one using the studio above!
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
              gap: 16,
            }}
          >
            {themes.map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                onEdit={startEdit}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    </>
  );
}
