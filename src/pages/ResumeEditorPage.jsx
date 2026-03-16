/**
 * ResumeEditorPage.jsx
 * Route: /resumes/:resumeId/edit
 * Connected to: UserDashboardLayout
 *
 * This is the main editor shell. After a resume is created via ResumeStudio,
 * the user lands here to fill in all their content sections.
 *
 * Left panel: section tabs (collapsible)
 * Right panel: active section form
 * Top: resume meta bar (title, status, publish/submit actions)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Briefcase, GraduationCap, Code2, FolderOpen,
  Award, BookOpen, Mic2, Star, Wrench, BarChart3,
  ChevronRight, Globe, Lock, Send, Eye, ArrowLeft,
  Settings, Loader2, CheckCircle, Clock, AlertCircle,
  Palette, History, FileText,
} from "lucide-react";
import UserDashboardLayout from "../components/user/UserDashboardLayout";
import { resumeAPI, sectionAPI, subscriptionAPI } from "./users/editorAPI";

// Section components
import ProfileSection from "./users/sections/ProfileSection";

// ExperienceSection exports 3
import {
  ExperienceSection,
  EducationSection,
  SkillsSection
} from "./users/sections/ExperienceSection";

import {
  ProjectsSection,
  CertificationsSection,
  BlogsSection,
  TestimonialsSection,
  ServicesSection,
  ExhibitionsSection,
  MediaSection,
  PublicationsSection,
  FinancialSection
} from "./users/sections/AllSections";

import ThemeCustomizerPanel, {
  VersioningPanel,
  SectionManager
} from "./users/sections/ToolPanels";


/* ── Section registry ──────────────────────────────────────────── */
const SECTIONS = [
  { id: "profile",     icon: <User size={14}/>,        label: "Profile",          component: ProfileSection,       required: true  },
  { id: "experience",  icon: <Briefcase size={14}/>,    label: "Experience",       component: ExperienceSection                     },
  { id: "education",   icon: <GraduationCap size={14}/>,label: "Education",        component: EducationSection                      },
  { id: "skills",      icon: <Code2 size={14}/>,        label: "Skills",           component: SkillsSection                         },
  { id: "projects",    icon: <FolderOpen size={14}/>,   label: "Projects",         component: ProjectsSection                       },
  { id: "certifications",icon:<Award size={14}/>,       label: "Certifications",   component: CertificationsSection                 },
  { id: "blogs",       icon: <FileText size={14}/>,     label: "Blog Posts",       component: BlogsSection                          },
  { id: "testimonials",icon: <Star size={14}/>,         label: "Testimonials",     component: TestimonialsSection                   },
  { id: "services",    icon: <Wrench size={14}/>,       label: "Services",         component: ServicesSection                       },
  { id: "exhibitions", icon: <Award size={14}/>,        label: "Awards & Exhibitions", component: ExhibitionsSection                },
  { id: "media",       icon: <Mic2 size={14}/>,         label: "Media Appearances",component: MediaSection                         },
  { id: "publications",icon: <BookOpen size={14}/>,     label: "Publications",     component: PublicationsSection                   },
  { id: "financial",   icon: <BarChart3 size={14}/>,    label: "Financial Credentials", component: FinancialSection                 },
];

const TOOLS = [
  { id: "theme",    icon: <Palette size={14}/>,  label: "Theme",    component: ThemeCustomizerPanel, plan: "PRO"     },
  { id: "versions", icon: <History size={14}/>,  label: "Versions", component: VersioningPanel,      plan: "PRO"     },
  { id: "sections", icon: <Settings size={14}/>, label: "Sections", component: SectionManager,       plan: null      },
];

