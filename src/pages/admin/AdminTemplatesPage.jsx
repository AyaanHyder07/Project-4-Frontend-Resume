import { useEffect, useState } from "react";
import { Lock, Sparkles, Star } from "lucide-react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminLayoutAPI, adminTemplateAPI, adminThemeAPI } from "../../api/api";

const PLAN_OPTIONS = ["FREE", "BASIC", "PRO", "PREMIUM"];
const MOOD_OPTIONS = ["CLEAN_MINIMAL", "CORPORATE_FORMAL", "ARTISTIC_EXPRESSIVE", "LUXURY_ELEGANT", "DARK_DRAMATIC", "FUTURISTIC_TECH"];
const CATEGORY_OPTIONS = ["PROFESSIONAL_CORPORATE", "TECH_ENGINEERING", "DESIGN_CREATIVE", "ARTIST_ILLUSTRATION", "PHOTOGRAPHY_FILM", "WRITING_PUBLISHING", "HEALTHCARE_MEDICAL", "FINANCE_BUSINESS", "EDUCATION_RESEARCH"];
const CONTENT_MODE_OPTIONS = ["RESUME_FIRST", "PORTFOLIO_FIRST", "GALLERY_FIRST", "CASE_STUDY_FIRST"];
const BLOCK_TYPE_OPTIONS = ["RICH_TEXT", "LINK_LIST", "METRICS", "TIMELINE", "GALLERY", "CASE_STUDY", "QUOTE", "CTA", "FAQ", "EMBED", "PROCESS_STEPS", "CUSTOM_LIST", "STATS_GRID", "CLIENT_LOGOS", "SERVICES_GRID", "AVAILABILITY_CARD"];
const PROFESSION_OPTIONS = ["SOFTWARE_ENGINEER", "FULL_STACK_DEVELOPER", "UX_DESIGNER", "PRODUCT_DESIGNER", "PHOTOGRAPHER", "FILMMAKER", "CONSULTANT", "DOCTOR", "LAWYER", "WRITER", "RESEARCHER"];
const MOTION_OPTIONS = ["NONE", "SUBTLE", "EDITORIAL", "PLAYFUL", "CINEMATIC", "PARALLAX", "SLIDESHOW", "IMMERSIVE"];

const PRESETS = [
  {
    name: "Executive Ledger",
    tagline: "Boardroom-ready professional presence",
    description: "Resume-first premium template for consultants, business operators, and executives.",
    planLevel: "PRO",
    primaryMood: "CORPORATE_FORMAL",
    supportedProfessionCategories: ["PROFESSIONAL_CORPORATE", "FINANCE_BUSINESS"],
    supportedProfessionTypes: ["CONSULTANT"],
    supportedContentModes: ["RESUME_FIRST", "CASE_STUDY_FIRST"],
    supportedBlockTypes: ["RICH_TEXT", "METRICS", "QUOTE", "CTA"],
    recommendedBlockTypes: ["METRICS", "QUOTE"],
    supportedMotionPresets: ["NONE", "SUBTLE", "EDITORIAL"],
    globallySelectable: true,
    premiumRank: 60,
    targetAudiences: ["FREELANCER"],
  },
  {
    name: "Studio Frame",
    tagline: "Case-study layout for product and brand work",
    description: "Portfolio-first designer template with a premium showcase rhythm.",
    planLevel: "PRO",
    primaryMood: "ARTISTIC_EXPRESSIVE",
    supportedProfessionCategories: ["DESIGN_CREATIVE"],
    supportedProfessionTypes: ["UX_DESIGNER", "PRODUCT_DESIGNER"],
    supportedContentModes: ["PORTFOLIO_FIRST", "CASE_STUDY_FIRST"],
    supportedBlockTypes: ["CASE_STUDY", "METRICS", "PROCESS_STEPS", "QUOTE"],
    recommendedBlockTypes: ["CASE_STUDY", "PROCESS_STEPS"],
    supportedMotionPresets: ["SUBTLE", "EDITORIAL", "PLAYFUL"],
    globallySelectable: true,
    premiumRank: 72,
    targetAudiences: ["FREELANCER"],
  },
  {
    name: "Lightbox Reel",
    tagline: "Immersive gallery-first portfolio",
    description: "Visual premium template for photography and film portfolios.",
    planLevel: "PREMIUM",
    primaryMood: "DARK_DRAMATIC",
    supportedProfessionCategories: ["PHOTOGRAPHY_FILM", "ARTIST_ILLUSTRATION"],
    supportedProfessionTypes: ["PHOTOGRAPHER", "FILMMAKER"],
    supportedContentModes: ["GALLERY_FIRST", "PORTFOLIO_FIRST"],
    supportedBlockTypes: ["GALLERY", "QUOTE", "EMBED", "CTA"],
    recommendedBlockTypes: ["GALLERY", "EMBED"],
    supportedMotionPresets: ["CINEMATIC", "SLIDESHOW", "IMMERSIVE"],
    globallySelectable: true,
    premiumRank: 92,
    targetAudiences: ["CREATOR"],
  },
];

