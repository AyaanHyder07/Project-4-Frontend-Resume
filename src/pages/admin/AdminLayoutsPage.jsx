import { useEffect, useMemo, useRef, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminLayoutAPI } from "../../api/api";

const LAYOUT_TYPES = [
  "SINGLE_COLUMN", "TWO_COLUMN", "LEFT_SIDEBAR", "RIGHT_SIDEBAR", "FULLSCREEN_HERO",
  "MAGAZINE", "MASONRY_GRID", "BENTO_GRID", "SPLIT_SCREEN", "BOLD_TYPOGRAPHIC",
  "DIAGONAL_SLASH", "LAYERED_OVERLAP", "IMMERSIVE_DARK", "CINEMATIC", "TIMELINE",
  "INFOGRAPHIC", "DASHBOARD_PANEL", "MODERN_GRID", "GALLERY_FOCUS", "CARD_STACK",
  "SCROLL_STORY", "MINIMAL_ZEN", "LUXURY_EDITORIAL", "MEDICAL_CLINICAL", "LEGAL_FORMAL",
  "FINANCIAL_STRUCTURED", "ACADEMIC_CV", "STARTUP_PITCH",
];

const DEFAULT_LAYOUT_CONFIG = {
  layoutType: "SINGLE_COLUMN",
  targetAudiences: ["FREELANCER"],
  compatibleMoods: ["CLEAN_MINIMAL"],
  professionTags: ["general"],
  requiredPlan: "FREE",
  structureConfig: {
    columnCount: 1,
    sidebarPosition: "none",
    sidebarWidthPercent: null,
    zones: [
      {
        zoneId: "main",
        label: "Main",
        allowedSections: [
          "PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS",
          "PUBLICATIONS", "BLOG_POSTS", "MEDIA_APPEARANCES", "EXHIBITIONS_AWARDS",
          "TESTIMONIALS", "SERVICE_OFFERINGS", "CONTACT",
        ],
        defaultWidth: "100%",
        optional: false,
        displayOrder: 1,
      },
    ],
    hasHeroSection: false,
    hasFloatingHeader: false,
    hasStickyContact: false,
    isScrollBased: false,
    scrollDirection: "vertical",
    gridConfig: null,
  },
};

const emptyForm = {
  name: "",
  description: "",
  layoutJson: JSON.stringify(DEFAULT_LAYOUT_CONFIG, null, 2),
};

function safeParse(json) {
  try {
    return { value: JSON.parse(json), error: "" };
  } catch {
    return { value: null, error: "Invalid JSON" };
  }
}

function buildPayload(form) {
  const parsed = safeParse(form.layoutJson);
  if (!parsed.value) throw new Error("Invalid JSON");
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    ...parsed.value,
  };
}

