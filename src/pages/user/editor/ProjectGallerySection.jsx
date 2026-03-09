import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, Image, Video, ExternalLink,
  ChevronDown, ChevronUp, Upload
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/project-gallery/project/{projectId}
   POST /api/project-gallery          multipart: data + mediaFile + thumbnailFile
   PUT  /api/project-gallery/{galleryId}  multipart: data + mediaFile + thumbnailFile
   DEL  /api/project-gallery/{galleryId}
   PUT  /api/project-gallery/project/{projectId}/reorder  body: string[]

   NOTE: This component is scoped to a single PROJECT (not resumeId).
   Pass projectId as prop from the ProjectSection when user opens a project's gallery.
───────────────────────────────────────────────────────── */

const MEDIA_TYPES = ["IMAGE", "VIDEO"];

const EMPTY = {
  mediaType: "IMAGE", caption: "", resolutionInfo: "",
  mediaUrl: "", thumbnailUrl: "",
};

export default function ProjectGallerySection({ projectId }) {
  const [list,        setList]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [mediaFile,   setMediaFile]   = useState(null);
  const [thumbFile,   setThumbFile]   = useState(null);
  const [mediaPreview,  setMediaPreview]  = useState(null);
  const [thumbPreview,  setThumbPreview]  = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [expanded,    setExpanded]    = useState(null);
  const [dragId,      setDragId]      = useState(null);
  const [reordering,  setReordering]  = useState(false);
  const [toast,       setToast]       = useState(null);
  const mediaRef = useRef();
  const thumbRef = useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/project-gallery/project/${projectId}`)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load gallery.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [projectId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setMediaFile(null); setThumbFile(null);
    setMediaPreview(null); setThumbPreview(null);
    setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (item) => {
    setForm({
      mediaType:      item.mediaType      ?? "IMAGE",
      caption:        item.caption        ?? "",
      resolutionInfo: item.resolutionInfo ?? "",
      mediaUrl:       item.mediaUrl       ?? "",
      thumbnailUrl:   item.thumbnailUrl   ?? "",
    });
    setEditId(item.id);
    setMediaFile(null); setThumbFile(null);
    setMediaPreview(item.mediaUrl     ?? null);
    setThumbPreview(item.thumbnailUrl ?? null);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── file pickers ── */
  const onMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { showToast("Image or video files only.", false); return; }
    if (file.size > 50_000_000) { showToast("Max 50 MB.", false); return; }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    // auto-set mediaType from file
    f("mediaType", isVideo ? "VIDEO" : "IMAGE");
  };

  const onThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Images only for thumbnail.", false); return; }
    if (file.size > 5_000_000)           { showToast("Thumbnail max 5 MB.", false); return; }
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  /* ── build FormData ── */
  const buildFD = () => {
    const payload = {
      projectId,
      mediaType:      form.mediaType,
      caption:        form.caption.trim()        || null,
      resolutionInfo: form.resolutionInfo.trim() || null,
      mediaUrl:       form.mediaUrl.trim()       || null,
      thumbnailUrl:   form.thumbnailUrl.trim()   || null,
    };
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(payload)], { type:"application/json" }));
    if (mediaFile) fd.append("mediaFile", mediaFile);
    if (thumbFile) fd.append("thumbnailFile", thumbFile);
    return fd;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!mediaFile && !form.mediaUrl.trim()) {
      showToast("Upload a media file or paste a media URL.", false); return;
    }
    setSaving(true);
    const fd  = buildFD();
    const cfg = { headers: { "Content-Type":"multipart/form-data" } };
    const req = editId
      ? axiosInstance.put(`/api/project-gallery/${editId}`, fd, cfg)
      : axiosInstance.post("/api/project-gallery", fd, cfg);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    axiosInstance.delete(`/api/project-gallery/${id}`)
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
    axiosInstance.put(`/api/project-gallery/project/${projectId}/reorder`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Project Gallery</h2>
          <p style={s.desc}>{list.length} item{list.length !== 1 ? "s" : ""} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Media
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Gallery Item" : "Add Gallery Item"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* media type toggle */}
          <div style={{ marginBottom:20 }}>
            <label style={s.lbl}>Media Type</label>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {MEDIA_TYPES.map(t => (
                <button key={t}
                  style={{
                    ...s.typePill,
                    background: form.mediaType === t ? "#1C1C1C" : "transparent",
                    color:      form.mediaType === t ? "#F0EDE6" : "#8A8578",
                    border:     `1px solid ${form.mediaType === t ? "#1C1C1C" : "#D8D3CA"}`,
                  }}
                  onClick={() => f("mediaType", t)}>
                  {t === "IMAGE" ? <Image size={12}/> : <Video size={12}/>}
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* media upload + thumbnail upload */}
          <div style={s.uploadRow}>

            {/* media file */}
            <div style={{ flex:1 }}>
              <label style={s.lbl}>
                {form.mediaType === "VIDEO" ? "Video File" : "Image File"}
              </label>
              <div style={{ ...s.uploadBox, marginTop:8 }} onClick={() => mediaRef.current.click()}>
                {mediaPreview
                  ? form.mediaType === "VIDEO"
                    ? <video src={mediaPreview} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:9 }}/>
                    : <img src={mediaPreview} alt="media" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:9 }}/>
                  : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:"#8A8578" }}>
                      {form.mediaType === "VIDEO" ? <Video size={22}/> : <Image size={22}/>}
                      <span style={{ fontSize:11 }}>Click to upload</span>
                    </div>
                }
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button style={s.smBtn} onClick={() => mediaRef.current.click()}>
                  <Upload size={11}/> {mediaPreview ? "Change" : "Upload"}
                </button>
                {mediaPreview && mediaFile && (
                  <button style={{ ...s.smBtn, color:"#B43C3C", borderColor:"rgba(180,60,60,0.3)" }}
                    onClick={() => { setMediaFile(null); setMediaPreview(null); }}>
                    <X size={11}/> Remove
                  </button>
                )}
              </div>
              <p style={{ fontSize:10, color:"#8A8578", margin:"5px 0 0" }}>
                {form.mediaType === "VIDEO" ? "MP4/WebM · max 50 MB" : "JPG/PNG · max 50 MB"}
              </p>
              <input ref={mediaRef} type="file"
                accept={form.mediaType === "VIDEO" ? "video/*" : "image/*"}
                style={{ display:"none" }} onChange={onMediaChange}/>
            </div>

            {/* thumbnail (always image) */}
            <div style={{ flex:1 }}>
              <label style={s.lbl}>Thumbnail <span style={{ fontWeight:400, textTransform:"none", fontSize:10 }}>(optional)</span></label>
              <div style={{ ...s.uploadBox, marginTop:8 }} onClick={() => thumbRef.current.click()}>
                {thumbPreview
                  ? <img src={thumbPreview} alt="thumb" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:9 }}/>
                  : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:"#8A8578" }}>
                      <Image size={22}/><span style={{ fontSize:11 }}>Thumbnail</span>
                    </div>
                }
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button style={s.smBtn} onClick={() => thumbRef.current.click()}>
                  <Upload size={11}/> {thumbPreview ? "Change" : "Upload"}
                </button>
                {thumbPreview && thumbFile && (
                  <button style={{ ...s.smBtn, color:"#B43C3C", borderColor:"rgba(180,60,60,0.3)" }}
                    onClick={() => { setThumbFile(null); setThumbPreview(null); }}>
                    <X size={11}/> Remove
                  </button>
                )}
              </div>
              <p style={{ fontSize:10, color:"#8A8578", margin:"5px 0 0" }}>JPG/PNG · max 5 MB</p>
              <input ref={thumbRef} type="file" accept="image/*"
                style={{ display:"none" }} onChange={onThumbChange}/>
            </div>
          </div>

          {/* OR paste URL */}
          <Field label="Media URL" hint="Or paste a direct link instead of uploading">
            <input style={s.input} value={form.mediaUrl}
              placeholder="https://res.cloudinary.com/…"
              onChange={e => f("mediaUrl", e.target.value)}/>
          </Field>

          <div style={s.grid2}>
            <Field label="Caption">
              <input style={s.input} value={form.caption}
                placeholder="Dashboard overview screenshot"
                onChange={e => f("caption", e.target.value)}/>
            </Field>
            <Field label="Resolution / Info">
              <input style={s.input} value={form.resolutionInfo}
                placeholder="1920×1080, 4K, 2min demo"
                onChange={e => f("resolutionInfo", e.target.value)}/>
            </Field>
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
          {list.map(item => (
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

              {/* thumbnail preview */}
              <div style={s.thumb}>
                {item.thumbnailUrl || item.mediaUrl
                  ? <img
                      src={item.thumbnailUrl ?? item.mediaUrl}
                      alt=""
                      style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:7 }}/>
                  : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
                      {item.mediaType === "VIDEO" ? <Video size={18} color="#8A8578"/> : <Image size={18} color="#8A8578"/>}
                    </div>
                }
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <p style={s.rowTitle}>{item.caption || `Gallery Item #${item.displayOrder}`}</p>
                  <span style={{
                    fontSize:10, fontWeight:600, padding:"1px 7px", borderRadius:20,
                    background: item.mediaType === "VIDEO" ? "rgba(160,58,200,0.09)" : "rgba(58,100,200,0.09)",
                    color:      item.mediaType === "VIDEO" ? "#A03AC8" : "#3A64C8",
                  }}>
                    {item.mediaType === "VIDEO" ? <Video size={9}/> : <Image size={9}/>}
                    {" "}{item.mediaType}
                  </span>
                </div>
                {item.resolutionInfo && (
                  <p style={s.rowSub}>{item.resolutionInfo}</p>
                )}
                {expanded === item.id && item.mediaUrl && (
                  <a href={item.mediaUrl} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:8, fontSize:12, color:"#1C6EA4" }}>
                    <ExternalLink size={11}/> Open Media
                  </a>
                )}
              </div>

              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
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
    <Image size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No gallery items yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add screenshots, demos or videos for this project</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Media</button>
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
  uploadRow: { display:"flex", gap:20, marginBottom:16, flexWrap:"wrap" },
  uploadBox: { width:"100%", height:120, border:"1.5px dashed #D8D3CA", borderRadius:9, background:"#F0EDE6", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", cursor:"pointer" },
  thumb:     { width:52, height:52, borderRadius:8, background:"#D8D3CA", overflow:"hidden", flexShrink:0 },
  row:       { display:"flex", alignItems:"center", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowTitle:  { margin:0, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:    { margin:"3px 0 0", fontSize:11, color:"#8A8578" },
  lbl:       { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:     { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:   { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578", flexShrink:0 },
  typePill:  { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 13px", borderRadius:20, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" },
  smBtn:     { display:"inline-flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:8, border:"1px solid #D8D3CA", background:"#E0DCD3", color:"#1C1C1C", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  btnPri:    { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:    { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};