/**
 * StepChooseTemplate.jsx
 * Step 2 of Resume Creation Studio
 *
 * Fetches from GET /api/templates (plan-gated by backend)
 * Optional filters: ?profession= ?audience= ?mood=
 *
 * TemplateResponse fields used:
 *   id, name, description, tagline, previewImageUrl, planLevel,
 *   targetAudiences, primaryMood, featured, isNew, version
 *
 * Sets: cfg.templateId, cfg.templateName, cfg.templatePlanLevel
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { templateAPI } from "./resumeStudioAPI";
import { Loader2, Star, Sparkles, Lock } from "lucide-react";

const MOOD_FILTERS = [
  { id: "", label: "All" },
  { id: "CLEAN_MINIMAL", label: "Minimal" },
  { id: "BOLD_VIBRANT", label: "Bold" },
  { id: "DARK_DRAMATIC", label: "Dark" },
  { id: "LUXURY_ELEGANT", label: "Luxury" },
  { id: "CORPORATE_FORMAL", label: "Corporate" },
  { id: "ARTISTIC_EXPRESSIVE", label: "Artistic" },
  { id: "FUTURISTIC_TECH", label: "Tech" },
];

const PLAN_COLOR = {
  FREE: "#8A8578",
  BASIC: "#1C6EA4",
  PRO: "#7B3FA0",
  PREMIUM: "#C9963A",
};

export default function StepChooseTemplate({ cfg, set, userPlan }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (moodFilter) params.mood = moodFilter;
    // Removed strict backend profession filtering so ALL templates show up with their lock icons.
    // if (cfg.professionType) params.profession = cfg.professionType;

    templateAPI
      .getAll(params)
      .then((data) => {
        console.log("FETCHED TEMPLATES:", data);
        setTemplates(Array.isArray(data) ? data : (data?.content || data?.data || []));
      })
      .catch((err) => {
        console.error("TEMPLATE FETCH ERROR:", err);
        setTemplates([]);
      })
      .finally(() => setLoading(false));
  }, [moodFilter, cfg.professionType]);

  const filtered = search
    ? templates.filter(
        (t) =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.tagline?.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  console.log("Filtered Templates for display:", filtered);

  const PLAN_ORDINAL = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };
  const userOrdinal = PLAN_ORDINAL[userPlan] ?? 0;

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search templates…"
        style={{
          width: "100%",
          border: "1.5px solid #E5E3DE",
          borderRadius: 10,
          padding: "9px 13px",
          fontSize: 12,
          color: "#1C1C1C",
          background: "#FAFAF8",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />

      {/* Mood filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {MOOD_FILTERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMoodFilter(m.id)}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "4px 11px",
              fontSize: 10.5,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              background: moodFilter === m.id ? "#1C1C1C" : "#F0EDE6",
              color: moodFilter === m.id ? "#F0EDE6" : "#5A5550",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Info about plan */}
      <div style={s.planInfo}>
        🎯 Showing templates available on your <strong>{userPlan}</strong> plan.
        {userPlan !== "PREMIUM" && (
          <span style={{ color: "#7B3FA0" }}> Upgrade to unlock more.</span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.center}>
          <Loader2
            size={20}
            style={{ animation: "spin 1s linear infinite", color: "#7B3FA0" }}
          />
          <span style={s.loadTxt}>Loading templates…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.center}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎨</div>
          <div style={s.loadTxt}>No templates found</div>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((t) => {
            const isSelected = cfg.templateId === t.id;
            const planOrd = PLAN_ORDINAL[t.planLevel] ?? 0;
            const locked = userOrdinal < planOrd;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (locked) {
                    navigate("/upgrade");
                    return;
                  }
                  set("templateId", t.id);
                  set("templateName", t.name);
                  set("templatePlanLevel", t.planLevel);
                }}
                style={{
                  ...s.card,
                  border: isSelected
                    ? "2px solid #1C1C1C"
                    : "1.5px solid #E5E3DE",
                  opacity: locked ? 0.6 : 1,
                  cursor: locked ? "not-allowed" : "pointer",
                  boxShadow: isSelected
                    ? "0 4px 20px rgba(28,28,28,0.15)"
                    : "0 1px 6px rgba(0,0,0,0.05)",
                }}
              >
                {/* Preview image */}
                <div style={s.preview}>
                  {t.previewImageUrl ? (
                    <img
                      src={t.previewImageUrl}
                      alt={t.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <TemplatePlaceholder template={t} />
                  )}
                  {locked && (
                    <div style={s.lockOverlay}>
                      <Lock size={16} color="#fff" />
                      <span style={s.lockTxt}>{t.planLevel}</span>
                    </div>
                  )}
                  {t.featured && !locked && (
                    <div style={s.featuredBadge}>
                      <Star size={8} fill="#C9963A" />
                      Featured
                    </div>
                  )}
                  {t.new && !locked && (
                    <div style={s.newBadge}>
                      <Sparkles size={8} />
                      New
                    </div>
                  )}
                  {isSelected && (
                    <div style={s.selectedOverlay}>✓ Selected</div>
                  )}
                </div>

                {/* Info */}
                <div style={s.info}>
                  <div style={s.tName}>{t.name}</div>
                  {t.tagline && <div style={s.tTagline}>{t.tagline}</div>}
                  <div
                    style={{
                      ...s.planBadge,
                      color: PLAN_COLOR[t.planLevel] ?? "#8A8578",
                      background:
                        (PLAN_COLOR[t.planLevel] ?? "#8A8578") + "18",
                    }}
                  >
                    {t.planLevel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!cfg.templateId && (
        <div style={s.warn}>⚡ Please select a template to continue</div>
      )}
    </div>
  );
}

