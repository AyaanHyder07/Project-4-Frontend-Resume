import { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Globe, Eye, Clock, CheckCircle,
  AlertCircle, MoreHorizontal, ExternalLink, Send,
  EyeOff, ArrowRight, Loader2, FileText
} from "lucide-react";

/* ── mock data (replace with real axios calls) ── */
const MOCK_RESUMES = [
  { id:"r1", title:"Senior Frontend Engineer", professionType:"Software Engineering", approvalStatus:"APPROVED", published:true,  slug:"alex-morgan",   viewCount:712, updatedAt:"2025-02-28T10:00:00Z" },
  { id:"r2", title:"Creative Director Portfolio", professionType:"Design",            approvalStatus:"PENDING",  published:false, slug:null,            viewCount:135, updatedAt:"2025-03-01T08:00:00Z" },
  { id:"r3", title:"Freelance Dev Portfolio",     professionType:"Software Engineering", approvalStatus:"DRAFT", published:false, slug:null,            viewCount:0,   updatedAt:"2025-03-02T12:00:00Z" },
];
const MOCK_SUB = { plan:"PRO", resumeLimit:2, publicLinkLimit:1 };

const STATUS = {
  DRAFT:    { label:"Draft",    color:"#8A8578", bg:"rgba(138,133,120,0.13)", Icon:Clock },
  PENDING:  { label:"Review",   color:"#C9963A", bg:"rgba(201,150,58,0.13)",  Icon:AlertCircle },
  APPROVED: { label:"Approved", color:"#3A7D44", bg:"rgba(58,125,68,0.13)",   Icon:CheckCircle },
};

export default function ResumesPage() {
  const [resumes,  setResumes]  = useState([]);
  const [sub,      setSub]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const showToast = (msg, ok=true) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 3000);
  };

  /* replace with real calls:
     axios.get("/api/resumes", authCfg())
     axios.get("/api/subscription/me", authCfg()) */
  useEffect(() => {
    setTimeout(() => {
      setResumes(MOCK_RESUMES);
      setSub(MOCK_SUB);
      setLoading(false);
    }, 600);
  }, []);

  const doSubmit = (id) => {
    /* axios.put(`/api/resumes/${id}/submit`, {}, authCfg()) */
    setResumes(p => p.map(r => r.id===id ? {...r, approvalStatus:"PENDING"} : r));
    showToast("Submitted for review!");
  };

  const doUnpublish = (id) => {
    /* axios.put(`/api/resumes/${id}/unpublish`, {}, authCfg()) */
    setResumes(p => p.map(r => r.id===id ? {...r, published:false, slug:null} : r));
    showToast("Unpublished.");
  };

  const doDelete = (id) => {
    /* axios.delete(`/api/resumes/${id}`, authCfg()) */
    setResumes(p => p.filter(r => r.id !== id));
    setMenuOpen(null);
    showToast("Deleted.");
  };

  const plan        = sub?.plan ?? "FREE";
  const resumeLimit = sub?.resumeLimit ?? 1;
  const canCreate   = resumes.length < resumeLimit;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>My Resumes</h1>
          <p style={s.pageSub}>MANAGE YOUR PORTFOLIOS</p>
        </div>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <span style={{fontSize:12, color:"#8A8578"}}>{resumes.length} / {resumeLimit} used</span>
          <button
            style={{...s.btnPrimary, opacity:canCreate?1:0.45, cursor:canCreate?"pointer":"not-allowed"}}
            onClick={() => canCreate && alert("→ navigate('/resumes/new')")}
          >
            <Plus size={14}/> New Resume
          </button>
        </div>
      </div>

      {toast && (
        <div style={{
          ...s.toast,
          background: toast.ok ? "rgba(58,125,68,0.10)" : "rgba(180,60,60,0.10)",
          border:`1px solid ${toast.ok ? "rgba(58,125,68,0.22)":"rgba(180,60,60,0.22)"}`,
          color: toast.ok ? "#3A7D44" : "#B43C3C",
        }}>
          {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>} {toast.msg}
        </div>
      )}

      {!canCreate && (
        <div style={s.limitBanner}>
          <span style={{fontSize:13, color:"#C9963A"}}>
            Resume limit reached for <strong>{plan}</strong> plan.
          </span>
          <button style={s.linkBtn} onClick={() => alert("→ /settings")}>
            Upgrade <ArrowRight size={12}/>
          </button>
        </div>
      )}

      {loading ? <CenterLoader/> : (
        resumes.length === 0
          ? <EmptyState canCreate={canCreate} onCreate={() => alert("→ /resumes/new")}/>
          : (
            <div style={s.grid}>
              {resumes.map(r => (
                <ResumeCard
                  key={r.id} resume={r}
                  menuOpen={menuOpen===r.id}
                  onMenuToggle={() => setMenuOpen(p => p===r.id ? null : r.id)}
                  onEdit={() => { setMenuOpen(null); alert(`→ /resumes/${r.id}/edit`); }}
                  onSubmit={() => { setMenuOpen(null); doSubmit(r.id); }}
                  onUnpublish={() => { setMenuOpen(null); doUnpublish(r.id); }}
                  onDelete={() => doDelete(r.id)}
                  onView={() => alert(`→ /p/${r.slug}`)}
                />
              ))}
              {canCreate && (
                <button style={s.addCard} onClick={() => alert("→ /resumes/new")}>
                  <Plus size={22} style={{color:"#8A8578"}}/>
                  <span style={{color:"#8A8578", fontSize:13}}>New Resume</span>
                </button>
              )}
            </div>
          )
      )}
    </div>
  );
}

