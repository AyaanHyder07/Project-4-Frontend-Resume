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
                    <TemplatePlaceholder name={t.name} mood={t.primaryMood} />
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

/** Placeholder shown when previewImageUrl is null (before html2canvas) */
function TemplatePlaceholder({ name, mood }) {
  const moodColors = {
    CLEAN_MINIMAL: { bg: "#F5F3EE", pri: "#1C1C1C", acc: "#4A6FA5" },
    BOLD_VIBRANT: { bg: "#0f172a", pri: "#e2e8f0", acc: "#38bdf8" },
    DARK_DRAMATIC: { bg: "#0a0a10", pri: "#f0f0ff", acc: "#ff2d78" },
    LUXURY_ELEGANT: { bg: "#FEFCE8", pri: "#713f12", acc: "#d97706" },
    CORPORATE_FORMAL: { bg: "#F0F4F8", pri: "#1e3a5f", acc: "#0284c7" },
    ARTISTIC_EXPRESSIVE: { bg: "#FAF5FF", pri: "#4c1d95", acc: "#a78bfa" },
    FUTURISTIC_TECH: { bg: "#0a0a10", pri: "#00f5d4", acc: "#8b5cf6" },
  };
  const c = moodColors[mood] || moodColors["CLEAN_MINIMAL"];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        gap: 6,
      }}
    >
      {/* Simulated resume layout */}
      <div
        style={{
          width: "80%",
          height: 10,
          background: c.pri,
          borderRadius: 3,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          width: "55%",
          height: 5,
          background: c.acc,
          borderRadius: 2,
          opacity: 0.7,
        }}
      />
      <div style={{ display: "flex", gap: 5, width: "80%", marginTop: 4 }}>
        <div
          style={{
            width: "35%",
            background: c.acc + "33",
            borderRadius: 3,
            height: 40,
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {[100, 75, 88, 60].map((w, i) => (
            <div
              key={i}
              style={{
                width: w + "%",
                height: 4,
                background: c.pri,
                borderRadius: 2,
                opacity: 0.3 + i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          fontSize: 8,
          color: c.pri,
          opacity: 0.5,
          fontFamily: "'DM Sans',sans-serif",
          marginTop: 4,
        }}
      >
        {name}
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