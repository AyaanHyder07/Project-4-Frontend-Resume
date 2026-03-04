import { useState, useEffect } from "react";
import {
  ArrowRight, ArrowLeft, Check, FileText, Palette, Type,
  Loader2, Lock, Star, User, Briefcase, GraduationCap,
  Code, Award, ChevronRight, Globe, Eye
} from "lucide-react";

/* ── MOCK DATA — replace useEffect fetches with real axios calls ── */
const MOCK_TEMPLATES = [
  { id:"t1", name:"Minimal Classic",    layoutId:"l1", defaultThemeId:"th1", planLevel:"FREE",    description:"Clean single-column layout", featured:true,
    sections:["Profile","Experience","Education","Skills"] },
  { id:"t2", name:"Modern Split",       layoutId:"l2", defaultThemeId:"th2", planLevel:"BASIC",   description:"Two-column with sidebar",     featured:false,
    sections:["Profile","Experience","Skills","Projects"] },
  { id:"t3", name:"Creative Editorial", layoutId:"l3", defaultThemeId:"th3", planLevel:"PRO",     description:"Bold editorial for creatives",featured:true,
    sections:["Profile","Projects","Testimonials","Services"] },
  { id:"t4", name:"Executive Profile",  layoutId:"l4", defaultThemeId:"th4", planLevel:"PREMIUM", description:"Premium full-bleed header",    featured:false,
    sections:["Profile","Experience","Education","Publications","Financial"] },
];
const MOCK_THEMES = [
  { id:"th1", name:"Parchment",  primary:"#1C1C1C", bg:"#F0EDE6", accent:"#8A8578",  text:"#333" },
  { id:"th2", name:"Slate",      primary:"#1C3A5A", bg:"#EEF2F6", accent:"#4A7FA5",  text:"#1C3A5A" },
  { id:"th3", name:"Amber",      primary:"#2D2D2D", bg:"#FBF8F3", accent:"#C9963A",  text:"#2D2D2D" },
  { id:"th4", name:"Forest",     primary:"#1A3C2C", bg:"#F0F4F2", accent:"#3A7D44",  text:"#1A3C2C" },
  { id:"th5", name:"Midnight",   primary:"#E8E6E0", bg:"#1A1A2E", accent:"#7B5EAE",  text:"#E8E6E0" },
  { id:"th6", name:"Rose",       primary:"#2D1B1B", bg:"#FDF4F4", accent:"#C96A6A",  text:"#2D1B1B" },
];
const PROFESSIONS = [
  "Software Engineering","Product Management","UI/UX Design","Data Science",
  "Marketing","Finance","Healthcare","Legal","Education","Creative Arts","Other",
];
const USER_PLAN = "PRO";
const PLAN_RANK = { FREE:0, BASIC:1, PRO:2, PREMIUM:3 };
const PLAN_COLOR = { FREE:"#8A8578", BASIC:"#1C6EA4", PRO:"#7B3FA0", PREMIUM:"#C9963A" };
const allowed = (t) => PLAN_RANK[USER_PLAN] >= PLAN_RANK[t.planLevel];

const STEPS = [
  { id:1, label:"Details",  Icon:Type },
  { id:2, label:"Template", Icon:FileText },
  { id:3, label:"Theme",    Icon:Palette },
  { id:4, label:"Review",   Icon:Check },
];

