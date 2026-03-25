import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminTemplateAPI, adminLayoutAPI, adminThemeAPI, templateAPI, layoutAPI, themeAPI } from "../../api/api";
import { Lock, Star, Sparkles } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  tagline: "",
  planLevel: "FREE",
  layoutId: "",
  defaultThemeId: "",
  supportedSections: ["PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CONTACT"],
  requiredSections: ["PROFILE"],
  targetAudiences: ["FREELANCER"],
  professionTags: [],
  primaryMood: "CLEAN_MINIMAL",
  featured: false,
  isNew: false,
  active: true,
};

const SECTION_OPTIONS = [
  "PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS",
  "PROJECT_GALLERY", "CERTIFICATIONS", "FINANCIAL_CREDENTIALS",
  "PUBLICATIONS", "BLOG_POSTS", "MEDIA_APPEARANCES",
  "EXHIBITIONS_AWARDS", "TESTIMONIALS", "SERVICE_OFFERINGS", "CONTACT",
];

const PLAN_OPTIONS = ["FREE", "BASIC", "PRO", "PREMIUM"];
const MOOD_OPTIONS = [
  "CLEAN_MINIMAL", "BOLD_VIBRANT", "DARK_DRAMATIC", "EARTHY_ORGANIC", "LUXURY_ELEGANT",
  "PLAYFUL_QUIRKY", "CORPORATE_FORMAL", "RETRO_VINTAGE", "FUTURISTIC_TECH", "ARTISTIC_EXPRESSIVE",
];

const normalizeResponse = (result) => result?.data ?? result ?? [];

const AdminTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const loadCatalogSafely = async (preferredCall, fallbackCall, emptyMessage) => {
    try {
      return normalizeResponse(await preferredCall());
    } catch (primaryError) {
      try {
        return normalizeResponse(await fallbackCall());
      } catch (fallbackError) {
        console.error(primaryError);
        console.error(fallbackError);
        notify(emptyMessage, "red");
        return [];
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, layoutsData, themesData] = await Promise.all([
        loadCatalogSafely(() => adminTemplateAPI.getAll(), () => templateAPI.getAvailable(), "Templates could not be loaded."),
        loadCatalogSafely(() => adminLayoutAPI.getAll(), () => layoutAPI.getAll(), "Layouts could not be loaded."),
        loadCatalogSafely(() => adminThemeAPI.getAll(), () => themeAPI.getAll(), "Themes could not be loaded."),
      ]);

      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setLayouts(Array.isArray(layoutsData) ? layoutsData : []);
      setThemes(Array.isArray(themesData) ? themesData : []);
    } catch (e) {
      console.error(e);
      notify("Failed to load template data.", "red");
      setTemplates([]);
      setLayouts([]);
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.layoutId || !form.defaultThemeId) {
      alert("Name, Layout, and Theme are required.");
      return;
    }

    setSaving(true);
    const payload = { ...form };
    if (typeof payload.professionTags === "string") {
      payload.professionTags = payload.professionTags.split(",").map((s) => s.trim()).filter(Boolean);
    }

    try {
      const call = editId ? adminTemplateAPI.update(editId, payload) : adminTemplateAPI.create(payload);
      await call;
      notify(editId ? "Template updated!" : "Template created!");
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      loadData();
    } catch {
      notify("Failed to save.", "red");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (template) => {
    setEditId(template.id);
    setForm({
      name: template.name || "",
      description: template.description || "",
      tagline: template.tagline || "",
      planLevel: template.planLevel || "FREE",
      layoutId: template.layoutId || "",
      defaultThemeId: template.defaultThemeId || "",
      supportedSections: template.supportedSections || [],
      requiredSections: template.requiredSections || [],
      targetAudiences: template.targetAudiences || ["FREELANCER"],
      professionTags: template.professionTags?.join(", ") || "",
      primaryMood: template.primaryMood || "CLEAN_MINIMAL",
      featured: !!template.featured,
      isNew: !!template.isNew,
      active: typeof template.active === "boolean" ? template.active : true,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Soft delete this template?")) return;
    adminTemplateAPI.deactivate(id)
      .then(() => { notify("Deactivated.", "red"); loadData(); })
      .catch(() => notify("Failed.", "red"));
  };

  const toggleSection = (section, isRequiredList) => {
    const listName = isRequiredList ? "requiredSections" : "supportedSections";
    const current = form[listName] || [];
    setForm({
      ...form,
      [listName]: current.includes(section) ? current.filter((s) => s !== section) : [...current, section],
    });
  };

  const toastCls = {
    green: "bg-green-50 text-green-700 border border-green-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <AdminDashboardLayout
      title="Templates"
      subtitle="Assemble layouts and themes into user-facing templates"
      rightAction={
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Template
        </button>
      }
    >
      {toast.msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toastCls[toast.type] || "bg-blue-50 text-blue-700 border border-blue-200"}`}>{toast.msg}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">
            {editId ? "Edit Template" : "New Template"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Template Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Modern Executive" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tagline</label>
                <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short punchy phrase" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Profession Tags</label>
                <input value={form.professionTags} onChange={(e) => setForm({ ...form, professionTags: e.target.value })} placeholder="designer, developer, lawyer" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Plan Level</label>
                  <select value={form.planLevel} onChange={(e) => setForm({ ...form, planLevel: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
                    {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Primary Mood</label>
                  <select value={form.primaryMood} onChange={(e) => setForm({ ...form, primaryMood: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
                    {MOOD_OPTIONS.map((mood) => <option key={mood} value={mood}>{mood.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />Featured Badge</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />New Badge</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />Active</label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attach Layout</label>
                <select value={form.layoutId} onChange={(e) => setForm({ ...form, layoutId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select Layout --</option>
                  {layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name} ({layout.layoutType})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attach Default Theme</label>
                <select value={form.defaultThemeId} onChange={(e) => setForm({ ...form, defaultThemeId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select Theme --</option>
                  {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supported Sections</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                  {SECTION_OPTIONS.map((section) => {
                    const isSelected = form.supportedSections.includes(section);
                    return (
                      <button key={section} type="button" onClick={() => toggleSection(section, false)} className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${isSelected ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                        {isSelected ? "Selected " : "+ "}{section}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editId ? "Update Template" : "Create Template"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading templates...</p>}

      {!loading && templates.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">Templates</div>
          <p className="text-gray-400 font-medium">No templates assembled yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => {
          const layout = layouts.find((entry) => entry.id === template.layoutId);
          const theme = themes.find((entry) => entry.id === template.defaultThemeId);
          return (
            <div key={template.id} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${!template.active ? "opacity-60" : ""}`}>
              <div className="relative border-b border-gray-100 bg-gray-50">
                {template.previewImageUrl ? (
                  <img src={template.previewImageUrl} alt={template.name} className="w-full h-48 object-cover object-top" />
                ) : (
                  <div className="h-48 p-3">
                    <TemplateCardPreview template={template} layout={layout} theme={theme} />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {template.featured && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200"><Star size={10} /> Featured</span>}
                  {template.isNew && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"><Sparkles size={10} /> New</span>}
                </div>
                {template.planLevel !== "FREE" && <div className="absolute top-3 right-3 inline-flex items-center justify-center p-1.5 bg-purple-100 text-purple-700 rounded-md" title={template.planLevel}><Lock size={12} /></div>}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate pr-2">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.tagline || template.description || "No description"}</p>
                <div className="mt-4 bg-gray-50/60 rounded-xl p-3 text-[11px] text-gray-600 space-y-2">
                  <div className="flex justify-between gap-2"><span className="font-medium text-gray-400">Layout</span><span className="truncate text-right">{layout?.name || "Missing layout"}</span></div>
                  <div className="flex justify-between gap-2"><span className="font-medium text-gray-400">Theme</span><span className="truncate text-right">{theme?.name || "Missing theme"}</span></div>
                  <div className="flex justify-between gap-2"><span className="font-medium text-gray-400">Sections</span><span>{template.supportedSections?.length || 0}</span></div>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button onClick={() => startEdit(template)} className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button>
                  {template.active && <button onClick={() => handleDeactivate(template.id)} className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Disable</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminDashboardLayout>
  );
};

function TemplateCardPreview({ template, layout, theme }) {
  const palette = theme?.colorPalette || {};
  const typography = theme?.typography || {};
  const effects = theme?.effects || {};
  const layoutType = layout?.layoutType || template?.layout?.layoutType || "SINGLE_COLUMN";
  const background = palette.pageBackground || "#f8f5ef";
  const surface = palette.surfaceBackground || "#ffffff";
  const primary = palette.primary || "#1f2937";
  const accent = palette.accent || "#c08457";
  const text = palette.textPrimary || "#111827";
  const divider = palette.dividerColor || "rgba(17,24,39,0.1)";
  const radius = effects.cardBorderRadius || "18px";
  const isSidebar = ["LEFT_SIDEBAR", "RIGHT_SIDEBAR"].includes(layoutType);
  const sidebarFirst = layoutType === "LEFT_SIDEBAR";
  const isGrid = ["MODERN_GRID", "MASONRY_GRID", "BENTO_GRID", "DASHBOARD_PANEL", "GALLERY_FOCUS"].includes(layoutType);

  return (
    <div style={{ height: "100%", borderRadius: radius, background, border: `1px solid ${divider}`, overflow: "hidden", boxShadow: "0 8px 18px rgba(15,23,42,0.08)" }}>
      <div style={{ background: primary, color: "#fff", padding: "12px 14px" }}>
        <div style={{ fontFamily: typography.headingFont || "serif", fontSize: 14, fontWeight: 700 }}>{template.name}</div>
        <div style={{ fontSize: 9, opacity: 0.72, marginTop: 4 }}>{template.tagline || template.primaryMood?.replace(/_/g, " ")}</div>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: isSidebar ? (sidebarFirst ? "row" : "row-reverse") : "column", gap: 10, height: "calc(100% - 58px)" }}>
        {isSidebar && <div style={{ width: "28%", borderRadius: 12, background: surface, border: `1px solid ${divider}`, padding: 8 }}><div style={{ height: 6, width: "70%", background: accent, borderRadius: 999, marginBottom: 6 }} /><div style={{ height: 4, width: "90%", background: `${text}22`, borderRadius: 999, marginBottom: 4 }} /><div style={{ height: 4, width: "65%", background: `${text}22`, borderRadius: 999 }} /></div>}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isGrid ? "1fr 1fr" : "1fr", gap: 8 }}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} style={{ borderRadius: 12, background: surface, border: `1px solid ${divider}`, padding: 8 }}><div style={{ height: 6, width: `${60 + index * 7}%`, background: primary, borderRadius: 999, marginBottom: 6, opacity: 0.85 }} /><div style={{ height: 4, width: "100%", background: `${text}1f`, borderRadius: 999, marginBottom: 4 }} /><div style={{ height: 4, width: `${75 + index * 4}%`, background: `${text}1f`, borderRadius: 999 }} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminTemplatesPage;
