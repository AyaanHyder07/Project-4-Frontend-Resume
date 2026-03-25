import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { themeAPI } from "./resumeStudioAPI";

const PLAN_ORDINAL = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

export default function StepChooseTheme({ cfg, set, userPlan }) {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    themeAPI
      .getAll(cfg.primaryMood ? { mood: cfg.primaryMood } : {})
      .then((data) => {
        if (!active) return;
        setThemes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setThemes([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cfg.primaryMood]);

  const sortedThemes = useMemo(() => {
    return [...themes].sort((a, b) => {
      if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return (a.requiredPlan || "FREE").localeCompare(b.requiredPlan || "FREE");
    });
  }, [themes]);

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={s.infoBox}>
        Themes are reusable skins. You can keep the template default, or swap in a shared premium look without changing your layout structure.
      </div>

      {loading ? (
        <div style={s.center}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#1C1C1C" }} />
          <div style={s.loadTxt}>Loading themes...</div>
        </div>
      ) : (
        <div style={s.grid}>
          <button
            type="button"
            onClick={() => {
              set("themeOverrideId", null);
              set("themeName", "Template Default");
            }}
            style={{ ...s.card, border: cfg.themeOverrideId === null ? "2px solid #1C1C1C" : "1px solid #E5E3DE" }}
          >
            <div style={{ ...s.preview, background: "linear-gradient(135deg, #F4EFE5 0%, #E7DFD2 100%)" }}>
              <div style={{ width: "68%", height: 16, borderRadius: 999, background: "#1C1C1C" }} />
              <div style={{ width: "42%", height: 10, borderRadius: 999, background: "#BDAA84", marginTop: 8 }} />
            </div>
            <div style={s.body}>
              <div style={s.title}>Template Default</div>
              <div style={s.text}>Use the original theme packed with your selected template.</div>
            </div>
          </button>

          {sortedThemes.map((theme) => {
            const locked = (PLAN_ORDINAL[theme.requiredPlan || "FREE"] ?? 0) > (PLAN_ORDINAL[userPlan] ?? 0);
            const selected = cfg.themeOverrideId === theme.id;
            const palette = theme.colorPalette || {};
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (locked) {
                    navigate("/upgrade");
                    return;
                  }
                  set("themeOverrideId", theme.id);
                  set("themeName", theme.name);
                }}
                style={{ ...s.card, border: selected ? "2px solid #1C1C1C" : "1px solid #E5E3DE", opacity: locked ? 0.66 : 1 }}
              >
                <div style={{ ...s.preview, background: palette.pageBackground || "#F7F3EA" }}>
                  {locked ? <div style={s.lock}><Lock size={15} /><span>{theme.requiredPlan}</span></div> : null}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[palette.primary, palette.secondary, palette.accent, palette.surfaceBackground].filter(Boolean).slice(0, 4).map((color, index) => (
                      <span key={`${theme.id}-${index}`} style={{ width: 26, height: 26, borderRadius: 999, background: color, border: "1px solid rgba(17,17,17,0.08)" }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 14, width: "65%", height: 14, borderRadius: 999, background: palette.primary || "#1C1C1C", opacity: 0.9 }} />
                  <div style={{ marginTop: 8, width: "42%", height: 10, borderRadius: 999, background: palette.accent || "#BDAA84", opacity: 0.85 }} />
                </div>
                <div style={s.body}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={s.title}>{theme.name}</div>
                    <div style={s.planBadge}>{theme.requiredPlan || "FREE"}</div>
                  </div>
                  <div style={s.text}>{theme.mood?.replace(/_/g, " ") || "Shared theme"}</div>
                  {theme.typography?.headingFont ? (
                    <div style={s.meta}>{theme.typography.headingFont.replace(/["']/g, "").split(",")[0]}</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
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
  center: {
    display: "grid",
    placeItems: "center",
    gap: 8,
    padding: "36px 0",
  },
  loadTxt: {
    fontSize: 12,
    color: "#8A8578",
    fontFamily: "'DM Sans', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  card: {
    position: "relative",
    padding: 0,
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(28,28,28,0.05)",
  },
  preview: {
    position: "relative",
    padding: 16,
    minHeight: 122,
    borderBottom: "1px solid rgba(17,17,17,0.06)",
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1C1C1C",
    fontFamily: "'DM Sans', sans-serif",
  },
  text: {
    marginTop: 4,
    fontSize: 11,
    color: "#817667",
    lineHeight: 1.45,
    fontFamily: "'DM Sans', sans-serif",
  },
  meta: {
    marginTop: 8,
    fontSize: 10,
    color: "#978A77",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
  planBadge: {
    borderRadius: 999,
    background: "#F2EEE7",
    color: "#7A6E5E",
    padding: "4px 7px",
    fontSize: 9.5,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
  lock: {
    position: "absolute",
    inset: 0,
    background: "rgba(17,17,17,0.58)",
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
};