const SECTION_ICONS = {
  Profile:<User size={10}/>, Experience:<Briefcase size={10}/>,
  Education:<GraduationCap size={10}/>, Skills:<Code size={10}/>,
  Projects:<Globe size={10}/>, Publications:<FileText size={10}/>,
  Testimonials:<Eye size={10}/>, Services:<Award size={10}/>,
  Financial:<Award size={10}/>, default:<ChevronRight size={10}/>,
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function ResumeCreatePage() {
  const [step,      setStep]    = useState(1);
  const [saving,    setSaving]  = useState(false);
  const [done,      setDone]    = useState(false);
  const [createdId, setCreated] = useState(null);

  const [form, setForm] = useState({
    title:"", professionType:"", templateId:"", themeOverrideId:"",
  });

  const set = (k, v) => setForm(p => ({...p, [k]:v}));

  const tpl   = MOCK_TEMPLATES.find(t => t.id === form.templateId);
  const thId  = form.themeOverrideId || tpl?.defaultThemeId;
  const theme = MOCK_THEMES.find(t => t.id === thId) ?? MOCK_THEMES[0];

  const canNext = () => {
    if (step===1) return form.title.trim().length >= 3 && !!form.professionType;
    if (step===2) return !!form.templateId;
    return true;
  };

  const handleCreate = () => {
    setSaving(true);
    /* real call:
       axios.post("/api/resumes", {
         title: form.title, professionType: form.professionType,
         templateId: form.templateId, themeOverrideId: form.themeOverrideId || null,
       }, authCfg()).then(r => { setCreated(r.data.id); setDone(true); })
    */
    setTimeout(() => { setCreated("new-resume-id"); setSaving(false); setDone(true); }, 1200);
  };

  if (done) return <SuccessScreen title={form.title} resumeId={createdId}/>;

  return (
    <div style={s.shell}>
      {/* ── LEFT: form panel ── */}
      <div style={s.formPanel}>
        <div style={s.formInner}>
          <div style={{marginBottom:24}}>
            <h1 style={s.pageTitle}>Create Resume</h1>
            <p style={s.pageSub}>BUILD YOUR PORTFOLIO</p>
          </div>

          <Stepper current={step}/>

          <div style={s.card}>
            {step===1 && <StepDetails form={form} set={set}/>}
            {step===2 && <StepTemplate form={form} set={set}/>}
            {step===3 && <StepTheme form={form} set={set} tpl={tpl}/>}
            {step===4 && <StepReview form={form} tpl={tpl} theme={theme}/>}
          </div>

          <div style={s.navRow}>
            <button style={s.btnSec}
              onClick={() => step>1 ? setStep(p=>p-1) : alert("← /resumes")}>
              <ArrowLeft size={13}/> {step>1 ? "Back" : "Cancel"}
            </button>
            {step<4 ? (
              <button
                style={{...s.btnPri, opacity:canNext()?1:0.4, cursor:canNext()?"pointer":"not-allowed"}}
                onClick={() => canNext() && setStep(p=>p+1)}>
                Continue <ArrowRight size={13}/>
              </button>
            ) : (
              <button style={s.btnPri} onClick={handleCreate} disabled={saving}>
                {saving
                  ? <><Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/> Creating…</>
                  : <><Check size={13}/> Create Resume</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <div style={s.previewPanel}>
        <p style={s.previewLabel}>LIVE PREVIEW</p>
        <LivePreview form={form} tpl={tpl} theme={theme}/>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
        .pill-btn:hover{background:#2a2a2a!important;color:#F0EDE6!important}
        .tpl-card:hover{border-color:#8A8578!important}
        .theme-card:hover{border-color:#8A8578!important}
      `}</style>
    </div>
  );
}

/* ── Stepper ── */
function Stepper({ current }) {
  return (
    <div style={{display:"flex", alignItems:"center", flexWrap:"wrap", gap:4, marginBottom:20}}>
      {STEPS.map((st, i) => {
        const done   = current > st.id;
        const active = current === st.id;
        return (
          <div key={st.id} style={{display:"flex", alignItems:"center"}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{
                width:28, height:28, borderRadius:"50%", display:"flex",
                alignItems:"center", justifyContent:"center", flexShrink:0,
                background: done||active ? "#1C1C1C" : "#D8D3CA",
                color: done||active ? "#F0EDE6" : "#8A8578", fontSize:12,
              }}>
                {done ? <Check size={12}/> : <st.Icon size={12}/>}
              </div>
              <span style={{fontSize:12, fontWeight:500, color:active?"#1C1C1C":done?"#1C1C1C":"#8A8578"}}>
                {st.label}
              </span>
            </div>
            {i<STEPS.length-1 && (
              <div style={{width:24, height:1, background:current>st.id?"#1C1C1C":"#D8D3CA", margin:"0 8px"}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Details ── */
function StepDetails({ form, set }) {
  return (
    <div>
      <p style={s.stepTitle}>Name your resume</p>
      <p style={s.stepDesc}>Give it a clear title — this is what visitors see first.</p>

      <label style={s.lbl}>Resume Title <span style={{color:"#B43C3C"}}>*</span></label>
      <input style={s.input} placeholder="e.g. Senior Frontend Engineer"
        value={form.title} onChange={e => set("title", e.target.value)} maxLength={80}/>
      <p style={{fontSize:11, color:"#8A8578", margin:"4px 0 20px", textAlign:"right"}}>{form.title.length}/80</p>

      <label style={s.lbl}>Profession <span style={{color:"#B43C3C"}}>*</span></label>
      <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
        {PROFESSIONS.map(p => (
          <button key={p} className="pill-btn"
            style={{
              padding:"6px 13px", borderRadius:20, border:"1px solid #D8D3CA",
              background: form.professionType===p ? "#1C1C1C" : "#F0EDE6",
              color: form.professionType===p ? "#F0EDE6" : "#8A8578",
              fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            }}
            onClick={() => set("professionType", p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: Template ── */
function StepTemplate({ form, set }) {
  return (
    <div>
      <p style={s.stepTitle}>Choose a template</p>
      <p style={s.stepDesc}>Templates define your resume structure. Locked ones need a plan upgrade.</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        {MOCK_TEMPLATES.map(t => {
          const ok  = allowed(t);
          const sel = form.templateId === t.id;
          const pc  = PLAN_COLOR[t.planLevel];
          return (
            <div key={t.id} className={ok?"tpl-card":""} style={{
              background: sel ? "#1C1C1C" : "#F0EDE6",
              border:`${sel?"2px":"1px"} solid ${sel?"#1C1C1C":"#D8D3CA"}`,
              borderRadius:12, padding:14, cursor:ok?"pointer":"default",
              opacity:ok?1:0.55, transition:"border .15s",
            }} onClick={() => ok && set("templateId", t.id)}>
              {/* mini mockup */}
              <div style={{height:70, borderRadius:7, background: sel?"#2a2a2a":"#E8E4DC", marginBottom:10, position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", gap:5, padding:"10px 12px"}}>
                {[65,45,55,35].map((w,i) => (
                  <div key={i} style={{height:i===0?8:5, width:`${w}%`, borderRadius:3, background: sel?"rgba(240,237,230,0.25)":"rgba(28,28,28,0.18)"}}/>
                ))}
                {!ok && (
                  <div style={{position:"absolute", inset:0, background:"rgba(28,28,28,0.4)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <Lock size={16} color="#F0EDE6"/>
                  </div>
                )}
                {sel && <div style={{position:"absolute", top:7, right:7, width:18, height:18, borderRadius:"50%", background:"#F0EDE6", display:"flex", alignItems:"center", justifyContent:"center"}}><Check size={11} color="#1C1C1C"/></div>}
                {t.featured && ok && !sel && <div style={{position:"absolute", top:7, right:7, background:"rgba(201,150,58,0.85)", borderRadius:20, padding:"1px 7px", fontSize:9, color:"#fff", fontWeight:600}}>FEATURED</div>}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3}}>
                <p style={{margin:0, fontSize:13, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:sel?"#F0EDE6":"#1C1C1C"}}>{t.name}</p>
                <span style={{fontSize:9, color:pc, background:`${pc}18`, padding:"2px 6px", borderRadius:20, fontWeight:600}}>{t.planLevel}</span>
              </div>
              <p style={{margin:0, fontSize:11, color:sel?"#8A8578":"#8A8578", lineHeight:1.4}}>{t.description}</p>
              {!ok && <p style={{margin:"6px 0 0", fontSize:10, color:pc, display:"flex", alignItems:"center", gap:3}}><Star size={9}/> Needs {t.planLevel}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3: Theme ── */
function StepTheme({ form, set, tpl }) {
  const activeId = form.themeOverrideId || tpl?.defaultThemeId;
  return (
    <div>
      <p style={s.stepTitle}>Pick a colour theme</p>
      <p style={s.stepDesc}>Override the template default or leave it as-is. Changeable any time.</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
        {MOCK_THEMES.map(th => {
          const active = activeId === th.id;
          return (
            <div key={th.id} className="theme-card" style={{
              background:"#F0EDE6", border:`${active?"2px":"1px"} solid ${active?"#1C1C1C":"#D8D3CA"}`,
              borderRadius:10, padding:12, cursor:"pointer", transition:"border .15s",
            }} onClick={() => set("themeOverrideId", th.id)}>
              <div style={{display:"flex", gap:4, marginBottom:8}}>
                {[th.bg, th.primary, th.accent].map((c,i) => (
                  <div key={i} style={{flex:1, height:22, borderRadius:5, background:c, border:"1px solid rgba(0,0,0,.08)"}}/>
                ))}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <p style={{margin:0, fontSize:12, fontWeight:500, color:"#1C1C1C"}}>{th.name}</p>
                {active && <Check size={12} color="#1C1C1C"/>}
              </div>
              {tpl?.defaultThemeId===th.id && <p style={{margin:"2px 0 0", fontSize:10, color:"#8A8578"}}>default</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 4: Review ── */
function StepReview({ form, tpl, theme }) {
  const rows = [
    { label:"Title",      value:form.title },
    { label:"Profession", value:form.professionType },
    { label:"Template",   value:tpl?.name ?? "—" },
    { label:"Theme",      value:theme?.name ?? "—" },
  ];
  return (
    <div>
      <p style={s.stepTitle}>Review & create</p>
      <p style={s.stepDesc}>Looks good? Hit create — then fill in your experience, education, and more.</p>
      <div style={{background:"#F0EDE6", borderRadius:12, border:"1px solid #D8D3CA", overflow:"hidden", marginBottom:18}}>
        {rows.map((r,i) => (
          <div key={r.label} style={{
            display:"flex", justifyContent:"space-between", padding:"13px 18px",
            borderBottom:i<rows.length-1?"1px solid #D8D3CA":"none",
          }}>
            <span style={{fontSize:12, color:"#8A8578", fontWeight:500}}>{r.label}</span>
            <span style={{fontSize:14, fontWeight:500, color:"#1C1C1C", fontFamily:r.label==="Title"?"'Cormorant Garamond',serif":undefined}}>{r.value}</span>
          </div>
        ))}
      </div>
      {tpl && (
        <div style={{marginBottom:14, padding:"12px 14px", background:"rgba(58,125,68,0.07)", border:"1px solid rgba(58,125,68,0.18)", borderRadius:10}}>
          <p style={{margin:0, fontSize:12, color:"#3A7D44", display:"flex", alignItems:"center", gap:6}}>
            <ChevronRight size={12}/>
            Sections included: {tpl.sections.join(" · ")}
          </p>
        </div>
      )}
      <p style={{margin:0, fontSize:12, color:"#8A8578"}}>After creation you'll be taken directly to the editor to fill in your details.</p>
    </div>
  );
}

/* ── Live Preview ── */
function LivePreview({ form, tpl, theme }) {
  const t  = theme ?? MOCK_THEMES[0];
  const hasTitle = form.title.trim().length > 0;
  const hasProf  = !!form.professionType;
  const hasTpl   = !!tpl;

  return (
    <div style={{...s.previewCard, background: t.bg}}>
      {/* header strip */}
      <div style={{
        background:t.primary, padding:"20px 22px 18px",
        borderBottom:`3px solid ${t.accent}`,
      }}>
        <p style={{
          margin:"0 0 4px", fontSize:18,
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontWeight:600, color: t.name==="Midnight" ? "#E8E6E0" : t.bg,
          minHeight:26, lineHeight:1.2,
          opacity: hasTitle ? 1 : 0.3,
        }}>
          {hasTitle ? form.title : "Your Name / Title"}
        </p>
        <p style={{
          margin:0, fontSize:11, letterSpacing:".6px", textTransform:"uppercase",
          color: t.accent, opacity: hasProf ? 1 : 0.4,
        }}>
          {hasProf ? form.professionType : "Profession Type"}
        </p>
      </div>

      {/* body */}
      <div style={{padding:"16px 22px"}}>
        {hasTpl ? (
          <>
            <p style={{margin:"0 0 10px", fontSize:9, color:t.accent, letterSpacing:".5px", textTransform:"uppercase", fontWeight:600, borderBottom:`1px solid ${t.accent}30`, paddingBottom:5}}>
              SECTIONS INCLUDED
            </p>
            <div style={{display:"flex", flexDirection:"column", gap:7}}>
              {tpl.sections.map(sec => (
                <div key={sec} style={{display:"flex", alignItems:"center", gap:6}}>
                  <span style={{color:t.accent}}>{SECTION_ICONS[sec]??SECTION_ICONS.default}</span>
                  <p style={{margin:0, fontSize:11, color:t.text, opacity:.7}}>{sec}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:7}}>
            {[80,55,70,45,60].map((w,i) => (
              <div key={i} style={{height:7, borderRadius:3, background:t.primary, opacity:.1, width:`${w}%`}}/>
            ))}
            <p style={{margin:"8px 0 0", fontSize:10, color:"#8A8578", textAlign:"center"}}>Select a template to see sections</p>
          </div>
        )}
      </div>

      {/* footer accent */}
      <div style={{height:4, background:`linear-gradient(90deg,${t.accent},${t.primary})`}}/>
    </div>
  );
}

/* ── Success ── */
function SuccessScreen({ title, resumeId }) {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif", background:"#F0EDE6", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:28}}>
      <div style={{textAlign:"center", maxWidth:400}}>
        <div style={{width:64, height:64, borderRadius:"50%", background:"rgba(58,125,68,0.1)", border:"2px solid #3A7D44", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px"}}>
          <Check size={28} color="#3A7D44"/>
        </div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:28, margin:"0 0 8px", color:"#1C1C1C"}}>Resume Created!</h2>
        <p style={{fontSize:14, color:"#8A8578", margin:"0 0 28px", lineHeight:1.6}}>
          <strong style={{color:"#1C1C1C"}}>{title}</strong> has been created as a draft.<br/>
          Now let's fill in your details.
        </p>
        <button style={s.btnPri} onClick={() => alert(`→ /resumes/${resumeId}/edit`)}>
          Start Editing <ArrowRight size={14}/>
        </button>
      </div>
    </div>
  );
}

/* ── styles ── */
const s = {
  shell: { display:"flex", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  formPanel: { flex:"0 0 520px", background:"#F0EDE6", overflowY:"auto", borderRight:"1px solid #D8D3CA" },
  formInner: { padding:"36px 36px 40px", maxWidth:520 },
  previewPanel: { flex:1, background:"#ECEAE2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:14, position:"sticky", top:0, height:"100vh", overflowY:"auto" },
  previewLabel: { fontSize:10, letterSpacing:"1px", color:"#8A8578", fontWeight:600, textTransform:"uppercase", margin:0 },
  previewCard: { width:"100%", maxWidth:340, borderRadius:12, overflow:"hidden", boxShadow:"0 12px 40px rgba(28,28,28,0.12)", border:"1px solid rgba(28,28,28,0.06)" },
  pageTitle: { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:26, fontWeight:500, margin:0, color:"#1C1C1C" },
  pageSub: { fontSize:11, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", margin:"4px 0 0" },
  card: { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"26px 28px", marginBottom:18 },
  navRow: { display:"flex", justifyContent:"space-between" },
  stepTitle: { margin:"0 0 5px", fontSize:19, fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:500 },
  stepDesc: { margin:"0 0 20px", fontSize:12, color:"#8A8578", lineHeight:1.5 },
  lbl: { display:"block", fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".5px", textTransform:"uppercase", marginBottom:8 },
  input: { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", outline:"none", boxSizing:"border-box" },
  btnPri: { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 20px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec: { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 20px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};