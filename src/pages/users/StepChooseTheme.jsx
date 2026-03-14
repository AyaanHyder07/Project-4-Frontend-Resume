/**
 * StepChooseTheme.jsx
 * Step 3 of Resume Creation Studio
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { themeAPI } from "./resumeStudioAPI";
import { Loader2, Lock } from "lucide-react";

export default function StepChooseTheme({ cfg, set, userPlan }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    themeAPI
      .getAll()
      .then((data) => {
        console.log("FETCHED THEMES:", data);
        setThemes(Array.isArray(data) ? data : (data?.content || data?.data || []));
      })
      .catch((err) => {
        console.error("THEME FETCH ERROR:", err);
        setThemes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={{ fontSize: 13, color: "#5A5550", marginBottom: 16 }}>
        Select a color and typography theme. Or keep the template's default.
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#1C1C1C" }} />
          <div style={{ fontSize: 12, marginTop: 10, color: "#8A8578" }}>Loading themes...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Default Theme Option */}
          <div
            onClick={() => {
              set("themeOverrideId", null);
              set("themeName", "Default");
            }}
            style={{
              padding: 16,
              borderRadius: 12,
              border: cfg.themeOverrideId === null ? "2px solid #1C1C1C" : "1.5px solid #E5E3DE",
              background: "#fff",
              cursor: "pointer",
              boxShadow: cfg.themeOverrideId === null ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1C1C1C", marginBottom: 4 }}>
              Template Default
            </div>
            <div style={{ fontSize: 11, color: "#8A8578" }}>
              Use original template styles
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E5E3DE", border: "1px solid #D5D3CE" }} />
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#B0AB9E", border: "1px solid #D5D3CE" }} />
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#5A5550", border: "1px solid #D5D3CE" }} />
            </div>
          </div>

          {themes.map((t) => {
            const isSelected = cfg.themeOverrideId === t.id;
            const pOpts = t.colorPalette || {};
            const pri = pOpts.primary || "#1C1C1C";
            const acc = pOpts.accent || "#4A6FA5";
            const bg = pOpts.pageBackground || "#F5F3EE";
            
            const reqPlan = t.requiredPlan || "FREE";
            const PLAN_ORDINAL = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };
            const userOrdinal = PLAN_ORDINAL[userPlan] ?? 0;
            const planOrd = PLAN_ORDINAL[reqPlan] ?? 0;
            const locked = userOrdinal < planOrd;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (locked) {
                    navigate("/upgrade");
                    return;
                  }
                  set("themeOverrideId", t.id);
                  set("themeName", t.name);
                }}
                style={{
                  position: "relative",
                  padding: 16,
                  borderRadius: 12,
                  border: isSelected ? "2px solid #1C1C1C" : "1.5px solid #E5E3DE",
                  background: "#fff",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.6 : 1,
                  boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {locked && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, zIndex: 10 }}>
                    <Lock size={16} color="#fff" />
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.5px" }}>{reqPlan}</span>
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1C1C1C", marginBottom: 4 }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: "#8A8578", textTransform: "capitalize" }}>
                  {locked ? "💎 Premium" : (t.primaryMood?.replace(/_/g, " ").toLowerCase() || "Theme")}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: pri, border: "1px solid #E5E3DE" }} />
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: acc, border: "1px solid #E5E3DE" }} />
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, border: "1px solid #E5E3DE" }} />
                </div>
                {t.typography && (
                  <div style={{ fontSize: 10, color: "#8A8578", marginTop: 8 }}>
                    {t.typography.headingFont?.replace(/['"]/g, '').split(',')[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
