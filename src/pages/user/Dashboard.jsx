import { useState } from "react";
import {
  FileText, Eye, Globe, Clock, CheckCircle, AlertCircle,
  Plus, ArrowRight, TrendingUp, Zap, MoreHorizontal,
  ExternalLink, Edit3, Trash2
} from "lucide-react";

/* ── mock data ── */
const mockData = {
  totalResumes: 2, publishedCount: 1, pendingCount: 1, totalViews: 847,
  plan: "PRO", resumeLimit: 2, publicLinkLimit: 1,
  recentResumes: [
    { id: "1", title: "Senior Frontend Engineer", professionType: "Software Engineering", approvalStatus: "APPROVED", published: true,  slug: "alex-morgan",   viewCount: 712, updatedAt: "2025-02-28" },
    { id: "2", title: "Creative Director Portfolio", professionType: "Design",            approvalStatus: "PENDING",  published: false, slug: null,          viewCount: 135, updatedAt: "2025-03-01" },
  ],
};

const STATUS = {
  DRAFT:    { label: "Draft",    color: "#8A8578", bg: "rgba(138,133,120,0.13)", Icon: Clock },
  PENDING:  { label: "Pending",  color: "#C9963A", bg: "rgba(201,150,58,0.13)",  Icon: AlertCircle },
  APPROVED: { label: "Approved", color: "#3A7D44", bg: "rgba(58,125,68,0.13)",   Icon: CheckCircle },
};

const PLAN = {
  FREE:    { color: "#8A8578", bg: "rgba(138,133,120,0.13)" },
  BASIC:   { color: "#1C6EA4", bg: "rgba(28,110,164,0.13)" },
  PRO:     { color: "#7B3FA0", bg: "rgba(123,63,160,0.13)" },
  PREMIUM: { color: "#C9963A", bg: "rgba(201,150,58,0.13)" },
};