const APPROVAL_META = {
  DRAFT:    { label: "Draft",          color: "#8A8578", bg: "rgba(138,133,120,0.12)", icon: <FileText size={10}/> },
  PENDING:  { label: "Pending Review", color: "#C9963A", bg: "rgba(201,150,58,0.12)", icon: <Clock size={10}/> },
  APPROVED: { label: "Approved",       color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: <CheckCircle size={10}/> },
  REJECTED: { label: "Rejected",       color: "#B43C3C", bg: "rgba(180,60,60,0.12)", icon: <AlertCircle size={10}/> },
};

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

/* ═══════════════════════════════════════════════════════════════ */
export default function ResumeEditorPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume]       = useState(null);
  const [dbSections, setDbSections] = useState([]);
  const [activeSection, setActive]= useState("profile");
  const [loading, setLoading]     = useState(true);
  const [userPlan, setUserPlan]   = useState("FREE");
  const [userId, setUserId]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([
      resumeAPI.getById(resumeId),
      subscriptionAPI.getMyPlan(),
      sectionAPI.getAll(resumeId)
    ])
      .then(([r, plan, secs]) => {
        setResume(r);
        setUserPlan(typeof plan === "string" ? plan : "FREE");
        // Convert section response to array
        const fetchedSecs = Array.isArray(secs?.data || secs) ? (secs.data || secs) : [];
        setDbSections(fetchedSecs);
        
        // Auto-select the first section if "profile" isn't present
        if (fetchedSecs.length > 0) {
           const firstSecType = fetchedSecs[0].sectionName?.toLowerCase();
           // Profile is standard mapped or fallback to first
           const match = SECTIONS.find(s => s.id === firstSecType || (s.id === "profile" && firstSecType === "personal_info"));
           if (match) setActive(match.id);
        }

        const uid = localStorage.getItem("userId");
        setUserId(uid);
      })
      .catch(() => navigate("/resumes"))
      .finally(() => setLoading(false));
  }, [resumeId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await resumeAPI.submit(resumeId);
      setResume(updated);
      notify("Submitted for admin review!");
    } catch (e) {
      notify(e?.message || "Submit failed", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await resumeAPI.publish(resumeId);
      setResume(updated);
      notify("Portfolio is now public! 🎉");
    } catch (e) {
      notify(e?.message || "Publish failed", false);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      const updated = await resumeAPI.unpublish(resumeId);
      setResume(updated);
      notify("Portfolio set to private");
    } catch {
      notify("Failed", false);
    }
  };

  // find active component
  const allSections = [...SECTIONS, ...TOOLS];
  const activeDef = allSections.find((s) => s.id === activeSection);
  const ActiveComponent = activeDef?.component;

  const approval = APPROVAL_META[resume?.approvalStatus] || APPROVAL_META.DRAFT;
  const userOrd  = PLAN_ORD[userPlan] ?? 0;

  /* rightAction for topbar */
  const RightAction = resume ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Approval status badge */}
      <span style={{
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 600,
        color: approval.color, background: approval.bg,
        padding: "4px 10px", borderRadius: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {approval.icon} {approval.label}
      </span>

      {/* Submit for review */}
      {resume.approvalStatus === "DRAFT" && (
        <button onClick={handleSubmit} disabled={submitting} style={btnStyle("#F0EDE6","#1C1C1C")}>
          {submitting ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Send size={11}/>}
          Submit
        </button>
      )}

      {/* Publish / Unpublish */}
      {resume.approvalStatus === "APPROVED" && !resume.published && (
        <button onClick={handlePublish} disabled={publishing} style={btnStyle("#1C1C1C","#F0EDE6")}>
          {publishing ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Globe size={11}/>}
          Publish
        </button>
      )}
      {resume.published && (
        <button onClick={handleUnpublish} style={btnStyle("#fee2e2","#B43C3C")}>
          <Lock size={11}/> Unpublish
        </button>
      )}

      {/* View public */}
      {resume.published && resume.slug && (
        <button
          onClick={() => window.open(`/p/${resume.slug}`, "_blank")}
          style={btnStyle("#F0EDE6","#4A6FA5")}
        >
          <Eye size={11}/> View
        </button>
      )}
    </div>
  ) : null;

  if (loading) return (
    <UserDashboardLayout title="Editor" subtitle="Loading…">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:10 }}>
        <Loader2 size={22} style={{ animation:"spin 1s linear infinite", color:"#7B3FA0" }}/>
        <span style={{ fontSize:13, color:"#8A8578", fontFamily:"'DM Sans',sans-serif" }}>
          Loading your portfolio…
        </span>
      </div>
    </UserDashboardLayout>
  );

  return (
    <UserDashboardLayout
      title={resume?.title || "Portfolio Editor"}
      subtitle={resume?.professionType || ""}
      rightAction={RightAction}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .editor-sidebar::-webkit-scrollbar { width:4px; }
        .editor-sidebar::-webkit-scrollbar-thumb { background:#E5E3DE; border-radius:4px; }
        .editor-content::-webkit-scrollbar { width:5px; }
        .editor-content::-webkit-scrollbar-thumb { background:#E5E3DE; border-radius:4px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:99999,
          background: toast.ok ? "#1C1C1C" : "#B43C3C",
          color:"#F0EDE6", padding:"11px 18px", borderRadius:12,
          fontSize:13, fontWeight:600,
          boxShadow:"0 8px 28px rgba(0,0,0,0.2)",
          fontFamily:"'DM Sans',sans-serif",
          animation:"toastIn 0.25s both",
        }}>{toast.msg}</div>
      )}

      {/* Back + breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <button
          onClick={() => navigate("/resumes")}
          style={{
            display:"flex", alignItems:"center", gap:5,
            background:"transparent", border:"1px solid #E5E3DE",
            borderRadius:8, padding:"5px 11px",
            fontSize:12, color:"#8A8578", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",
          }}
        >
          <ArrowLeft size={12}/> My Portfolios
        </button>
        <span style={{ fontSize:12, color:"#D5D3CE" }}>/</span>
        <span style={{ fontSize:12, color:"#1C1C1C", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
          {resume?.title}
        </span>
      </div>

      {/* Editor layout */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <div className="editor-sidebar" style={{
          width:200, flexShrink:0,
          position:"sticky", top:80,
          maxHeight:"calc(100vh - 120px)",
          overflowY:"auto",
          display:"flex", flexDirection:"column", gap:3,
        }}>
          {/* Content sections (mapped to database sections) */}
          <div style={sideLabel}>Content</div>
          
          {/* ALWAYS show Profile first, as it's mandatory and separate from generic sections API */}
          <SideItem
            sec={SECTIONS.find(s => s.id === "profile")}
            active={activeSection === "profile"}
            onClick={() => setActive("profile")}
          />

          {SECTIONS.map((secDef) => {
            if (secDef.id === "profile") return null;

            // Try to find if this section has a custom title in DB sections
            // For this, we need to map frontend id back to backend enum, or scan dbSections
            const enumMapReverse = {
              "experience": "EXPERIENCE",
              "education": "EDUCATION",
              "projects": "PROJECTS",
              "skills": "SKILLS",
              "certifications": "CERTIFICATIONS",
              "financial": "FINANCIAL_CREDENTIALS",
              "publications": "PUBLICATIONS",
              "blogs": "BLOG_POSTS",
              "media": "MEDIA_APPEARANCES",
              "exhibitions": "EXHIBITIONS_AWARDS",
              "testimonials": "TESTIMONIALS",
              "services": "SERVICE_OFFERINGS",
              "contact": "CONTACT"
            };
            const expectedType = enumMapReverse[secDef.id];
            const dbSec = dbSections.find(d => d.sectionName === expectedType);
            const label = dbSec?.customTitle || secDef.label;

            return (
              <SideItem
                key={secDef.id}
                sec={{ ...secDef, label }}
                active={activeSection === secDef.id}
                onClick={() => setActive(secDef.id)}
              />
            );
          })}

          {/* Tools */}
          <div style={{ ...sideLabel, marginTop:12 }}>Tools</div>
          {TOOLS.map((tool) => {
            const locked = tool.plan && (PLAN_ORD[tool.plan] ?? 0) > userOrd;
            return (
              <SideItem
                key={tool.id}
                sec={tool}
                active={activeSection === tool.id}
                onClick={() => setActive(tool.id)}
                locked={locked}
                planRequired={tool.plan}
              />
            );
          })}
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <div className="editor-content" style={{
          flex:1, minWidth:0,
          maxHeight:"calc(100vh - 120px)",
          overflowY:"auto",
        }}>
          {ActiveComponent ? (
            <div style={{ animation:"fadeIn 0.25s both" }}>
              {/* Section header */}
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                marginBottom:20, paddingBottom:16,
                borderBottom:"2px solid #F0EDE6",
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background:"#1C1C1C",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#F0EDE6", flexShrink:0,
                }}>
                  {activeDef?.icon}
                </div>
                <div>
                  <div style={{
                    fontSize:17, fontWeight:700, color:"#1C1C1C",
                    fontFamily:"'DM Serif Display',serif",
                    letterSpacing:"-0.02em",
                  }}>
                    {activeDef?.label}
                  </div>
                  {activeDef?.plan && (
                    <span style={{
                      fontSize:9.5, fontWeight:700,
                      color:"#7B3FA0",
                      background:"rgba(123,63,160,0.1)",
                      padding:"2px 7px", borderRadius:20,
                      fontFamily:"'DM Sans',sans-serif",
                    }}>
                      {activeDef.plan}+ only
                    </span>
                  )}
                </div>
              </div>

              <ActiveComponent
                resumeId={resumeId}
                userId={userId}
                userPlan={userPlan}
                resume={resume}
                onResumeUpdate={setResume}
                onNotify={notify}
              />
            </div>
          ) : (
            <div style={{
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              height:300, color:"#8A8578",
              fontFamily:"'DM Sans',sans-serif", fontSize:13,
            }}>
              Select a section from the left to start editing
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}

