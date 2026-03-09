import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, ShieldCheck, ExternalLink,
  Upload, ChevronDown, ChevronUp
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/financial-credentials/resume/{resumeId}
   POST /api/financial-credentials          multipart: data + file
   PUT  /api/financial-credentials/{id}     multipart: data + file
   DEL  /api/financial-credentials/{id}
   PUT  /api/financial-credentials/resume/{resumeId}/reorder  body: string[]
───────────────────────────────────────────────────────── */

const CURRENT_DATE = new Date().toISOString().split("T")[0];
const CURRENT_YEAR = new Date().getFullYear();

const CREDENTIAL_TYPES = [
  "CA", "CPA", "CFA", "CFP", "ACCA", "ICWA",
  "CS", "FRM", "CIA", "CISA", "OTHER"
];

const STATUS_COLORS = {
  ACTIVE:  { bg:"rgba(58,125,68,0.10)",   color:"#3A7D44" },
  EXPIRED: { bg:"rgba(180,60,60,0.10)",   color:"#B43C3C" },
  PENDING: { bg:"rgba(201,150,58,0.12)",  color:"#C9963A" },
};

const EMPTY = {
  certificationName:"", credentialType:"CA", licenseNumber:"",
  issuingAuthority:"", issueDate:"", validTill:"",
  region:"", verificationUrl:"",
};

