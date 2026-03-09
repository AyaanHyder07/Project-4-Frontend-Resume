import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, GraduationCap, ChevronDown, ChevronUp
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/educations/resume/{resumeId}
   POST /api/educations                    body: JSON
   PUT  /api/educations/{educationId}      body: JSON
   DEL  /api/educations/{educationId}
   PUT  /api/educations/resume/{resumeId}/reorder   body: string[]
───────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

const EMPTY = {
  institutionName: "", degree: "", specialization: "",
  grade: "", startYear: "", endYear: "", description: "",
};

export default function EducationSection({ resumeId }) {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [expanded,  setExpanded]  = useState(null);
  const [dragId,    setDragId]    = useState(null);
  const [reordering,setReordering]= useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/educations/resume/${resumeId}`)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load education.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null); setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (edu) => {
    setForm({
      institutionName: edu.institutionName ?? "",
      degree:          edu.degree          ?? "",
      specialization:  edu.specialization  ?? "",
      grade:           edu.grade           ?? "",
      startYear:       edu.startYear       ?? "",
      endYear:         edu.endYear         ?? "",
      description:     edu.description     ?? "",
    });
    setEditId(edu.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── validate ── */
  const validate = () => {
    if (!form.institutionName.trim()) { showToast("Institution name is required.", false); return false; }
    if (!form.degree.trim())          { showToast("Degree is required.", false); return false; }
    if (!form.startYear)              { showToast("Start year is required.", false); return false; }
    if (Number(form.startYear) > CURRENT_YEAR) { showToast("Start year cannot be in the future.", false); return false; }
    if (form.endYear && Number(form.endYear) < Number(form.startYear)) {
      showToast("End year cannot be before start year.", false); return false;
    }
    return true;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      resumeId,
      institutionName: form.institutionName.trim(),
      degree:          form.degree.trim(),
      specialization:  form.specialization.trim() || null,
      grade:           form.grade.trim()           || null,
      startYear:       Number(form.startYear),
      endYear:         form.endYear ? Number(form.endYear) : null,
      description:     form.description.trim()     || null,
    };
    const req = editId
      ? axiosInstance.put(`/api/educations/${editId}`, payload)
      : axiosInstance.post("/api/educations", payload);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this education entry?")) return;
    axiosInstance.delete(`/api/educations/${id}`)
      .then(() => { showToast("Deleted."); load(); })
      .catch(() => showToast("Delete failed.", false));
  };

  /* ── drag reorder ── */
  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const reordered = [...list];
    const from = reordered.findIndex(e => e.id === dragId);
    const to   = reordered.findIndex(e => e.id === targetId);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setList(reordered);
    setDragId(null);
    setReordering(true);
    axiosInstance.put(`/api/educations/resume/${resumeId}/reorder`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Education</h2>
          <p style={s.desc}>{list.length} entr{list.length !== 1 ? "ies" : "y"} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Education
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Education" : "Add Education"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          <div style={s.grid2}>
            <Field label="Institution Name *">
              <input style={s.input} value={form.institutionName} placeholder="Harvard University"
                onChange={e => f("institutionName", e.target.value)}/>
            </Field>
            <Field label="Degree *">
              <input style={s.input} value={form.degree} placeholder="B.Tech / B.Sc / MBA"
                onChange={e => f("degree", e.target.value)}/>
            </Field>
            <Field label="Specialization">
              <input style={s.input} value={form.specialization} placeholder="Computer Science"
                onChange={e => f("specialization", e.target.value)}/>
            </Field>
            <Field label="Grade / GPA">
              <input style={s.input} value={form.grade} placeholder="8.5 / 10"
                onChange={e => f("grade", e.target.value)}/>
            </Field>
            <Field label="Start Year *">
              <select style={s.input} value={form.startYear} onChange={e => f("startYear", e.target.value)}>
                <option value="">— Select —</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="End Year" hint="Leave blank if ongoing">
              <select style={s.input} value={form.endYear} onChange={e => f("endYear", e.target.value)}>
                <option value="">Ongoing</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} rows={3}
              value={form.description} placeholder="Relevant coursework, achievements…"
              onChange={e => f("description", e.target.value)}/>
          </Field>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <button style={s.btnSec} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={s.btnPri} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={13} style={{ animation:"spin .8s linear infinite" }}/> : <Save size={13}/>}
              {saving ? "Saving…" : editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {loading ? <CenterLoader/> : list.length === 0 && !showForm ? (
        <Empty onAdd={openCreate}/>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {list.map(edu => (
            <div key={edu.id} draggable
              onDragStart={() => setDragId(edu.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(edu.id)}
              style={{
                ...s.row,
                opacity: dragId === edu.id ? 0.4 : 1,
                border: dragId && dragId !== edu.id ? "1.5px dashed #8A8578" : "1px solid #D8D3CA",
              }}
            >
              <GripVertical size={15} style={{ color:"#D8D3CA", flexShrink:0, cursor:"grab" }}/>

              <div style={s.rowIcon}><GraduationCap size={17} color="#8A8578"/></div>

              <div style={{ flex:1, minWidth:0 }}>
                <p style={s.rowTitle}>{edu.degree}{edu.specialization ? ` — ${edu.specialization}` : ""}</p>
                <p style={s.rowSub}>
                  {edu.institutionName}
                  <span style={s.dot}>·</span>
                  {edu.startYear} – {edu.endYear ?? "Present"}
                  {edu.grade && <><span style={s.dot}>·</span>{edu.grade}</>}
                </p>
                {edu.description && expanded === edu.id && (
                  <p style={{ margin:"8px 0 0", fontSize:12, color:"#1C1C1C", lineHeight:1.6 }}>
                    {edu.description}
                  </p>
                )}
              </div>

              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button style={s.iconBtn} onClick={() => setExpanded(p => p === edu.id ? null : edu.id)}>
                  {expanded === edu.id ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                </button>
                <button style={s.iconBtn} onClick={() => openEdit(edu)}><Edit3 size={13}/></button>
                <button style={{ ...s.iconBtn, color:"#B43C3C" }} onClick={() => handleDelete(edu.id)}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── helpers ── */
const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
      <label style={s.lbl}>{label}</label>
      {hint && <span style={{ fontSize:11, color:"#8A8578" }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Toast = ({ toast }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:10,
    fontSize:13, marginBottom:16,
    background: toast.ok ? "rgba(58,125,68,0.10)" : "rgba(180,60,60,0.10)",
    border: `1px solid ${toast.ok ? "rgba(58,125,68,0.22)" : "rgba(180,60,60,0.22)"}`,
    color: toast.ok ? "#3A7D44" : "#B43C3C",
  }}>
    {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>} {toast.msg}
  </div>
);

const Empty = ({ onAdd }) => (
  <div style={{ textAlign:"center", padding:"50px 0", background:"#ECEAE2", borderRadius:14, border:"1px solid #D8D3CA" }}>
    <GraduationCap size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No education added yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add your degrees and qualifications</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Education</button>
  </div>
);

const CenterLoader = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
    <Loader2 size={26} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>
  </div>
);

const s = {
  wrap:     { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 },
  title:    { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:500, margin:0 },
  desc:     { fontSize:12, color:"#8A8578", margin:"4px 0 0" },
  card:     { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"20px 22px", marginBottom:16 },
  cardHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  cardTitle:{ fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',serif" },
  grid2:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:4 },
  row:      { display:"flex", alignItems:"center", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowIcon:  { width:38, height:38, borderRadius:8, background:"#D8D3CA", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  rowTitle: { margin:"0 0 3px", fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:   { margin:0, fontSize:11, color:"#8A8578" },
  dot:      { margin:"0 5px" },
  lbl:      { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:    { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:  { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578" },
  btnPri:   { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:   { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};