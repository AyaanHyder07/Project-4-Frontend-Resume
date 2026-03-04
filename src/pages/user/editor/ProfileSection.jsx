import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Globe, Github, Linkedin,
  Camera, Save, Trash2, CheckCircle, AlertCircle,
  Loader2, ChevronDown, ChevronUp, Heart, Star, Trophy
} from "lucide-react";

/* ─────────────────────────────────────────────
   MOCK  —  replace with real axios calls:

   GET    /api/profile/{resumeId}          → load existing
   POST   /api/profile   (multipart/form-data)
          FormData: data=JSON blob, profilePhoto=file
   PUT    /api/profile/{resumeId} (multipart/form-data)
          FormData: data=JSON blob, profilePhoto=file
   DELETE /api/profile/{resumeId}
───────────────────────────────────────────── */

const AVAILABILITY = ["OPEN_TO_WORK","FREELANCING","EMPLOYED","NOT_AVAILABLE"];
const GENDER_OPTS  = ["MALE","FEMALE","NON_BINARY","PREFER_NOT_TO_SAY"];

const EMPTY_FORM = {
  fullName:"", displayName:"", email:"", professionalTitle:"",
  bio:"", detailedBio:"", dateOfBirth:"", gender:"",
  nationality:"", location:"", availabilityStatus:"",
  phone:"", whatsapp:"", linkedinUrl:"", githubUrl:"",
  hobbies:"", interests:"", achievementsSummary:"",
};

/* ── section groups for clean UI ── */
const GROUPS = [
  {
    id:"basic", label:"Basic Info", Icon:User,
    fields:[
      { name:"fullName",          label:"Full Name",         type:"text",     placeholder:"Alex Morgan",       required:true },
      { name:"displayName",       label:"Display Name",      type:"text",     placeholder:"Alex M." },
      { name:"email",             label:"Email",             type:"email",    placeholder:"alex@example.com",  required:true },
      { name:"professionalTitle", label:"Professional Title",type:"text",     placeholder:"Senior Frontend Engineer" },
      { name:"dateOfBirth",       label:"Date of Birth",     type:"date" },
      { name:"gender",            label:"Gender",            type:"select",   options:GENDER_OPTS },
      { name:"nationality",       label:"Nationality",       type:"text",     placeholder:"e.g. Indian" },
      { name:"location",          label:"Location",          type:"text",     placeholder:"Pune, Maharashtra" },
      { name:"availabilityStatus",label:"Availability",      type:"select",   options:AVAILABILITY },
    ],
  },
  {
    id:"bio", label:"About", Icon:Star,
    fields:[
      { name:"bio",          label:"Short Bio",    type:"textarea", placeholder:"One-line summary for resume header…", rows:2 },
      { name:"detailedBio",  label:"Detailed Bio", type:"textarea", placeholder:"Full about section…",                rows:5 },
      { name:"achievementsSummary", label:"Achievements Summary", type:"textarea", placeholder:"Key career highlights…", rows:3 },
    ],
  },
  {
    id:"contact", label:"Contact & Social", Icon:Globe,
    fields:[
      { name:"phone",       label:"Phone",    type:"tel",  placeholder:"+91 98765 43210" },
      { name:"whatsapp",    label:"WhatsApp", type:"tel",  placeholder:"+91 98765 43210" },
      { name:"linkedinUrl", label:"LinkedIn", type:"url",  placeholder:"https://linkedin.com/in/…" },
      { name:"githubUrl",   label:"GitHub",   type:"url",  placeholder:"https://github.com/…" },
    ],
  },
  {
    id:"personal", label:"Personal", Icon:Heart,
    fields:[
      { name:"hobbies",   label:"Hobbies",   type:"textarea", placeholder:"Reading, hiking, open source…", rows:2 },
      { name:"interests", label:"Interests", type:"textarea", placeholder:"AI, design systems, coffee…",   rows:2 },
    ],
  },
];