const AdminLayoutsPage = () => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [jsonErr, setJsonErr] = useState("");
  const previewRef = useRef(null);

  const previewConfig = useMemo(() => safeParse(form.layoutJson).value || DEFAULT_LAYOUT_CONFIG, [form.layoutJson]);

  const load = () => {
    setLoading(true);
    adminLayoutAPI.getAll().then((r) => setLayouts(r.data || [])).catch(() => {}).finally(() => setLoading(false));
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
      fd.append("file", blob, "layout-preview.png");
      const res = await fetch("/api/admin/upload/preview?type=layout", {
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
    if (!validateJson(form.layoutJson)) return;

    setSaving(true);
    notify("Capturing preview...", "blue");
    const previewImageUrl = await capturePreview();

    try {
      const payload = buildPayload(form);
      if (previewImageUrl) payload.previewImageUrl = previewImageUrl;
      const call = editId ? adminLayoutAPI.update(editId, payload) : adminLayoutAPI.create(payload);
      await call;
      notify(editId ? "Layout updated!" : "Layout created!");
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

  const startEdit = (layout) => {
    const editable = {
      layoutType: layout.layoutType || "SINGLE_COLUMN",
      targetAudiences: layout.targetAudiences || ["FREELANCER"],
      compatibleMoods: layout.compatibleMoods || ["CLEAN_MINIMAL"],
      professionTags: layout.professionTags || [],
      requiredPlan: layout.requiredPlan || "FREE",
      structureConfig: layout.structureConfig || DEFAULT_LAYOUT_CONFIG.structureConfig,
    };
    setEditId(layout.id);
    setForm({
      name: layout.name || "",
      description: layout.description || "",
      layoutJson: JSON.stringify(editable, null, 2),
    });
    setJsonErr("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Deactivate this layout?")) return;
    adminLayoutAPI.deactivate(id)
      .then(() => { notify("Deactivated.", "red"); load(); })
      .catch(() => notify("Failed.", "red"));
  };

  const toastCls = {
    green: "bg-green-50 text-green-700 border border-green-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <AdminDashboardLayout
      title="Layouts"
      subtitle="Create and manage portfolio layouts"
      rightAction={
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setJsonErr(""); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          + New Layout
        </button>
      }
    >
      {toast.msg && <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toastCls[toast.type] || "bg-blue-50 text-blue-700 border border-blue-200"}`}>{toast.msg}</div>}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">{editId ? "Edit Layout" : "New Layout"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Layout Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Modern Executive Split" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Who this layout is for" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Preview</label>
            <div ref={previewRef} className="rounded-lg border border-gray-200 overflow-hidden" style={{ background: "#fff", display: "inline-block", padding: "10px" }}>
              <LayoutDiagram layoutType={previewConfig.layoutType} structureConfig={previewConfig.structureConfig} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Layout JSON{jsonErr && <span className="ml-2 text-red-500 normal-case font-normal">{jsonErr}</span>}</label>
            <textarea rows={18} value={form.layoutJson} onChange={(e) => { setForm({ ...form, layoutJson: e.target.value }); validateJson(e.target.value); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">Save `layoutType`, `targetAudiences`, `compatibleMoods`, `professionTags`, `requiredPlan`, and `structureConfig` here. This matches the backend DTO directly.</div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editId ? "Update Layout" : "Create Layout"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading layouts...</p>}

      {!loading && layouts.length === 0 && (
        <div className="mb-8">
          <div className="text-center py-10">
            <div className="text-4xl mb-3">Layouts</div>
            <p className="text-gray-500 font-medium">No saved layouts yet. Showing enum-based layout idea cards below.</p>
          </div>
          <EnumLayoutShowcase />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {layouts.map((layout) => (
          <div key={layout.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="border-b border-gray-100 bg-gray-50 relative">
              {layout.previewImageUrl ? <img src={layout.previewImageUrl} alt={layout.name} className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105" /> : <div style={{ padding: "30px 10px" }}><LayoutDiagram layoutType={layout.layoutType} structureConfig={layout.structureConfig} small /></div>}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 uppercase tracking-widest shadow-sm border border-white/50">{layout.layoutType?.replace(/_/g, " ")}</div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-900 text-base mb-1 truncate" title={layout.name}>{layout.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{layout.description || "No description"}</p>
              <div className="mt-3 text-[11px] text-gray-500 space-y-1"><div>Plan: {layout.requiredPlan || "FREE"}</div><div>Audiences: {(layout.targetAudiences || []).slice(0, 2).join(", ") || "-"}</div></div>
              <div className="mt-auto pt-4 flex gap-2"><button onClick={() => startEdit(layout)} className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Edit</button><button onClick={() => handleDeactivate(layout.id)} className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors">Deactivate</button></div>
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

const EnumLayoutShowcase = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
    {LAYOUT_TYPES.map((layoutType) => (
      <div key={layoutType} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div style={{ padding: "22px 12px", background: "#f8fafc" }}>
          <LayoutDiagram layoutType={layoutType} structureConfig={{ sidebarPosition: layoutType === "LEFT_SIDEBAR" ? "left" : layoutType === "RIGHT_SIDEBAR" ? "right" : "none" }} />
        </div>
        <div className="p-4">
          <div className="font-semibold text-sm text-gray-900">{layoutType.replace(/_/g, " ")}</div>
          <div className="text-xs text-gray-500 mt-1">Quick visual idea card for this enum layout type.</div>
        </div>
      </div>
    ))}
  </div>
);

const LayoutDiagram = ({ layoutType = "SINGLE_COLUMN", structureConfig = {}, small }) => {
  const h = small ? 64 : 96;
  const sidebar = structureConfig?.sidebarPosition;
  const wrap = { display: "flex", height: h, gap: 4, padding: 8, background: "#f8fafc" };
  const b = (flex, bg) => <div style={{ flex, background: bg, borderRadius: 3 }} />;

  if (layoutType === "LEFT_SIDEBAR" || sidebar === "left") return <div style={wrap}>{b(1, "#94a3b8")}{b(3, "#e2e8f0")}</div>;
  if (layoutType === "RIGHT_SIDEBAR" || sidebar === "right") return <div style={wrap}>{b(3, "#e2e8f0")}{b(1, "#94a3b8")}</div>;
  if (["TWO_COLUMN", "SPLIT_SCREEN"].includes(layoutType)) return <div style={wrap}>{b(1, "#cbd5e1")}{b(1, "#e2e8f0")}</div>;
  if (["MODERN_GRID", "MASONRY_GRID", "BENTO_GRID", "DASHBOARD_PANEL", "GALLERY_FOCUS"].includes(layoutType)) {
    return <div style={{ ...wrap, flexWrap: "wrap" }}>{[...Array(4)].map((_, i) => <div key={i} style={{ width: "47%", height: "44%", background: i % 2 === 0 ? "#cbd5e1" : "#e2e8f0", borderRadius: 3, margin: "1.5%" }} />)}</div>;
  }
  return <div style={{ ...wrap, flexDirection: "column" }}><div style={{ height: 22, background: "#94a3b8", borderRadius: 3 }} /><div style={{ flex: 1, background: "#e2e8f0", borderRadius: 3, marginTop: 4 }} /></div>;
};

export default AdminLayoutsPage;
