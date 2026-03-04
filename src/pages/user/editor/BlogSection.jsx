import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import {
  Plus, Edit3, Trash2, Eye, EyeOff, Image, Tag,
  Save, X, Loader2, CheckCircle, AlertCircle,
  Globe, Lock, ChevronDown, ChevronUp, Calendar
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET    /api/blogs/resume/{resumeId}
   POST   /api/blogs                   multipart: data + coverFile
   PUT    /api/blogs/{blogId}           multipart: data + coverFile
   DELETE /api/blogs/{blogId}
───────────────────────────────────────────────────────── */

const EMPTY = { title:"", content:"", tags:"", visibility:"Draft" };

export default function BlogSection({ resumeId }) {
  const [blogs,   setBlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);   // null = create mode
  const [coverFile, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [expanded, setExpanded] = useState(null);  // which card is open
  const [toast,   setToast]   = useState(null);
  const fileRef = useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    api.get(`/api/blogs/resume/${resumeId}`)
      .then(r => setBlogs(r.data))
      .catch(() => showToast("Failed to load blogs.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open form for create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null);
    setCover(null); setCoverPreview(null);
    setShowForm(true);
  };

  /* ── open form for edit ── */
  const openEdit = (blog) => {
    setForm({
      title:      blog.title      ?? "",
      content:    blog.content    ?? "",
      tags:       (blog.tags ?? []).join(", "),
      visibility: blog.visibility ?? "Draft",
    });
    setEditId(blog.id);
    setCover(null);
    setCoverPreview(blog.coverImage ?? null);
    setShowForm(true);
    setExpanded(null);
  };

  /* ── cover pick ── */
  const onCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { showToast("Images only.", false); return; }
    if (f.size > 5_000_000)           { showToast("Max 5 MB.",    false); return; }
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  /* ── build FormData ── */
  const buildFD = () => {
    const payload = {
      resuemeId:  resumeId,           // backend reads from CreateBlogRequest
      title:      form.title.trim(),
      content:    form.content.trim(),
      tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
      visibility: form.visibility,
    };
    if (!editId) payload.resumeId = resumeId; // required for create
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (coverFile) fd.append("coverFile", coverFile);
    return fd;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!form.title.trim())   { showToast("Title is required.", false); return; }
    if (!form.content.trim()) { showToast("Content is required.", false); return; }
    setSaving(true);
    const fd  = buildFD();
    const cfg = { headers: { "Content-Type": "multipart/form-data" } };
    const req = editId
      ? api.put(`/api/blogs/${editId}`, fd, cfg)
      : api.post("/api/blogs", fd, cfg);

    req
      .then(() => { showToast(editId ? "Blog updated!" : "Blog created!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this blog post?")) return;
    api.delete(`/api/blogs/${id}`)
      .then(() => { showToast("Deleted."); load(); })
      .catch(() => showToast("Delete failed.", false));
  };

  /* ── toggle publish ── */
  const toggleVisibility = (blog) => {
    const next = blog.visibility === "Public" ? "Draft" : "Public";
    const payload = { title: blog.title, content: blog.content, tags: blog.tags, visibility: next };
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    api.put(`/api/blogs/${blog.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => { showToast(next === "Public" ? "Published!" : "Set to Draft."); load(); })
      .catch(() => showToast("Failed.", false));
  };

  return (
    <div style={s.wrap}>
      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Blog Posts</h2>
          <p style={s.desc}>{blogs.length} post{blogs.length !== 1 ? "s" : ""}</p>
        </div>
        {!showForm && (
          <button style={s.btnPri} onClick={openCreate}>
            <Plus size={14}/> New Post
          </button>
        )}
      </div>

      {/* toast */}
      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Post" : "New Post"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* cover */}
          <div style={s.coverRow}>
            <div style={{...s.coverBox, cursor:"pointer"}} onClick={() => fileRef.current.click()}>
              {coverPreview
                ? <img src={coverPreview} alt="cover" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:9}}/>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"#8A8578"}}>
                    <Image size={22}/><span style={{fontSize:12}}>Cover Image</span>
                  </div>
              }
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button style={s.smBtn} onClick={() => fileRef.current.click()}>
                <Image size={12}/> {coverPreview ? "Change" : "Upload"} Cover
              </button>
              {coverPreview && (
                <button style={{...s.smBtn, color:"#B43C3C", borderColor:"rgba(180,60,60,0.3)"}}
                  onClick={() => { setCover(null); setCoverPreview(null); }}>
                  <X size={12}/> Remove
                </button>
              )}
              <p style={{fontSize:11,color:"#8A8578",margin:0}}>JPG/PNG · max 5 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onCoverChange}/>
          </div>

          <Field label="Title *" required>
            <input style={s.input} value={form.title} placeholder="Post title…"
              onChange={e => setForm(p => ({...p, title:e.target.value}))}/>
          </Field>

          <Field label="Content *" required>
            <textarea style={{...s.input, resize:"vertical", lineHeight:1.6}} rows={8}
              value={form.content} placeholder="Write your post here…"
              onChange={e => setForm(p => ({...p, content:e.target.value}))}/>
          </Field>

          <Field label="Tags" hint="Comma separated">
            <input style={s.input} value={form.tags} placeholder="react, typescript, career"
              onChange={e => setForm(p => ({...p, tags:e.target.value}))}/>
          </Field>

          <Field label="Visibility">
            <div style={{display:"flex",gap:10}}>
              {["Draft","Public"].map(v => (
                <button key={v} style={{...s.pillBtn, ...(form.visibility===v ? s.pillActive : {})}}
                  onClick={() => setForm(p => ({...p, visibility:v}))}>
                  {v==="Public" ? <Globe size={12}/> : <Lock size={12}/>} {v}
                </button>
              ))}
            </div>
          </Field>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
            <button style={s.btnSec} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={s.btnPri} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/> : <Save size={13}/>}
              {saving ? "Saving…" : editId ? "Update" : "Create Post"}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {loading ? <CenterLoader/> : blogs.length === 0 && !showForm ? (
        <Empty onAdd={openCreate}/>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {blogs.map(b => (
            <BlogCard
              key={b.id} blog={b}
              open={expanded===b.id}
              onToggle={() => setExpanded(p => p===b.id ? null : b.id)}
              onEdit={() => openEdit(b)}
              onDelete={() => handleDelete(b.id)}
              onToggleVis={() => toggleVisibility(b)}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function BlogCard({ blog, open, onToggle, onEdit, onDelete, onToggleVis }) {
  const isPublic = blog.visibility === "Public";
  return (
    <div style={s.card}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        {blog.coverImage && (
          <img src={blog.coverImage} alt="" style={{width:48,height:48,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
        )}
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:"0 0 3px",fontSize:15,fontWeight:500,fontFamily:"'Cormorant Garamond',serif",color:"#1C1C1C"}}>{blog.title}</p>
          <div style={{display:"flex",gap:10,fontSize:11,color:"#8A8578",flexWrap:"wrap"}}>
            <span style={{...s.visPill, color:isPublic?"#3A7D44":"#8A8578", background:isPublic?"rgba(58,125,68,0.1)":"rgba(138,133,120,0.1)"}}>
              {isPublic ? <Globe size={9}/> : <Lock size={9}/>} {blog.visibility}
            </span>
            <span><Eye size={9}/> {blog.viewCount??0} views</span>
            {blog.publishedAt && <span><Calendar size={9}/> {new Date(blog.publishedAt).toLocaleDateString()}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button style={s.iconBtn} title={isPublic?"Set to Draft":"Publish"} onClick={onToggleVis}>
            {isPublic ? <EyeOff size={13}/> : <Globe size={13}/>}
          </button>
          <button style={s.iconBtn} onClick={onEdit}><Edit3 size={13}/></button>
          <button style={{...s.iconBtn,color:"#B43C3C"}} onClick={onDelete}><Trash2 size={13}/></button>
          <button style={s.iconBtn} onClick={onToggle}>
            {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>
      </div>

      {open && (
        <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #D8D3CA"}}>
          <p style={{margin:"0 0 10px",fontSize:13,color:"#1C1C1C",lineHeight:1.6,whiteSpace:"pre-wrap"}}>
            {blog.content?.slice(0, 300)}{blog.content?.length > 300 ? "…" : ""}
          </p>
          {blog.tags?.length > 0 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {blog.tags.map(t => (
                <span key={t} style={s.tag}><Tag size={9}/> {t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Field = ({ label, hint, children }) => (
  <div style={{marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
      <label style={s.lbl}>{label}</label>
      {hint && <span style={{fontSize:11,color:"#8A8578"}}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Empty = ({ onAdd }) => (
  <div style={{textAlign:"center",padding:"50px 0",background:"#ECEAE2",borderRadius:14,border:"1px solid #D8D3CA"}}>
    <p style={{margin:"0 0 6px",fontSize:17,fontFamily:"'Cormorant Garamond',serif"}}>No blog posts yet</p>
    <p style={{margin:"0 0 18px",fontSize:13,color:"#8A8578"}}>Share articles and thoughts on your portfolio</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> New Post</button>
  </div>
);

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

const CenterLoader = () => (
  <div style={{display:"flex",justifyContent:"center",padding:"60px 0"}}>
    <Loader2 size={26} style={{color:"#8A8578",animation:"spin .8s linear infinite"}}/>
  </div>
);

const s = {
  wrap: { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow: { display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20 },
  title: { fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:500,margin:0 },
  desc: { fontSize:12,color:"#8A8578",margin:"4px 0 0" },
  card: { background:"#ECEAE2",border:"1px solid #D8D3CA",borderRadius:14,padding:"20px 22px",marginBottom:2 },
  cardHead: { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 },
  cardTitle: { fontSize:15,fontWeight:500,fontFamily:"'Cormorant Garamond',serif" },
  coverRow: { display:"flex",alignItems:"center",gap:16,marginBottom:18 },
  coverBox: { width:100,height:68,borderRadius:9,border:"1.5px dashed #D8D3CA",background:"#F0EDE6",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 },
  lbl: { fontSize:11,fontWeight:600,color:"#8A8578",letterSpacing:".4px",textTransform:"uppercase" },
  input: { width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid #D8D3CA",background:"#F0EDE6",fontSize:13.5,fontFamily:"'DM Sans',sans-serif",color:"#1C1C1C",boxSizing:"border-box" },
  visPill: { display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:20,fontWeight:500 },
  tag: { display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:20,background:"rgba(28,28,28,0.07)",fontSize:11,color:"#1C1C1C" },
  pillBtn: { display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:"1px solid #D8D3CA",background:"#F0EDE6",color:"#8A8578",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" },
  pillActive: { background:"#1C1C1C",color:"#F0EDE6",border:"1px solid #1C1C1C" },
  iconBtn: { display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid #D8D3CA",background:"#F0EDE6",cursor:"pointer",color:"#8A8578" },
  smBtn: { display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:"1px solid #D8D3CA",background:"#E0DCD3",color:"#1C1C1C",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" },
  btnPri: { display:"inline-flex",alignItems:"center",gap:7,background:"#1C1C1C",color:"#F0EDE6",border:"none",padding:"10px 18px",borderRadius:9,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:500,cursor:"pointer" },
  btnSec: { display:"inline-flex",alignItems:"center",gap:7,background:"#E0DCD3",color:"#1C1C1C",border:"none",padding:"10px 18px",borderRadius:9,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:500,cursor:"pointer" },
};