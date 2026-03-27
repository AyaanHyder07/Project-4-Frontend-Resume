import { useEffect, useState } from "react";
import { Lock, Sparkles, Star } from "lucide-react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminLayoutAPI, adminTemplateAPI, adminThemeAPI } from "../../api/api";

const PLAN_OPTIONS = ["FREE", "BASIC", "PRO", "PREMIUM"];
const MOOD_OPTIONS = ["CLEAN_MINIMAL", "CORPORATE_FORMAL", "ARTISTIC_EXPRESSIVE", "LUXURY_ELEGANT", "DARK_DRAMATIC", "FUTURISTIC_TECH"];
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
};
const shell = { background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 24, padding: 24, boxShadow: "0 24px 50px rgba(15,23,42,0.06)" };
const input = { width: "100%", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 14, padding: "12px 14px", fontSize: 13, background: "#fff" };

const PRESETS = [
  { name: "Executive Ledger", tagline: "Boardroom-ready professional presence", description: "Resume-first premium template.", planLevel: "PRO", primaryMood: "CORPORATE_FORMAL" },
  { name: "Studio Frame", tagline: "Case-study layout for product and brand work", description: "Portfolio-first designer template.", planLevel: "PRO", primaryMood: "ARTISTIC_EXPRESSIVE" },
  { name: "Lightbox Reel", tagline: "Immersive gallery-first portfolio", description: "Visual premium template for photography and film portfolios.", planLevel: "PREMIUM", primaryMood: "DARK_DRAMATIC" },
];

const normalizeResponse = (result) => result?.data ?? result ?? [];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [templateData, layoutData, themeData] = await Promise.all([adminTemplateAPI.getAll(), adminLayoutAPI.getAll(), adminThemeAPI.getAll()]);
      setTemplates(normalizeResponse(templateData));
      setLayouts(normalizeResponse(layoutData));
      setThemes(normalizeResponse(themeData));
    } catch {
      setTemplates([]); setLayouts([]); setThemes([]); setToast("Template catalogs could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    });
    setShowForm(true);
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({ ...prev, ...preset }));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.layoutId || !form.defaultThemeId) {
      setToast("Name, layout, and default theme are required.");
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
    };
    setSaving(true);
    try {
      if (editId) await adminTemplateAPI.update(editId, payload);
      else await adminTemplateAPI.create(payload);
      setToast(editId ? "Template updated." : "Template created.");
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } catch {
      setToast("Template could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Disable this template?")) return;
    try { await adminTemplateAPI.deactivate(id); setToast("Template disabled."); load(); }
    catch { setToast("Disable failed."); }
  };

  return (
    <AdminDashboardLayout title="Templates" subtitle="Premium template catalog management">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Template Catalog</div>
          <h2 className="page-title">Clean, readable admin controls for templates.</h2>
          <p className="page-lead">This page now uses real styling and clear cards, so the admin can actually manage templates, layout links, and default themes without the UI collapsing.</p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <button className="premium-btn primary" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>New Template</button>
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
                <div className="premium-muted" style={{ marginTop: 6 }}>{preset.tagline}</div>
              </button>
            ))}
          </div>
        </section>

        {showForm ? (
          <section style={{ ...shell, marginTop: 20 }}>
            <div className="page-eyebrow">{editId ? "Edit Template" : "Create Template"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, marginTop: 14 }}>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Template Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} /></label>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Tagline</span><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} style={input} /></label>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Description</span><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={input} /></label>
              <div style={{ display: "grid", gap: 16 }}>
                <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Plan Level</span><select value={form.planLevel} onChange={(e) => setForm({ ...form, planLevel: e.target.value })} style={input}>{PLAN_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Mood</span><select value={form.primaryMood} onChange={(e) => setForm({ ...form, primaryMood: e.target.value })} style={input}>{MOOD_OPTIONS.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
              </div>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Layout</span><select value={form.layoutId} onChange={(e) => setForm({ ...form, layoutId: e.target.value })} style={input}><option value="">Select layout</option>{layouts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label style={{ display: "grid", gap: 6 }}><span className="premium-muted">Default Theme</span><select value={form.defaultThemeId} onChange={(e) => setForm({ ...form, defaultThemeId: e.target.value })} style={input}><option value="">Select theme</option>{themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 16, fontSize: 13 }}>
              <label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <label><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> New</label>
              <label><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
              <label><input type="checkbox" checked={form.globallySelectable} onChange={(e) => setForm({ ...form, globallySelectable: e.target.checked })} /> Globally Selectable</label>
            </div>
            <div className="panel-actions" style={{ marginTop: 16 }}>
              <button className="premium-btn primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editId ? "Update Template" : "Create Template"}</button>
              <button className="premium-btn ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>Cancel</button>
            </div>
          </section>
        ) : null}

        {loading ? <section className="premium-panel"><p className="premium-muted">Loading templates...</p></section> : null}

        <section className="premium-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", marginTop: 20 }}>
          {templates.map((template) => {
            const layout = layouts.find((item) => item.id === template.layoutId);
            const theme = themes.find((item) => item.id === template.defaultThemeId);
            return (
              <article key={template.id} className="premium-card" style={{ padding: 18 }}>
                <div style={{ position: "relative", padding: 16, borderRadius: 20, background: "linear-gradient(135deg,#f8fafc,#ede9fe)", border: "1px solid rgba(15,23,42,0.08)" }}>
                  <div style={{ borderRadius: 16, background: theme?.colorPalette?.primary || "#111827", height: 34 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <div style={{ height: 88, borderRadius: 14, background: theme?.colorPalette?.pageBackground || "#f9fafb" }} />
                    <div style={{ height: 88, borderRadius: 14, background: theme?.colorPalette?.surfaceBackground || "#ffffff" }} />
                  </div>
                  <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
                    {template.featured ? <span className="premium-badge status-tone-warn"><Star size={11}/> Featured</span> : null}
                    {template.isNew ? <span className="premium-badge status-tone-info"><Sparkles size={11}/> New</span> : null}
                  </div>
                  {template.planLevel !== "FREE" ? <div style={{ position: "absolute", top: 14, right: 14 }} className="premium-badge status-tone-neutral"><Lock size={11}/> {template.planLevel}</div> : null}
                </div>
                <h3 style={{ margin: "14px 0 6px", fontSize: "1.2rem" }}>{template.name}</h3>
                <p className="premium-muted">{template.tagline || template.description || "No description"}</p>
                <div style={{ display: "grid", gap: 6, marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                  <div>Layout: {layout?.name || "Missing layout"}</div>
                  <div>Theme: {theme?.name || "Missing theme"}</div>
                  <div>Mood: {template.primaryMood || "-"}</div>
                </div>
                <div className="panel-actions" style={{ marginTop: 14 }}>
                  <button className="premium-btn secondary" onClick={() => startEdit(template)}>Edit</button>
                  <button className="premium-btn ghost" onClick={() => handleDeactivate(template.id)}>Disable</button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
