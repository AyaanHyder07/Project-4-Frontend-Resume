import { useEffect, useMemo, useRef, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminLayoutAPI } from "../../api/api";

const LAYOUT_TYPES = ["SINGLE_COLUMN", "TWO_COLUMN", "LEFT_SIDEBAR", "RIGHT_SIDEBAR", "TOP_HERO", "SPLIT_SCREEN", "GRID", "BENTO_GRID", "MASONRY_GRID", "MAGAZINE", "TIMELINE", "DASHBOARD", "GALLERY", "CASE_STUDY", "EDITORIAL", "SCROLL_STORY", "MINIMAL", "FULLSCREEN_SHOWCASE"];
const DEFAULT_LAYOUT_CONFIG = {
  layoutType: "SINGLE_COLUMN",
  targetAudiences: ["FREELANCER"],
  compatibleMoods: ["CLEAN_MINIMAL"],
  requiredPlan: "FREE",
  supportedProfessionCategories: ["PROFESSIONAL_CORPORATE"],
  supportedProfessionTypes: [],
  supportedContentModes: ["RESUME_FIRST"],
  supportedMotionPresets: ["NONE", "SUBTLE"],
  recommendedBlockTypes: ["RICH_TEXT", "CTA"],
  defaultMotionPreset: "SUBTLE",
  structureConfig: {
    columnCount: 1,
    sidebarPosition: "none",
    hasHeroSection: true,
    hasFloatingHeader: false,
    hasStickyContact: false,
    isScrollBased: false,
    scrollDirection: "vertical",
    maxWidth: "1120px",
    contentPadding: "40px 22px 56px",
    zones: [
      { zoneId: "main", label: "Main", defaultWidth: "100%", optional: false, displayOrder: 1 }
    ]
  }
};

const PRESETS = [
  { name: "Executive Single Column", layoutType: "SINGLE_COLUMN", supportedProfessionCategories: ["PROFESSIONAL_CORPORATE", "FINANCE_BUSINESS"], supportedContentModes: ["RESUME_FIRST", "CASE_STUDY_FIRST"], supportedMotionPresets: ["NONE", "SUBTLE", "EDITORIAL"] },
  { name: "Studio Case Study", layoutType: "CASE_STUDY", supportedProfessionCategories: ["DESIGN_CREATIVE"], supportedContentModes: ["PORTFOLIO_FIRST", "CASE_STUDY_FIRST"], supportedMotionPresets: ["SUBTLE", "EDITORIAL", "PLAYFUL"] },
  { name: "Gallery Showcase", layoutType: "FULLSCREEN_SHOWCASE", supportedProfessionCategories: ["PHOTOGRAPHY_FILM", "ARTIST_ILLUSTRATION"], supportedContentModes: ["GALLERY_FIRST", "PORTFOLIO_FIRST"], supportedMotionPresets: ["CINEMATIC", "SLIDESHOW", "IMMERSIVE"] },
];

const emptyForm = {
  name: "",
  description: "",
  layoutJson: JSON.stringify(DEFAULT_LAYOUT_CONFIG, null, 2),
};

function safeParse(json) {
  try { return { value: JSON.parse(json), error: "" }; }
  catch { return { value: null, error: "Invalid JSON" }; }
}