const emptyForm = {
  name: "",
  description: "",
  tagline: "",
  planLevel: "FREE",
  layoutId: "",
  defaultThemeId: "",
  primaryMood: "CLEAN_MINIMAL",
  featured: false,
  isNew: false,
  active: true,
  globallySelectable: true,
  premiumRank: 10,
  targetAudiences: "FREELANCER",
  supportedProfessionCategories: "",
  supportedProfessionTypes: "",
  supportedContentModes: "RESUME_FIRST",
  supportedBlockTypes: "RICH_TEXT, CTA",
  recommendedBlockTypes: "RICH_TEXT",
  supportedMotionPresets: "SUBTLE",
};

const normalizeResponse = (result) => result?.data ?? result ?? [];
const parseList = (value) => String(value || "").split(",").map((entry) => entry.trim()).filter(Boolean);
const stringifyList = (value) => Array.isArray(value) ? value.join(", ") : "";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "green" });

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "green" }), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [templateData, layoutData, themeData] = await Promise.all([
        adminTemplateAPI.getAll(),
        adminLayoutAPI.getAll(),
        adminThemeAPI.getAll(),
      ]);
      setTemplates(normalizeResponse(templateData));
      setLayouts(normalizeResponse(layoutData));
      setThemes(normalizeResponse(themeData));
    } catch {
      setTemplates([]);
      setLayouts([]);
      setThemes([]);
      notify("Template catalogs could not be loaded.", "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (template) => {
    setEditId(template.id);
    setForm({
      name: template.name || "",
      description: template.description || "",
      tagline: template.tagline || "",
      planLevel: template.planLevel || "FREE",
      layoutId: template.layoutId || "",
      defaultThemeId: template.defaultThemeId || "",
      primaryMood: template.primaryMood || "CLEAN_MINIMAL",
      featured: !!template.featured,
      isNew: !!template.isNew,
      active: template.active !== false,
      globallySelectable: template.globallySelectable !== false,
      premiumRank: template.premiumRank ?? 10,
      targetAudiences: stringifyList(template.targetAudiences),
      supportedProfessionCategories: stringifyList(template.supportedProfessionCategories),
      supportedProfessionTypes: stringifyList(template.supportedProfessionTypes),
      supportedContentModes: stringifyList(template.supportedContentModes),
      supportedBlockTypes: stringifyList(template.supportedBlockTypes),
      recommendedBlockTypes: stringifyList(template.recommendedBlockTypes),
      supportedMotionPresets: stringifyList(template.supportedMotionPresets),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyPreset = (preset) => {
    setForm((previous) => ({
      ...previous,
      ...preset,
      targetAudiences: stringifyList(preset.targetAudiences),
      supportedProfessionCategories: stringifyList(preset.supportedProfessionCategories),
      supportedProfessionTypes: stringifyList(preset.supportedProfessionTypes),
      supportedContentModes: stringifyList(preset.supportedContentModes),
      supportedBlockTypes: stringifyList(preset.supportedBlockTypes),
      recommendedBlockTypes: stringifyList(preset.recommendedBlockTypes),
      supportedMotionPresets: stringifyList(preset.supportedMotionPresets),
    }));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.layoutId || !form.defaultThemeId) {
      notify("Name, layout, and default theme are required.", "red");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      tagline: form.tagline.trim(),
      planLevel: form.planLevel,
      layoutId: form.layoutId,
      defaultThemeId: form.defaultThemeId,
      primaryMood: form.primaryMood,
      featured: !!form.featured,
      isNew: !!form.isNew,
      active: !!form.active,
      globallySelectable: !!form.globallySelectable,
      premiumRank: Number(form.premiumRank || 0),
      targetAudiences: parseList(form.targetAudiences),
      supportedProfessionCategories: parseList(form.supportedProfessionCategories),
      supportedProfessionTypes: parseList(form.supportedProfessionTypes),
      supportedContentModes: parseList(form.supportedContentModes),
      supportedBlockTypes: parseList(form.supportedBlockTypes),
      recommendedBlockTypes: parseList(form.recommendedBlockTypes),
      supportedMotionPresets: parseList(form.supportedMotionPresets),
    };

    setSaving(true);
    try {
      if (editId) await adminTemplateAPI.update(editId, payload);
      else await adminTemplateAPI.create(payload);
      notify(editId ? "Template updated." : "Template created.");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch {
      notify("Template could not be saved.", "red");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Disable this template?")) return;
    try {
      await adminTemplateAPI.deactivate(id);
      notify("Template disabled.", "red");
      load();
    } catch {
      notify("Disable failed.", "red");
    }
  };

  return (
    <AdminDashboardLayout
      title="Templates"
      subtitle="Sellable combinations of layout, theme, profession targeting, block support, and premium gating"
      rightAction={<button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ New Template</button>}
    >
      {toast.msg ? <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toast.type === "red" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{toast.msg}</div> : null}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-3">Starter Presets</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)} className="text-left rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-semibold text-gray-900 text-sm">{preset.name}</div>
              <div className="text-xs text-gray-500 mt-1">{preset.tagline}</div>
            </button>
          ))}
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">{editId ? "Edit Template" : "New Template"}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field label="Template Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
              <Field label="Tagline"><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} /></Field>
              <Field label="Description"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Plan Level"><select value={form.planLevel} onChange={(e) => setForm({ ...form, planLevel: e.target.value })} className={inputCls}>{PLAN_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>
                <Field label="Primary Mood"><select value={form.primaryMood} onChange={(e) => setForm({ ...form, primaryMood: e.target.value })} className={inputCls}>{MOOD_OPTIONS.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Layout"><select value={form.layoutId} onChange={(e) => setForm({ ...form, layoutId: e.target.value })} className={inputCls}><option value="">Select layout</option>{layouts.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.layoutType})</option>)}</select></Field>
                <Field label="Default Theme"><select value={form.defaultThemeId} onChange={(e) => setForm({ ...form, defaultThemeId: e.target.value })} className={inputCls}><option value="">Select theme</option>{themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Premium Rank"><input type="number" value={form.premiumRank} onChange={(e) => setForm({ ...form, premiumRank: e.target.value })} className={inputCls} /></Field>
                <Field label="Target Audiences"><input value={form.targetAudiences} onChange={(e) => setForm({ ...form, targetAudiences: e.target.value })} placeholder="FREELANCER, CREATOR" className={inputCls} /></Field>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Profession Categories"><input list="categories" value={form.supportedProfessionCategories} onChange={(e) => setForm({ ...form, supportedProfessionCategories: e.target.value })} placeholder="TECH_ENGINEERING, DESIGN_CREATIVE" className={inputCls} /></Field>
              <Field label="Profession Types"><input list="professions" value={form.supportedProfessionTypes} onChange={(e) => setForm({ ...form, supportedProfessionTypes: e.target.value })} placeholder="SOFTWARE_ENGINEER, PHOTOGRAPHER" className={inputCls} /></Field>
              <Field label="Supported Content Modes"><input list="contentModes" value={form.supportedContentModes} onChange={(e) => setForm({ ...form, supportedContentModes: e.target.value })} placeholder="RESUME_FIRST, CASE_STUDY_FIRST" className={inputCls} /></Field>
              <Field label="Supported Block Types"><textarea rows={3} value={form.supportedBlockTypes} onChange={(e) => setForm({ ...form, supportedBlockTypes: e.target.value })} placeholder="RICH_TEXT, CTA, GALLERY" className={inputCls} /></Field>
              <Field label="Recommended Block Types"><input list="blockTypes" value={form.recommendedBlockTypes} onChange={(e) => setForm({ ...form, recommendedBlockTypes: e.target.value })} placeholder="CASE_STUDY, METRICS" className={inputCls} /></Field>
              <Field label="Supported Motion Presets"><input list="motions" value={form.supportedMotionPresets} onChange={(e) => setForm({ ...form, supportedMotionPresets: e.target.value })} placeholder="SUBTLE, EDITORIAL" className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 pt-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> New</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.globallySelectable} onChange={(e) => setForm({ ...form, globallySelectable: e.target.checked })} /> Globally Selectable</label>
              </div>
            </div>
          </div>

          <datalist id="categories">{CATEGORY_OPTIONS.map((value) => <option key={value} value={value} />)}</datalist>
          <datalist id="professions">{PROFESSION_OPTIONS.map((value) => <option key={value} value={value} />)}</datalist>
          <datalist id="contentModes">{CONTENT_MODE_OPTIONS.map((value) => <option key={value} value={value} />)}</datalist>
          <datalist id="blockTypes">{BLOCK_TYPE_OPTIONS.map((value) => <option key={value} value={value} />)}</datalist>
          <datalist id="motions">{MOTION_OPTIONS.map((value) => <option key={value} value={value} />)}</datalist>

          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editId ? "Update Template" : "Create Template"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-gray-400 text-sm">Loading templates...</p> : null}
      {!loading && templates.length === 0 ? <div className="text-center py-20 text-gray-500">No templates yet. Use the starter presets above to assemble new premium templates safely.</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const layout = layouts.find((item) => item.id === template.layoutId);
          const theme = themes.find((item) => item.id === template.defaultThemeId);
          return (
            <article key={template.id} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all ${template.active === false ? "opacity-60" : ""}`}>
              <div className="relative p-4 border-b border-gray-100 bg-gradient-to-br from-stone-50 to-stone-100">
                <div className="rounded-xl border border-stone-200 bg-white p-4 min-h-[150px]">
                  <div className="h-8 rounded-lg" style={{ background: theme?.colorPalette?.primary || "#1F2937" }} />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg h-20" style={{ background: theme?.colorPalette?.pageBackground || "#F6F1E7" }} />
                    <div className="rounded-lg h-20" style={{ background: theme?.colorPalette?.surfaceBackground || "#FFFFFF" }} />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {template.featured ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200"><Star size={10} /> Featured</span> : null}
                  {template.isNew ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"><Sparkles size={10} /> New</span> : null}
                </div>
                {template.planLevel !== "FREE" ? <div className="absolute top-3 right-3 inline-flex items-center justify-center p-1.5 bg-purple-100 text-purple-700 rounded-md" title={template.planLevel}><Lock size={12} /></div> : null}
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-3 items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{template.tagline || template.description || "No description"}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{template.planLevel}</span>
                </div>
                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-600 space-y-1.5">
                  <div>Layout: {layout?.name || "Missing layout"}</div>
                  <div>Theme: {theme?.name || "Missing theme"}</div>
                  <div>Categories: {(template.supportedProfessionCategories || []).slice(0, 2).join(", ") || "-"}</div>
                  <div>Modes: {(template.supportedContentModes || []).slice(0, 2).join(", ") || "-"}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startEdit(template)} className="flex-1 py-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button>
                  <button onClick={() => handleDeactivate(template.id)} className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Disable</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AdminDashboardLayout>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500";
