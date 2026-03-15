import { useEffect, useState, useRef } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminThemeAPI } from "../../api/api";

const emptyForm = {
  name: "",
  themeConfig: JSON.stringify({
    primaryColor:    "#1a1a2e",
    secondaryColor:  "#16213e",
    accentColor:     "#0f3460",
    backgroundColor: "#ffffff",
    textColor:       "#333333",
    fontFamily:      "Inter, sans-serif",
    borderRadius:    "8px",
  }, null, 2),
};

const AdminThemesPage = () => {
  const [themes, setThemes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ msg: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [jsonErr, setJsonErr]   = useState("");
  const previewRef              = useRef(null);

  const load = () => {
    setLoading(true);
    adminThemeAPI.getAll().then((r) => setThemes(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const validateJson = (str) => {
    try { JSON.parse(str); setJsonErr(""); return true; }
    catch { setJsonErr("Invalid JSON"); return false; }
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      return data.secureUrl || null;
    } catch (e) {
      console.warn("capturePreview failed", e);
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (!validateJson(form.themeConfig)) return;
    
    setSaving(true);
    notify("Capturing preview...", "blue");
    const previewImageUrl = await capturePreview();

    const payload = { 
      name: form.name, 
      themeConfig: JSON.parse(form.themeConfig),
      previewImageUrl
    };
    
    const call = editId ? adminThemeAPI.update(editId, payload) : adminThemeAPI.create(payload);
    call
      .then(() => { notify(editId ? "Theme updated!" : "Theme created!"); setShowForm(false); setForm(emptyForm); setEditId(null); load(); })
      .catch(() => notify("Failed to save.", "red"))
      .finally(() => setSaving(false));
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({ name: t.name, themeConfig: JSON.stringify(t.themeConfig, null, 2) });
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

  return (
    <AdminDashboardLayout
      title="Themes"
      subtitle="Create and manage portfolio themes"
      rightAction={
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Theme
        </button>
      }
    >
      {toast.msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toastCls[toast.type] || "bg-blue-50 text-blue-700 border border-blue-200"}`}>{toast.msg}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">
            {editId ? "Edit Theme" : "New Theme"}
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Theme Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ocean Dark"
              className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Theme Config (JSON)
              {jsonErr && <span className="ml-2 text-red-500 normal-case">{jsonErr}</span>}
            </label>
            <textarea
              rows={14}
              value={form.themeConfig}
              onChange={(e) => { setForm({ ...form, themeConfig: e.target.value }); validateJson(e.target.value); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Live preview */}
          <div ref={previewRef} style={{ padding: "10px", background: "#fff", display: "inline-block", minWidth: "250px" }}>
            <ThemePreview configStr={form.themeConfig} />
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editId ? "Update Theme" : "Create Theme"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading themes...</p>}

      {!loading && themes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-gray-400 font-medium">No themes yet. Create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {themes.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="relative">
              {t.previewImageUrl ? (
                <img src={t.previewImageUrl} alt={t.name} className="w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div style={{ height: "192px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                  <ColorBar config={t.themeConfig} />
                </div>
              )}
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-900 text-base mb-1 truncate" title={t.name}>{t.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate" title={t.themeConfig?.fontFamily}>{t.themeConfig?.fontFamily || "—"}</p>
              
              <div className="mt-auto pt-4 flex gap-2">
                <button onClick={() => startEdit(t)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >Edit</button>
                <button onClick={() => handleDeactivate(t.id)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                >Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

const ColorBar = ({ config = {} }) => {
  const colors = [config.primaryColor, config.secondaryColor, config.accentColor, config.backgroundColor].filter(Boolean);
  return (
    <div className="flex h-7">
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} title={c} />
      ))}
    </div>
  );
};

const ThemePreview = ({ configStr }) => {
  try {
    const c = JSON.parse(configStr);

    return (
      <div
        className="border-2 p-4 mt-2"
        style={{
          background: c.backgroundColor,
          color: c.textColor,
          fontFamily: c.fontFamily,
          borderRadius: c.borderRadius,
          borderColor: c.primaryColor
        }}
      >
        <div
          style={{ background: c.primaryColor }}
          className="text-white text-xs font-semibold px-3 py-2 rounded mb-2"
        >
          Primary — {c.primaryColor}
        </div>

        <div className="flex gap-2">
          <span
            style={{ background: c.accentColor }}
            className="text-white text-xs px-2 py-1 rounded-full"
          >
            Accent
          </span>

          <span
            style={{ background: c.secondaryColor }}
            className="text-white text-xs px-2 py-1 rounded-full"
          >
            Secondary
          </span>
        </div>

        <p className="text-xs mt-2 opacity-60">
          Body text — {c.fontFamily}
        </p>
      </div>
    );
  } catch {
    return null;
  }
};

export default AdminThemesPage;