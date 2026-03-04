import { useEffect, useState, useRef, useCallback } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { themeAPI, layoutAPI, templateAPI } from "../../api/endpoints";

/* ═══════════════════════════════════════════════════════════════
   INJECT FONTS + KEYFRAMES
═══════════════════════════════════════════════════════════════ */
const FONT_INJECT = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&family=Raleway:wght@300;400;600;700&family=Josefin+Sans:wght@300;400;600&family=Merriweather:wght@300;400;700&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes popIn { 0%{transform:scale(0.85);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
@keyframes slideRight { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0.15)} }
.ts-fade { animation: fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
.ts-pop { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
.ts-slide { animation: slideRight 0.3s cubic-bezier(0.16,1,0.3,1) both; }
`;

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const FONTS = [
  {
    label: "Cormorant Garamond",
    val: "'Cormorant Garamond',Georgia,serif",
    cat: "✦ Serif",
    preview: "Timeless Elegance",
    vibe: "Editorial · Luxury",
  },
  {
    label: "Playfair Display",
    val: "'Playfair Display',Georgia,serif",
    cat: "✦ Serif",
    preview: "Grand Statement",
    vibe: "Classic · Magazine",
  },
  {
    label: "Lora",
    val: "'Lora',Georgia,serif",
    cat: "✦ Serif",
    preview: "Literary Soul",
    vibe: "Academic · Warm",
  },
  {
    label: "Merriweather",
    val: "'Merriweather',Georgia,serif",
    cat: "✦ Serif",
    preview: "Solid Authority",
    vibe: "Corporate · Trust",
  },
  {
    label: "DM Sans",
    val: "'DM Sans',sans-serif",
    cat: "○ Sans",
    preview: "Modern Clean",
    vibe: "Tech · Startup",
  },
  {
    label: "Raleway",
    val: "'Raleway',sans-serif",
    cat: "○ Sans",
    preview: "Refined Edge",
    vibe: "Design · Agency",
  },
  {
    label: "Josefin Sans",
    val: "'Josefin Sans',sans-serif",
    cat: "○ Sans",
    preview: "Geometric Pure",
    vibe: "Minimal · Swedish",
  },
  {
    label: "Bebas Neue",
    val: "'Bebas Neue',sans-serif",
    cat: "▲ Display",
    preview: "BOLD IMPACT",
    vibe: "Fashion · Sports",
  },
  {
    label: "Space Mono",
    val: "'Space Mono',monospace",
    cat: "⌨ Mono",
    preview: "Code & Craft",
    vibe: "Developer · Cyber",
  },
];

const QUICK_PALETTES = [
  {
    name: "Obsidian",
    emoji: "🖤",
    bg: "#F5F3EE",
    pri: "#1C1C1C",
    sec: "#8A8578",
    acc: "#4A6FA5",
    txt: "#1C1C1C",
  },
  {
    name: "Ocean",
    emoji: "🌊",
    bg: "#EFF6FF",
    pri: "#1e3a5f",
    sec: "#4a7ab5",
    acc: "#0ea5e9",
    txt: "#0f172a",
  },
  {
    name: "Forest",
    emoji: "🌿",
    bg: "#F0F4F0",
    pri: "#1a3320",
    sec: "#4a7a5a",
    acc: "#22c55e",
    txt: "#1a2e1a",
  },
  {
    name: "Rose Noir",
    emoji: "🌹",
    bg: "#FFF1F2",
    pri: "#881337",
    sec: "#be123c",
    acc: "#f43f5e",
    txt: "#1c0a0d",
  },
  {
    name: "Amethyst",
    emoji: "💜",
    bg: "#FAF5FF",
    pri: "#4c1d95",
    sec: "#7c3aed",
    acc: "#a78bfa",
    txt: "#1e1b4b",
  },
  {
    name: "Copper",
    emoji: "🔶",
    bg: "#FEFCE8",
    pri: "#713f12",
    sec: "#a16207",
    acc: "#eab308",
    txt: "#422006",
  },
  {
    name: "Glacier",
    emoji: "❄️",
    bg: "#F0F9FF",
    pri: "#0c4a6e",
    sec: "#0284c7",
    acc: "#38bdf8",
    txt: "#082f49",
  },
  {
    name: "Midnight",
    emoji: "🌙",
    bg: "#0f172a",
    pri: "#e2e8f0",
    sec: "#94a3b8",
    acc: "#38bdf8",
    txt: "#f1f5f9",
  },
];

const LAYOUTS = [
  {
    id: "SINGLE_COLUMN",
    label: "Classic",
    emoji: "📄",
    desc: "Full-width · Traditional · ATS-Safe",
    tags: ["Corporate", "Finance", "Law", "HR"],
    best: "Safe choice for most industries",
  },
  {
    id: "TWO_COLUMN",
    label: "Split",
    emoji: "⚡",
    desc: "Equal columns · Modern balance",
    tags: ["Product", "Engineering", "Consulting"],
    best: "Shows off both skills and experience equally",
  },
  {
    id: "LEFT_SIDEBAR",
    label: "Sidebar Left",
    emoji: "◧",
    desc: "Dark sidebar · Wide content area",
    tags: ["Designer", "Developer", "Creative"],
    best: "Makes skills pop in a sleek sidebar",
  },
  {
    id: "RIGHT_SIDEBAR",
    label: "Sidebar Right",
    emoji: "◨",
    desc: "Wide content · Accent sidebar",
    tags: ["Marketing", "Sales", "PR"],
    best: "Content-first with supporting details aside",
  },
  {
    id: "MODERN_GRID",
    label: "Grid",
    emoji: "⊞",
    desc: "2×2 card grid · Structured sections",
    tags: ["Tech", "Data", "Product", "PM"],
    best: "Clear structure, great for section-heavy resumes",
  },
  {
    id: "MASONRY",
    label: "Masonry",
    emoji: "🧱",
    desc: "Staggered height · Dynamic flow",
    tags: ["Artist", "Architect", "Creative Dir"],
    best: "Visually interesting, stands out from the pile",
  },
  {
    id: "GALLERY",
    label: "Gallery",
    emoji: "🖼️",
    desc: "Photo-first · Project grid showcase",
    tags: ["Photographer", "Illustrator", "3D Artist"],
    best: "Let your work speak — visuals front and center",
  },
  {
    id: "TIMELINE",
    label: "Timeline",
    emoji: "📅",
    desc: "Vertical story arc · Journey focus",
    tags: ["Consultant", "Executive", "Founder"],
    best: "For careers with a compelling progression story",
  },
  {
    id: "INFOGRAPHIC",
    label: "Infographic",
    emoji: "📊",
    desc: "Stats · Skill bars · Visual data",
    tags: ["Data Scientist", "Analyst", "Engineer"],
    best: "Show your numbers — metrics-driven personalities",
  },
  {
    id: "BOLD_HEADER",
    label: "Bold Header",
    emoji: "🎯",
    desc: "Full-bleed gradient hero · Impact opening",
    tags: ["Brand", "Marketing", "C-Suite"],
    best: "First impression is everything — make it count",
  },
  {
    id: "MINIMALIST",
    label: "Minimalist",
    emoji: "◻",
    desc: "Ultra white space · Refined typography",
    tags: ["Executive", "VC", "Lawyer", "Finance"],
    best: "Less is more — confidence through restraint",
  },
  {
    id: "MAGAZINE",
    label: "Magazine",
    emoji: "📖",
    desc: "Editorial hero · Big name · Story layout",
    tags: ["Journalist", "Writer", "Editor", "Media"],
    best: "For storytellers who want drama and flair",
  },
];

const PROFESSIONS = [
  { id: "SOFTWARE_ENGINEER", label: "Software Engineer", emoji: "💻" },
  { id: "DESIGNER", label: "Designer", emoji: "🎨" },
  { id: "PRODUCT_MANAGER", label: "Product Manager", emoji: "📋" },
  { id: "DATA_SCIENTIST", label: "Data Scientist", emoji: "📊" },
  { id: "MARKETING", label: "Marketing", emoji: "📣" },
  { id: "FINANCE", label: "Finance", emoji: "💰" },
  { id: "HEALTHCARE", label: "Healthcare", emoji: "🏥" },
  { id: "EDUCATOR", label: "Educator", emoji: "📚" },
  { id: "LEGAL", label: "Legal", emoji: "⚖️" },
  { id: "PHOTOGRAPHER", label: "Photographer", emoji: "📷" },
  { id: "ARTIST", label: "Artist", emoji: "🖼️" },
  { id: "WRITER", label: "Writer", emoji: "✍️" },
  { id: "ARCHITECT", label: "Architect", emoji: "🏛️" },
  { id: "CONSULTANT", label: "Consultant", emoji: "🤝" },
  { id: "GENERAL", label: "General", emoji: "🌐" },
];

const NAME_SUGGESTIONS = [
  "Obsidian Noir",
  "Sage & Stone",
  "Champagne Edit",
  "Blueprint Pro",
  "Arctic Minimal",
  "Terra Classic",
  "Dusk Modern",
  "Crimson Editorial",
  "Ivory Serif",
  "Midnight Gallery",
  "Canvas Studio",
  "Steel Grid",
  "Golden Hour",
  "Onyx Executive",
  "Coral Creative",
  "Ink & Paper",
  "Velvet Dark",
  "Ash & Ember",
  "Seafoam Pro",
  "Midnight Ink",
];

const DEFAULT_CFG = {
  name: "",
  description: "",
  primaryColor: "#1C1C1C",
  secondaryColor: "#8A8578",
  accentColor: "#4A6FA5",
  backgroundColor: "#F5F3EE",
  textColor: "#1C1C1C",
  fontFamily: "'Cormorant Garamond',Georgia,serif",
  borderRadius: "8",
  layoutType: "SINGLE_COLUMN",
  professionTags: ["GENERAL"],
  planLevel: "FREE",
};

/* ═══════════════════════════════════════════════════════════════
   LIVE MINI PREVIEW
═══════════════════════════════════════════════════════════════ */
function MiniPreview({ cfg, scale = 1, layout: overrideLayout }) {
  const layout = overrideLayout || cfg.layoutType;
  const br = parseInt(cfg.borderRadius || 8);
  const ff = cfg.fontFamily;
  const p = cfg.primaryColor;
  const s = cfg.secondaryColor;
  const a = cfg.accentColor;
  const bg = cfg.backgroundColor;
  const tx = cfg.textColor;

  const baseStyle = {
    fontFamily: ff,
    background: bg,
    color: tx,
    borderRadius: br + 4 + "px",
    overflow: "hidden",
    border: `1.5px solid ${p}30`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    fontSize: 10 * scale + "px",
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
  };

  const Header = ({ name = "Alexandra Chen", title = "Senior Designer" }) => (
    <div style={{ background: p, padding: `${8 * scale}px ${12 * scale}px` }}>
      <div
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: 13 * scale + "px",
          marginBottom: 1,
        }}
      >
        {name}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 8 * scale + "px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
    </div>
  );

  const Line = ({ w = "100%", h = 5, col }) => (
    <div
      style={{
        height: h * scale + "px",
        width: w,
        borderRadius: 3,
        background: col || tx + "18",
        marginBottom: 4 * scale + "px",
      }}
    />
  );

  const Section = ({ label, children }) => (
    <div style={{ marginBottom: 10 * scale + "px" }}>
      <div
        style={{
          fontSize: 7 * scale + "px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: a,
          borderBottom: `1.5px solid ${a}44`,
          paddingBottom: 2 * scale + "px",
          marginBottom: 5 * scale + "px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );

  const Chip = ({ label }) => (
    <span
      style={{
        display: "inline-block",
        padding: `${2 * scale}px ${6 * scale}px`,
        borderRadius: br + "px",
        background: a + "22",
        color: a,
        fontSize: 7 * scale + "px",
        marginRight: 3 * scale + "px",
        marginBottom: 3 * scale + "px",
        border: `1px solid ${a}44`,
      }}
    >
      {label}
    </span>
  );

  const SidebarBlock = () => (
    <div
      style={{
        background: p + "0D",
        padding: 10 * scale + "px",
        borderRight: `1px solid ${p}15`,
        minWidth: 90 * scale + "px",
      }}
    >
      <div
        style={{
          width: 32 * scale + "px",
          height: 32 * scale + "px",
          borderRadius: "50%",
          background: a + "33",
          border: `2px solid ${a}66`,
          marginBottom: 8 * scale + "px",
        }}
      />
      <Section label="Skills">
        {[80, 65, 90, 70].map((w, i) => (
          <div key={i} style={{ marginBottom: 4 * scale + "px" }}>
            <div
              style={{
                fontSize: 7 * scale + "px",
                marginBottom: 1 * scale + "px",
                opacity: 0.7,
              }}
            >
              Skill {i + 1}
            </div>
            <div
              style={{
                height: 3 * scale + "px",
                background: tx + "18",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: w + "%",
                  height: "100%",
                  background: a,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </Section>
    </div>
  );

  const MainBlock = () => (
    <div style={{ flex: 1, padding: 10 * scale + "px" }}>
      <Section label="Experience">
        {["Senior Designer · Acme Corp", "UI Engineer · StartupXYZ"].map(
          (job, i) => (
            <div key={i} style={{ marginBottom: 6 * scale + "px" }}>
              <div
                style={{
                  fontSize: 9 * scale + "px",
                  fontWeight: 600,
                  marginBottom: 1,
                }}
              >
                {job.split("·")[0]}
              </div>
              <div
                style={{
                  fontSize: 7 * scale + "px",
                  color: s,
                  marginBottom: 2,
                }}
              >
                {job.split("·")[1]}
              </div>
              <Line w="88%" />
              <Line w="65%" />
            </div>
          ),
        )}
      </Section>
      <Section label="Education">
        <div style={{ fontSize: 9 * scale + "px", fontWeight: 600 }}>
          B.Design — State University
        </div>
        <div style={{ fontSize: 7 * scale + "px", color: s }}>2015–2019</div>
      </Section>
    </div>
  );

  if (layout === "GALLERY")
    return (
      <div style={baseStyle}>
        <Header title="Visual Artist & Photographer" />
        <div style={{ padding: 8 * scale + "px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              gap: 3 * scale + "px",
              marginBottom: 6 * scale + "px",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: i === 0 ? 55 * scale + "px" : 32 * scale + "px",
                  gridColumn: i === 0 ? "1/2" : "auto",
                  gridRow: i === 0 ? "1/3" : "auto",
                  background: i % 2 === 0 ? p + "33" : a + "22",
                  borderRadius: br + "px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 10 * scale + "px", opacity: 0.4 }}>
                  ▣
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 8 * scale + "px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: a,
              textTransform: "uppercase",
              marginBottom: 4 * scale + "px",
            }}
          >
            Portfolio
          </div>
          <Line />
          <Line w="70%" />
        </div>
      </div>
    );

  if (layout === "TIMELINE")
    return (
      <div style={baseStyle}>
        <Header title="Executive Consultant" />
        <div
          style={{
            display: "flex",
            gap: 8 * scale + "px",
            padding: 10 * scale + "px",
          }}
        >
          <div
            style={{
              width: 2 * scale + "px",
              background: a + "55",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            {[
              "2022–Now · VP Strategy",
              "2019–22 · Senior Mgr",
              "2015–19 · Analyst",
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8 * scale + "px",
                  paddingLeft: 8 * scale + "px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -4 * scale + "px",
                    top: 2 * scale + "px",
                    width: 6 * scale + "px",
                    height: 6 * scale + "px",
                    borderRadius: "50%",
                    background: i === 0 ? a : tx + "30",
                  }}
                />
                <div
                  style={{
                    fontSize: 7 * scale + "px",
                    color: a,
                    fontWeight: 700,
                  }}
                >
                  {t.split("·")[0]}
                </div>
                <div style={{ fontSize: 8 * scale + "px", fontWeight: 600 }}>
                  {t.split("·")[1]}
                </div>
                <Line w="75%" />
                <Line w="55%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (layout === "INFOGRAPHIC")
    return (
      <div style={baseStyle}>
        <Header title="Data Scientist" />
        <div style={{ padding: 8 * scale + "px" }}>
          <div
            style={{
              display: "flex",
              gap: 6 * scale + "px",
              marginBottom: 8 * scale + "px",
            }}
          >
            {[
              ["5+", "Years"],
              ["30+", "Projects"],
              ["98%", "Rate"],
            ].map(([n, l], i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: i === 1 ? a + "15" : p + "08",
                  borderRadius: br + "px",
                  padding: 6 * scale + "px",
                }}
              >
                <div
                  style={{
                    fontSize: 14 * scale + "px",
                    fontWeight: 800,
                    color: i === 1 ? a : p,
                  }}
                >
                  {n}
                </div>
                <div style={{ fontSize: 6 * scale + "px", color: s }}>{l}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 7 * scale + "px",
              fontWeight: 700,
              color: a,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4 * scale + "px",
            }}
          >
            Skills
          </div>
          {[
            ["Python", 95],
            ["ML/AI", 88],
            ["SQL", 75],
          ].map(([sk, pct]) => (
            <div
              key={sk}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5 * scale + "px",
                marginBottom: 4 * scale + "px",
              }}
            >
              <div
                style={{
                  fontSize: 7 * scale + "px",
                  width: 32 * scale + "px",
                  flexShrink: 0,
                }}
              >
                {sk}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 4 * scale + "px",
                  background: tx + "15",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: pct + "%",
                    height: "100%",
                    background: `linear-gradient(90deg,${p},${a})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (layout === "BOLD_HEADER")
    return (
      <div style={baseStyle}>
        <div
          style={{
            background: `linear-gradient(135deg,${p},${a})`,
            padding: 14 * scale + "px 12px",
          }}
        >
          <div
            style={{
              width: 36 * scale + "px",
              height: 36 * scale + "px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "2px solid rgba(255,255,255,0.5)",
              marginBottom: 6 * scale + "px",
            }}
          />
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 13 * scale + "px",
            }}
          >
            Alexandra Chen
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 8 * scale + "px",
              letterSpacing: "0.08em",
            }}
          >
            BRAND STRATEGIST
          </div>
        </div>
        <MainBlock />
      </div>
    );

  if (layout === "MINIMALIST")
    return (
      <div style={baseStyle}>
        <div style={{ padding: 12 * scale + "px" }}>
          <div
            style={{
              width: 28 * scale + "px",
              height: 2 * scale + "px",
              background: p,
              marginBottom: 8 * scale + "px",
            }}
          />
          <div
            style={{
              fontSize: 15 * scale + "px",
              fontWeight: 700,
              color: p,
              marginBottom: 2 * scale + "px",
            }}
          >
            Alexandra Chen
          </div>
          <div
            style={{
              fontSize: 7 * scale + "px",
              color: s,
              letterSpacing: "0.12em",
              marginBottom: 10 * scale + "px",
            }}
          >
            SENIOR DESIGNER
          </div>
          <div
            style={{
              height: 0.5 * scale + "px",
              background: p + "20",
              marginBottom: 10 * scale + "px",
            }}
          />
          <MainBlock />
        </div>
      </div>
    );

  if (layout === "MAGAZINE")
    return (
      <div style={baseStyle}>
        <div
          style={{
            background: `linear-gradient(135deg,${p} 60%,${a})`,
            padding: 14 * scale + "px",
          }}
        >
          <div
            style={{
              fontSize: 7 * scale + "px",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.2em",
              marginBottom: 4 * scale + "px",
            }}
          >
            PORTFOLIO
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 16 * scale + "px",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Alexandra
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 7 * scale + "px",
              letterSpacing: "0.1em",
            }}
          >
            JOURNALIST & EDITOR
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 2, padding: 8 * scale + "px" }}>
            <MainBlock />
          </div>
          <SidebarBlock />
        </div>
      </div>
    );

  if (layout === "MODERN_GRID")
    return (
      <div style={baseStyle}>
        <Header />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: p + "15",
          }}
        >
          {["Experience", "Skills", "Education", "Projects"].map((sec, i) => (
            <div key={i} style={{ background: bg, padding: 8 * scale + "px" }}>
              <div
                style={{
                  fontSize: 6 * scale + "px",
                  color: a,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 4 * scale + "px",
                }}
              >
                {sec}
              </div>
              <Line />
              <Line w="70%" />
            </div>
          ))}
        </div>
      </div>
    );

  if (layout === "MASONRY")
    return (
      <div style={baseStyle}>
        <Header />
        <div
          style={{
            display: "flex",
            gap: 5 * scale + "px",
            padding: 8 * scale + "px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 5 * scale + "px",
            }}
          >
            <div
              style={{
                background: p + "0D",
                borderRadius: br + "px",
                padding: 8 * scale + "px",
              }}
            >
              <div
                style={{
                  fontSize: 6 * scale + "px",
                  color: a,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 4 * scale + "px",
                }}
              >
                Experience
              </div>
              <Line />
              <Line />
              <Line w="60%" />
            </div>
            <div
              style={{
                background: a + "11",
                borderRadius: br + "px",
                padding: 6 * scale + "px",
              }}
            >
              {["React", "Figma", "TS"].map((sk, i) => (
                <Chip key={i} label={sk} />
              ))}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 5 * scale + "px",
            }}
          >
            <div
              style={{
                background: s + "11",
                borderRadius: br + "px",
                padding: 6 * scale + "px",
              }}
            >
              <div
                style={{
                  fontSize: 6 * scale + "px",
                  color: a,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 4 * scale + "px",
                }}
              >
                Education
              </div>
              <Line w="80%" />
            </div>
            <div
              style={{
                background: p + "0D",
                borderRadius: br + "px",
                padding: 8 * scale + "px",
              }}
            >
              <div
                style={{
                  fontSize: 6 * scale + "px",
                  color: a,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 4 * scale + "px",
                }}
              >
                Projects
              </div>
              <Line />
              <Line />
              <Line w="50%" />
            </div>
          </div>
        </div>
      </div>
    );

  // Default: SINGLE_COLUMN, TWO_COLUMN, LEFT_SIDEBAR, RIGHT_SIDEBAR
  const isLeft = layout === "LEFT_SIDEBAR";
  const isRight = layout === "RIGHT_SIDEBAR";
  const isTwo = layout === "TWO_COLUMN";

  return (
    <div style={baseStyle}>
      <Header />
      {isLeft && (
        <div style={{ display: "flex" }}>
          <SidebarBlock />
          <MainBlock />
        </div>
      )}
      {isRight && (
        <div style={{ display: "flex" }}>
          <MainBlock />
          <SidebarBlock />
        </div>
      )}
      {isTwo && (
        <div style={{ display: "flex" }}>
          <MainBlock />
          <div style={{ width: 1, background: p + "15" }} />
          <MainBlock />
        </div>
      )}
      {!isLeft && !isRight && !isTwo && <MainBlock />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function AdminThemeStudioPage() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [themes, setThemes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const [hoveredColor, setHoveredColor] = useState(null);
  const [activeTab, setActiveTab] = useState("colors");
  const [animKey, setAnimKey] = useState(0);

  const set = useCallback((k, v) => {
    setCfg((p) => ({ ...p, [k]: v }));
    setAnimKey((n) => n + 1);
  }, []);

  const loadThemes = () => {
    setLoadingList(true);
    themeAPI
      .getAll()
      .then((r) => setThemes(r.data))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };
  useEffect(() => {
    loadThemes();
  }, []);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 4000);
  };

  const randomName = () => {
    const n =
      NAME_SUGGESTIONS[Math.floor(Math.random() * NAME_SUGGESTIONS.length)];
    set("name", n);
  };

  const toggleTag = (tag) => {
    set(
      "professionTags",
      cfg.professionTags.includes(tag)
        ? cfg.professionTags.filter((t) => t !== tag)
        : [...cfg.professionTags, tag],
    );
  };

  const handleSave = async () => {
    if (!cfg.name.trim()) {
      notify("Please enter a theme name! 😊", false);
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      setSaveMsg("Creating theme…");
      const themePayload = {
        name: cfg.name,
        themeConfig: {
          primaryColor: cfg.primaryColor,
          secondaryColor: cfg.secondaryColor,
          accentColor: cfg.accentColor,
          backgroundColor: cfg.backgroundColor,
          textColor: cfg.textColor,
          fontFamily: cfg.fontFamily,
          borderRadius: cfg.borderRadius + "px",
        },
      };
      let themeId;
      if (editId) {
        await themeAPI.update(editId, themePayload);
        notify("Theme updated successfully! ✓");
        setSaved(true);
        loadThemes();
        return;
      } else {
        const r = await themeAPI.create(themePayload);
        themeId = r.data.id;
      }
      setSaveMsg("Creating layout…");
      const layoutRes = await layoutAPI.create({
        name: cfg.name,
        layoutType: cfg.layoutType,
        layoutConfigJson: JSON.stringify({
          columns: 2,
          sidebarWidth: "260px",
          contentPadding: "24px",
          headerHeight: "80px",
          sectionSpacing: "32px",
          maxWidth: "1200px",
        }),
      });
      setSaveMsg("Creating template…");
      await templateAPI.create({
        name: cfg.name,
        description: cfg.description || `${cfg.name} template`,
        previewImageUrl: null,
        planLevel: cfg.planLevel,
        layoutId: layoutRes.data.id,
        defaultThemeId: themeId,
        professionTags: cfg.professionTags,
        supportedSections: [
          "PERSONAL_INFO",
          "SUMMARY",
          "EXPERIENCE",
          "EDUCATION",
          "SKILLS",
          "PROJECTS",
          "CERTIFICATIONS",
        ],
        featured: false,
      });
      notify("🎉 Theme + Layout + Template published!");
      setSaved(true);
      loadThemes();
      setTimeout(() => {
        setSaved(false);
        setStep(1);
        setCfg(DEFAULT_CFG);
        setEditId(null);
      }, 2500);
    } catch (err) {
      notify(err?.response?.data?.message || "Save failed.", false);
    } finally {
      setSaving(false);
      setSaveMsg("");
    }
  };

  const startEdit = (t) => {
    const c = t.themeConfig || {};
    setCfg({
      ...DEFAULT_CFG,
      name: t.name,
      primaryColor: c.primaryColor || "#1C1C1C",
      secondaryColor: c.secondaryColor || "#8A8578",
      accentColor: c.accentColor || "#4A6FA5",
      backgroundColor: c.backgroundColor || "#F5F3EE",
      textColor: c.textColor || "#1C1C1C",
      fontFamily: c.fontFamily || DEFAULT_CFG.fontFamily,
      borderRadius: parseInt(c.borderRadius || "8") + "",
    });
    setEditId(t.id);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Deactivate this theme?")) return;
    themeAPI
      .deactivate(id)
      .then(() => {
        notify("Deactivated.");
        loadThemes();
      })
      .catch(() => notify("Failed.", false));
  };

  const COLORS_DATA = [
    {
      key: "backgroundColor",
      label: "Background",
      icon: "🎨",
      hint: "The paper color of your resume",
    },
    {
      key: "primaryColor",
      label: "Primary",
      icon: "⬛",
      hint: "Headers, sidebar, name section",
    },
    {
      key: "secondaryColor",
      label: "Secondary",
      icon: "🔘",
      hint: "Job titles, dates, subtle text",
    },
    {
      key: "accentColor",
      label: "Accent",
      icon: "✨",
      hint: "Section titles, skill bars, chips",
    },
    {
      key: "textColor",
      label: "Body Text",
      icon: "📝",
      hint: "All paragraph and description text",
    },
  ];

  return (
    <>
      <style>{FONT_INJECT}</style>
      <AdminDashboardLayout
        title={editId ? `✏️ Editing: ${cfg.name}` : "🎨 Theme Studio"}
        subtitle={
          editId
            ? "Update colors and style"
            : "Build beautiful resume themes with live preview"
        }
        rightAction={
          editId && (
            <button
              onClick={() => {
                setCfg(DEFAULT_CFG);
                setEditId(null);
                setStep(1);
              }}
              style={S.btnGhost}
            >
              ✕ Cancel
            </button>
          )
        }
      >
        {/* ── Toast ── */}
        {toast.msg && (
          <div
            className="ts-pop"
            style={{ ...S.toast, background: toast.ok ? "#1a1a1a" : "#dc2626" }}
          >
            {toast.msg}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            MAIN STUDIO LAYOUT: LEFT EDITOR + RIGHT LIVE PREVIEW
        ════════════════════════════════════════════════════════ */}
        <div style={S.studioLayout}>
          {/* ═══ LEFT: EDITOR PANEL ═══ */}
          <div style={S.editorCol}>
            {/* Step Pills */}
            {!editId && (
              <div style={S.stepPills}>
                {["Style", "Layout", "Publish"].map((lbl, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <button
                      key={n}
                      onClick={() => done && setStep(n)}
                      style={{
                        ...S.stepPill,
                        background: active
                          ? "#1a1a1a"
                          : done
                            ? "#22c55e"
                            : "#f1f5f9",
                        color: active || done ? "#fff" : "#94a3b8",
                        cursor: done ? "pointer" : "default",
                        transform: active ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {done ? "✓ " : `${n}. `}
                      {lbl}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── STEP 1: STYLE ─── */}
            {step === 1 && (
              <div className="ts-fade" style={S.editorCard}>
                {/* Theme Name */}
                <div style={S.sectionHead}>
                  <span style={S.sectionIcon}>✦</span>
                  <span style={S.sectionTitle}>Name your theme</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <input
                    value={cfg.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Midnight Gallery…"
                    style={{ ...S.input, flex: 1 }}
                  />
                  <button
                    onClick={randomName}
                    title="Suggest a magical name ✨"
                    style={{ ...S.iconBtn, fontSize: 18 }}
                  >
                    ✨
                  </button>
                </div>
                <input
                  value={cfg.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description (optional)…"
                  style={{
                    ...S.input,
                    marginBottom: 24,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                />

                {/* Sub-tabs */}
                <div style={S.subTabs}>
                  {[
                    ["colors", "🎨 Colors"],
                    ["font", "✦ Font"],
                    ["shape", "◯ Shape"],
                  ].map(([id, lbl]) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      style={{
                        ...S.subTab,
                        background:
                          activeTab === id ? "#1a1a1a" : "transparent",
                        color: activeTab === id ? "#fff" : "#64748b",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* ── COLORS TAB ── */}
                {activeTab === "colors" && (
                  <div className="ts-slide">
                    {/* Quick Palettes */}
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Quick Palettes</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>
                        Click to apply instantly
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 20,
                      }}
                    >
                      {QUICK_PALETTES.map((pal) => (
                        <button
                          key={pal.name}
                          onClick={() =>
                            setCfg((p) => ({
                              ...p,
                              backgroundColor: pal.bg,
                              primaryColor: pal.pri,
                              secondaryColor: pal.sec,
                              accentColor: pal.acc,
                              textColor: pal.txt,
                            }))
                          }
                          style={S.palBtn}
                          title={pal.name}
                        >
                          <div
                            style={{
                              display: "flex",
                              height: 16,
                              borderRadius: 4,
                              overflow: "hidden",
                              marginBottom: 3,
                            }}
                          >
                            {[pal.pri, pal.acc, pal.sec, pal.bg].map((c, i) => (
                              <div key={i} style={{ flex: 1, background: c }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 9, color: "#64748b" }}>
                            {pal.emoji} {pal.name}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Individual color pickers */}
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Fine-tune Colors</span>
                    </div>
                    <div style={S.colorList}>
                      {COLORS_DATA.map(({ key, label, icon, hint }) => {
                        const isHovered = hoveredColor === key;
                        return (
                          <div
                            key={key}
                            onMouseEnter={() => setHoveredColor(key)}
                            onMouseLeave={() => setHoveredColor(null)}
                            style={{
                              ...S.colorRow,
                              background: isHovered ? "#f8fafc" : "#fff",
                              transform: isHovered
                                ? "translateX(4px)"
                                : "translateX(0)",
                            }}
                          >
                            {/* Color swatch + hidden input */}
                            <div
                              style={{ position: "relative", flexShrink: 0 }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 10,
                                  background: cfg[key],
                                  border: "2px solid rgba(0,0,0,0.08)",
                                  boxShadow: isHovered
                                    ? `0 0 0 3px ${cfg[key]}44, 0 4px 12px ${cfg[key]}33`
                                    : "none",
                                  transition: "all 0.25s",
                                  cursor: "pointer",
                                }}
                              />
                              <input
                                type="color"
                                value={cfg[key]}
                                onChange={(e) => set(key, e.target.value)}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  opacity: 0,
                                  cursor: "pointer",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#1a1a1a",
                                  marginBottom: 1,
                                }}
                              >
                                {icon} {label}
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                {hint}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontFamily: "monospace",
                                  color: "#475569",
                                  marginTop: 1,
                                }}
                              >
                                {cfg[key]}
                              </div>
                            </div>
                            {/* Mini indicator of what it affects */}
                            {isHovered && (
                              <div
                                style={{
                                  position: "absolute",
                                  right: 12,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: 9,
                                  color: "#6366f1",
                                  fontWeight: 600,
                                  animation: "shimmer 1s infinite",
                                }}
                              >
                                ← see preview
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── FONT TAB ── */}
                {activeTab === "font" && (
                  <div className="ts-slide">
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Pick Your Font</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>
                        See it live in preview →
                      </span>
                    </div>
                    <div style={S.fontGrid}>
                      {FONTS.map((f) => {
                        const active = cfg.fontFamily === f.val;
                        return (
                          <button
                            key={f.val}
                            onClick={() => set("fontFamily", f.val)}
                            style={{
                              ...S.fontCard,
                              border: active
                                ? "2.5px solid #1a1a1a"
                                : "2px solid #e2e8f0",
                              background: active ? "#1a1a1a" : "#fafafa",
                              color: active ? "#fff" : "#1a1a1a",
                              transform: active ? "scale(1.03)" : "scale(1)",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: f.val,
                                fontSize: 22,
                                fontWeight: 700,
                                marginBottom: 3,
                                color: active ? "#fff" : "#1a1a1a",
                              }}
                            >
                              {f.preview.length > 10
                                ? f.preview.slice(0, 8) + "…"
                                : f.preview}
                            </div>
                            <div
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                marginBottom: 1,
                                color: active
                                  ? "rgba(255,255,255,0.9)"
                                  : "#334155",
                              }}
                            >
                              {f.label}
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                color: active
                                  ? "rgba(255,255,255,0.6)"
                                  : "#94a3b8",
                                fontFamily: "system-ui",
                              }}
                            >
                              {f.cat}
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                marginTop: 3,
                                color: active
                                  ? "rgba(255,255,255,0.7)"
                                  : "#cbd5e1",
                                fontFamily: "system-ui",
                              }}
                            >
                              {f.vibe}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── SHAPE TAB ── */}
                {activeTab === "shape" && (
                  <div className="ts-slide">
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Corner Roundness</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {cfg.borderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={2}
                      value={cfg.borderRadius}
                      onChange={(e) => set("borderRadius", e.target.value)}
                      style={{
                        width: "100%",
                        accentColor: "#1a1a1a",
                        height: 4,
                        marginBottom: 12,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                      {[0, 4, 8, 12, 16, 20, 24].map((v) => (
                        <div
                          key={v}
                          onClick={() => set("borderRadius", v + "")}
                          style={{
                            flex: 1,
                            aspectRatio: "1",
                            background:
                              parseInt(cfg.borderRadius) === v
                                ? "#1a1a1a"
                                : "#e2e8f0",
                            borderRadius: v + "px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            border:
                              parseInt(cfg.borderRadius) === v
                                ? "2px solid #1a1a1a"
                                : "2px solid transparent",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: "#94a3b8",
                        marginBottom: 20,
                      }}
                    >
                      <span>0 — Sharp</span>
                      <span>12 — Rounded</span>
                      <span>24 — Pill</span>
                    </div>
                    {/* Spacing & size guide */}
                    <div style={S.sectionHead}>
                      <span style={S.sectionTitle}>Visual Guide</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {["Headers", "Chips", "Cards", "Buttons"].map(
                        (label, i) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <div
                              style={{
                                width: 56,
                                height: 24 + i * 8,
                                background:
                                  cfg.primaryColor + ["", "22", "11", "33"][i],
                                border: `2px solid ${cfg.accentColor}44`,
                                borderRadius: [
                                  cfg.borderRadius + "px",
                                  "20px",
                                  "12px",
                                  cfg.borderRadius + "px",
                                ][i],
                                marginBottom: 4,
                                transition: "all 0.3s",
                              }}
                            />
                            <div style={{ fontSize: 9, color: "#94a3b8" }}>
                              {label}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  {editId ? (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}
                    >
                      {saving ? "⏳ " + saveMsg : "💾 Update Theme"}
                    </button>
                  ) : (
                    <button onClick={() => setStep(2)} style={S.btnPrimary}>
                      Next: Choose Layout →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─── STEP 2: LAYOUT ─── */}
            {step === 2 && !editId && (
              <div className="ts-fade" style={S.editorCard}>
                <div style={S.sectionHead}>
                  <span style={S.sectionIcon}>📐</span>
                  <span style={S.sectionTitle}>Choose Layout Style</span>
                </div>

                {/* Layout cards — live colored with YOUR palette */}
                <div style={S.layoutGrid}>
                  {LAYOUTS.map((l) => {
                    const active = cfg.layoutType === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => set("layoutType", l.id)}
                        style={{
                          ...S.layoutCard,
                          border: active
                            ? "2.5px solid #1a1a1a"
                            : "2px solid #e2e8f0",
                          boxShadow: active
                            ? "0 0 0 4px rgba(26,26,26,0.1)"
                            : "0 1px 4px rgba(0,0,0,0.06)",
                          background: active ? "#fafafa" : "#fff",
                          transform: active ? "translateY(-2px)" : "none",
                        }}
                      >
                        {/* Live mini preview of THIS layout with current colors */}
                        <div
                          style={{
                            borderRadius: 8,
                            overflow: "hidden",
                            marginBottom: 8,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              width: 160,
                              height: 100,
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                transformOrigin: "top left",
                                transform: "scale(0.5)",
                                width: 320,
                                height: 200,
                              }}
                            >
                              <MiniPreview
                                cfg={cfg}
                                scale={0.5}
                                layout={l.id}
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              marginBottom: 2,
                              color: "#1a1a1a",
                            }}
                          >
                            {l.emoji} {l.label}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#94a3b8",
                              marginBottom: 5,
                              lineHeight: 1.4,
                            }}
                          >
                            {l.desc}
                          </div>
                          {active && (
                            <>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#22c55e",
                                  fontWeight: 700,
                                  marginBottom: 4,
                                }}
                              >
                                ✓ Selected
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#6366f1",
                                  fontStyle: "italic",
                                  marginBottom: 4,
                                }}
                              >
                                💡 {l.best}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 3,
                                }}
                              >
                                {l.tags.map((t) => (
                                  <span
                                    key={t}
                                    style={{
                                      fontSize: 8,
                                      background: "#1a1a1a",
                                      color: "#fff",
                                      borderRadius: 10,
                                      padding: "1px 6px",
                                    }}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ ...S.sectionHead, marginTop: 24 }}>
                  <span style={S.sectionIcon}>🎯</span>
                  <span style={S.sectionTitle}>Who is this for?</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {PROFESSIONS.map((t) => {
                    const on = cfg.professionTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTag(t.id)}
                        style={{
                          ...S.tagBtn,
                          background: on ? "#1a1a1a" : "#f8fafc",
                          color: on ? "#fff" : "#475569",
                          border: on
                            ? "2px solid #1a1a1a"
                            : "2px solid #e2e8f0",
                          transform: on ? "scale(1.04)" : "scale(1)",
                        }}
                      >
                        {t.emoji} {t.label}
                      </button>
                    );
                  })}
                </div>

                <div style={S.sectionHead}>
                  <span style={S.sectionIcon}>💎</span>
                  <span style={S.sectionTitle}>Access Plan</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  {[
                    { id: "FREE", emoji: "🆓", desc: "All users" },
                    { id: "PRO", emoji: "⭐", desc: "Pro subscribers" },
                    { id: "ENTERPRISE", emoji: "🏢", desc: "Enterprise only" },
                  ].map((p) => {
                    const on = cfg.planLevel === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => set("planLevel", p.id)}
                        style={{
                          ...S.planCard,
                          background: on ? "#1a1a1a" : "#fafafa",
                          color: on ? "#fff" : "#334155",
                          border: on
                            ? "2px solid #1a1a1a"
                            : "2px solid #e2e8f0",
                          transform: on ? "scale(1.04)" : "scale(1)",
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 4 }}>
                          {p.emoji}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>
                          {p.id}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>
                          {p.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={S.btnGhost}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)} style={S.btnPrimary}>
                    Review & Publish →
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: PUBLISH ─── */}
            {step === 3 && !editId && (
              <div className="ts-fade" style={S.editorCard}>
                <div style={S.sectionHead}>
                  <span style={S.sectionIcon}>🚀</span>
                  <span style={S.sectionTitle}>Ready to Publish?</span>
                </div>

                {/* Summary cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {[
                    ["Theme Name", cfg.name || "(unnamed)", "✦"],
                    [
                      "Layout",
                      LAYOUTS.find((l) => l.id === cfg.layoutType)?.label ||
                        cfg.layoutType,
                      "📐",
                    ],
                    [
                      "Font",
                      cfg.fontFamily
                        .split(",")[0]
                        .replace(/'/g, "")
                        .slice(0, 20),
                      "✦",
                    ],
                    ["Corners", cfg.borderRadius + "px", "◯"],
                    ["Plan", cfg.planLevel, "💎"],
                    [
                      "Professions",
                      cfg.professionTags.length + " selected",
                      "🎯",
                    ],
                  ].map(([k, v, icon]) => (
                    <div
                      key={k}
                      style={{
                        background: "#fafafa",
                        borderRadius: 10,
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          marginBottom: 3,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {icon} {k}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color swatches */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                  {[
                    cfg.primaryColor,
                    cfg.accentColor,
                    cfg.secondaryColor,
                    cfg.backgroundColor,
                    cfg.textColor,
                  ].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: 8,
                        background: c,
                        border: "1.5px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 2px 8px " + c + "44",
                      }}
                    />
                  ))}
                </div>

                {/* What gets created */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 20,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    3 things will be created:
                  </div>
                  {[
                    ["🎨", "Theme", `Colors + font → /api/themes`],
                    [
                      "📐",
                      "Layout",
                      `${cfg.layoutType.replace(/_/g, " ")} → /api/layouts`,
                    ],
                    [
                      "📋",
                      "Template",
                      `Plan: ${cfg.planLevel}, ${cfg.professionTags.length} profession(s) → /api/templates`,
                    ],
                  ].map(([ic, title, desc]) => (
                    <div
                      key={title}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{ic}</span>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1a1a1a",
                          }}
                        >
                          {title}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {saving && saveMsg && (
                  <div
                    style={{
                      background: "#1a1a1a",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
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
                    {saveMsg}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={S.btnGhost}>
                    ← Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    style={{
                      ...S.btnPrimary,
                      flex: 1,
                      fontSize: 15,
                      background: saved ? "#22c55e" : "#1a1a1a",
                      opacity: saving || saved ? 0.8 : 1,
                    }}
                  >
                    {saved
                      ? "✓ Published!"
                      : saving
                        ? saveMsg || "Saving…"
                        : "🚀 Publish Theme"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ═══ RIGHT: LIVE PREVIEW PANEL ═══ */}
          <div style={S.previewCol}>
            <div style={S.previewCard}>
              {/* Preview header */}
              <div style={S.previewHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      marginLeft: 6,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Live Preview
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[cfg.backgroundColor, cfg.primaryColor, cfg.accentColor].map(
                    (c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: c,
                          border: "1.5px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* The actual preview — smoothly updates on every change */}
              <div
                style={{
                  padding: "12px 16px 16px",
                  overflow: "auto",
                  maxHeight: "70vh",
                }}
              >
                <div
                  style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}
                  key={animKey + cfg.layoutType}
                >
                  <MiniPreview cfg={cfg} scale={1} />
                </div>
              </div>

              {/* Font preview strip */}
              <div
                style={{
                  margin: "0 16px 16px",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Typography Preview
                </div>
                <div
                  style={{
                    fontFamily: cfg.fontFamily,
                    transition: "font-family 0.3s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: cfg.primaryColor,
                      marginBottom: 2,
                    }}
                  >
                    Alexandra Chen
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: cfg.secondaryColor,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Senior Designer · New York
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: cfg.textColor,
                      lineHeight: 1.6,
                      opacity: 0.8,
                    }}
                  >
                    Passionate about crafting experiences that are both
                    beautiful and meaningful.
                  </div>
                </div>
              </div>

              {/* Color reference strip */}
              <div style={{ margin: "0 16px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    borderRadius: 8,
                    overflow: "hidden",
                    height: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {[
                    cfg.primaryColor,
                    cfg.accentColor,
                    cfg.secondaryColor,
                    cfg.textColor,
                    cfg.backgroundColor,
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
                  {["Primary", "Accent", "Secondary", "Text", "Background"].map(
                    (l, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          fontSize: 7,
                          color: "#94a3b8",
                          textAlign: "center",
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

        {/* ════════════════════════════════════════════════════════
            SAVED THEMES
        ════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: "#1a1a1a",
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                }}
              >
                Published Themes
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                Click a theme to edit its colors and style
              </p>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#94a3b8",
                background: "#f1f5f9",
                borderRadius: 20,
                padding: "3px 12px",
              }}
            >
              {themes.length} theme{themes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingList && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              <div
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                  marginBottom: 8,
                }}
              >
                ⏳
              </div>
              <div>Loading themes…</div>
            </div>
          )}

          {!loadingList && themes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#cbd5e1",
                border: "2px dashed #e2e8f0",
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "#94a3b8",
                }}
              >
                No themes yet
              </div>
              <div style={{ fontSize: 13 }}>Create your first theme above!</div>
            </div>
          )}

          <div style={S.savedGrid}>
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

/* ─────────────────────────────────────────────────────────────
   THEME CARD
───────────────────────────────────────────────────────────── */
function ThemeCard({ theme, onEdit, onDeactivate }) {
  const c = theme.themeConfig || {};
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.themeCard,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.12)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Color bar */}
      <div style={{ height: 8, display: "flex" }}>
        {[c.primaryColor, c.accentColor, c.secondaryColor, c.backgroundColor]
          .filter(Boolean)
          .map((col, i) => (
            <div key={i} style={{ flex: 1, background: col }} />
          ))}
      </div>
      {/* Mini preview */}
      <div style={{ padding: "10px 12px 0", overflow: "hidden" }}>
        <div
          style={{
            transform: "scale(0.48)",
            transformOrigin: "top left",
            width: "208%",
            pointerEvents: "none",
            opacity: hovered ? 1 : 0.85,
            transition: "opacity 0.3s",
          }}
        >
          <MiniPreview
            cfg={{
              primaryColor: c.primaryColor || "#1C1C1C",
              secondaryColor: c.secondaryColor || "#8A8578",
              accentColor: c.accentColor || "#4A6FA5",
              backgroundColor: c.backgroundColor || "#F5F3EE",
              textColor: c.textColor || "#1C1C1C",
              fontFamily: c.fontFamily || "sans-serif",
              borderRadius: parseInt(c.borderRadius || "8") + "",
              layoutType: "SINGLE_COLUMN",
            }}
            scale={1}
          />
        </div>
      </div>
      <div style={{ padding: "8px 12px 12px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 1,
          }}
        >
          {theme.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#94a3b8",
            marginBottom: 10,
            fontFamily: c.fontFamily,
          }}
        >
          {c.fontFamily?.split(",")[0].replace(/'/g, "")?.slice(0, 22) || "—"}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(theme)} style={S.btnSmall}>
            ✏ Edit
          </button>
          <button
            onClick={() => onDeactivate(theme.id)}
            style={{ ...S.btnSmall, color: "#ef4444", borderColor: "#fecaca" }}
          >
            ✕ Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const S = {
  studioLayout: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
  },
  editorCol: {
    flex: "0 0 460px",
    minWidth: 0,
  },
  previewCol: {
    flex: 1,
    position: "sticky",
    top: 80,
  },
  editorCard: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
  },
  previewCard: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
  },
  stepPills: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },
  stepPill: {
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    fontFamily: "system-ui",
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionIcon: { fontSize: 16, marginRight: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.01em",
  },
  subTabs: {
    display: "flex",
    gap: 4,
    marginBottom: 20,
    padding: 4,
    background: "#f1f5f9",
    borderRadius: 10,
  },
  subTab: {
    flex: 1,
    padding: "7px 0",
    borderRadius: 7,
    border: "none",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "system-ui",
  },
  input: {
    width: "100%",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 13px",
    fontSize: 13,
    color: "#1a1a1a",
    outline: "none",
    background: "#fafafa",
    boxSizing: "border-box",
    fontFamily: "system-ui",
    transition: "border-color 0.15s",
  },
  colorList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    position: "relative",
    transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
    border: "1px solid #f0f0f0",
  },
  palBtn: {
    background: "#fafafa",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 9px",
    cursor: "pointer",
    textAlign: "center",
    minWidth: 68,
    transition: "all 0.15s",
    fontFamily: "system-ui",
  },
  fontGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 7,
  },
  fontCard: {
    padding: "10px 8px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    fontFamily: "system-ui",
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },
  layoutCard: {
    padding: 10,
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
    fontFamily: "system-ui",
    background: "#fff",
    overflow: "hidden",
  },
  tagBtn: {
    padding: "5px 11px",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
    fontFamily: "system-ui",
  },
  planCard: {
    flex: 1,
    padding: "14px 10px",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    fontFamily: "system-ui",
  },
  savedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
    gap: 14,
  },
  themeCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
  },
  btnPrimary: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 24px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "system-ui",
    transition: "all 0.2s",
  },
  btnGhost: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "system-ui",
  },
  btnSmall: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    padding: "4px 12px",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "system-ui",
  },
  toast: {
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 9999,
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    fontFamily: "system-ui",
    maxWidth: 320,
  },
};