/** Dynamically renders from attached layout/theme data */
function TemplatePlaceholder({ template }) {
  const t = template.theme;
  const l = template.layout;

  // Fallbacks if data is still syncing
  const bg = t?.background?.solidColor || t?.colorPalette?.pageBackground || "#F5F3EE";
  const pri = t?.colorPalette?.primary || "#1C1C1C";
  const sec = t?.colorPalette?.secondary || "#4A6FA5";
  const text = t?.colorPalette?.textPrimary || "#1C1C1C";
  
  const layoutType = l?.layoutType || "SINGLE_COLUMN";

  // Different mini-renderings based on layout type
  const isTwoCol = layoutType === "TWO_COLUMN" || layoutType === "LEFT_SIDEBAR" || layoutType === "RIGHT_SIDEBAR";
  const sidebarLeft = layoutType === "LEFT_SIDEBAR";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        flexDirection: "column",
        padding: 6,
        gap: 4,
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      {/* Header Block */}
      <div style={{
        backgroundColor: t?.colorPalette?.surfaceBackground || "transparent",
        borderRadius: t?.effects?.cardBorderRadius || 0,
        padding: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: layoutType === "CENTERED" ? "center" : "flex-start",
        borderBottom: `1px solid ${t?.colorPalette?.dividerColor || 'transparent'}`
      }}>
        <div style={{ width: "60%", height: 8, background: pri, borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: "40%", height: 4, background: sec, borderRadius: 2 }} />
      </div>

      {/* Body Block */}
      <div style={{
        display: "flex",
        flexDirection: sidebarLeft ? "row" : (isTwoCol ? "row-reverse" : "column"),
        gap: 4,
        flex: 1
      }}>
        
        {/* Main Content Area */}
        <div style={{ flex: isTwoCol ? 2 : 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ width: "30%", height: 5, background: pri, borderRadius: 2, opacity: 0.8 }} />
          {[100, 85, 90].map((w, i) => (
             <div key={`m1-${i}`} style={{ width: `${w}%`, height: 3, background: text, opacity: 0.3, borderRadius: 1 }} />
          ))}
          <div style={{ width: "40%", height: 5, background: pri, borderRadius: 2, opacity: 0.8, marginTop: 2 }} />
          {[95, 80].map((w, i) => (
             <div key={`m2-${i}`} style={{ width: `${w}%`, height: 3, background: text, opacity: 0.3, borderRadius: 1 }} />
          ))}
        </div>

        {/* Sidebar / Secondary Area */}
        {isTwoCol && (
          <div style={{
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: 4,
            paddingLeft: sidebarLeft ? 0 : 4,
            paddingRight: sidebarLeft ? 4 : 0,
            borderLeft: !sidebarLeft ? `1px solid ${t?.colorPalette?.dividerColor || 'rgba(0,0,0,0.1)'}` : 'none',
            borderRight: sidebarLeft ? `1px solid ${t?.colorPalette?.dividerColor || 'rgba(0,0,0,0.1)'}` : 'none'
          }}>
             <div style={{ width: "60%", height: 5, background: sec, borderRadius: 2, opacity: 0.8 }} />
             {[70, 60, 80, 50].map((w, i) => (
                 <div key={`s-${i}`} style={{ width: `${w}%`, height: 3, background: text, opacity: 0.3, borderRadius: 1 }} />
             ))}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  planInfo: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#F0EDE6",
    fontSize: 11,
    color: "#5A5550",
    marginBottom: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: 8,
  },
  loadTxt: {
    fontSize: 12,
    color: "#8A8578",
    fontFamily: "'DM Sans', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    maxHeight: "42vh",
    overflowY: "auto",
    paddingRight: 2,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    transition: "all 0.2s",
  },
  preview: {
    height: 100,
    background: "#F5F3EE",
    position: "relative",
    overflow: "hidden",
  },
  lockOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  lockTxt: {
    fontSize: 9,
    color: "#fff",
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.5px",
  },
  featuredBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    background: "#FEFCE8",
    color: "#C9963A",
    fontSize: 8.5,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontFamily: "'DM Sans', sans-serif",
  },
  newBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    background: "#EDE9FE",
    color: "#7B3FA0",
    fontSize: 8.5,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontFamily: "'DM Sans', sans-serif",
  },
  selectedOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(28,28,28,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.5px",
  },
  info: {
    padding: "8px 10px 10px",
  },
  tName: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#1C1C1C",
    marginBottom: 2,
    fontFamily: "'DM Sans', sans-serif",
  },
  tTagline: {
    fontSize: 9.5,
    color: "#8A8578",
    marginBottom: 5,
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.3,
  },
  planBadge: {
    display: "inline-block",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  warn: {
    marginTop: 12,
    padding: "9px 13px",
    borderRadius: 9,
    background: "rgba(180,60,60,0.07)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
};