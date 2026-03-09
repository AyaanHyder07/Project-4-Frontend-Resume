import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Award, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, ExternalLink, Image
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/certifications/resume/{resumeId}
   POST /api/certifications              multipart: data + file
   PUT  /api/certifications/{id}         multipart: data + file
   DEL  /api/certifications/{id}
   PUT  /api/certifications/resume/{resumeId}/reorder   body: string[]
───────────────────────────────────────────────────────── */

const EMPTY = { title: "", resumeId: "" };

export default function CertificationSection({ resumeId }) {
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragId,  setDragId]  = useState(null);
  const [toast,   setToast]   = useState(null);
  const fileRef = useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/certifications/resume/${resumeId}`)
      .then(r => setCerts(r.data))
      .catch(() => showToast("Failed to load certifications.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm({ title:"", resumeId });
    setEditId(null); setCertFile(null); setFilePreview(null);
    setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (cert) => {
    setForm({ title: cert.title ?? "", resumeId });
    setEditId(cert.id);
    setCertFile(null);
    setFilePreview(cert.certificateUrl ?? null);
    setShowForm(true);
  };

  /* ── file pick ── */
  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { showToast("Images only.", false); return; }
    if (f.size > 5_000_000)           { showToast("Max 5 MB.",    false); return; }
    setCertFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  /* ── build FormData ── */
  const buildFD = () => {
    const payload = { title: form.title.trim(), resumeId };
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(payload)], { type:"application/json" }));
    if (certFile) fd.append("file", certFile);
    return fd;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!form.title.trim()) { showToast("Title is required.", false); return; }
    setSaving(true);
    const fd  = buildFD();
    const cfg = { headers: { "Content-Type":"multipart/form-data" } };
    const req = editId
      ? axiosInstance.put(`/api/certifications/${editId}`, fd, cfg)
      : axiosInstance.post("/api/certifications", fd, cfg);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this certification?")) return;
    axiosInstance.delete(`/api/certifications/${id}`)
      .then(() => { showToast("Deleted."); load(); })
      .catch(() => showToast("Delete failed.", false));
  };

  /* ── drag-to-reorder ── */
  const onDragStart = (id) => setDragId(id);

  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const reordered = [...certs];
    const fromIdx   = reordered.findIndex(c => c.id === dragId);
    const toIdx     = reordered.findIndex(c => c.id === targetId);
    const [moved]   = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setCerts(reordered);
    setDragId(null);
    setReordering(true);
    axiosInstance.put(`/api/certifications/resume/${resumeId}/reorder`, reordered.map(c => c.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>
      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Certifications</h2>
          <p style={s.desc}>{certs.length} certification{certs.length!==1?"s":""} · drag to reorder</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {reordering && <Loader2 size={14} style={{color:"#8A8578",animation:"spin .8s linear infinite"}}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Certification
            </button>
          )}
        </div>
      </div>

      {/* toast */}
      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Certification" : "Add Certification"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* certificate image upload */}
          <div style={s.uploadRow}>
            <div style={{...s.certBox, cursor:"pointer"}} onClick={() => fileRef.current.click()}>
              {filePreview
                ? <img src={filePreview} alt="cert" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:9}}/>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"#8A8578"}}>
                    <Award size={24}/><span style={{fontSize:11}}>Certificate Image</span>
                  </div>
              }
            </div>
            <div>
              <button style={s.smBtn} onClick={() => fileRef.current.click()}>
                <Image size={12}/> {filePreview ? "Change" : "Upload"} Image
              </button>
              {filePreview && (
                <button style={{...s.smBtn, marginLeft:8, color:"#B43C3C", borderColor:"rgba(180,60,60,0.3)"}}
                  onClick={() => { setCertFile(null); setFilePreview(null); }}>
                  <X size={12}/> Remove
                </button>
              )}
              <p style={{fontSize:11,color:"#8A8578",margin:"8px 0 0"}}>JPG/PNG · max 5 MB · optional</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onFileChange}/>
          </div>

          <div style={{marginBottom:20}}>
            <label style={s.lbl}>Certification Title <span style={{color:"#B43C3C"}}>*</span></label>
            <input style={s.input} value={form.title}
              placeholder="e.g. AWS Certified Solutions Architect"
              onChange={e => setForm(p => ({...p, title:e.target.value}))}/>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={s.btnSec} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={s.btnPri} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/> : <Save size={13}/>}
              {saving ? "Saving…" : editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {loading ? <CenterLoader/> : certs.length === 0 && !showForm ? (
        <Empty onAdd={openCreate}/>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {certs.map(cert => (
            <div
              key={cert.id}
              draggable
              onDragStart={() => onDragStart(cert.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(cert.id)}
              style={{
                ...s.certRow,
                opacity: dragId===cert.id ? 0.45 : 1,
                border: dragId && dragId!==cert.id ? "1.5px dashed #8A8578" : "1px solid #D8D3CA",
              }}
            >
              {/* drag handle */}
              <GripVertical size={15} style={{color:"#D8D3CA",flexShrink:0,cursor:"grab"}}/>

              {/* cert thumbnail */}
              {cert.certificateUrl
                ? <img src={cert.certificateUrl} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                : <div style={s.certThumb}><Award size={18} color="#8A8578"/></div>
              }

              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 3px",fontSize:14,fontWeight:500,fontFamily:"'Cormorant Garamond',serif",color:"#1C1C1C"}}>
                  {cert.title}
                </p>
                <p style={{margin:0,fontSize:11,color:"#8A8578"}}>
                  Order #{cert.displayOrder}
                  {cert.certificateUrl && (
                    <a href={cert.certificateUrl} target="_blank" rel="noreferrer"
                      style={{marginLeft:8,color:"#1C6EA4",display:"inline-flex",alignItems:"center",gap:3}}>
                      <ExternalLink size={10}/> View
                    </a>
                  )}
                </p>
              </div>

              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button style={s.iconBtn} onClick={() => openEdit(cert)}><Edit3 size={13}/></button>
                <button style={{...s.iconBtn,color:"#B43C3C"}} onClick={() => handleDelete(cert.id)}>
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
const Toast = ({ toast }) => (
  <div style={{
    display:"flex",alignItems:"center",gap:8,padding:"11px 16px",borderRadius:10,
    fontSize:13,marginBottom:16,
    background: toast.ok?"rgba(58,125,68,0.10)":"rgba(180,60,60,0.10)",
    border:`1px solid ${toast.ok?"rgba(58,125,68,0.22)":"rgba(180,60,60,0.22)"}`,
    color: toast.ok?"#3A7D44":"#B43C3C",
  }}>
    {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>} {toast.msg}
  </div>
);

const Empty = ({ onAdd }) => (
  <div style={{textAlign:"center",padding:"50px 0",background:"#ECEAE2",borderRadius:14,border:"1px solid #D8D3CA"}}>
    <Award size={36} style={{color:"#D8D3CA",marginBottom:14}}/>
    <p style={{margin:"0 0 5px",fontSize:17,fontFamily:"'Cormorant Garamond',serif"}}>No certifications yet</p>
    <p style={{margin:"0 0 18px",fontSize:13,color:"#8A8578"}}>Add your credentials and achievements</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Certification</button>
  </div>
);

const CenterLoader = () => (
  <div style={{display:"flex",justifyContent:"center",padding:"60px 0"}}>
    <Loader2 size={26} style={{color:"#8A8578",animation:"spin .8s linear infinite"}}/>
  </div>
);

const s = {
  wrap: { fontFamily:"'DM Sans',sans-serif",color:"#1C1C1C" },
  topRow: { display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20 },
  title: { fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:500,margin:0 },
  desc: { fontSize:12,color:"#8A8578",margin:"4px 0 0" },
  card: { background:"#ECEAE2",border:"1px solid #D8D3CA",borderRadius:14,padding:"20px 22px",marginBottom:16 },
  cardHead: { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 },
  cardTitle: { fontSize:15,fontWeight:500,fontFamily:"'Cormorant Garamond',serif" },
  uploadRow: { display:"flex",alignItems:"center",gap:16,marginBottom:18 },
  certBox: { width:110,height:72,borderRadius:9,border:"1.5px dashed #D8D3CA",background:"#F0EDE6",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 },
  certRow: { display:"flex",alignItems:"center",gap:12,background:"#ECEAE2",borderRadius:12,padding:"14px 16px",cursor:"default",transition:"border .15s" },
  certThumb: { width:44,height:44,borderRadius:8,background:"#D8D3CA",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  lbl: { display:"block",fontSize:11,fontWeight:600,color:"#8A8578",letterSpacing:".4px",textTransform:"uppercase",marginBottom:7 },
  input: { width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid #D8D3CA",background:"#F0EDE6",fontSize:13.5,fontFamily:"'DM Sans',sans-serif",color:"#1C1C1C",boxSizing:"border-box" },
  iconBtn: { display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid #D8D3CA",background:"#F0EDE6",cursor:"pointer",color:"#8A8578" },
  smBtn: { display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid #D8D3CA",background:"#E0DCD3",color:"#1C1C1C",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" },
  btnPri: { display:"inline-flex",alignItems:"center",gap:7,background:"#1C1C1C",color:"#F0EDE6",border:"none",padding:"10px 18px",borderRadius:9,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:500,cursor:"pointer" },
  btnSec: { display:"inline-flex",alignItems:"center",gap:7,background:"#E0DCD3",color:"#1C1C1C",border:"none",padding:"10px 18px",borderRadius:9,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:500,cursor:"pointer" },
};