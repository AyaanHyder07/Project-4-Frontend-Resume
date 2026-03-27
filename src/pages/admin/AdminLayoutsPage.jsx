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
    zones: [{ zoneId: "main", label: "Main", defaultWidth: "100%", optional: false, displayOrder: 1 }]
  }
};

const PRESETS = [
  { name: "Executive Single Column", layoutType: "SINGLE_COLUMN" },
  { name: "Studio Case Study", layoutType: "CASE_STUDY" },
  { name: "Gallery Showcase", layoutType: "FULLSCREEN_SHOWCASE" },
];

const emptyForm = { name: "", description: "", layoutJson: JSON.stringify(DEFAULT_LAYOUT_CONFIG, null, 2) };
const shell = { background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 24, padding: 24, boxShadow: "0 24px 50px rgba(15,23,42,0.06)" };
const input = { width: "100%", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 14, padding: "12px 14px", fontSize: 13, background: "#fff" };

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
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef(null);

  const previewConfig = useMemo(() => safeParse(form.layoutJson).value || DEFAULT_LAYOUT_CONFIG, [form.layoutJson]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminLayoutAPI.getAll();
      setLayouts(response.data || []);
    } catch {
      setLayouts([]);
      setToast("Layouts could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyPreset = (preset) => {
    setForm({ name: preset.name, description: `${preset.layoutType.replace(/_/g, " ")} layout preset`, layoutJson: JSON.stringify({ ...DEFAULT_LAYOUT_CONFIG, ...preset }, null, 2) });
    setShowForm(true);
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
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast("Layout name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (editId) await adminLayoutAPI.update(editId, payload);
      else await adminLayoutAPI.create(payload);
      setToast(editId ? "Layout updated." : "Layout created.");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch {
      setToast("Layout could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this layout?")) return;
    try {
      await adminLayoutAPI.deactivate(id);
      setToast("Layout deactivated.");
      load();
    } catch {
      setToast("Could not deactivate layout.");
    }
  };

  return (
    <AdminDashboardLayout title="Layouts" subtitle="Structural systems that templates build on top of">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Layout Catalog</div>
          <h2 className="page-title">Layouts should look intentional, not broken.</h2>
          <p className="page-lead">This page now uses real styles instead of unsupported utility classes, so layout presets, previews, and editing are readable again.</p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <button className="premium-btn primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>New Layout</button>
            <button className="premium-btn secondary" onClick={load}>Refresh</button>
          </div>
        </section>

        {toast ? <section className="premium-panel" style={{ padding: 16 }}><span className="premium-badge status-tone-info">{toast}</span></section> : null}

        <section style={shell}>
          <div className="page-eyebrow">Starter Presets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 14 }}>
            {PRESETS.map((preset) => (
              <button key={preset.name} onClick={() => applyPreset(preset)} style={{ textAlign: "left", padding: 18, borderRadius: 18, border: "1px solid rgba(15,23,42,0.1)", background: "#fff", cursor: "pointer" }}>
                <div style={{ fontWeight: 700 }}>{preset.name}</div>
                <div className="premium-muted" style={{ marginTop: 6 }}>{preset.layoutType.replace(/_/g, " ")}</div>
              </button>
            ))}
          </div>
        </section>

        {showForm ? (
          <section style={{ ...shell, marginTop: 20 }}>
            <div className="page-eyebrow">{editId ? "Edit Layout" : "Create Layout"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} /></label>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Description</span><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={input} /></label>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="premium-muted" style={{ marginBottom: 8 }}>Preview</div>
              <div ref={previewRef} style={{ display: "inline-block", padding: 14, background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.08)" }}>
                <LayoutDiagram layoutType={previewConfig.layoutType} structureConfig={previewConfig.structureConfig} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="premium-muted" style={{ marginBottom: 8 }}>Layout JSON</div>
              <textarea rows={18} value={form.layoutJson} onChange={(e) => setForm({ ...form, layoutJson: e.target.value })} style={{ ...input, fontFamily: "monospace", minHeight: 340 }} />
            </div>
            <div className="panel-actions" style={{ marginTop: 16 }}>
              <button className="premium-btn primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editId ? "Update Layout" : "Create Layout"}</button>
              <button className="premium-btn ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>Cancel</button>
            </div>
          </section>
        ) : null}

        {loading ? <section className="premium-panel"><p className="premium-muted">Loading layouts...</p></section> : null}

        <section className="premium-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", marginTop: 20 }}>
          {layouts.map((layout) => (
            <article key={layout.id} className="premium-card" style={{ padding: 18 }}>
              <LayoutDiagram layoutType={layout.layoutType} structureConfig={layout.structureConfig} small />
              <h3 style={{ margin: "14px 0 6px", fontSize: "1.2rem" }}>{layout.name}</h3>
              <p className="premium-muted">{layout.description || "No description"}</p>
              <div style={{ display: "grid", gap: 6, marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                <div>Type: {layout.layoutType || "-"}</div>
                <div>Plan: {layout.requiredPlan || "FREE"}</div>
                <div>Categories: {(layout.supportedProfessionCategories || []).slice(0, 2).join(", ") || "-"}</div>
              </div>
              <div className="panel-actions" style={{ marginTop: 14 }}>
                <button className="premium-btn secondary" onClick={() => startEdit(layout)}>Edit</button>
                <button className="premium-btn ghost" onClick={() => handleDeactivate(layout.id)}>Deactivate</button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminDashboardLayout>
  );
}

function LayoutDiagram({ layoutType = "SINGLE_COLUMN", structureConfig = {}, small }) {
  const h = small ? 86 : 120;
  const sidebar = structureConfig?.sidebarPosition;
  const block = (flex, bg) => <div style={{ flex, background: bg, borderRadius: 10 }} />;
  const wrap = { display: "flex", height: h, gap: 8, padding: 10, background: "linear-gradient(180deg,#f8fafc,#eef2ff)", borderRadius: 16, border: "1px solid rgba(148,163,184,0.18)" };
  if (layoutType === "LEFT_SIDEBAR" || sidebar === "left") return <div style={wrap}>{block(1, "#94a3b8")}{block(3, "#e2e8f0")}</div>;
  if (layoutType === "RIGHT_SIDEBAR" || sidebar === "right") return <div style={wrap}>{block(3, "#e2e8f0")}{block(1, "#94a3b8")}</div>;
  if (["TWO_COLUMN", "SPLIT_SCREEN", "CASE_STUDY"].includes(layoutType)) return <div style={wrap}>{block(1, "#cbd5e1")}{block(1, "#e2e8f0")}</div>;
  if (["GRID", "BENTO_GRID", "MASONRY_GRID", "DASHBOARD", "GALLERY"].includes(layoutType)) return <div style={{ ...wrap, flexWrap: "wrap" }}>{[...Array(4)].map((_, index) => <div key={index} style={{ width: "47%", height: "44%", background: index % 2 === 0 ? "#cbd5e1" : "#e2e8f0", borderRadius: 8, margin: "1.5%" }} />)}</div>;
  return <div style={{ ...wrap, flexDirection: "column" }}><div style={{ height: 30, background: "#94a3b8", borderRadius: 8 }} /><div style={{ flex: 1, background: "#e2e8f0", borderRadius: 8, marginTop: 8 }} /></div>;
}
