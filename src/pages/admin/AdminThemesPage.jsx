import { useEffect, useMemo, useRef, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminThemeAPI } from "../../api/api";

const THEME_PRESETS = [
  {
    name: "Sandstone Editorial",
    mood: "CLEAN_MINIMAL",
    requiredPlan: "FREE",
    description: "Warm editorial neutral theme for professional portfolios.",
    colorPalette: { primary: "#1f1d1a", secondary: "#7c6f5d", accent: "#b88b5c", surfaceBackground: "#fffdf8", pageBackground: "#f5efe4", textPrimary: "#1f1d1a", textSecondary: "#6b6254", textMuted: "#9f9485", borderColor: "rgba(31,29,26,0.08)", dividerColor: "rgba(31,29,26,0.1)", glowColor: "#c08457", shadowColor: "rgba(15,23,42,0.18)", tagBackground: "#f3eadf", tagText: "#8a5a33" },
    background: { type: "SOLID", solidColor: "#f5efe4", gradient: null, imageUrl: null, textureOverlay: null },
    typography: { headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'DM Sans', sans-serif", accentFont: "'DM Sans', sans-serif", baseSize: "16px", headingScale: 1.2, subheadingScale: 1.05, labelScale: 0.86, headingWeight: 700, bodyWeight: 400, headingTransform: "none", headingStyle: "normal", headingLetterSpacing: "0.02em", bodyLineHeight: 1.6, headingLineHeight: 1.08 },
    effects: { cardBorderRadius: "20px", cardShadow: "0 18px 40px rgba(15,23,42,0.12)", cardBorderStyle: "1px solid rgba(17,24,39,0.08)", cardBackdropFilter: "blur(10px)", enableScrollReveal: true, enableHoverLift: true, enableParallax: false, transitionSpeed: "240ms", enableGlassmorphism: false, enableNeumorphism: false, enableGrain: false, globalGrainIntensity: 0, sectionDividerStyle: "line" },
    targetAudiences: ["FREELANCER"],
    featured: true,
  },
  {
    name: "Indigo Product Studio",
    mood: "FUTURISTIC_TECH",
    requiredPlan: "PRO",
    description: "Sharper product and SaaS-oriented premium theme.",
    colorPalette: { primary: "#1f2a5a", secondary: "#5f6db4", accent: "#63c4ff", surfaceBackground: "#ffffff", pageBackground: "#eef3ff", textPrimary: "#182033", textSecondary: "#5b6786", textMuted: "#93a0bf", borderColor: "rgba(24,32,51,0.09)", dividerColor: "rgba(24,32,51,0.12)", glowColor: "#63c4ff", shadowColor: "rgba(31,42,90,0.22)", tagBackground: "#dfe8ff", tagText: "#3350b1" },
    background: { type: "GRADIENT", solidColor: null, gradient: { angle: 135, stops: [{ color: "#eef3ff", position: 0 }, { color: "#f9fbff", position: 100 }] }, imageUrl: null, textureOverlay: null },
    typography: { headingFont: "'DM Sans', sans-serif", bodyFont: "'DM Sans', sans-serif", accentFont: "'DM Sans', sans-serif", baseSize: "16px", headingScale: 1.18, subheadingScale: 1.02, labelScale: 0.84, headingWeight: 800, bodyWeight: 400, headingTransform: "none", headingStyle: "normal", headingLetterSpacing: "-0.02em", bodyLineHeight: 1.6, headingLineHeight: 1.02 },
    effects: { cardBorderRadius: "18px", cardShadow: "0 18px 36px rgba(31,42,90,0.14)", cardBorderStyle: "1px solid rgba(24,32,51,0.08)", cardBackdropFilter: "blur(14px)", enableScrollReveal: true, enableHoverLift: true, enableParallax: false, transitionSpeed: "220ms", enableGlassmorphism: false, enableNeumorphism: false, enableGrain: false, globalGrainIntensity: 0, sectionDividerStyle: "line" },
    targetAudiences: ["FREELANCER", "CREATOR"],
    featured: true,
  },
  {
    name: "Midnight Gallery",
    mood: "DARK_DRAMATIC",
    requiredPlan: "PREMIUM",
    description: "Cinematic dark theme for gallery-first creative work.",
    colorPalette: { primary: "#0f1014", secondary: "#363b4a", accent: "#f5a524", surfaceBackground: "#171921", pageBackground: "#0b0c10", textPrimary: "#f5f3ef", textSecondary: "#c4c0b5", textMuted: "#8c8798", borderColor: "rgba(255,255,255,0.08)", dividerColor: "rgba(255,255,255,0.12)", glowColor: "#f5a524", shadowColor: "rgba(0,0,0,0.32)", tagBackground: "rgba(245,165,36,0.15)", tagText: "#f8be57" },
    background: { type: "SOLID", solidColor: "#0b0c10", gradient: null, imageUrl: null, textureOverlay: null },
    typography: { headingFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'DM Sans', sans-serif", accentFont: "'DM Sans', sans-serif", baseSize: "16px", headingScale: 1.24, subheadingScale: 1.08, labelScale: 0.86, headingWeight: 700, bodyWeight: 400, headingTransform: "none", headingStyle: "normal", headingLetterSpacing: "0.01em", bodyLineHeight: 1.68, headingLineHeight: 1.04 },
    effects: { cardBorderRadius: "20px", cardShadow: "0 18px 42px rgba(0,0,0,0.28)", cardBorderStyle: "1px solid rgba(255,255,255,0.08)", cardBackdropFilter: "blur(12px)", enableScrollReveal: true, enableHoverLift: true, enableParallax: true, transitionSpeed: "260ms", enableGlassmorphism: false, enableNeumorphism: false, enableGrain: true, globalGrainIntensity: 14, sectionDividerStyle: "line" },
    targetAudiences: ["CREATOR"],
    featured: true,
  },
];

const emptyForm = {
  name: "",
  themeJson: JSON.stringify(THEME_PRESETS[0], null, 2),
};

function safeParse(json) {
  try { return { value: JSON.parse(json), error: "" }; }
  catch { return { value: null, error: "Invalid JSON" }; }
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "green" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [jsonErr, setJsonErr] = useState("");
  const previewRef = useRef(null);
  const previewTheme = useMemo(() => safeParse(form.themeJson).value || THEME_PRESETS[0], [form.themeJson]);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "green" }), 2500);
  };

  const load = () => {
    setLoading(true);
    adminThemeAPI.getAll().then((response) => setThemes(response.data || [])).catch(() => { setThemes([]); notify("Themes could not be loaded.", "red"); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const validateJson = (value) => {
    const parsed = safeParse(value);
    setJsonErr(parsed.error);
    return !parsed.error;
  };

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.9));
      const fd = new FormData();
      fd.append("file", blob, "theme-preview.png");
      const response = await fetch("/api/admin/upload/preview?type=theme", { method: "POST", body: fd, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const data = await response.json();
      return data.secureUrl || null;
    } catch {
      return null;
    }
  };

  const applyPreset = (preset) => {
    setForm({ name: preset.name, themeJson: JSON.stringify(preset, null, 2) });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      notify("Theme name is required.", "red");
      return;
    }
    if (!validateJson(form.themeJson)) return;
    setSaving(true);
    const previewImageUrl = await capturePreview();
    try {
      const payload = { name: form.name.trim(), ...safeParse(form.themeJson).value };
      if (previewImageUrl) payload.previewImageUrl = previewImageUrl;
      if (editId) await adminThemeAPI.update(editId, payload);
      else await adminThemeAPI.create(payload);
      notify(editId ? "Theme updated." : "Theme created.");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch {
      notify("Theme could not be saved.", "red");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (theme) => {
    const editable = {
      description: theme.description || "",
      colorPalette: theme.colorPalette || THEME_PRESETS[0].colorPalette,
      background: theme.background || THEME_PRESETS[0].background,
      typography: theme.typography || THEME_PRESETS[0].typography,
      effects: theme.effects || THEME_PRESETS[0].effects,
      mood: theme.mood || "CLEAN_MINIMAL",
      targetAudiences: theme.targetAudiences || ["FREELANCER"],
      requiredPlan: theme.requiredPlan || "FREE",
      featured: !!theme.featured,
      previewVideoUrl: theme.previewVideoUrl || null,
    };
    setEditId(theme.id);
    setForm({ name: theme.name || "", themeJson: JSON.stringify(editable, null, 2) });
    setShowForm(true);
    setJsonErr("");
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this theme?")) return;
    try {
      await adminThemeAPI.deactivate(id);
      notify("Theme deactivated.", "red");
      load();
    } catch {
      notify("Could not deactivate theme.", "red");
    }
  };

  const headingFontLabel = (previewTheme.typography?.headingFont || "Default").replace(/["']/g, "").split(",")[0];

  return (
    <AdminDashboardLayout
      title="Themes"
      subtitle="Shared visual systems that can be reused across layouts and premium template bundles"
      rightAction={<button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setJsonErr(""); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ New Theme</button>}
    >
      {toast.msg ? <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toast.type === "red" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{toast.msg}</div> : null}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-3">Starter Theme Presets</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)} className="text-left rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-semibold text-gray-900 text-sm">{preset.name}</div>
              <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">{editId ? "Edit Theme" : "New Theme"}</h2>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Theme Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Theme JSON {jsonErr ? <span className="text-red-500 normal-case">{jsonErr}</span> : null}</label>
            <textarea rows={22} value={form.themeJson} onChange={(e) => { setForm({ ...form, themeJson: e.target.value }); validateJson(e.target.value); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">Use these fields to manage a reusable premium theme catalog. This JSON maps directly to the backend DTO.</div>
          <div ref={previewRef} style={{ padding: "10px", background: "#fff", display: "inline-block", minWidth: "280px" }}><ThemePreview theme={previewTheme} /></div>
          <div className="mt-3 text-xs text-gray-500">Preview font: {headingFontLabel}</div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editId ? "Update Theme" : "Create Theme"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-gray-400 text-sm">Loading themes...</p> : null}
      {!loading && themes.length === 0 ? <div className="text-center py-20 text-gray-500">No themes yet. Use the starter presets above to build the shared theme library.</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <article key={theme.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative">{theme.previewImageUrl ? <img src={theme.previewImageUrl} alt={theme.name} className="w-full h-48 object-cover object-top" /> : <div style={{ height: "192px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}><ColorBar palette={theme.colorPalette} /></div>}</div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-base mb-1">{theme.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{theme.typography?.headingFont?.replace(/["']/g, "").split(",")[0] || "-"}</p>
              <div className="mt-2 text-[11px] text-gray-500 space-y-1"><div>Mood: {theme.mood || "-"}</div><div>Plan: {theme.requiredPlan || "FREE"}</div></div>
              <div className="mt-4 flex gap-2"><button onClick={() => startEdit(theme)} className="flex-1 py-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button><button onClick={() => handleDeactivate(theme.id)} className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Deactivate</button></div>
            </div>
          </article>
        ))}
      </div>
    </AdminDashboardLayout>
  );
}

function ColorBar({ palette = {} }) {
  const colors = [palette.primary, palette.secondary, palette.accent, palette.pageBackground].filter(Boolean);
  return <div className="flex h-7 w-full">{colors.map((color, index) => <div key={index} className="flex-1" style={{ background: color }} title={color} />)}</div>;
}

function ThemePreview({ theme }) {
  const colors = theme.colorPalette || THEME_PRESETS[0].colorPalette;
  const typography = theme.typography || THEME_PRESETS[0].typography;
  const effects = theme.effects || THEME_PRESETS[0].effects;
  const background = theme.background || THEME_PRESETS[0].background;
  const backgroundStyle = background.type === "GRADIENT" && background.gradient
    ? { background: `linear-gradient(${background.gradient.angle || 135}deg, ${(background.gradient.stops || []).map((stop) => `${stop.color} ${stop.position}%`).join(", ")})` }
    : { background: background.solidColor || colors.pageBackground };
  return (
    <div className="border p-4 mt-2" style={{ ...backgroundStyle, color: colors.textPrimary, borderRadius: effects.cardBorderRadius || "20px", borderColor: colors.borderColor || "rgba(17,24,39,0.08)", boxShadow: effects.cardShadow || "0 18px 40px rgba(15,23,42,0.12)", minWidth: 260 }}>
      <div style={{ fontFamily: typography.headingFont, fontWeight: typography.headingWeight, fontSize: 24, marginBottom: 8 }}>{theme.mood?.replace(/_/g, " ") || "Theme Preview"}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}><span style={{ background: colors.primary, color: "#fff", padding: "4px 10px", borderRadius: 999 }}>Primary</span><span style={{ background: colors.accent, color: "#fff", padding: "4px 10px", borderRadius: 999 }}>Accent</span></div>
      <div style={{ fontFamily: typography.bodyFont, color: colors.textSecondary, lineHeight: typography.bodyLineHeight }}>Reusable theme preview using the backend palette, typography, background, and effect fields.</div>
    </div>
  );
}
