import { useEffect, useMemo, useRef, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminThemeAPI } from "../../api/api";

const DEFAULT_THEME_CONFIG = {
  description: "",
  colorPalette: {
    primary: "#1f2937",
    secondary: "#475569",
    accent: "#c08457",
    surfaceBackground: "#ffffff",
    pageBackground: "#f8f5ef",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    borderColor: "rgba(17,24,39,0.08)",
    dividerColor: "rgba(17,24,39,0.1)",
    glowColor: "#c08457",
    shadowColor: "rgba(15,23,42,0.18)",
    tagBackground: "#f3eadf",
    tagText: "#8a5a33"
  },
  background: {
    type: "SOLID",
    solidColor: "#f8f5ef",
    gradient: null,
    imageUrl: null,
    textureOverlay: null
  },
  typography: {
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'DM Sans', sans-serif",
    accentFont: "'DM Sans', sans-serif",
    headingFontUrl: null,
    bodyFontUrl: null,
    baseSize: "16px",
    headingScale: 1.2,
    subheadingScale: 1.05,
    labelScale: 0.86,
    headingWeight: 700,
    bodyWeight: 400,
    headingTransform: "none",
    headingStyle: "normal",
    headingLetterSpacing: "0.02em",
    bodyLineHeight: 1.6,
    headingLineHeight: 1.08
  },
  effects: {
    cardBorderRadius: "20px",
    cardShadow: "0 18px 40px rgba(15,23,42,0.12)",
    cardBorderStyle: "1px solid rgba(17,24,39,0.08)",
    cardBackdropFilter: "blur(10px)",
    enableScrollReveal: true,
    enableHoverLift: true,
    enableParallax: false,
    transitionSpeed: "240ms",
    enableGlassmorphism: false,
    enableNeumorphism: false,
    enableGrain: false,
    globalGrainIntensity: 0,
    sectionDividerStyle: "line"
  },
  mood: "CLEAN_MINIMAL",
  targetAudiences: ["FREELANCER"],
  requiredPlan: "FREE",
  featured: false
};

const emptyForm = {
  name: "",
  themeJson: JSON.stringify(DEFAULT_THEME_CONFIG, null, 2),
};

function safeParse(json) {
  try {
    return { value: JSON.parse(json), error: "" };
  } catch {
    return { value: null, error: "Invalid JSON" };
  }
}

