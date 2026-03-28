import { useEffect, useMemo, useState } from "react";
import { themeCustomAPI } from "../editorAPI";
import { Field, Input, Select, FormActions, ErrorBox, SectionLoader } from "../sectionAtoms";

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

const densityOptions = [
  { value: "compact", label: "Compact" },
  { value: "balanced", label: "Balanced" },
  { value: "spacious", label: "Spacious" },
];

const widthOptions = [
  { value: "narrow", label: "Narrow canvas" },
  { value: "normal", label: "Standard canvas" },
  { value: "wide", label: "Wide canvas" },
];

const heroOptions = [
  { value: "focused", label: "Focused" },
  { value: "split", label: "Split" },
  { value: "stacked", label: "Stacked" },
];

const cardOptions = [
  { value: "soft", label: "Soft" },
  { value: "outlined", label: "Outlined" },
  { value: "glass", label: "Glass" },
  { value: "solid", label: "Solid" },
];

const navOptions = [
  { value: "auto", label: "Auto from sections" },
  { value: "minimal", label: "Minimal" },
  { value: "tabs", label: "Tabs" },
  { value: "sidebar", label: "Sidebar" },
  { value: "none", label: "No nav" },
];

function cleanMap(map) {
  return Object.fromEntries(
    Object.entries(map || {}).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
  );
}