export default function FinancialCredentialSection({ resumeId }) {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [proofFile,  setProofFile]  = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState(null);
  const [dragId,     setDragId]     = useState(null);
  const [reordering, setReordering] = useState(false);
  const [toast,      setToast]      = useState(null);
  const fileRef = useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/financial-credentials/resume/${resumeId}`)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load credentials.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null);
    setProofFile(null); setProofPreview(null);
    setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (item) => {
    setForm({
      certificationName: item.certificationName ?? "",
      credentialType:    item.credentialType    ?? "CA",
      licenseNumber:     item.licenseNumber     ?? "",
      issuingAuthority:  item.issuingAuthority  ?? "",
      issueDate:         item.issueDate         ?? "",
      validTill:         item.validTill         ?? "",
      region:            item.region            ?? "",
      verificationUrl:   item.verificationUrl   ?? "",
    });
    setEditId(item.id);
    setProofFile(null);
    setProofPreview(item.verificationUrl ?? null);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── file pick ── */
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Images only.", false); return; }
    if (file.size > 5_000_000)           { showToast("Max 5 MB.",    false); return; }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  /* ── validate ── */
  const validate = () => {
    if (!form.certificationName.trim()) { showToast("Certification name is required.", false); return false; }
    if (!form.issuingAuthority.trim())  { showToast("Issuing authority is required.", false); return false; }
    if (!form.issueDate)                { showToast("Issue date is required.", false); return false; }
    if (form.validTill && form.validTill < form.issueDate) {
      showToast("Valid till cannot be before issue date.", false); return false;
    }
    return true;
  };

  /* ── build FormData ── */
  const buildFD = () => {
    const payload = {
      resumeId,
      certificationName: form.certificationName.trim(),
      credentialType:    form.credentialType.toUpperCase(),
      licenseNumber:     form.licenseNumber.trim()    || null,
      issuingAuthority:  form.issuingAuthority.trim(),
      issueDate:         form.issueDate               || null,
      validTill:         form.validTill               || null,
      region:            form.region.trim()           || null,
      verificationUrl:   form.verificationUrl.trim()  || null,
    };
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(payload)], { type:"application/json" }));
    if (proofFile) fd.append("file", proofFile);
    return fd;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const fd  = buildFD();
    const cfg = { headers: { "Content-Type":"multipart/form-data" } };
    const req = editId
      ? axiosInstance.put(`/api/financial-credentials/${editId}`, fd, cfg)
      : axiosInstance.post("/api/financial-credentials", fd, cfg);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this credential?")) return;
    axiosInstance.delete(`/api/financial-credentials/${id}`)
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
    axiosInstance.put(`/api/financial-credentials/resume/${resumeId}/reorder`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Financial Credentials</h2>
          <p style={s.desc}>{list.length} credential{list.length !== 1 ? "s" : ""} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Credential
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Credential" : "Add Credential"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* credential type pills */}
          <div style={{ marginBottom:20 }}>
            <label style={s.lbl}>Credential Type *</label>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
              {CREDENTIAL_TYPES.map(t => (
                <button key={t}
                  style={{
                    ...s.typePill,
                    background: form.credentialType === t ? "#1C1C1C" : "transparent",
                    color:      form.credentialType === t ? "#F0EDE6"  : "#8A8578",
                    border:     `1px solid ${form.credentialType === t ? "#1C1C1C" : "#D8D3CA"}`,
                  }}
                  onClick={() => f("credentialType", t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={s.grid2}>
            <Field label="Certification Name *">
              <input style={s.input} value={form.certificationName}
                placeholder="Chartered Accountant"
                onChange={e => f("certificationName", e.target.value)}/>
            </Field>
            <Field label="License / Registration No.">
              <input style={s.input} value={form.licenseNumber}
                placeholder="MH/12345/2021"
                onChange={e => f("licenseNumber", e.target.value)}/>
            </Field>
            <Field label="Issuing Authority *">
              <input style={s.input} value={form.issuingAuthority}
                placeholder="ICAI"
                onChange={e => f("issuingAuthority", e.target.value)}/>
            </Field>
            <Field label="Region">
              <input style={s.input} value={form.region}
                placeholder="India / USA / UK"
                onChange={e => f("region", e.target.value)}/>
            </Field>
            <Field label="Issue Date *">
              <input style={s.input} type="date" value={form.issueDate}
                max={CURRENT_DATE}
                onChange={e => f("issueDate", e.target.value)}/>
            </Field>
            <Field label="Valid Till" hint="Leave blank if lifetime">
              <input style={s.input} type="date" value={form.validTill}
                onChange={e => f("validTill", e.target.value)}/>
            </Field>
          </div>

          {/* verification URL or file upload */}
          <div style={s.proofRow}>
            <div style={{ flex:1 }}>
              <Field label="Verification URL">
                <input style={s.input} value={form.verificationUrl}
                  placeholder="https://verify.icai.org/..."
                  onChange={e => f("verificationUrl", e.target.value)}/>
              </Field>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, paddingTop:24 }}>
              <button style={s.smBtn} onClick={() => fileRef.current.click()}>
                <Upload size={12}/> {proofPreview && proofFile ? "Change File" : "Upload Proof"}
              </button>
              {proofFile && (
                <span style={{ fontSize:11, color:"#3A7D44" }}>
                  <CheckCircle size={10}/> {proofFile.name}
                </span>
              )}
              <p style={{ fontSize:10, color:"#8A8578", margin:0 }}>JPG/PNG · max 5 MB</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFileChange}/>
            </div>
          </div>

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
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.ACTIVE;
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

                <div style={{ ...s.rowIcon, background: sc.bg }}>
                  <ShieldCheck size={17} color={sc.color}/>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                    <p style={s.rowTitle}>{item.certificationName}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:20, background:"rgba(28,28,28,0.08)", color:"#1C1C1C" }}>
                      {item.credentialType}
                    </span>
                    <span style={{ fontSize:10, fontWeight:600, padding:"1px 8px", borderRadius:20, background:sc.bg, color:sc.color }}>
                      {item.status}
                    </span>
                    {item.verified && (
                      <span style={{ fontSize:10, fontWeight:600, padding:"1px 8px", borderRadius:20, background:"rgba(58,125,68,0.10)", color:"#3A7D44" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p style={s.rowSub}>
                    {item.issuingAuthority}
                    {item.licenseNumber && <><span style={s.dot}>·</span>#{item.licenseNumber}</>}
                    {item.region && <><span style={s.dot}>·</span>{item.region}</>}
                    {item.issueDate && <><span style={s.dot}>·</span>Issued {item.issueDate}</>}
                    {item.validTill && <><span style={s.dot}>·</span>Till {item.validTill}</>}
                  </p>
                  {expanded === item.id && item.verificationUrl && (
                    <a href={item.verificationUrl} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:8, fontSize:12, color:"#1C6EA4" }}>
                      <ExternalLink size={11}/> Verify Online
                    </a>
                  )}
                </div>

                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {item.verificationUrl && (
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
    <ShieldCheck size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No credentials yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add your CA, CPA, CFA or other financial credentials</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Credential</button>
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
  proofRow:  { display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" },
  row:       { display:"flex", alignItems:"center", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowIcon:   { width:38, height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  rowTitle:  { margin:0, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:    { margin:"3px 0 0", fontSize:11, color:"#8A8578" },
  dot:       { margin:"0 5px" },
  lbl:       { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:     { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:   { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578" },
  typePill:  { padding:"5px 11px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", letterSpacing:".3px", transition:"all .15s" },
  smBtn:     { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, border:"1px solid #D8D3CA", background:"#E0DCD3", color:"#1C1C1C", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" },
  btnPri:    { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:    { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};