/* ── Sidebar item ────────────────────────────────────────────── */
function SideItem({ sec, active, onClick, locked, planRequired }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"9px 11px", borderRadius:10, border:"none",
        background: active ? "#1C1C1C" : "transparent",
        color: active ? "#F0EDE6" : locked ? "#B0AB9E" : "#5A5550",
        cursor: "pointer",
        textAlign:"left",
        transition:"all 0.15s",
        fontFamily:"'DM Sans',sans-serif",
        width:"100%",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background="#F0EDE6"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background="transparent"; }}
    >
      <span style={{ flexShrink:0 }}>{sec.icon}</span>
      <span style={{ fontSize:12, fontWeight:active?700:500, flex:1, lineHeight:1.2 }}>
        {sec.label}
      </span>
      {locked && (
        <span style={{
          fontSize:8.5, fontWeight:700,
          color:"#7B3FA0",
          background:"rgba(123,63,160,0.12)",
          padding:"1px 5px", borderRadius:10,
          flexShrink:0,
        }}>
          {planRequired}
        </span>
      )}
      {active && <ChevronRight size={10} style={{ flexShrink:0 }}/>}
    </button>
  );
}

const sideLabel = {
  fontSize:9.5, fontWeight:700, color:"#B0AB9E",
  textTransform:"uppercase", letterSpacing:"0.08em",
  padding:"0 11px", marginBottom:2,
  fontFamily:"'DM Sans',sans-serif",
};

const btnStyle = (bg, color) => ({
  display:"flex", alignItems:"center", gap:5,
  background:bg, color,
  border:"none", borderRadius:8,
  padding:"7px 13px", fontSize:11.5,
  fontWeight:600, cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif",
  transition:"opacity 0.15s",
  whiteSpace:"nowrap",
});