export default function LayoutCustomizationPanel({ resumeId, userId, userPlan, resume, onNotify, onPreviewDraftChange }) {
  const canUse = (PLAN_ORD[userPlan] ?? 0) >= 3;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [customization, setCustomization] = useState({ templateOptions: {}, templateLabels: {} });

  useEffect(() => {
    if (!canUse || !userId) {
      setLoading(false);
      return;
    }
    let active = true;
    themeCustomAPI.get(userId, resumeId)
      .then((data) => {
        if (!active) return;
        setCustomization({
          ...(data || {}),
          templateOptions: data?.templateOptions || {},
          templateLabels: data?.templateLabels || {},
        });
      })
      .catch(() => {
        if (!active) return;
        setCustomization({ templateOptions: {}, templateLabels: {} });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canUse, userId, resumeId]);

  const updateDraft = (next) => {
    onPreviewDraftChange?.("templateOptions", next.templateOptions || {});
    onPreviewDraftChange?.("templateLabels", next.templateLabels || {});
  };

  const setOption = (key, value) => {
    setCustomization((prev) => {
      const next = {
        ...prev,
        templateOptions: {
          ...(prev.templateOptions || {}),
          [key]: value,
        },
      };
      updateDraft(next);
      return next;
    });
  };

  const setLabel = (key, value) => {
    setCustomization((prev) => {
      const next = {
        ...prev,
        templateLabels: {
          ...(prev.templateLabels || {}),
          [key]: value,
        },
      };
      updateDraft(next);
      return next;
    });
  };

  const payload = useMemo(() => ({
    ...customization,
    baseThemeId: resume?.themeId || customization?.baseThemeId || null,
    templateOptions: cleanMap(customization.templateOptions),
    templateLabels: cleanMap(customization.templateLabels),
  }), [customization, resume?.themeId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await themeCustomAPI.save(userId, resumeId, payload);
      onNotify?.("Premium layout customization saved");
    } catch (e) {
      setError(e?.message || "Unable to save customization right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const next = {
      ...customization,
      templateOptions: {},
      templateLabels: {},
    };
    setCustomization(next);
    updateDraft(next);
    setSaving(true);
    setError(null);
    try {
      await themeCustomAPI.save(userId, resumeId, {
        ...next,
        baseThemeId: resume?.themeId || next?.baseThemeId || null,
      });
      onNotify?.("Premium layout customization reset");
    } catch (e) {
      setError(e?.message || "Unable to reset customization right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!canUse) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: "2px dashed #E5E3DE", borderRadius: 14, background: "#FAFAF8" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>Ã¢Å“Â¨</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C", fontFamily: "'DM Serif Display',serif", marginBottom: 6 }}>
          Premium Layout Customization
        </div>
        <div style={{ fontSize: 12, color: "#8A8578", fontFamily: "'DM Sans',sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
          Resize sections, adjust density, change card behavior, and edit template-only copy live.<br />
          Available on <strong>PREMIUM</strong> plans.
        </div>
        <a href="/upgrade" style={{ background: "#7B3FA0", color: "#fff", borderRadius: 9, padding: "9px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>
          Upgrade to PREMIUM Ã¢â€ â€™
        </a>
      </div>
    );
  }

  if (loading) return <SectionLoader />;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: "8px 12px", borderRadius: 8, background: "#EEF6FF", border: "1px solid #BFDBFE", fontSize: 11, color: "#1d4ed8", marginBottom: 16 }}>
        Live structure controls for PREMIUM users. Changes appear instantly in the preview and save into your public page configuration.
      </div>

      <ErrorBox msg={error} />

      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1C1C", marginBottom: 10 }}>Structure</div>
      <Field label="Density">
        <Select value={customization.templateOptions?.densityMode || "balanced"} onChange={(value) => setOption("densityMode", value)} options={densityOptions} />
      </Field>
      <Field label="Content Width">
        <Select value={customization.templateOptions?.contentWidth || "normal"} onChange={(value) => setOption("contentWidth", value)} options={widthOptions} />
      </Field>
      <Field label="Hero Layout">
        <Select value={customization.templateOptions?.heroLayout || "focused"} onChange={(value) => setOption("heroLayout", value)} options={heroOptions} />
      </Field>
      <Field label="Card Style">
        <Select value={customization.templateOptions?.cardStyle || "soft"} onChange={(value) => setOption("cardStyle", value)} options={cardOptions} />
      </Field>
      <Field label="Navigation Mode">
        <Select value={customization.templateOptions?.navMode || "auto"} onChange={(value) => setOption("navMode", value)} options={navOptions} />
      </Field>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1C1C", margin: "18px 0 10px" }}>Template Copy</div>
      <Field label="Hero Eyebrow" hint="Small label above the main headline">
        <Input value={customization.templateLabels?.heroEyebrow || ""} onChange={(value) => setLabel("heroEyebrow", value)} placeholder="e.g. Product engineer portfolio" />
      </Field>
      <Field label="Hero Tagline" hint="Optional supporting line for the hero">
        <Input value={customization.templateLabels?.heroTagline || ""} onChange={(value) => setLabel("heroTagline", value)} placeholder="e.g. Building clear products and reliable systems" />
      </Field>
      <Field label="Primary CTA">
        <Input value={customization.templateLabels?.primaryCta || ""} onChange={(value) => setLabel("primaryCta", value)} placeholder="e.g. View Projects" />
      </Field>
      <Field label="Secondary CTA">
        <Input value={customization.templateLabels?.secondaryCta || ""} onChange={(value) => setLabel("secondaryCta", value)} placeholder="e.g. Contact Me" />
      </Field>
      <Field label="Services Section Title">
        <Input value={customization.templateLabels?.servicesTitle || ""} onChange={(value) => setLabel("servicesTitle", value)} placeholder="e.g. Services" />
      </Field>
      <Field label="Projects Section Title">
        <Input value={customization.templateLabels?.projectsTitle || ""} onChange={(value) => setLabel("projectsTitle", value)} placeholder="e.g. Selected Work" />
      </Field>

      <FormActions onSave={handleSave} saving={saving} saveLabel="Save Premium Customization" />
      <button onClick={handleReset} style={{ width: "100%", marginTop: 8, padding: "9px", border: "1.5px solid #E5E3DE", borderRadius: 9, background: "transparent", color: "#B43C3C", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
        Reset Layout Overrides
      </button>
    </div>
  );
}