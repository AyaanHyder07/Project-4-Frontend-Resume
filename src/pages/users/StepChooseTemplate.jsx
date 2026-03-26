import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Sparkles, Star } from "lucide-react";
import { templateAPI } from "./resumeStudioAPI";
import TemplateCardPreview from "../../templates/TemplateCardPreview";
import { isImplementedTemplate } from "../../templates/implementedTemplates";

const PLAN_ORDINAL = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

export default function StepChooseTemplate({ cfg, set, userPlan }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [recommendationData, catalogData] = await Promise.all([
          cfg.professionType ? templateAPI.getRecommendations(cfg.professionType).catch(() => []) : Promise.resolve([]),
          templateAPI.getAll().catch(() => []),
        ]);
        if (!active) return;
        setRecommended(Array.isArray(recommendationData) ? recommendationData.filter((item) => isImplementedTemplate(item.templateKey || item.renderFamily)) : []);
        setCatalog(Array.isArray(catalogData) ? catalogData.filter((item) => isImplementedTemplate(item.templateKey || item.renderFamily)) : []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [cfg.professionType]);

  const userOrdinal = PLAN_ORDINAL[userPlan] ?? 0;
  const recommendedIds = useMemo(() => new Set(recommended.map((item) => item.id)), [recommended]);

  const visibleTemplates = useMemo(() => {
    const merged = [...recommended, ...catalog.filter((item) => !recommendedIds.has(item.id))];
    if (!search.trim()) return merged;
    const query = search.trim().toLowerCase();
    return merged.filter((template) => [template.name, template.description, template.tagline, template.renderFamily, template.profession]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [catalog, recommended, recommendedIds, search]);

  const onSelect = (template) => {
    const requiredOrdinal = PLAN_ORDINAL[template.planLevel] ?? 0;
    if (requiredOrdinal > userOrdinal) {
      navigate("/upgrade");
      return;
    }
    set("templateId", template.id);
    set("templateKey", template.templateKey || template.renderFamily || template.name);
    set("renderFamily", template.renderFamily || template.templateKey || "CLASSICPRO");
    set("templateName", template.name);
    set("templatePlanLevel", template.planLevel);
    set("layoutId", template.layoutId || null);
    set("layoutType", template.layout?.layoutType || null);
    set("primaryMood", template.primaryMood || "");
    set("recommendedBlockTypes", template.recommendedBlockTypes || []);
    set("enabledSections", template.enabledSections || template.supportedSections || []);
    set("sectionOrder", template.sectionOrder || template.enabledSections || template.supportedSections || []);
    set("navStyle", template.navStyle || "TOP_FIXED");
    set("defaultTheme", template.defaultTheme || null);
  };

  const openPreview = (event, template) => {
    event.stopPropagation();
    const key = template.templateKey || template.renderFamily || "CLASSICPRO";
    window.open(`/template-preview/${key}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search premium templates or styles"
          style={s.search}
        />
      </div>

      <div style={s.infoBox}>
        <strong>{cfg.professionType?.replace(/_/g, " ") || "Profession"}</strong>
        <span> templates appear first below. Only real implemented premium templates are shown here, and each card now reflects the actual public template direction.</span>
      </div>

      {loading ? (
        <div style={s.loadingWrap}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#1C1C1C" }} />
          <div style={s.loadingText}>Loading premium templates...</div>
        </div>
      ) : visibleTemplates.length === 0 ? (
        <div style={s.emptyState}>No real implemented templates are available for this profession yet.</div>
      ) : (
        <div style={s.grid}>
          {visibleTemplates.map((template) => {
            const selected = cfg.templateId === template.id;
            const locked = (PLAN_ORDINAL[template.planLevel] ?? 0) > userOrdinal;
            const isRecommended = recommendedIds.has(template.id);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                style={{ ...s.card, border: selected ? "2px solid #1C1C1C" : "1px solid #E7E0D6", opacity: locked ? 0.68 : 1 }}
              >
                <div style={s.previewShell}>
                  <TemplateCardPreview template={template} />
                  {locked ? <div style={s.lockOverlay}><Lock size={15} /><span>{template.planLevel}</span></div> : null}
                  {isRecommended ? <div style={s.recommendedBadge}><Sparkles size={10} /> Recommended</div> : null}
                  {template.featured ? <div style={s.featuredBadge}><Star size={10} /> Featured</div> : null}
                </div>
                <div style={s.cardBody}>
                  <div style={s.cardTitleRow}>
                    <div>
                      <div style={s.cardTitle}>{template.name}</div>
                      <div style={s.familyLabel}>{template.renderFamily || template.templateKey}</div>
                    </div>
                    <div style={s.planBadge}>{template.planLevel}</div>
                  </div>
                  <div style={s.cardText}>{template.tagline || template.description || "Premium portfolio template."}</div>
                  <div style={s.metaWrap}>
                    {(template.enabledSections || []).slice(0, 3).map((section) => <span key={section}>{section.replace(/_/g, " ")}</span>)}
                  </div>
                  <div style={s.cardActions}>
                    <button type="button" style={s.previewButton} onClick={(event) => openPreview(event, template)}>Preview</button>
                    <span style={s.selectionHint}>{selected ? "Selected" : "Select template"}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!cfg.templateId ? <div style={s.warn}>Select one premium template to continue.</div> : null}
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
    gap: 14,
  },
  card: {
    textAlign: "left",
    borderRadius: 20,
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
    borderRadius: 16,
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
  familyLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#817665",
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
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  previewButton: {
    border: "1px solid #D7CCBC",
    background: "#FCFAF6",
    color: "#1C1C1C",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  selectionHint: {
    fontSize: 10.5,
    color: "#7F7568",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
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