const AdminThemesPage = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [jsonErr, setJsonErr] = useState("");
  const previewRef = useRef(null);

  const previewTheme = useMemo(() => safeParse(form.themeJson).value || DEFAULT_THEME_CONFIG, [form.themeJson]);

  const load = () => {
    setLoading(true);
    adminThemeAPI.getAll().then((r) => setThemes(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const validateJson = (str) => {
    const parsed = safeParse(str);
    setJsonErr(parsed.error);
    return !parsed.error;
  };

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.9));
      const fd = new FormData();
      fd.append("file", blob, "theme-preview.png");
      const res = await fetch("/api/admin/upload/preview?type=theme", {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      return data.secureUrl || null;
    } catch (e) {
      console.warn("capturePreview failed", e);
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!validateJson(form.themeJson)) return;

    setSaving(true);
    notify("Capturing preview...", "blue");
    const previewImageUrl = await capturePreview();

    try {
      const parsed = safeParse(form.themeJson).value;
      const payload = {
        name: form.name.trim(),
        ...parsed,
      };
      if (previewImageUrl) payload.previewImageUrl = previewImageUrl;
      const call = editId ? adminThemeAPI.update(editId, payload) : adminThemeAPI.create(payload);
      await call;
      notify(editId ? "Theme updated!" : "Theme created!");
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch {
      notify("Failed to save.", "red");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (theme) => {
    const editable = {
      description: theme.description || "",
      colorPalette: theme.colorPalette || DEFAULT_THEME_CONFIG.colorPalette,
      background: theme.background || DEFAULT_THEME_CONFIG.background,
      typography: theme.typography || DEFAULT_THEME_CONFIG.typography,
      effects: theme.effects || DEFAULT_THEME_CONFIG.effects,
      mood: theme.mood || "CLEAN_MINIMAL",
      targetAudiences: theme.targetAudiences || ["FREELANCER"],
      requiredPlan: theme.requiredPlan || "FREE",
      featured: theme.featured || false,
      previewVideoUrl: theme.previewVideoUrl || null,
    };
    setEditId(theme.id);
    setForm({ name: theme.name || "", themeJson: JSON.stringify(editable, null, 2) });
    setJsonErr("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Deactivate this theme?")) return;
    adminThemeAPI.deactivate(id)
      .then(() => { notify("Deactivated.", "red"); load(); })
      .catch(() => notify("Failed.", "red"));
  };

  const toastCls = { green: "bg-green-50 text-green-700 border border-green-200", red: "bg-red-50 text-red-700 border border-red-200" };
  const headingFontLabel = (previewTheme.typography?.headingFont || "Default").replace(/["']/g, "").split(",")[0];

  return (
    <AdminDashboardLayout
      title="Themes"
      subtitle="Create and manage portfolio themes"
      rightAction={
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setJsonErr(""); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Theme
        </button>
      }
    >
      {toast.msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toastCls[toast.type] || "bg-blue-50 text-blue-700 border border-blue-200"}`}>{toast.msg}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">
            {editId ? "Edit Theme" : "New Theme"}
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Theme Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ocean Editorial"
              className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Theme JSON
              {jsonErr && <span className="ml-2 text-red-500 normal-case">{jsonErr}</span>}
            </label>
            <textarea
              rows={22}
              value={form.themeJson}
              onChange={(e) => { setForm({ ...form, themeJson: e.target.value }); validateJson(e.target.value); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">
            Save `description`, `colorPalette`, `background`, `typography`, `effects`, `mood`, `targetAudiences`, `requiredPlan`, and `featured` here. This matches the backend DTO directly.
          </div>

          <div ref={previewRef} style={{ padding: "10px", background: "#fff", display: "inline-block", minWidth: "280px" }}>
            <ThemePreview theme={previewTheme} />
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : editId ? "Update Theme" : "Create Theme"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">Preview font: {headingFontLabel}</div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading themes...</p>}

      {!loading && themes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">Themes</div>
          <p className="text-gray-400 font-medium">No themes yet. Create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {themes.map((theme) => (
          <div key={theme.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="relative">
              {theme.previewImageUrl ? (
                <img src={theme.previewImageUrl} alt={theme.name} className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div style={{ height: "192px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                  <ColorBar palette={theme.colorPalette} />
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-900 text-base mb-1 truncate" title={theme.name}>{theme.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{theme.typography?.headingFont?.replace(/["']/g, "").split(",")[0] || "-"}</p>
              <div className="mt-2 text-[11px] text-gray-500 space-y-1">
                <div>Mood: {theme.mood || "-"}</div>
                <div>Plan: {theme.requiredPlan || "FREE"}</div>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <button onClick={() => startEdit(theme)} className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button>
                <button onClick={() => handleDeactivate(theme.id)} className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

const ColorBar = ({ palette = {} }) => {
  const colors = [palette.primary, palette.secondary, palette.accent, palette.pageBackground].filter(Boolean);
  return (
    <div className="flex h-7 w-full">
      {colors.map((color, index) => (
        <div key={index} className="flex-1" style={{ background: color }} title={color} />
      ))}
    </div>
  );
};

const ThemePreview = ({ theme }) => {
  const colors = theme.colorPalette || DEFAULT_THEME_CONFIG.colorPalette;
  const typography = theme.typography || DEFAULT_THEME_CONFIG.typography;
  const effects = theme.effects || DEFAULT_THEME_CONFIG.effects;
  const background = theme.background || DEFAULT_THEME_CONFIG.background;

  const backgroundStyle = background.type === "GRADIENT" && background.gradient
    ? { background: `linear-gradient(${background.gradient.angle || 135}deg, ${(background.gradient.stops || []).map((stop) => `${stop.color} ${stop.position}%`).join(", ")})` }
    : { background: background.solidColor || colors.pageBackground };

  return (
    <div
      className="border p-4 mt-2"
      style={{
        ...backgroundStyle,
        color: colors.textPrimary,
        borderRadius: effects.cardBorderRadius || "20px",
        borderColor: colors.borderColor || "rgba(17,24,39,0.08)",
        boxShadow: effects.cardShadow || "0 18px 40px rgba(15,23,42,0.12)",
        minWidth: 260,
      }}
    >
      <div style={{ fontFamily: typography.headingFont, fontWeight: typography.headingWeight, fontSize: 24, marginBottom: 8 }}>
        {theme.mood?.replace(/_/g, " ") || "Theme Preview"}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <span style={{ background: colors.primary, color: "#fff", padding: "4px 10px", borderRadius: 999 }}>Primary</span>
        <span style={{ background: colors.accent, color: "#fff", padding: "4px 10px", borderRadius: 999 }}>Accent</span>
      </div>
      <div style={{ fontFamily: typography.bodyFont, color: colors.textSecondary, lineHeight: typography.bodyLineHeight }}>
        Structured theme preview using the real backend color palette, typography, background, and effects fields.
      </div>
    </div>
  );
};

export default AdminThemesPage;
