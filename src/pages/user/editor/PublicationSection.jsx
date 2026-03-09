import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, BookOpen, ExternalLink,
  ChevronDown, ChevronUp, Tag
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/publications/resume/{resumeId}
   POST /api/publications                   body: JSON
   PUT  /api/publications/{id}              body: JSON
   DEL  /api/publications/{id}
   POST /api/publications/reorder/{resumeId}  body: string[]
───────────────────────────────────────────────────────── */

const PUB_TYPES = [
  "JOURNAL", "CONFERENCE", "BOOK", "BOOK_CHAPTER",
  "THESIS", "PATENT", "BLOG", "OTHER"
];

const TYPE_COLORS = {
  JOURNAL:      { bg:"rgba(58,100,200,0.09)",  color:"#3A64C8" },
  CONFERENCE:   { bg:"rgba(201,150,58,0.12)",  color:"#C9963A" },
  BOOK:         { bg:"rgba(58,125,68,0.10)",   color:"#3A7D44" },
  BOOK_CHAPTER: { bg:"rgba(58,125,68,0.07)",   color:"#3A7D44" },
  THESIS:       { bg:"rgba(160,58,200,0.09)",  color:"#A03AC8" },
  PATENT:       { bg:"rgba(180,60,60,0.09)",   color:"#B43C3C" },
  BLOG:         { bg:"rgba(58,180,160,0.10)",  color:"#3AB4A0" },
  OTHER:        { bg:"rgba(138,133,120,0.10)", color:"#8A8578" },
};

const EMPTY = {
  title:"", type:"JOURNAL", publisher:"",
  publicationDate:"", abstractText:"", contentUrl:"", keywords:"",
};