export default function Dashboard() {
  const d = mockData;
  const planCfg = PLAN[d.plan] ?? PLAN.FREE;
  const canCreate = d.totalResumes < d.resumeLimit;

  return (
    <div style={css.page}>

      {/* ── topbar ── */}
      <div style={css.topbar}>
        <div>
          <h1 style={css.topTitle}>Dashboard</h1>
          <p style={css.topSub}>WELCOME BACK</p>
        </div>
        {canCreate && (
          <button style={css.btnPrimary} onClick={() => alert("→ /resumes/new")}>
            <Plus size={14}/> New Resume
          </button>
        )}
      </div>

      {/* ── stat row ── */}
      <div style={css.statGrid}>
        <StatCard icon={<FileText size={18}/>} label="Total Resumes"
          value={`${d.totalResumes} / ${d.resumeLimit}`} accent="#1C1C1C"
          sub={canCreate ? "Slot available" : "Limit reached"} />
        <StatCard icon={<Globe size={18}/>} label="Published"
          value={`${d.publishedCount} / ${d.publicLinkLimit}`} accent="#3A7D44"
          sub="Public portfolios" />
        <StatCard icon={<Clock size={18}/>} label="Pending Approval"
          value={d.pendingCount} accent="#C9963A"
          sub="Awaiting review" />
        <StatCard icon={<Eye size={18}/>} label="Total Views"
          value={d.totalViews.toLocaleString()} accent="#1C6EA4"
          sub="All time" trend="+12% this week" />
      </div>

      {/* ── plan banner ── */}
      {d.plan === "FREE" ? (
        <UpgradeBanner />
      ) : (
        <PlanBanner plan={d.plan} color={planCfg.color} bg={planCfg.bg} />
      )}

      {/* ── resumes ── */}
      <div style={{ marginBottom: 8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={css.sectionLabel}>Recent Resumes</p>
        <button style={css.textBtn} onClick={() => alert("→ /resumes")}>
          View all <ArrowRight size={12}/>
        </button>
      </div>

      {d.recentResumes.length === 0 ? (
        <EmptyState onCreate={() => alert("→ /resumes/new")} />
      ) : (
        <div style={css.resumeList}>
          {d.recentResumes.map(r => <ResumeRow key={r.id} resume={r} />)}
          {canCreate && (
            <button style={css.addRow} onClick={() => alert("→ /resumes/new")}>
              <Plus size={16} style={{color:"#8A8578"}}/> 
              <span style={{color:"#8A8578", fontSize:13}}>Add another resume</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}

/* ── StatCard ── */
function StatCard({ icon, label, value, accent, sub, trend }) {
  return (
    <div style={css.statCard}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
        <span style={{...css.iconBox, color:accent, background:`${accent}14`}}>{icon}</span>
        {trend && (
          <span style={{...css.trendBadge}}>
            <TrendingUp size={10}/> {trend}
          </span>
        )}
      </div>
      <p style={{margin:"0 0 2px", fontSize:11, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", fontWeight:500}}>{label}</p>
      <p style={{margin:"0 0 4px", fontSize:26, fontWeight:600, fontFamily:"'Cormorant Garamond',Georgia,serif", color:accent, lineHeight:1}}>{value}</p>
      {sub && <p style={{margin:0, fontSize:11, color:"#8A8578"}}>{sub}</p>}
    </div>
  );
}

/* ── ResumeRow ── */
function ResumeRow({ resume }) {
  const [menu, setMenu] = useState(false);
  const sm = STATUS[resume.approvalStatus] ?? STATUS.DRAFT;
  const Icon = sm.Icon;

  return (
    <div style={css.resumeRow}>
      {/* left */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:5, flexWrap:"wrap"}}>
          <p style={css.resumeTitle}>{resume.title}</p>
          <span style={{...css.statusPill, color:sm.color, background:sm.bg}}>
            <Icon size={10}/> {sm.label}
          </span>
          {resume.published && (
            <span style={{...css.statusPill, color:"#3A7D44", background:"rgba(58,125,68,0.10)"}}>
              <Globe size={10}/> Live
            </span>
          )}
        </div>
        <div style={{display:"flex", gap:16, fontSize:12, color:"#8A8578", flexWrap:"wrap"}}>
          <span>{resume.professionType}</span>
          <span style={{display:"flex", alignItems:"center", gap:4}}>
            <Eye size={11}/> {resume.viewCount.toLocaleString()} views
          </span>
          {resume.slug && (
            <span style={{display:"flex", alignItems:"center", gap:4, color:"#3A7D44"}}>
              <ExternalLink size={11}/> /{resume.slug}
            </span>
          )}
          <span>Updated {resume.updatedAt}</span>
        </div>
      </div>

      {/* actions */}
      <div style={{display:"flex", gap:8, alignItems:"center", flexShrink:0, position:"relative"}}>
        <button style={css.iconBtn} onClick={() => alert(`Edit resume ${resume.id}`)}>
          <Edit3 size={14}/>
        </button>
        <button style={css.iconBtn} onClick={() => setMenu(p => !p)}>
          <MoreHorizontal size={14}/>
        </button>
        {menu && (
          <div style={css.dropdown}>
            {resume.approvalStatus === "DRAFT" && (
              <button style={css.dropItem} onClick={() => { alert("Submit for approval"); setMenu(false); }}>
                Submit for Approval
              </button>
            )}
            {resume.approvalStatus === "APPROVED" && !resume.published && (
              <button style={css.dropItem} onClick={() => { alert("Publish"); setMenu(false); }}>
                Publish
              </button>
            )}
            {resume.published && (
              <button style={css.dropItem} onClick={() => { alert("Unpublish"); setMenu(false); }}>
                Unpublish
              </button>
            )}
            <button style={{...css.dropItem, color:"#B43C3C"}} onClick={() => { alert("Delete"); setMenu(false); }}>
              <Trash2 size={12}/> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanBanner({ plan, color, bg }) {
  return (
    <div style={{...css.planBanner, background:bg, border:`1px solid ${color}25`, marginBottom:28}}>
      <span style={{display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:600, color}}>
        <Zap size={14} fill={color}/> {plan} Plan Active
      </span>
      {plan !== "PREMIUM" && (
        <button style={{...css.textBtn, color}} onClick={() => alert("→ /settings")}>
          Upgrade for more <ArrowRight size={12}/>
        </button>
      )}
    </div>
  );
}

function UpgradeBanner() {
  return (
    <div style={css.upgradeBanner}>
      <div>
        <p style={{margin:"0 0 3px", fontSize:15, fontWeight:600, color:"#F0EDE6", fontFamily:"'Cormorant Garamond',serif"}}>
          Unlock your public portfolio
        </p>
        <p style={{margin:0, fontSize:12, color:"#8A8578"}}>Upgrade to Basic or higher to publish and share.</p>
      </div>
      <button style={{...css.btnPrimary, background:"#F0EDE6", color:"#1C1C1C"}} onClick={() => alert("→ /settings")}>
        Upgrade <ArrowRight size={13} style={{marginLeft:4, verticalAlign:"middle"}}/>
      </button>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div style={{textAlign:"center", padding:"60px 0", background:"#ECEAE2", borderRadius:16, border:"1px solid #D8D3CA"}}>
      <FileText size={40} style={{color:"#D8D3CA", marginBottom:14}}/>
      <p style={{margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif"}}>No resumes yet</p>
      <p style={{margin:"0 0 20px", fontSize:13, color:"#8A8578"}}>Create your first resume to get started</p>
      <button style={css.btnPrimary} onClick={onCreate}>
        <Plus size={14}/> Create Resume
      </button>
    </div>
  );
}

/* ── styles ── */
const css = {
  page:  { fontFamily:"'DM Sans',sans-serif", background:"#F0EDE6", minHeight:"100vh", padding:"32px 28px", maxWidth:900, margin:"0 auto", color:"#1C1C1C" },
  topbar:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 },
  topTitle:{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:500, margin:0, color:"#1C1C1C" },
  topSub:{ fontSize:11, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", margin:"4px 0 0" },
  statGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:14, marginBottom:24 },
  statCard:{ background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"22px 24px" },
  iconBox:{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:9, flexShrink:0 },
  trendBadge:{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"#3A7D44", background:"rgba(58,125,68,0.12)", padding:"3px 8px", borderRadius:20, fontWeight:500 },
  sectionLabel:{ margin:0, fontSize:11, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", fontWeight:500 },
  resumeList:{ display:"flex", flexDirection:"column", gap:2 },
  resumeRow:{ display:"flex", alignItems:"center", gap:16, background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:12, padding:"16px 20px" },
  resumeTitle:{ margin:0, fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#1C1C1C", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  statusPill:{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:500, padding:"3px 9px", borderRadius:20, flexShrink:0 },
  iconBtn:{ display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578" },
  dropdown:{ position:"absolute", top:38, right:0, background:"#1C1C1C", borderRadius:10, padding:6, zIndex:100, minWidth:160, boxShadow:"0 8px 24px rgba(0,0,0,.2)" },
  dropItem:{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px", background:"none", border:"none", color:"#F0EDE6", fontSize:13, cursor:"pointer", borderRadius:7, fontFamily:"'DM Sans',sans-serif", textAlign:"left" },
  addRow:{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:16, background:"transparent", border:"1.5px dashed #D8D3CA", borderRadius:12, cursor:"pointer", width:"100%" },
  btnPrimary:{ display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"9px 18px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  textBtn:{ display:"inline-flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#8A8578", fontFamily:"'DM Sans',sans-serif", fontWeight:500 },
  planBanner:{ display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:12, padding:"12px 18px", flexWrap:"wrap", gap:8 },
  upgradeBanner:{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, background:"linear-gradient(135deg,#1C1C1C 0%,#2e2e2e 100%)", borderRadius:14, padding:"20px 28px", marginBottom:28 },
};