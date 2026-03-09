import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminLayoutAPI } from "../../api/api";

const LAYOUT_TYPES = ["SINGLE_COLUMN", "TWO_COLUMN", "SIDEBAR_LEFT", "SIDEBAR_RIGHT", "GRID", "MASONRY"];

const emptyForm = {
  name: "",
  layoutType: "SINGLE_COLUMN",
  layoutConfigJson: JSON.stringify({
    columns: 1,
    sidebarWidth: "280px",
    contentPadding: "24px",
    headerHeight: "80px",
    sectionSpacing: "32px",
    maxWidth: "1200px",
  }, null, 2),
};

const AdminLayoutsPage = () => {
  const [layouts, setLayouts]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ msg: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [jsonErr, setJsonErr]   = useState("");

  const load = () => {
    setLoading(true);
    adminLayoutAPI.getAll().then((r) => setLayouts(r.data)).catch(() => {}).finally(() => setLoading(false));
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

  const handleSave = () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (!validateJson(form.layoutConfigJson)) return;
    const payload = { name: form.name, layoutType: form.layoutType, layoutConfigJson: JSON.parse(form.layoutConfigJson) };
    setSaving(true);
    const call = editId ? adminLayoutAPI.update(editId, payload) : adminLayoutAPI.create(payload);
    call
      .then(() => { notify(editId ? "Layout updated!" : "Layout created!"); setShowForm(false); setForm(emptyForm); setEditId(null); load(); })
      .catch(() => notify("Failed to save.", "red"))
      .finally(() => setSaving(false));
  };

  const startEdit = (l) => {
    setEditId(l.id);
    setForm({ name: l.name, layoutType: l.layoutType, layoutConfigJson: JSON.stringify(l.layoutConfigJson, null, 2) });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Deactivate this layout?")) return;
    adminLayoutAPI.deactivate(id)
      .then(() => { notify("Deactivated.", "red"); load(); })
      .catch(() => notify("Failed.", "red"));
  };

  const toastCls = { green: "bg-green-50 text-green-700 border border-green-200", red: "bg-red-50 text-red-700 border border-red-200" };

  return (
    <AdminDashboardLayout
      title="Layouts"
      subtitle="Create and manage portfolio layouts"
      rightAction={
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Layout
        </button>
      }
    >
      {toast.msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-5 ${toastCls[toast.type]}`}>{toast.msg}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">
            {editId ? "Edit Layout" : "New Layout"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Layout Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Two Column Pro"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Layout Type
              </label>
              <select
                value={form.layoutType}
                onChange={(e) => setForm({ ...form, layoutType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LAYOUT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Diagram */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Preview
            </label>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <LayoutDiagram type={form.layoutType} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Config JSON
              {jsonErr && <span className="ml-2 text-red-500 normal-case font-normal">{jsonErr}</span>}
            </label>
            <textarea
              rows={12}
              value={form.layoutConfigJson}
              onChange={(e) => { setForm({ ...form, layoutConfigJson: e.target.value }); validateJson(e.target.value); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editId ? "Update Layout" : "Create Layout"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading layouts...</p>}

      {!loading && layouts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="text-gray-400 font-medium">No layouts yet. Create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {layouts.map((l) => (
          <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="border-b border-gray-100">
              <LayoutDiagram type={l.layoutType} small />
            </div>
            <div className="p-4">
              <p className="font-bold text-gray-900">{l.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l.layoutType?.replace(/_/g, " ")}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => startEdit(l)}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >Edit</button>
                <button onClick={() => handleDeactivate(l.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                >Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

/* Layout diagram */
const LayoutDiagram = ({ type, small }) => {
  const h    = small ? 64 : 96;
  const wrap = { display: "flex", height: h, gap: 4, padding: 8, background: "#f8fafc" };
  const b    = (flex, bg) => <div style={{ flex, background: bg, borderRadius: 3 }} />;

  switch (type) {
    case "TWO_COLUMN":
      return <div style={wrap}>{b(1,"#cbd5e1")}{b(1,"#e2e8f0")}</div>;
    case "SIDEBAR_LEFT":
      return <div style={wrap}>{b(1,"#94a3b8")}{b(3,"#e2e8f0")}</div>;
    case "SIDEBAR_RIGHT":
      return <div style={wrap}>{b(3,"#e2e8f0")}{b(1,"#94a3b8")}</div>;
    case "GRID":
      return (
        <div style={{ ...wrap, flexWrap: "wrap" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ width: "47%", height: "44%", background: "#cbd5e1", borderRadius: 3, margin: "1.5%" }} />
          ))}
        </div>
      );
    case "MASONRY":
      return (
        <div style={wrap}>
          {b(1,"#94a3b8")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ flex: 1, background: "#cbd5e1", borderRadius: 3 }} />
            <div style={{ flex: 2, background: "#e2e8f0", borderRadius: 3 }} />
          </div>
        </div>
      );
    default:
      return (
        <div style={{ ...wrap, flexDirection: "column" }}>
          <div style={{ height: 22, background: "#94a3b8", borderRadius: 3 }} />
          <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 3, marginTop: 4 }} />
        </div>
      );
  }
};

export default AdminLayoutsPage;