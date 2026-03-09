import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, Trophy, ChevronDown, ChevronUp
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/exhibitions/resume/{resumeId}
   GET  /api/exhibitions/resume/{resumeId}/type/{type}
   POST /api/exhibitions                    body: JSON
   PUT  /api/exhibitions/{id}               body: JSON
   DEL  /api/exhibitions/{id}
   PUT  /api/exhibitions/resume/{resumeId}/reorder   body: string[]
───────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

const AWARD_TYPES = ["EXHIBITION", "AWARD", "RECOGNITION", "COMPETITION", "GRANT", "OTHER"];

const TYPE_COLORS = {
  EXHIBITION:  { bg:"rgba(58,100,200,0.09)",  color:"#3A64C8" },
  AWARD:       { bg:"rgba(201,150,58,0.12)",  color:"#C9963A" },
  RECOGNITION: { bg:"rgba(58,125,68,0.10)",   color:"#3A7D44" },
  COMPETITION: { bg:"rgba(160,58,200,0.09)",  color:"#A03AC8" },
  GRANT:       { bg:"rgba(58,180,160,0.10)",  color:"#3AB4A0" },
  OTHER:       { bg:"rgba(138,133,120,0.10)", color:"#8A8578" },
};

const EMPTY = {
  title:"", eventName:"", location:"", year:"", description:"", awardType:"AWARD",
};