function buildPayload(form) {
  const parsed = safeParse(form.layoutJson);
  if (!parsed.value) throw new Error("Invalid JSON");
  return { name: form.name.trim(), description: form.description.trim() || undefined, ...parsed.value };
}

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "green" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [jsonErr, setJsonErr] = useState("");
  const previewRef = useRef(null);

  const previewConfig = useMemo(() => safeParse(form.layoutJson).value || DEFAULT_LAYOUT_CONFIG, [form.layoutJson]);
  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "green" }), 2500);
  };

  const load = () => {
    setLoading(true);
    adminLayoutAPI.getAll().then((response) => setLayouts(response.data || [])).catch(() => { setLayouts([]); notify("Layouts could not be loaded.", "red"); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const validateJson = (value) => {
    const parsed = safeParse(value);
    setJsonErr(parsed.error);
    return !parsed.error;
  };

  const applyPreset = (preset) => {
    setForm({
      name: preset.name,
      description: `${preset.layoutType.replace(/_/g, " ")} layout preset`,
      layoutJson: JSON.stringify({ ...DEFAULT_LAYOUT_CONFIG, ...preset }, null, 2),
    });
    setShowForm(true);
  };

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.9));
      const fd = new FormData();
      fd.append("file", blob, "layout-preview.png");
      const response = await fetch("/api/admin/upload/preview?type=layout", { method: "POST", body: fd, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const data = await response.json();
      return data.secureUrl || null;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      notify("Layout name is required.", "red");
      return;
    }
    if (!validateJson(form.layoutJson)) return;
    setSaving(true);
    const previewImageUrl = await capturePreview();
    try {
      const payload = buildPayload(form);
      if (previewImageUrl) payload.previewImageUrl = previewImageUrl;
      if (editId) await adminLayoutAPI.update(editId, payload);
      else await adminLayoutAPI.create(payload);
      notify(editId ? "Layout updated." : "Layout created.");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch {
      notify("Layout could not be saved.", "red");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (layout) => {
    const editable = {
      layoutType: layout.layoutType || "SINGLE_COLUMN",
      targetAudiences: layout.targetAudiences || ["FREELANCER"],
      compatibleMoods: layout.compatibleMoods || ["CLEAN_MINIMAL"],
      requiredPlan: layout.requiredPlan || "FREE",
      supportedProfessionCategories: layout.supportedProfessionCategories || [],
      supportedProfessionTypes: layout.supportedProfessionTypes || [],
      supportedContentModes: layout.supportedContentModes || ["RESUME_FIRST"],
      supportedMotionPresets: layout.supportedMotionPresets || ["SUBTLE"],
      recommendedBlockTypes: layout.recommendedBlockTypes || [],
      defaultMotionPreset: layout.defaultMotionPreset || "SUBTLE",
      structureConfig: layout.structureConfig || DEFAULT_LAYOUT_CONFIG.structureConfig,
    };
    setEditId(layout.id);
    setForm({ name: layout.name || "", description: layout.description || "", layoutJson: JSON.stringify(editable, null, 2) });
    setShowForm(true);
    setJsonErr("");
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this layout?")) return;
    try {
      await adminLayoutAPI.deactivate(id);
      notify("Layout deactivated.", "red");
      load();
    } catch {
      notify("Could not deactivate layout.", "red");
    }
  };

  return (
    <AdminDashboardLayout
      title="Layouts"
      subtitle="Structural page systems with profession fit, motion support, and content-mode metadata"
      rightAction={<button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setJsonErr(""); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">+ New Layout</button>}
    >
      {toast.msg ? <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toast.type === "red" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{toast.msg}</div> : null}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-3">Starter Layout Presets</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => applyPreset(preset)} className="text-left rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="font-semibold text-gray-900 text-sm">{preset.name}</div>
              <div className="text-xs text-gray-500 mt-1">{preset.layoutType.replace(/_/g, " ")}</div>
            </button>
          ))}
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">{editId ? "Edit Layout" : "New Layout"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Layout Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Preview</label>
            <div ref={previewRef} className="rounded-lg border border-gray-200 overflow-hidden inline-block bg-white p-3">
              <LayoutDiagram layoutType={previewConfig.layoutType} structureConfig={previewConfig.structureConfig} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Layout JSON {jsonErr ? <span className="text-red-500 normal-case font-normal">{jsonErr}</span> : null}</label>
            <textarea rows={20} value={form.layoutJson} onChange={(e) => { setForm({ ...form, layoutJson: e.target.value }); validateJson(e.target.value); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">This JSON now carries real backend metadata: profession categories, content modes, motion presets, recommended block types, and structure configuration.</div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editId ? "Update Layout" : "Create Layout"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-gray-400 text-sm">Loading layouts...</p> : null}
      {!loading && layouts.length === 0 ? <div className="text-center py-20 text-gray-500">No saved layouts yet. Use the starter presets above to create the first structural set.</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {layouts.map((layout) => (
          <article key={layout.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="border-b border-gray-100 bg-gray-50 relative p-4">
              {layout.previewImageUrl ? <img src={layout.previewImageUrl} alt={layout.name} className="w-full h-44 object-cover object-top rounded-xl" /> : <LayoutDiagram layoutType={layout.layoutType} structureConfig={layout.structureConfig} small />}
              <div className="absolute top-6 right-6 bg-white/90 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 uppercase tracking-widest shadow-sm border border-white/50">{layout.layoutType?.replace(/_/g, " ")}</div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-base mb-1">{layout.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{layout.description || "No description"}</p>
              <div className="mt-3 text-[11px] text-gray-500 space-y-1">
                <div>Plan: {layout.requiredPlan || "FREE"}</div>
                <div>Categories: {(layout.supportedProfessionCategories || []).slice(0, 2).join(", ") || "-"}</div>
                <div>Motions: {(layout.supportedMotionPresets || []).slice(0, 2).join(", ") || "-"}</div>
              </div>
              <div className="mt-4 flex gap-2"><button onClick={() => startEdit(layout)} className="flex-1 py-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button><button onClick={() => handleDeactivate(layout.id)} className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Deactivate</button></div>
            </div>
          </article>
        ))}
      </div>

      {!loading && layouts.length === 0 ? <EnumLayoutShowcase /> : null}
    </AdminDashboardLayout>
  );
}

function EnumLayoutShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {LAYOUT_TYPES.map((layoutType) => (
        <div key={layoutType} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50"><LayoutDiagram layoutType={layoutType} structureConfig={{ sidebarPosition: layoutType === "LEFT_SIDEBAR" ? "left" : layoutType === "RIGHT_SIDEBAR" ? "right" : "none" }} /></div>
          <div className="p-4"><div className="font-semibold text-sm text-gray-900">{layoutType.replace(/_/g, " ")}</div><div className="text-xs text-gray-500 mt-1">Quick structural idea card.</div></div>
        </div>
      ))}
    </div>
  );
}

function LayoutDiagram({ layoutType = "SINGLE_COLUMN", structureConfig = {}, small }) {
  const h = small ? 72 : 110;
  const sidebar = structureConfig?.sidebarPosition;
  const block = (flex, bg) => <div style={{ flex, background: bg, borderRadius: 6 }} />;
  const wrap = { display: "flex", height: h, gap: 6, padding: 8, background: "#f8fafc", borderRadius: 12, border: "1px solid rgba(148,163,184,0.18)" };
  if (layoutType === "LEFT_SIDEBAR" || sidebar === "left") return <div style={wrap}>{block(1, "#94a3b8")}{block(3, "#e2e8f0")}</div>;
  if (layoutType === "RIGHT_SIDEBAR" || sidebar === "right") return <div style={wrap}>{block(3, "#e2e8f0")}{block(1, "#94a3b8")}</div>;
  if (["TWO_COLUMN", "SPLIT_SCREEN", "CASE_STUDY"].includes(layoutType)) return <div style={wrap}>{block(1, "#cbd5e1")}{block(1, "#e2e8f0")}</div>;
  if (["GRID", "BENTO_GRID", "MASONRY_GRID", "DASHBOARD", "GALLERY"].includes(layoutType)) return <div style={{ ...wrap, flexWrap: "wrap" }}>{[...Array(4)].map((_, index) => <div key={index} style={{ width: "47%", height: "44%", background: index % 2 === 0 ? "#cbd5e1" : "#e2e8f0", borderRadius: 6, margin: "1.5%" }} />)}</div>;
  return <div style={{ ...wrap, flexDirection: "column" }}><div style={{ height: 28, background: "#94a3b8", borderRadius: 6 }} /><div style={{ flex: 1, background: "#e2e8f0", borderRadius: 6, marginTop: 6 }} /></div>;
}