export default function PublicationSection({ resumeId }) {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState(null);
  const [dragId,     setDragId]     = useState(null);
  const [reordering, setReordering] = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/publications/resume/${resumeId}`)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load publications.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null); setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (item) => {
    setForm({
      title:           item.title           ?? "",
      type:            item.type            ?? "JOURNAL",
      publisher:       item.publisher       ?? "",
      publicationDate: item.publicationDate ?? "",
      abstractText:    item.abstractText    ?? "",
      contentUrl:      item.contentUrl      ?? "",
      keywords:        Array.isArray(item.keywords)
                         ? item.keywords.join(", ")
                         : (item.keywords ?? ""),
    });
    setEditId(item.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── validate ── */
  const validate = () => {
    if (!form.title.trim())     { showToast("Title is required.", false); return false; }
    if (!form.publisher.trim()) { showToast("Publisher is required.", false); return false; }
    return true;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      resumeId,
      title:           form.title.trim(),
      type:            form.type,
      publisher:       form.publisher.trim(),
      publicationDate: form.publicationDate || null,
      abstractText:    form.abstractText.trim() || null,
      contentUrl:      form.contentUrl.trim()   || null,
      keywords:        form.keywords.trim()
                         ? form.keywords.split(",").map(k => k.trim()).filter(Boolean)
                         : [],
    };

    const req = editId
      ? axiosInstance.put(`/api/publications/${editId}`, payload)
      : axiosInstance.post("/api/publications", payload);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this publication?")) return;
    axiosInstance.delete(`/api/publications/${id}`)
      .then(() => { showToast("Deleted."); load(); })
      .catch(() => showToast("Delete failed.", false));
  };

  /* ── drag reorder — NOTE: POST not PUT ── */
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
    axiosInstance.post(`/api/publications/reorder/${resumeId}`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Publications</h2>
          <p style={s.desc}>{list.length} publication{list.length !== 1 ? "s" : ""} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Publication
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Publication" : "Add Publication"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* type pills */}
          <div style={{ marginBottom:20 }}>
            <label style={s.lbl}>Type *</label>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
              {PUB_TYPES.map(t => {
                const tc = TYPE_COLORS[t];
                return (
                  <button key={t}
                    style={{
                      ...s.typePill,
                      background: form.type === t ? tc.bg        : "transparent",
                      color:      form.type === t ? tc.color     : "#8A8578",
                      border:     `1px solid ${form.type === t ? tc.color + "55" : "#D8D3CA"}`,
                      fontWeight: form.type === t ? 600 : 400,
                    }}
                    onClick={() => f("type", t)}>
                    {t.replace("_", " ").charAt(0) + t.replace("_", " ").slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.grid2}>
            <Field label="Title *">
              <input style={s.input} value={form.title}
                placeholder="Deep Learning in Medical Imaging"
                onChange={e => f("title", e.target.value)}/>
            </Field>
            <Field label="Publisher / Journal / Venue *">
              <input style={s.input} value={form.publisher}
                placeholder="IEEE, Springer, Nature…"
                onChange={e => f("publisher", e.target.value)}/>
            </Field>
            <Field label="Publication Date">
              <input style={s.input} type="date" value={form.publicationDate}
                onChange={e => f("publicationDate", e.target.value)}/>
            </Field>
            <Field label="Content URL">
              <input style={s.input} value={form.contentUrl}
                placeholder="https://doi.org/10.1000/xyz123"
                onChange={e => f("contentUrl", e.target.value)}/>
            </Field>
          </div>

          <Field label="Abstract">
            <textarea style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} rows={4}
              value={form.abstractText}
              placeholder="Brief summary of the publication…"
              onChange={e => f("abstractText", e.target.value)}/>
          </Field>

          <Field label="Keywords" hint="Comma separated">
            <input style={s.input} value={form.keywords}
              placeholder="machine learning, neural networks, healthcare"
              onChange={e => f("keywords", e.target.value)}/>
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
            const tc = TYPE_COLORS[item.type] ?? TYPE_COLORS.OTHER;
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
                  <BookOpen size={17} color={tc.color}/>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                    <p style={s.rowTitle}>{item.title}</p>
                    <span style={{ ...s.typeBadge, background: tc.bg, color: tc.color }}>
                      {item.type?.replace("_", " ")}
                    </span>
                  </div>
                  <p style={s.rowSub}>
                    {item.publisher}
                    {item.publicationDate && (
                      <><span style={s.dot}>·</span>
                      {new Date(item.publicationDate).toLocaleDateString("en-IN", { year:"numeric", month:"short" })}</>
                    )}
                  </p>

                  {expanded === item.id && (
                    <div style={{ marginTop:10 }}>
                      {item.abstractText && (
                        <p style={{ fontSize:12, color:"#1C1C1C", lineHeight:1.6, margin:"0 0 8px" }}>
                          {item.abstractText}
                        </p>
                      )}
                      {item.keywords?.length > 0 && (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                          {item.keywords.map(k => (
                            <span key={k} style={s.kwTag}>
                              <Tag size={9}/> {k}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.contentUrl && (
                        <a href={item.contentUrl} target="_blank" rel="noreferrer"
                          style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, color:"#1C6EA4" }}>
                          <ExternalLink size={11}/> View Publication
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {item.contentUrl && !expanded && (
                    <a href={item.contentUrl} target="_blank" rel="noreferrer"
                      style={{ ...s.iconBtn, textDecoration:"none" }}>
                      <ExternalLink size={13}/>
                    </a>
                  )}
                  <button style={s.iconBtn}
                    onClick={() => setExpanded(p => p === item.id ? null : item.id)}>
                    {expanded === item.id ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                  </button>
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
    <BookOpen size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No publications yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add journals, papers, patents or books</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Publication</button>
  </div>
);

const CenterLoader = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
    <Loader2 size={26} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>
  </div>
);

const s = {
  wrap:      { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 },
  title:     { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:500, margin:0 },
  desc:      { fontSize:12, color:"#8A8578", margin:"4px 0 0" },
  card:      { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"20px 22px", marginBottom:16 },
  cardHead:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  cardTitle: { fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',serif" },
  grid2:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:4 },
  row:       { display:"flex", alignItems:"flex-start", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowIcon:   { width:38, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 },
  rowTitle:  { margin:0, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:    { margin:"3px 0 0", fontSize:11, color:"#8A8578" },
  dot:       { margin:"0 5px" },
  typeBadge: { fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, letterSpacing:".3px", textTransform:"uppercase" },
  kwTag:     { display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"2px 9px", borderRadius:20, background:"rgba(28,28,28,0.07)", color:"#1C1C1C" },
  lbl:       { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:     { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:   { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578", flexShrink:0 },
  typePill:  { padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" },
  btnPri:    { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:    { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};