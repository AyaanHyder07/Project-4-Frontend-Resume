import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Sparkles, Star } from "lucide-react";
import { layoutAPI, templateAPI } from "./resumeStudioAPI";

const MOOD_FILTERS = [
  ["", "All moods"],
  ["CLEAN_MINIMAL", "Minimal"],
  ["CORPORATE_FORMAL", "Corporate"],
  ["ARTISTIC_EXPRESSIVE", "Creative"],
  ["LUXURY_ELEGANT", "Luxury"],
  ["DARK_DRAMATIC", "Dark"],
  ["FUTURISTIC_TECH", "Tech"],
];

const PLAN_ORDINAL = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };
const CONTENT_MODE_LABELS = {
  RESUME_FIRST: "Resume-first",
  PORTFOLIO_FIRST: "Portfolio-first",
  GALLERY_FIRST: "Gallery-first",
  CASE_STUDY_FIRST: "Case-study",
};

export default function StepChooseTemplate({ cfg, set, userPlan }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState(cfg.primaryMood || "");
  const [layouts, setLayouts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [layoutData, recommendationData, catalogData] = await Promise.all([
          layoutAPI.getAll().catch(() => []),
          cfg.professionType ? templateAPI.getRecommendations(cfg.professionType, mood || undefined).catch(() => []) : Promise.resolve([]),
          templateAPI.getAll({ mood: mood || undefined }).catch(() => []),
        ]);
        if (!active) return;
        setLayouts(Array.isArray(layoutData) ? layoutData : []);
        setRecommended(Array.isArray(recommendationData) ? recommendationData : []);
        setCatalog(Array.isArray(catalogData) ? catalogData : []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [cfg.professionType, mood]);

  const userOrdinal = PLAN_ORDINAL[userPlan] ?? 0;
  const recommendedIds = useMemo(() => new Set(recommended.map((item) => item.id)), [recommended]);

  const visibleTemplates = useMemo(() => {
    const merged = [...recommended, ...catalog.filter((item) => !recommendedIds.has(item.id))];
    if (!search.trim()) return merged;
    const query = search.trim().toLowerCase();
    return merged.filter((template) => [template.name, template.description, template.tagline, template.layout?.name]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [catalog, recommended, recommendedIds, search]);

  const onSelect = (template) => {
    const requiredOrdinal = PLAN_ORDINAL[template.planLevel] ?? 0;
    if (requiredOrdinal > userOrdinal) {
      navigate("/upgrade");
      return;
    }
    set("templateId", template.id);
    set("templateName", template.name);
    set("templatePlanLevel", template.planLevel);
    set("layoutId", template.layoutId || template.layout?.id || null);
    set("layoutType", template.layout?.layoutType || null);
    set("contentModes", template.supportedContentModes || []);
    set("primaryMood", template.primaryMood || mood || "");
    set("recommendedBlockTypes", template.recommendedBlockTypes || []);
  };

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates, layouts, or vibes"
          style={s.search}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MOOD_FILTERS.map(([value, label]) => (
            <button
              key={value || "all"}
              type="button"
              onClick={() => {
                setMood(value);
                set("primaryMood", value || "");
              }}
              style={{ ...s.filterChip, background: mood === value ? "#1C1C1C" : "#F0EDE6", color: mood === value ? "#F8F4EB" : "#5A5550" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.infoBox}>
        <strong>{cfg.professionType?.replace(/_/g, " ") || "Profession"}</strong>
        <span> drives the recommendation rail below. Users can still pick any unlocked template from the full catalog.</span>
      </div>

      {loading ? (
        <div style={s.loadingWrap}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#1C1C1C" }} />
          <div style={s.loadingText}>Loading recommendations...</div>
        </div>
      ) : visibleTemplates.length === 0 ? (
        <div style={s.emptyState}>No templates found. Create a few in the admin panel and they will appear here safely.</div>
      ) : (
        <div style={s.grid}>
          {visibleTemplates.map((template) => {
            const selected = cfg.templateId === template.id;
            const locked = (PLAN_ORDINAL[template.planLevel] ?? 0) > userOrdinal;
            const layout = template.layout || layouts.find((item) => item.id === template.layoutId);
            const isRecommended = recommendedIds.has(template.id);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                style={{ ...s.card, border: selected ? "2px solid #1C1C1C" : "1px solid #E7E0D6", opacity: locked ? 0.68 : 1 }}
              >
                <div style={s.previewShell}>
                  <TemplateMiniPreview template={template} layout={layout} selected={selected} />
                  {locked ? <div style={s.lockOverlay}><Lock size={15} /><span>{template.planLevel}</span></div> : null}
                  {isRecommended ? <div style={s.recommendedBadge}><Sparkles size={10} /> Recommended</div> : null}
                  {template.featured ? <div style={s.featuredBadge}><Star size={10} /> Featured</div> : null}
                </div>
                <div style={s.cardBody}>
                  <div style={s.cardTitleRow}>
                    <div style={s.cardTitle}>{template.name}</div>
                    <div style={s.planBadge}>{template.planLevel}</div>
                  </div>
                  <div style={s.cardText}>{template.tagline || template.description || "No description yet."}</div>
                  <div style={s.metaWrap}>
                    <span>{layout?.layoutType?.replace(/_/g, " ") || "No layout"}</span>
                    {(template.supportedContentModes || []).slice(0, 2).map((mode) => (
                      <span key={mode}>{CONTENT_MODE_LABELS[mode] || mode.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!cfg.templateId ? <div style={s.warn}>Select one template to continue.</div> : null}
    </div>
  );
}

function TemplateMiniPreview({ template, layout, selected }) {
  const palette = template.theme?.colorPalette || {};
  const primary = palette.primary || "#1F2937";
  const accent = palette.accent || "#C08457";
  const surface = palette.surfaceBackground || "#FCFBF8";
  const paper = palette.pageBackground || "#F3EEE5";
  const layoutType = layout?.layoutType || template.layout?.layoutType || "SINGLE_COLUMN";
  const sidebar = layoutType === "LEFT_SIDEBAR" ? "left" : layoutType === "RIGHT_SIDEBAR" ? "right" : "none";
  const grid = ["GRID", "BENTO_GRID", "MASONRY_GRID", "DASHBOARD", "GALLERY"].includes(layoutType);
  const split = ["TWO_COLUMN", "SPLIT_SCREEN", "CASE_STUDY"].includes(layoutType);

  return (
    <div style={{ height: "100%", borderRadius: 14, overflow: "hidden", background: paper, border: `1px solid ${selected ? primary : "rgba(31,41,55,0.08)"}` }}>
      <div style={{ height: 28, background: primary, opacity: 0.92 }} />
      <div style={{ display: "flex", gap: 6, padding: 8, height: "calc(100% - 28px)", background: surface }}>
        {sidebar === "left" ? <div style={{ width: "28%", borderRadius: 8, background: `${accent}66` }} /> : null}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: grid ? "1fr 1fr" : "1fr", gap: 6 }}>
          {[0, 1, 2, 3].slice(0, grid ? 4 : split ? 2 : 3).map((index) => (
            <div key={index} style={{ minHeight: grid ? 26 : 18, borderRadius: 8, background: index % 2 === 0 ? `${primary}18` : `${accent}20` }} />
          ))}
        </div>
        {sidebar === "right" ? <div style={{ width: "28%", borderRadius: 8, background: `${accent}66` }} /> : null}
      </div>
    </div>
  );
}

const s = {
  search: {
    width: "100%",
    border: "1.5px solid #E5E3DE",
    borderRadius: 12,
    padding: "10px 13px",
    fontSize: 12.5,
    background: "#FAFAF8",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  filterChip: {
    border: "none",
    borderRadius: 999,
    padding: "5px 11px",
    fontSize: 10.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  infoBox: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "#F7F4EE",
    border: "1px solid #E9E1D4",
    fontSize: 11,
    color: "#5C5348",
    marginBottom: 14,
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.45,
  },
  loadingWrap: {
    display: "grid",
    placeItems: "center",
    gap: 8,
    padding: "36px 0",
  },
  loadingText: {
    fontSize: 12,
    color: "#8A8578",
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyState: {
    padding: "24px 18px",
    borderRadius: 14,
    background: "#FBF8F2",
    border: "1px dashed #D8CDBA",
    color: "#7B6F5D",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  card: {
    textAlign: "left",
    borderRadius: 18,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 10px 24px rgba(28,28,28,0.06)",
    cursor: "pointer",
    padding: 0,
  },
  previewShell: {
    position: "relative",
    height: 148,
    padding: 10,
    background: "linear-gradient(180deg, #F8F3EA 0%, #F2ECE2 100%)",
  },
  lockOverlay: {
    position: "absolute",
    inset: 10,
    borderRadius: 14,
    background: "rgba(17,17,17,0.62)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    gap: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
  },
  recommendedBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 9.5,
    fontWeight: 700,
    background: "rgba(255,255,255,0.92)",
    color: "#1C1C1C",
    fontFamily: "'DM Sans', sans-serif",
  },
  featuredBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 9.5,
    fontWeight: 700,
    background: "rgba(28,28,28,0.88)",
    color: "#F6EFE4",
    fontFamily: "'DM Sans', sans-serif",
  },
  cardBody: {
    padding: 14,
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1C1C1C",
    fontFamily: "'DM Sans', sans-serif",
  },
  planBadge: {
    flexShrink: 0,
    borderRadius: 999,
    background: "#F2EEE7",
    color: "#7A6E5E",
    padding: "4px 7px",
    fontSize: 9.5,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
  cardText: {
    fontSize: 11,
    color: "#7D7468",
    lineHeight: 1.45,
    minHeight: 30,
    fontFamily: "'DM Sans', sans-serif",
  },
  metaWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    fontSize: 9.5,
    color: "#5A5550",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontFamily: "'DM Sans', sans-serif",
  },
  warn: {
    marginTop: 12,
    padding: "9px 12px",
    borderRadius: 10,
    background: "rgba(180,60,60,0.07)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
};
