import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { publicAPI, subscriptionAPI } from "../../api/api";
import { resumeAPI, themeCustomAPI } from "../users/editorAPI";
import TemplateRenderer from "../../templates/TemplateRenderer";

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

const densityOptions = ["compact", "balanced", "spacious"];
const widthOptions = ["narrow", "normal", "wide"];
const cardOptions = ["soft", "outlined", "glass", "solid"];
const navOptions = ["auto", "minimal", "tabs", "sidebar", "none"];

function cleanMap(map) {
  return Object.fromEntries(Object.entries(map || {}).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== ""));
}

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [canCustomize, setCanCustomize] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ templateOptions: {}, templateLabels: {} });
  const wrapperRef = useRef(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const customizeRequested = searchParams.get("customize") === "1";

  useEffect(() => {
    let active = true;
    publicAPI
      .getPortfolio(slug)
      .then((res) => {
        if (!active) return;
        const next = res.data;
        setPortfolio(next);
        setDraft({
          templateOptions: next?.templateOptions || {},
          templateLabels: next?.templateLabels || {},
        });
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!portfolio?.resumeId || !token || !customizeRequested) {
      setCanCustomize(false);
      setCustomizeMode(false);
      return;
    }
    let active = true;
    Promise.all([
      subscriptionAPI.getMyPlan().catch(() => null),
      resumeAPI.getById(portfolio.resumeId).catch(() => null),
    ]).then(([planRes, resume]) => {
      if (!active) return;
      const plan = typeof planRes?.data === "string" ? planRes.data : typeof planRes === "string" ? planRes : "FREE";
      const allowed = Boolean(resume?.id) && (PLAN_ORD[plan] ?? 0) >= 3;
      setCanCustomize(allowed);
      setCustomizeMode(allowed);
    }).catch(() => {
      if (active) setCanCustomize(false);
    });
    return () => {
      active = false;
    };
  }, [portfolio?.resumeId, token, userId, customizeRequested]);

  useEffect(() => {
    if (!customizeMode || !wrapperRef.current) return;
    const root = wrapperRef.current;
    const onClick = (event) => {
      const region = event.target.closest("[data-customize-region], section[id], [data-custom-block-id]");
      if (!region || !root.contains(region)) return;
      const regionKey = region.getAttribute("data-region-key") || region.getAttribute("id") || region.getAttribute("data-custom-block-id") || "region";
      setSelectedRegion(regionKey);
    };
    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [customizeMode]);

  const mergedPortfolio = useMemo(() => {
    if (!portfolio) return null;
    return {
      ...portfolio,
      templateOptions: {
        ...(portfolio.templateOptions || {}),
        ...(draft.templateOptions || {}),
      },
      templateLabels: {
        ...(portfolio.templateLabels || {}),
        ...(draft.templateLabels || {}),
      },
    };
  }, [portfolio, draft]);

  const setOption = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      templateOptions: {
        ...(prev.templateOptions || {}),
        [key]: value,
      },
    }));
  };

  const setLabel = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      templateLabels: {
        ...(prev.templateLabels || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!portfolio?.resumeId || !userId) return;
    setSaving(true);
    try {
      await themeCustomAPI.save(userId, portfolio.resumeId, {
        baseThemeId: portfolio?.theme?.themeId || portfolio?.themeData?.themeId || portfolio?.templateMeta?.templateId || "",
        templateOptions: cleanMap(draft.templateOptions),
        templateLabels: cleanMap(draft.templateLabels),
      });
      setPortfolio((prev) => ({
        ...prev,
        templateOptions: cleanMap(draft.templateOptions),
        templateLabels: cleanMap(draft.templateLabels),
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading portfolio...</div>;
  if (notFound) return <div style={{ padding: "2rem" }}>Portfolio not found.</div>;
  if (!portfolio) return null;

  return (
    <div>
      {canCustomize && customizeMode ? (
        <style>{`
          .public-customize-mode section[id],
          .public-customize-mode [data-custom-block-id],
          .public-customize-mode [data-customize-region] {
            position: relative;
            cursor: pointer;
            outline: 1px dashed rgba(74,111,165,0.28);
            outline-offset: 6px;
          }
          .public-customize-mode section[id]:hover,
          .public-customize-mode [data-custom-block-id]:hover,
          .public-customize-mode [data-customize-region]:hover {
            outline-color: rgba(74,111,165,0.8);
          }
        `}</style>
      ) : null}

      {canCustomize && customizeRequested ? (
        <button
          type="button"
          onClick={() => setCustomizeMode((prev) => !prev)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 60,
            border: "none",
            borderRadius: 999,
            padding: "12px 16px",
            background: customizeMode ? "#111827" : "#1d4ed8",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
          }}
        >
          {customizeMode ? "Close Customize Mode" : "Customize Page"}
        </button>
      ) : null}

      {canCustomize && customizeMode ? (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: 340,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          zIndex: 55,
          padding: 18,
          borderRadius: 22,
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", fontWeight: 700 }}>Premium Visual Customize</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#334155", lineHeight: 1.6 }}>
            Hover and click a visible region to inspect it. Layout controls below apply live to the real public page.
          </div>
          {selectedRegion ? <div style={{ marginTop: 10, fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>Selected: {selectedRegion}</div> : null}

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <label style={fieldLabel}>Density<select value={draft.templateOptions?.densityMode || "balanced"} onChange={(e) => setOption("densityMode", e.target.value)} style={fieldInput}>{densityOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label style={fieldLabel}>Content Width<select value={draft.templateOptions?.contentWidth || "normal"} onChange={(e) => setOption("contentWidth", e.target.value)} style={fieldInput}>{widthOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label style={fieldLabel}>Card Style<select value={draft.templateOptions?.cardStyle || "soft"} onChange={(e) => setOption("cardStyle", e.target.value)} style={fieldInput}>{cardOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label style={fieldLabel}>Navigation<select value={draft.templateOptions?.navMode || "auto"} onChange={(e) => setOption("navMode", e.target.value)} style={fieldInput}>{navOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label style={fieldLabel}>Hero Eyebrow<input value={draft.templateLabels?.heroEyebrow || ""} onChange={(e) => setLabel("heroEyebrow", e.target.value)} style={fieldInput} placeholder="Hero eyebrow" /></label>
            <label style={fieldLabel}>Hero Tagline<textarea value={draft.templateLabels?.heroTagline || ""} onChange={(e) => setLabel("heroTagline", e.target.value)} style={{ ...fieldInput, minHeight: 84, resize: "vertical" }} placeholder="Hero tagline" /></label>
          </div>

          <button type="button" onClick={handleSave} disabled={saving} style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 14, padding: "12px 14px", background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {saving ? "Saving..." : "Save Customization"}
          </button>
        </div>
      ) : null}

      <div ref={wrapperRef} className={canCustomize && customizeMode ? "public-customize-mode" : undefined}>
        <TemplateRenderer portfolio={mergedPortfolio} />
      </div>
    </div>
  );
}

const fieldLabel = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: "#334155",
  fontWeight: 700,
};

const fieldInput = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  padding: "10px 12px",
  font: "inherit",
  boxSizing: "border-box",
  background: "#fff",
};