function ResumeCard({ resume, menuOpen, onMenuToggle, onEdit, onSubmit, onUnpublish, onDelete, onView }) {
  const sm = STATUS[resume.approvalStatus] ?? STATUS.DRAFT;
  const Icon = sm.Icon;
  return (
    <div style={s.card}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, gap:8}}>
        <p style={s.cardTitle}>{resume.title}</p>
        <div style={{display:"flex", flexWrap:"wrap", gap:5, justifyContent:"flex-end", flexShrink:0}}>
          <span style={{...s.pill, color:sm.color, background:sm.bg}}>
            <Icon size={10}/> {sm.label}
          </span>
          {resume.published && (
            <span style={{...s.pill, color:"#3A7D44", background:"rgba(58,125,68,0.10)"}}>
              <Globe size={10}/> Live
            </span>
          )}
        </div>
      </div>

      <p style={{margin:"0 0 16px", fontSize:12, color:"#8A8578"}}>{resume.professionType ?? "—"}</p>

      <div style={{display:"flex", gap:14, fontSize:12, color:"#8A8578", marginBottom:20, flexWrap:"wrap"}}>
        <span style={{display:"flex", alignItems:"center", gap:4}}>
          <Eye size={11}/> {(resume.viewCount??0).toLocaleString()}
        </span>
        {resume.slug && (
          <span style={{display:"flex", alignItems:"center", gap:4, color:"#3A7D44"}}>
            <ExternalLink size={11}/> /{resume.slug}
          </span>
        )}
        <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
      </div>

      <div style={{display:"flex", gap:8, position:"relative", alignItems:"center"}}>
        <button style={s.editBtn} onClick={onEdit}><Edit3 size={13}/> Edit</button>

        {resume.approvalStatus==="DRAFT" && (
          <button style={s.submitBtn} onClick={onSubmit}><Send size={12}/> Submit</button>
        )}

        {resume.published && resume.slug && (
          <button style={s.viewBtn} onClick={onView}><Globe size={12}/></button>
        )}

        <div style={{marginLeft:"auto", position:"relative"}}>
          <button style={s.moreBtn} onClick={onMenuToggle}>
            <MoreHorizontal size={14}/>
          </button>
          {menuOpen && (
            <div style={s.dropdown}>
              {resume.published && (
                <DropItem icon={<EyeOff size={12}/>} label="Unpublish" onClick={onUnpublish}/>
              )}
              <DropItem icon={<Trash2 size={12}/>} label="Delete" onClick={onDelete} danger/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DropItem = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} style={{
    display:"flex", alignItems:"center", gap:8, width:"100%",
    padding:"8px 12px", background:"none", border:"none",
    color:danger?"#EF9999":"#F0EDE6", fontSize:12,
    cursor:"pointer", borderRadius:7, fontFamily:"'DM Sans',sans-serif", textAlign:"left",
  }}>
    {icon} {label}
  </button>
);

const EmptyState = ({ canCreate, onCreate }) => (
  <div style={{textAlign:"center", padding:"70px 0", background:"#ECEAE2", borderRadius:16, border:"1px solid #D8D3CA"}}>
    <FileText size={42} style={{color:"#D8D3CA", marginBottom:16}}/>
    <p style={{margin:"0 0 6px", fontSize:18, fontFamily:"'Cormorant Garamond',serif"}}>No resumes yet</p>
    <p style={{margin:"0 0 22px", fontSize:13, color:"#8A8578"}}>Create your first resume to get started</p>
    {canCreate && (
      <button style={s.btnPrimary} onClick={onCreate}><Plus size={14}/> Create Resume</button>
    )}
  </div>
);

const CenterLoader = () => (
  <div style={{display:"flex", justifyContent:"center", padding:"80px 0"}}>
    <Loader2 size={28} style={{color:"#8A8578", animation:"spin 1s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const s = {
  page: { fontFamily:"'DM Sans',sans-serif", background:"#F0EDE6", minHeight:"100vh", padding:"32px 28px", color:"#1C1C1C", maxWidth:1000, margin:"0 auto" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 },
  pageTitle: { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:500, margin:0 },
  pageSub: { fontSize:11, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", margin:"4px 0 0" },
  toast: { display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:10, fontSize:13, marginBottom:18 },
  limitBanner: { display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(201,150,58,0.10)", border:"1px solid rgba(201,150,58,0.20)", borderRadius:10, padding:"12px 18px", marginBottom:20, flexWrap:"wrap", gap:8 },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16 },
  card: { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"22px 22px 18px" },
  cardTitle: { margin:0, fontSize:16, fontWeight:500, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#1C1C1C", lineHeight:1.3 },
  pill: { display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:500, padding:"3px 9px", borderRadius:20 },
  editBtn: { display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, background:"#1C1C1C", border:"none", color:"#F0EDE6", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  submitBtn: { display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, background:"rgba(58,125,68,0.12)", border:"1px solid rgba(58,125,68,0.25)", color:"#3A7D44", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  viewBtn: { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, background:"rgba(28,110,164,0.10)", border:"1px solid rgba(28,110,164,0.2)", color:"#1C6EA4", cursor:"pointer" },
  moreBtn: { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578" },
  dropdown: { position:"absolute", bottom:38, right:0, background:"#1C1C1C", borderRadius:10, padding:6, zIndex:100, minWidth:150, boxShadow:"0 8px 24px rgba(0,0,0,.25)" },
  addCard: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, background:"transparent", border:"1.5px dashed #D8D3CA", borderRadius:14, padding:28, cursor:"pointer", minHeight:160 },
  btnPrimary: { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  linkBtn: { display:"inline-flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#C9963A", fontFamily:"'DM Sans',sans-serif", fontWeight:600 },
};