export default function ExhibitionSection({ resumeId }) {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState(null);
  const [dragId,     setDragId]     = useState(null);
  const [reordering, setReordering] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = (type = filterType) => {
    const url = type === "ALL"
      ? `/api/exhibitions/resume/${resumeId}`
      : `/api/exhibitions/resume/${resumeId}/type/${type}`;
    axiosInstance.get(url)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load.", false))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [resumeId]);

  const applyFilter = (type) => {
    setFilterType(type);
    setLoading(true);
    load(type);
  };

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null); setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (item) => {
    setForm({
      title:     item.title     ?? "",
      eventName: item.eventName ?? "",
      location:  item.location  ?? "",
      year:      item.year      ?? "",
      description: item.description ?? "",
      awardType: item.awardType ?? "AWARD",
    });
    setEditId(item.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── validate ── */
  const validate = () => {
    if (!form.title.trim())     { showToast("Title is required.", false); return false; }
    if (!form.eventName.trim()) { showToast("Event / Issuer name is required.", false); return false; }
    if (!form.year)             { showToast("Year is required.", false); return false; }
    if (Number(form.year) > CURRENT_YEAR) { showToast("Year cannot be in the future.", false); return false; }
    return true;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      resumeId,
      title:       form.title.trim(),
      eventName:   form.eventName.trim(),
      location:    form.location.trim()    || null,
      year:        Number(form.year),
      description: form.description.trim() || null,
      awardType:   form.awardType,
    };
    const req = editId
      ? axiosInstance.put(`/api/exhibitions/${editId}`, payload)
      : axiosInstance.post("/api/exhibitions", payload);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this entry?")) return;
    axiosInstance.delete(`/api/exhibitions/${id}`)
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
    axiosInstance.put(`/api/exhibitions/resume/${resumeId}/reorder`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Exhibitions & Awards</h2>
          <p style={s.desc}>{list.length} entr{list.length !== 1 ? "ies" : "y"} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Entry
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── TYPE FILTER PILLS ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
        {["ALL", ...AWARD_TYPES].map(t => (
          <button key={t} onClick={() => applyFilter(t)}
            style={{
              ...s.filterPill,
              ...(filterType === t ? s.filterActive : {}),
              ...(filterType !== t && t !== "ALL" ? { color: TYPE_COLORS[t]?.color, borderColor: TYPE_COLORS[t]?.bg } : {}),
            }}>
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Entry" : "Add Entry"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* type selector */}
          <div style={{ marginBottom:18 }}>
            <label style={s.lbl}>Type *</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:7 }}>
              {AWARD_TYPES.map(t => (
                <button key={t}
                  style={{
                    ...s.typePill,
                    background: form.awardType === t ? TYPE_COLORS[t]?.bg : "transparent",
                    color:      form.awardType === t ? TYPE_COLORS[t]?.color : "#8A8578",
                    border:     `1px solid ${form.awardType === t ? (TYPE_COLORS[t]?.color + "55") : "#D8D3CA"}`,
                    fontWeight: form.awardType === t ? 600 : 400,
                  }}
                  onClick={() => f("awardType", t)}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={s.grid2}>
            <Field label="Title *">
              <input style={s.input} value={form.title} placeholder="Best UI Design Award"
                onChange={e => f("title", e.target.value)}/>
            </Field>
            <Field label="Event / Issuer *">
              <input style={s.input} value={form.eventName} placeholder="Google UX Summit"
                onChange={e => f("eventName", e.target.value)}/>
            </Field>
            <Field label="Location">
              <input style={s.input} value={form.location} placeholder="New York, USA"
                onChange={e => f("location", e.target.value)}/>
            </Field>
            <Field label="Year *">
              <select style={s.input} value={form.year} onChange={e => f("year", e.target.value)}>
                <option value="">— Select Year —</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} rows={3}
              value={form.description} placeholder="What you achieved, how it was recognised…"
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
          {list.map(item => {
            const tc = TYPE_COLORS[item.awardType] ?? TYPE_COLORS.OTHER;
            return (
              <div key={item.id} draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(item.id)}
                style={{
                  ...s.row,
                  opacity: dragId === item.id ? 0.4 : 1,
                  border: dragId && dragId !== item.id ? "1.5px dashed #8A8578" : "1px solid #D8D3CA",
                }}
              >
                <GripVertical size={15} style={{ color:"#D8D3CA", flexShrink:0, cursor:"grab" }}/>

                <div style={{ ...s.rowIcon, background: tc.bg }}>
                  <Trophy size={17} color={tc.color}/>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                    <p style={s.rowTitle}>{item.title}</p>
                    <span style={{ ...s.typeBadge, background: tc.bg, color: tc.color }}>
                      {item.awardType.charAt(0) + item.awardType.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p style={s.rowSub}>
                    {item.eventName}
                    {item.location && <><span style={s.dot}>·</span>{item.location}</>}
                    <span style={s.dot}>·</span>{item.year}
                  </p>
                  {item.description && expanded === item.id && (
                    <p style={{ margin:"8px 0 0", fontSize:12, color:"#1C1C1C", lineHeight:1.6 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {item.description && (
                    <button style={s.iconBtn} onClick={() => setExpanded(p => p === item.id ? null : item.id)}>
                      {expanded === item.id ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                    </button>
                  )}
                  <button style={s.iconBtn} onClick={() => openEdit(item)}><Edit3 size={13}/></button>
                  <button style={{ ...s.iconBtn, color:"#B43C3C" }} onClick={() => handleDelete(item.id)}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── helpers ── */
const Field = ({ label, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={s.lbl}>{label}</label>
    <div style={{ marginTop:6 }}>{children}</div>
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
    <Trophy size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No entries yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add your awards, exhibitions and recognitions</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Entry</button>
  </div>
);

const CenterLoader = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
    <Loader2 size={26} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>
  </div>
);

const s = {
  wrap:        { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow:      { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 },
  title:       { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:500, margin:0 },
  desc:        { fontSize:12, color:"#8A8578", margin:"4px 0 0" },
  card:        { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"20px 22px", marginBottom:16 },
  cardHead:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  cardTitle:   { fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',serif" },
  grid2:       { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:4 },
  row:         { display:"flex", alignItems:"center", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowIcon:     { width:38, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  rowTitle:    { margin:0, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:      { margin:"3px 0 0", fontSize:11, color:"#8A8578" },
  dot:         { margin:"0 5px" },
  typeBadge:   { fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, letterSpacing:".3px" },
  lbl:         { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:       { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:     { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578" },
  filterPill:  { display:"inline-flex", alignItems:"center", padding:"5px 13px", borderRadius:20, border:"1px solid #D8D3CA", background:"transparent", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#8A8578" },
  filterActive:{ background:"#1C1C1C", color:"#F0EDE6", border:"1px solid #1C1C1C" },
  typePill:    { padding:"6px 13px", borderRadius:20, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" },
  btnPri:      { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:      { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};