/* ════════════════════════════════════════════
   MAIN COMPONENT
   Props: resumeId (string) — passed from ResumeEditorPage
════════════════════════════════════════════ */
export default function ProfileSection({ resumeId }) {
  const [form,       setForm]      = useState(EMPTY_FORM);
  const [photoFile,  setPhotoFile] = useState(null);
  const [photoPreview,setPreview]  = useState(null);
  const [existing,   setExisting]  = useState(null); // null = not loaded yet
  const [loading,    setLoading]   = useState(true);
  const [saving,     setSaving]    = useState(false);
  const [deleting,   setDeleting]  = useState(false);
  const [toast,      setToast]     = useState(null);
  const [open,       setOpen]      = useState({ basic:true, bio:false, contact:false, personal:false });
  const fileRef = useRef();

  /* show toast and auto-dismiss */
  const showToast = (msg, ok=true) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Load existing profile ── */
  useEffect(() => {
    /* Real call:
       axios.get(`/api/profile/${resumeId}`, authCfg())
         .then(r => { populate(r.data); setExisting(r.data); })
         .catch(err => { if(err.response?.status === 404) setExisting(null); })
         .finally(() => setLoading(false));
    */
    // MOCK: simulate no existing profile
    setTimeout(() => { setExisting(null); setLoading(false); }, 500);
  }, [resumeId]);

  const populate = (data) => {
    const f = {};
    Object.keys(EMPTY_FORM).forEach(k => { f[k] = data[k] ?? ""; });
    setForm(f);
    if (data.profilePhotoUrl) setPreview(data.profilePhotoUrl);
  };

  const setField = (k, v) => setForm(p => ({...p, [k]:v}));

  /* ── Photo pick ── */
  const onPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Only image files allowed.", false); return; }
    if (file.size > 5_000_000) { showToast("Max file size is 5 MB.", false); return; }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ── Build FormData ── */
  const buildFormData = () => {
    const fd = new FormData();
    const payload = { ...form, resumeId };
    // clean empty strings → null
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    fd.append("data", new Blob([JSON.stringify(payload)], { type:"application/json" }));
    if (photoFile) fd.append("profilePhoto", photoFile);
    return fd;
  };

  /* ── Save (create or update) ── */
  const handleSave = () => {
    if (!form.fullName.trim()) { showToast("Full name is required.", false); return; }
    if (!form.email.trim())    { showToast("Email is required.", false); return; }

    setSaving(true);
    const fd = buildFormData();

    /* Real call:
       const call = existing
         ? axios.put(`/api/profile/${resumeId}`, fd, {
             headers: { ...authCfg().headers, "Content-Type":"multipart/form-data" }
           })
         : axios.post("/api/profile", fd, {
             headers: { ...authCfg().headers, "Content-Type":"multipart/form-data" }
           });
       call.then(r => { setExisting(r.data); populate(r.data); showToast("Profile saved!"); })
           .catch(() => showToast("Failed to save.", false))
           .finally(() => setSaving(false));
    */

    // MOCK
    setTimeout(() => {
      const mockRes = { ...form, resumeId, profilePhotoUrl: photoPreview };
      setExisting(mockRes);
      setSaving(false);
      showToast(existing ? "Profile updated!" : "Profile created!");
    }, 900);
  };

  /* ── Delete ── */
  const handleDelete = () => {
    if (!window.confirm("Delete this profile? This cannot be undone.")) return;
    setDeleting(true);
    /* Real: axios.delete(`/api/profile/${resumeId}`, authCfg())
         .then(() => { setExisting(null); setForm(EMPTY_FORM); setPreview(null); showToast("Profile deleted."); })
         .catch(() => showToast("Failed to delete.", false))
         .finally(() => setDeleting(false)); */
    setTimeout(() => {
      setExisting(null); setForm(EMPTY_FORM); setPreview(null);
      setDeleting(false); showToast("Profile deleted.");
    }, 700);
  };

  if (loading) return <CenterLoader/>;

  return (
    <div style={s.wrap}>

      {/* ── header ── */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.sectionTitle}>Profile</h2>
          <p style={s.sectionDesc}>
            {existing ? "Update your profile information." : "No profile yet — fill in your details below."}
          </p>
        </div>
        <div style={{display:"flex", gap:8}}>
          {existing && (
            <button style={s.delBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/> : <Trash2 size={13}/>}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/> : <Save size={13}/>}
            {saving ? "Saving…" : existing ? "Update" : "Create Profile"}
          </button>
        </div>
      </div>

      {/* ── toast ── */}
      {toast && (
        <div style={{
          ...s.toast,
          background: toast.ok ? "rgba(58,125,68,0.10)":"rgba(180,60,60,0.10)",
          border:`1px solid ${toast.ok?"rgba(58,125,68,0.22)":"rgba(180,60,60,0.22)"}`,
          color: toast.ok ? "#3A7D44":"#B43C3C",
        }}>
          {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>}
          {toast.msg}
        </div>
      )}

      {/* ── photo upload ── */}
      <div style={s.photoRow}>
        <div style={s.avatar} onClick={() => fileRef.current.click()}>
          {photoPreview
            ? <img src={photoPreview} alt="profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <User size={28} color="#8A8578"/>
          }
          <div style={s.avatarOverlay}><Camera size={16} color="#F0EDE6"/></div>
        </div>
        <div>
          <p style={{margin:"0 0 4px", fontSize:13, fontWeight:500, color:"#1C1C1C"}}>Profile Photo</p>
          <p style={{margin:"0 0 10px", fontSize:12, color:"#8A8578"}}>JPG, PNG or WebP · max 5 MB</p>
          <button style={s.uploadBtn} onClick={() => fileRef.current.click()}>
            <Camera size={12}/> {photoPreview ? "Change Photo" : "Upload Photo"}
          </button>
          {photoPreview && (
            <button style={s.clearBtn} onClick={() => { setPhotoFile(null); setPreview(null); }}>
              Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhotoChange}/>
      </div>

      {/* ── accordion groups ── */}
      {GROUPS.map(g => (
        <Accordion key={g.id} group={g} open={open[g.id]}
          onToggle={() => setOpen(p => ({...p, [g.id]:!p[g.id]}))}>
          <div style={s.fieldGrid(g.id)}>
            {g.fields.map(f => (
              <FieldInput key={f.name} field={f} value={form[f.name]} onChange={v => setField(f.name, v)}/>
            ))}
          </div>
        </Accordion>
      ))}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
        .pf-input:focus{border-color:#1C1C1C!important;outline:none}
        .upload-btn:hover{background:#D8D3CA!important}
        .save-btn:hover{background:#333!important}
      `}</style>
    </div>
  );
}

/* ── Accordion ── */
function Accordion({ group, open, onToggle, children }) {
  return (
    <div style={s.accordion}>
      <button style={s.accordionHead} onClick={onToggle}>
        <span style={{display:"flex", alignItems:"center", gap:9}}>
          <span style={s.accordionIcon}><group.Icon size={14}/></span>
          <span style={{fontSize:14, fontWeight:500, color:"#1C1C1C"}}>{group.label}</span>
        </span>
        {open ? <ChevronUp size={15} color="#8A8578"/> : <ChevronDown size={15} color="#8A8578"/>}
      </button>
      {open && <div style={{padding:"20px 24px 24px"}}>{children}</div>}
    </div>
  );
}

/* ── Single field ── */
function FieldInput({ field, value, onChange }) {
  const base = s.input;

  if (field.type === "select") {
    return (
      <div style={field.name==="bio"||field.name==="detailedBio"||field.name==="achievementsSummary" ? {gridColumn:"1 / -1"} : {}}>
        <label style={s.lbl}>{field.label}{field.required && <span style={{color:"#B43C3C"}}> *</span>}</label>
        <select className="pf-input" value={value} onChange={e => onChange(e.target.value)} style={{...base, appearance:"none"}}>
          <option value="">— Select —</option>
          {field.options.map(o => <option key={o} value={o}>{o.replace(/_/g," ")}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div style={{gridColumn:"1 / -1"}}>
        <label style={s.lbl}>{field.label}</label>
        <textarea className="pf-input" value={value} rows={field.rows ?? 3}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{...base, resize:"vertical", lineHeight:1.5}}/>
      </div>
    );
  }

  return (
    <div>
      <label style={s.lbl}>{field.label}{field.required && <span style={{color:"#B43C3C"}}> *</span>}</label>
      <input className="pf-input" type={field.type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={base}/>
    </div>
  );
}

function CenterLoader() {
  return (
    <div style={{display:"flex", justifyContent:"center", padding:"60px 0"}}>
      <Loader2 size={26} style={{color:"#8A8578", animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── styles ── */
const s = {
  wrap: { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 },
  sectionTitle: { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:500, margin:0 },
  sectionDesc: { fontSize:12, color:"#8A8578", margin:"4px 0 0" },
  toast: { display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:10, fontSize:13, marginBottom:18 },

  photoRow: { display:"flex", alignItems:"center", gap:20, background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"20px 24px", marginBottom:16 },
  avatar: {
    width:72, height:72, borderRadius:"50%", background:"#D8D3CA",
    display:"flex", alignItems:"center", justifyContent:"center",
    overflow:"hidden", cursor:"pointer", position:"relative", flexShrink:0,
  },
  avatarOverlay: {
    position:"absolute", inset:0, background:"rgba(28,28,28,0.45)",
    display:"flex", alignItems:"center", justifyContent:"center",
    borderRadius:"50%", opacity:0,
    transition:"opacity .2s",
    // hover handled via JS workaround — see save-btn trick
  },
  uploadBtn: {
    display:"inline-flex", alignItems:"center", gap:6,
    padding:"7px 13px", borderRadius:8, border:"1px solid #D8D3CA",
    background:"#E0DCD3", color:"#1C1C1C", fontSize:12, fontWeight:500,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginRight:8,
  },
  clearBtn: {
    background:"none", border:"none", fontSize:12, color:"#8A8578", cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif",
  },

  accordion: { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:12, marginBottom:10, overflow:"hidden" },
  accordionHead: {
    width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"14px 20px", background:"none", border:"none", cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif",
  },
  accordionIcon: {
    width:28, height:28, borderRadius:7, background:"rgba(28,28,28,0.07)",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },

  fieldGrid: (id) => ({
    display:"grid",
    gridTemplateColumns: id==="bio"||id==="personal" ? "1fr" : "repeat(auto-fill,minmax(220px,1fr))",
    gap:16,
  }),

  lbl: { display:"block", fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase", marginBottom:6 },
  input: {
    width:"100%", padding:"10px 13px", borderRadius:9,
    border:"1px solid #D8D3CA", background:"#F0EDE6",
    fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C",
    boxSizing:"border-box", transition:"border .15s",
  },

  saveBtn: {
    display:"inline-flex", alignItems:"center", gap:7,
    padding:"9px 18px", borderRadius:9, border:"none",
    background:"#1C1C1C", color:"#F0EDE6",
    fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
  },
  delBtn: {
    display:"inline-flex", alignItems:"center", gap:7,
    padding:"9px 16px", borderRadius:9, border:"1px solid rgba(180,60,60,0.3)",
    background:"rgba(180,60,60,0.08)", color:"#B43C3C",
    fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
  },
};