import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminTemplateAPI, adminLayoutAPI, adminThemeAPI } from "../../api/api";
import { Lock, Star, Sparkles } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  tagline: "",
  planLevel: "FREE",
  layoutId: "",
  defaultThemeId: "",
  supportedSections: ["PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS"],
  requiredSections: ["PROFILE"],
  targetAudiences: ["GENERAL"],
  professionTags: [],
  primaryMood: "CLEAN_MINIMAL",
  featured: false,
  isNew: false,
  active: true
};

const SECTION_OPTIONS = [
  "PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", 
  "PROJECT_GALLERY", "CERTIFICATIONS", "FINANCIAL_CREDENTIALS",
  "PUBLICATIONS", "BLOG_POSTS", "MEDIA_APPEARANCES", 
  "EXHIBITIONS_AWARDS", "TESTIMONIALS", "SERVICE_OFFERINGS", "CONTACT"
];

const PLAN_OPTIONS = ["FREE", "BASIC", "PRO", "PREMIUM"];

const AdminTemplatesPage = () => {
  const [templates, setTemplates]   = useState([]);
  const [layouts, setLayouts]       = useState([]);
  const [themes, setThemes]         = useState([]);
  
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState({ msg: "", type: "" });
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tplRes, layRes, thmRes] = await Promise.all([
        adminTemplateAPI.getAll(),
        adminLayoutAPI.getAll(),
        adminThemeAPI.getAll()
      ]);
      setTemplates(tplRes.data || []);
      setLayouts(layRes.data || []);
      setThemes(thmRes.data || []);
    } catch (e) {
      console.error(e);
      notify("Failed to load template data.", "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.layoutId || !form.defaultThemeId) { 
      alert("Name, Layout, and Theme are required."); 
      return; 
    }
    
    setSaving(true);
    const payload = { ...form };
    
    // Convert string CSV to array if needed for profession tags (simplified here)
    if (typeof payload.professionTags === 'string') {
      payload.professionTags = payload.professionTags.split(',').map(s => s.trim()).filter(Boolean);
    }

    const call = editId ? adminTemplateAPI.update(editId, payload) : adminTemplateAPI.create(payload);
    call
      .then(() => { 
        notify(editId ? "Template updated!" : "Template created!"); 
        setShowForm(false); 
        setForm(emptyForm); 
        setEditId(null); 
        loadData(); 
      })
      .catch(() => notify("Failed to save.", "red"))
      .finally(() => setSaving(false));
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({
      name: t.name || "",
      description: t.description || "",
      tagline: t.tagline || "",
      planLevel: t.planLevel || "FREE",
      layoutId: t.layoutId || "",
      defaultThemeId: t.defaultThemeId || "",
      supportedSections: t.supportedSections || [],
      requiredSections: t.requiredSections || [],
      targetAudiences: t.targetAudiences || [],
      professionTags: t.professionTags?.join(", ") || "",
      primaryMood: t.primaryMood || "CLEAN_MINIMAL",
      featured: t.featured || false,
      isNew: t.isNew || false,
      active: typeof t.active === 'boolean' ? t.active : true
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
    const listName = isRequiredList ? 'requiredSections' : 'supportedSections';
    const current = form[listName] || [];
    
    if (current.includes(section)) {
      setForm({ ...form, [listName]: current.filter(s => s !== section) });
    } else {
      setForm({ ...form, [listName]: [...current, section] });
    }
  };

  const toastCls = { 
    green: "bg-green-50 text-green-700 border border-green-200", 
    red: "bg-red-50 text-red-700 border border-red-200" 
  };

  return (
    <AdminDashboardLayout
      title="Templates"
      subtitle="Assemble Layouts and Themes into user-facing Templates"
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

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-base mb-5 pb-4 border-b border-gray-100">
            {editId ? "Edit Template" : "New Template"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Template Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Modern Executive"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tagline</label>
                 <input
                   value={form.tagline}
                   onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                   placeholder="Short punchy phrase"
                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>

              <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                 <textarea
                   value={form.description}
                   onChange={(e) => setForm({ ...form, description: e.target.value })}
                   rows={3}
                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Plan Level</label>
                   <select
                     value={form.planLevel}
                     onChange={(e) => setForm({ ...form, planLevel: e.target.value })}
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                   >
                     {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Primary Mood</label>
                   <select
                     value={form.primaryMood}
                     onChange={(e) => setForm({ ...form, primaryMood: e.target.value })}
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="CLEAN_MINIMAL">Clean Minimal</option>
                     <option value="BOLD_VIBRANT">Bold Vibrant</option>
                     <option value="DARK_DRAMATIC">Dark Dramatic</option>
                     <option value="LUXURY_ELEGANT">Luxury Elegant</option>
                     <option value="CORPORATE_FORMAL">Corporate Formal</option>
                   </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                   <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                   Featured Badge
                 </label>
                 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                   <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({...form, isNew: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                   New Badge
                 </label>
                 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                   <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                   Active
                 </label>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attach Layout</label>
                <select
                  value={form.layoutId}
                  onChange={(e) => setForm({ ...form, layoutId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Layout --</option>
                  {layouts.map(l => <option key={l.id} value={l.id}>{l.name} ({l.layoutType})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attach Default Theme</label>
                <select
                  value={form.defaultThemeId}
                  onChange={(e) => setForm({ ...form, defaultThemeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Theme --</option>
                  {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Supported Sections (Determines Order!)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                  {SECTION_OPTIONS.map(sec => {
                    const isSelected = form.supportedSections.includes(sec);
                    return (
                      <button
                        key={sec}
                        onClick={() => toggleSection(sec, false)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
                          isSelected ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sec}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 mt-1">Order clicked determines rendering order on Resume Creation.</p>
              </div>

            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editId ? "Update Template" : "Create Template"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading templates...</p>}

      {!loading && templates.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-400 font-medium">No templates assembled yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((t) => (
          <div key={t.id} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${!t.active ? 'opacity-60' : ''}`}>
            
            <div className="p-5 border-b border-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate pr-2">{t.name}</h3>
                {t.planLevel !== "FREE" && (
                    <span className="inline-flex items-center justify-center p-1 bg-purple-100 text-purple-700 rounded-md" title={t.planLevel}>
                      <Lock size={12} />
                    </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{t.tagline || t.description || 'No description'}</p>
            </div>
            
            <div className="p-4 bg-gray-50/50 flex-grow text-[11px] text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Layout:</span>
                <span className="truncate max-w-[120px]" title={t.layoutId}>{layouts.find(l => l.id === t.layoutId)?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Theme:</span>
                <span className="truncate max-w-[120px]" title={t.defaultThemeId}>{themes.find(th => th.id === t.defaultThemeId)?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Sections:</span>
                <span>{t.supportedSections?.length || 0} enabled</span>
              </div>
            </div>
            
            <div className="p-4 pt-0 mt-auto flex gap-2">
              <button 
                onClick={() => startEdit(t)}
                className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
               >
                 Edit
               </button>
               {t.active && (
                 <button 
                   onClick={() => handleDeactivate(t.id)}
                   className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                 >
                   Disable
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminTemplatesPage;
