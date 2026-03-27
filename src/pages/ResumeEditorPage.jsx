import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Briefcase, GraduationCap, Code2, FolderOpen,
  Award, BookOpen, Mic2, Star, Wrench, BarChart3,
  ChevronRight, Globe, Lock, Send, Eye, ArrowLeft,
  Settings, Loader2, CheckCircle, Clock, AlertCircle,
  Palette, History, FileText, Sparkles, ExternalLink, RefreshCw
} from "lucide-react";
import UserDashboardLayout from "../components/user/UserDashboardLayout";
import { layoutAPI, themeAPI as catalogThemeAPI } from "../api/api";
import TemplateRenderer from "../templates/TemplateRenderer";
import {
  resumeAPI, sectionAPI, subscriptionAPI, profileAPI,
  experienceAPI, educationAPI, skillAPI, projectAPI,
  certificationAPI, blogAPI, testimonialAPI, serviceAPI,
  exhibitionAPI, mediaAPI, publicationAPI, financialAPI,
  themeCustomAPI,
  blockAPI
} from "./users/editorAPI";

import ProfileSection from "./users/sections/ProfileSection";
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
import CustomBlocksPanel from "./users/sections/CustomBlocksPanel";
import TemplateSwitcherPanel from "./users/sections/TemplateSwitcherPanel";
import SlugSettingsPanel from "./users/sections/SlugSettingsPanel";

const SECTIONS = [
  { id: "profile", icon: <User size={14}/>, label: "Profile", component: ProfileSection, required: true },
  { id: "experience", icon: <Briefcase size={14}/>, label: "Experience", component: ExperienceSection },
  { id: "education", icon: <GraduationCap size={14}/>, label: "Education", component: EducationSection },
  { id: "skills", icon: <Code2 size={14}/>, label: "Skills", component: SkillsSection },
  { id: "projects", icon: <FolderOpen size={14}/>, label: "Projects", component: ProjectsSection },
  { id: "certifications", icon: <Award size={14}/>, label: "Certifications", component: CertificationsSection },
  { id: "blogs", icon: <FileText size={14}/>, label: "Blog Posts", component: BlogsSection },
  { id: "testimonials", icon: <Star size={14}/>, label: "Testimonials", component: TestimonialsSection },
  { id: "services", icon: <Wrench size={14}/>, label: "Services", component: ServicesSection },
  { id: "exhibitions", icon: <Award size={14}/>, label: "Awards & Exhibitions", component: ExhibitionsSection },
  { id: "media", icon: <Mic2 size={14}/>, label: "Media Appearances", component: MediaSection },
  { id: "publications", icon: <BookOpen size={14}/>, label: "Publications", component: PublicationsSection },
  { id: "financial", icon: <BarChart3 size={14}/>, label: "Financial Credentials", component: FinancialSection },
];

const TOOLS = [
  { id: "template", icon: <Sparkles size={14}/>, label: "Change Template", component: TemplateSwitcherPanel, plan: "PRO" },
  { id: "slug", icon: <Globe size={14}/>, label: "Public URL", component: SlugSettingsPanel, plan: "PRO" },
  { id: "theme", icon: <Palette size={14}/>, label: "Theme", component: ThemeCustomizerPanel, plan: "PREMIUM" },
  { id: "versions", icon: <History size={14}/>, label: "Versions", component: VersioningPanel, plan: "PRO" },
  { id: "sections", icon: <Settings size={14}/>, label: "Sections", component: SectionManager, plan: null },
  { id: "blocks", icon: <Sparkles size={14}/>, label: "Custom Blocks", component: CustomBlocksPanel, plan: null },
];

const APPROVAL_META = {
  DRAFT: { label: "Draft", color: "#8A8578", bg: "rgba(138,133,120,0.12)", icon: <FileText size={10}/> },
  PENDING: { label: "Pending Review", color: "#C9963A", bg: "rgba(201,150,58,0.12)", icon: <Clock size={10}/> },
  APPROVED: { label: "Approved", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: <CheckCircle size={10}/> },
  REJECTED: { label: "Rejected", color: "#B43C3C", bg: "rgba(180,60,60,0.12)", icon: <AlertCircle size={10}/> },
};

const PLAN_ORD = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

const SECTION_SOURCES = [
  { config: "EXPERIENCE", preview: "EXPERIENCE", load: experienceAPI.getAll },
  { config: "EDUCATION", preview: "EDUCATION", load: educationAPI.getAll },
  { config: "SKILLS", preview: "SKILLS", load: skillAPI.getAll },
  { config: "PROJECTS", preview: "PROJECTS", load: projectAPI.getAll },
  { config: "CERTIFICATIONS", preview: "CERTIFICATIONS", load: certificationAPI.getAll },
  { config: "PUBLICATIONS", preview: "PUBLICATIONS", load: publicationAPI.getAll },
  { config: "TESTIMONIALS", preview: "TESTIMONIALS", load: testimonialAPI.getAll },
  { config: "SERVICE_OFFERINGS", preview: "SERVICE_OFFERINGS", load: serviceAPI.getAll },
  { config: "EXHIBITIONS_AWARDS", preview: "EXHIBITIONS_AWARDS", load: exhibitionAPI.getAll },
  { config: "BLOG_POSTS", preview: "BLOG_POSTS", load: blogAPI.getAll },
  { config: "MEDIA_APPEARANCES", preview: "MEDIA_APPEARANCES", load: mediaAPI.getAll },
  { config: "FINANCIAL_CREDENTIALS", preview: "FINANCIAL_CREDENTIALS", load: financialAPI.getAll },
];

const enumMapReverse = {
  experience: "EXPERIENCE",
  education: "EDUCATION",
  projects: "PROJECTS",
  skills: "SKILLS",
  certifications: "CERTIFICATIONS",
  financial: "FINANCIAL_CREDENTIALS",
  publications: "PUBLICATIONS",
  blogs: "BLOG_POSTS",
  media: "MEDIA_APPEARANCES",
  exhibitions: "EXHIBITIONS_AWARDS",
  testimonials: "TESTIMONIALS",
  services: "SERVICE_OFFERINGS",
  contact: "CONTACT",
};

function normalizeAxios(res) {
  return res?.data ?? res;
}

const PREVIEW_SECTION_KEY_MAP = {
  EXPERIENCE: "experience",
  EDUCATION: "education",
  SKILLS: "skills",
  PROJECTS: "projects",
  CERTIFICATIONS: "certifications",
  PUBLICATIONS: "publications",
  TESTIMONIALS: "testimonials",
  SERVICE_OFFERINGS: "services",
  BLOG_POSTS: "blogPosts",
  EXHIBITIONS_AWARDS: "exhibitions",
  MEDIA_APPEARANCES: "mediaAppearances",
  FINANCIAL_CREDENTIALS: "financialCredentials",
  CONTACT: "contact",
};

function normalizePreviewSections(rawSections = {}, profile = {}, resumeId = null) {
  const next = {};
  Object.entries(rawSections || {}).forEach(([key, value]) => {
    const mappedKey = PREVIEW_SECTION_KEY_MAP[String(key || "").toUpperCase()] || key;
    next[mappedKey] = value;
  });
  if (!next.contact) {
    next.contact = {
      email: profile?.email || "",
      phone: profile?.phone || "",
      whatsapp: profile?.whatsapp || "",
      showContactForm: true,
      resumeId,
    };
  }
  return next;
}

function resolvePreviewTheme(theme, resume) {
  if (resume?.resolvedTheme) {
    return {
      primaryColor: resume.resolvedTheme.primaryColor,
      accentColor: resume.resolvedTheme.accentColor,
      backgroundColor: resume.resolvedTheme.backgroundColor,
      textColor: resume.resolvedTheme.textColor,
      fontFamily: resume.resolvedTheme.fontFamily,
      motionLevel: resume.resolvedTheme.motionLevel,
      borderRadius: resume.resolvedTheme.borderRadius,
    };
  }
  return {
    primaryColor: theme?.primaryColor || theme?.colorPalette?.primary || "#111111",
    accentColor: theme?.accentColor || theme?.colorPalette?.accent || "#22c55e",
    backgroundColor: theme?.backgroundColor || theme?.colorPalette?.pageBackground || "#ffffff",
    textColor: theme?.textColor || theme?.colorPalette?.textPrimary || "#111111",
    fontFamily: theme?.fontFamily || theme?.typography?.bodyFont || theme?.typography?.headingFont || "Inter",
    motionLevel: theme?.motionLevel || resume?.resolvedTheme?.motionLevel || "subtle",
  };
}

function LivePublicPreview({ resume, resumeId, userId, refreshKey, previewDraft }) {
  const [state, setState] = useState({
    loading: true,
    profile: null,
    layout: null,
    theme: null,
    sections: {},
    customBlocks: [],
    sectionTitles: {},
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const settled = await Promise.allSettled([
          profileAPI.get(resumeId).catch(() => null),
          sectionAPI.getAll(resumeId).catch(() => []),
          blockAPI.getAll(resumeId).catch(() => []),
          resume?.layoutId
            ? Promise.resolve(layoutAPI.getById(resume.layoutId)).then(normalizeAxios).catch(() => null)
            : Promise.resolve(null),
          resume?.themeId && userId
            ? themeCustomAPI
                .resolve(userId, resumeId, resume.themeId)
                .catch(() =>
                  Promise.resolve(catalogThemeAPI.getById(resume.themeId)).then(normalizeAxios).catch(() => null)
                )
            : resume?.themeId
              ? Promise.resolve(catalogThemeAPI.getById(resume.themeId)).then(normalizeAxios).catch(() => null)
              : Promise.resolve(null),
          ...SECTION_SOURCES.map((source) => source.load(resumeId).catch(() => [])),
        ]);

        if (!active) return;

        const profile = settled[0].status === "fulfilled" ? settled[0].value : null;
        const configs = settled[1].status === "fulfilled" ? settled[1].value || [] : [];
        const blockItems = settled[2].status === "fulfilled" && Array.isArray(settled[2].value) ? settled[2].value : [];
        const layout = settled[3].status === "fulfilled" ? settled[3].value : null;
        const theme = settled[4].status === "fulfilled" ? settled[4].value : null;
        const configMap = new Map((Array.isArray(configs) ? configs : []).map((cfg) => [cfg.sectionName, cfg]));
        const sections = {};
        const sectionTitles = {};

        SECTION_SOURCES.forEach((source, index) => {
          const config = configMap.get(source.config);
          if (config?.enabled === false) return;
          const itemsResult = settled[index + 5];
          const items = itemsResult?.status === "fulfilled" && Array.isArray(itemsResult.value)
            ? itemsResult.value
            : [];
          if (!items.length) return;
          sections[source.preview] = items;
          if (config?.customTitle) sectionTitles[source.preview] = config.customTitle;
        });

        const contactConfig = configMap.get("CONTACT");
        if (contactConfig?.enabled !== false) {
          sections.CONTACT = { resumeId };
          if (contactConfig?.customTitle) sectionTitles.CONTACT = contactConfig.customTitle;
        }

        setState({
          loading: false,
          profile,
          layout,
          theme,
          sections,
          customBlocks: blockItems.filter((item) => item?.enabled !== false),
          sectionTitles,
          error: null,
          lastUpdated: new Date(),
        });
      } catch {
        if (!active) return;
        setState((prev) => ({ ...prev, loading: false, error: "Preview could not be loaded." }));
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [resumeId, resume?.layoutId, resume?.themeId, userId, refreshKey]);

  const mergedProfile = useMemo(() => ({
    ...(state.profile || {}),
    ...((previewDraft && previewDraft.profile) || {}),
  }), [state.profile, previewDraft]);

  const mergedSections = useMemo(() => ({
    ...(state.sections || {}),
    ...((previewDraft && previewDraft.sections) || {}),
  }), [state.sections, previewDraft]);

  const previewPortfolio = useMemo(() => {
  const normalizedSections = normalizePreviewSections(mergedSections, mergedProfile, resumeId);
  return {
    resumeId,
    slug: resume?.slug,
    title: resume?.title,
    templateKey: resume?.templateKey || resume?.renderFamily || "CLASSICPRO",
    renderFamily: resume?.templateKey || resume?.renderFamily || "CLASSICPRO",
    themeData: resolvePreviewTheme(state.theme, resume),
    profile: mergedProfile,
    sections: normalizedSections,
    sectionOrder: Object.keys(normalizedSections),
    openToWork: String(mergedProfile?.availabilityStatus || "").includes("OPEN") || Boolean(mergedProfile?.isOpenToWork),
  };
}, [resumeId, resume, state.theme, mergedProfile, mergedSections]);

  const stamp = state.lastUpdated
    ? state.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{ position: "sticky", top: 84 }}>
      <div style={{
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(31,29,26,0.08)",
        boxShadow: "0 28px 60px rgba(31,29,26,0.14)",
        background: "#fffdfa",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, padding: "14px 18px",
          borderBottom: "1px solid rgba(31,29,26,0.08)",
          background: "linear-gradient(180deg, #fffdf8 0%, #f6f1e7 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
                <span key={color} style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              ))}
            </div>
            <div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 12, fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#7b6f5c",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <Eye size={14}/> Live Public Preview
              </div>
              <div style={{ marginTop: 2, fontSize: 11, color: "#958772", fontFamily: "'DM Sans', sans-serif" }}>
                Live layout, live theme, and your in-progress content
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, color: "#6f9b5b", fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <RefreshCw size={12}/>
            {state.loading ? "Syncing..." : previewDraft?.dirty ? "Editing live" : stamp ? `Updated ${stamp}` : "Ready"}
          </div>
        </div>

        <div style={{ height: "calc(100vh - 220px)", minHeight: 560, overflow: "auto", background: "#f5efe4" }}>
          {state.error ? (
            <div style={{
              display: "grid", placeItems: "center", minHeight: "100%",
              padding: 32, color: "#8c4b4b", fontFamily: "'DM Sans', sans-serif",
            }}>
              {state.error}
            </div>
          ) : (
            <TemplateRenderer portfolio={previewPortfolio} />
          )}
        </div>
      </div>

      {resume?.slug && (
        <a
          href={`/p/${resume.slug}`}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 12,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "11px 14px",
            borderRadius: 14, background: "#fff",
            border: "1px solid rgba(31,29,26,0.08)", color: "#4a6fa5",
            textDecoration: "none", fontSize: 12, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif", boxShadow: "0 12px 30px rgba(31,29,26,0.08)",
          }}
        >
          Open Public Page
          <ExternalLink size={13}/>
        </a>
      )}
    </div>
  );
}

export default function ResumeEditorPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [dbSections, setDbSections] = useState([]);
  const [activeSection, setActive] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("FREE");
  const [userId, setUserId] = useState(null);
  const [toast, setToast] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [previewDraft, setPreviewDraft] = useState({ dirty: false, profile: null, sections: {} });

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setPreviewRefreshKey((prev) => prev + 1);
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
        const fetchedSecs = Array.isArray(secs?.data || secs) ? (secs.data || secs) : [];
        setDbSections(fetchedSecs);
        if (fetchedSecs.length > 0) {
          const firstSecType = fetchedSecs[0].sectionName?.toLowerCase();
          const match = SECTIONS.find((s) => s.id === firstSecType || (s.id === "profile" && firstSecType === "personal_info"));
          if (match) setActive(match.id);
        }
        setUserId(localStorage.getItem("userId"));
      })
      .catch(() => navigate("/resumes"))
      .finally(() => setLoading(false));
  }, [resumeId, navigate]);

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
      notify("Portfolio is now public!");
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

  const allSections = [...SECTIONS, ...TOOLS];
  const activeDef = allSections.find((s) => s.id === activeSection);
  const ActiveComponent = activeDef?.component;

  const approval = APPROVAL_META[resume?.approvalStatus] || APPROVAL_META.DRAFT;
  const userOrd = PLAN_ORD[userPlan] ?? 0;

  const RightAction = resume ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 600, color: approval.color, background: approval.bg,
        padding: "4px 10px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif",
      }}>
        {approval.icon} {approval.label}
      </span>

      {resume.approvalStatus === "DRAFT" && (
        <button onClick={handleSubmit} disabled={submitting} style={btnStyle("#F0EDE6","#1C1C1C")}>
          {submitting ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }}/> : <Send size={11}/>}
          Submit
        </button>
      )}

      {resume.approvalStatus === "APPROVED" && !resume.published && (
        <button onClick={handlePublish} disabled={publishing} style={btnStyle("#1C1C1C","#F0EDE6")}>
          {publishing ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }}/> : <Globe size={11}/>}
          Publish
        </button>
      )}

      {resume.published && (
        <button onClick={handleUnpublish} style={btnStyle("#fee2e2","#B43C3C")}>
          <Lock size={11}/> Unpublish
        </button>
      )}

      {resume.slug && (
        <button
          onClick={() => window.open(`/p/${resume.slug}`, "_blank")}
          style={btnStyle("#F0EDE6","#4A6FA5")}
        >
          <Eye size={11}/> View
        </button>
      )}
    </div>
  ) : null;

  if (loading) {
    return (
      <UserDashboardLayout title="Editor" subtitle="Loading..." rightAction={RightAction}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 10 }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite", color: "#7B3FA0" }}/>
          <span style={{ fontSize: 13, color: "#8A8578", fontFamily: "'DM Sans',sans-serif" }}>
            Loading your portfolio...
          </span>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout
      title={resume?.title || "Portfolio Editor"}
      subtitle={resume?.professionType || ""}
      rightAction={RightAction}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .editor-sidebar::-webkit-scrollbar, .editor-canvas::-webkit-scrollbar, .preview-scroll::-webkit-scrollbar { width: 6px; }
        .editor-sidebar::-webkit-scrollbar-thumb, .editor-canvas::-webkit-scrollbar-thumb, .preview-scroll::-webkit-scrollbar-thumb { background: #ddd3c3; border-radius: 999px; }
        @media (max-width: 1200px) {
          .editor-workspace { grid-template-columns: 210px 1fr; }
          .editor-preview-column { grid-column: 1 / -1; }
        }
        @media (max-width: 860px) {
          .editor-workspace { grid-template-columns: 1fr; }
          .editor-sidebar { position: static !important; max-height: none !important; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99999,
          background: toast.ok ? "#1C1C1C" : "#B43C3C", color: "#F0EDE6",
          padding: "11px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)", fontFamily: "'DM Sans',sans-serif",
          animation: "toastIn 0.25s both",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{
        position: "relative",
        marginBottom: 20,
        padding: "22px 24px",
        borderRadius: 28,
        background: "linear-gradient(135deg, rgba(255,249,240,0.98) 0%, rgba(245,236,221,0.98) 52%, rgba(242,245,255,0.92) 100%)",
        border: "1px solid rgba(31,29,26,0.06)",
        boxShadow: "0 24px 70px rgba(31,29,26,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: "auto -120px -160px auto", width: 320, height: 320,
          background: "radial-gradient(circle, rgba(74,111,165,0.18) 0%, rgba(74,111,165,0) 70%)",
        }}/>
        <div style={{
          position: "absolute", inset: "-120px auto auto -140px", width: 280, height: 280,
          background: "radial-gradient(circle, rgba(159,133,87,0.16) 0%, rgba(159,133,87,0) 70%)",
        }}/>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative" }}>
          <button
            onClick={() => navigate("/resumes")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.7)", border: "1px solid rgba(31,29,26,0.08)",
              borderRadius: 999, padding: "8px 14px", fontSize: 12, color: "#8A8578",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 8px 20px rgba(31,29,26,0.05)",
            }}
          >
            <ArrowLeft size={12}/> My Portfolios
          </button>
          <span style={{ fontSize: 12, color: "#C6B9A6" }}>/</span>
          <span style={{ fontSize: 12, color: "#1C1C1C", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            {resume?.title}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 18, flexWrap: "wrap", position: "relative" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.68)", border: "1px solid rgba(31,29,26,0.06)",
              color: "#8A8578", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif",
            }}>
              <Sparkles size={12}/> Creative Editing Studio
            </div>
            <h1 style={{
              margin: "14px 0 8px",
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(2rem, 3vw, 3rem)",
              lineHeight: 1,
              color: "#1C1C1C",
              letterSpacing: "-0.03em",
            }}>
              Build the public page while seeing the real result live.
            </h1>
            <p style={{
              margin: 0, maxWidth: 640,
              color: "#736755", fontSize: 14, lineHeight: 1.7,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              Edit your content on the left, and review the actual public portfolio rendering on the right.
              This workspace is designed to feel like one professional studio, not two dashboards fighting each other.
            </p>
          </div>

          <div style={{
            minWidth: 220, padding: "16px 18px", borderRadius: 20,
            background: "rgba(255,255,255,0.72)", border: "1px solid rgba(31,29,26,0.06)",
            boxShadow: "0 14px 30px rgba(31,29,26,0.05)", fontFamily: "'DM Sans',sans-serif",
          }}>
            <div style={{ fontSize: 11, color: "#9B8D77", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Workspace Flow
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 12.5, color: "#3F372E" }}>
              <div>1. Pick a section</div>
              <div>2. Save the content</div>
              <div>3. Review the real public preview</div>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-workspace" style={{
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr) minmax(360px, 0.86fr)",
        gap: 18,
        alignItems: "start",
      }}>
        <div className="editor-sidebar" style={{
          position: "sticky", top: 84, maxHeight: "calc(100vh - 120px)", overflowY: "auto",
          padding: 14, borderRadius: 24,
          background: "linear-gradient(180deg, #fffaf3 0%, #f7efe2 100%)",
          border: "1px solid rgba(31,29,26,0.06)",
          boxShadow: "0 18px 45px rgba(31,29,26,0.06)",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={sideLabel}>Content</div>
          <SideItem
            sec={SECTIONS.find((s) => s.id === "profile")}
            active={activeSection === "profile"}
            onClick={() => setActive("profile")}
          />

          {SECTIONS.map((secDef) => {
            if (secDef.id === "profile") return null;
            const expectedType = enumMapReverse[secDef.id];
            const dbSec = dbSections.find((d) => d.sectionName === expectedType);
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

          <div style={{ ...sideLabel, marginTop: 12 }}>Tools</div>
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

        <div className="editor-canvas" style={{
          minWidth: 0, maxHeight: "calc(100vh - 120px)", overflowY: "auto",
          padding: 18, borderRadius: 28,
          background: "linear-gradient(180deg, #fffdfa 0%, #fbf6ed 100%)",
          border: "1px solid rgba(31,29,26,0.06)",
          boxShadow: "0 22px 55px rgba(31,29,26,0.07)",
        }}>
          {ActiveComponent ? (
            <div style={{ animation: "fadeIn 0.25s both" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 14, marginBottom: 20, paddingBottom: 18,
                borderBottom: "1px solid rgba(31,29,26,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 14,
                    background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#F0EDE6", flexShrink: 0,
                    boxShadow: "0 12px 24px rgba(31,29,26,0.18)",
                  }}>
                    {activeDef?.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 20, fontWeight: 700, color: "#1C1C1C",
                      fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.02em",
                    }}>
                      {activeDef?.label}
                    </div>
                    <div style={{
                      marginTop: 4, fontSize: 12, color: "#8A8578",
                      fontFamily: "'DM Sans',sans-serif",
                    }}>
                      Changes here shape the public page preview in real time after save.
                    </div>
                  </div>
                </div>
                {activeDef?.plan && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, color: "#7B3FA0",
                    background: "rgba(123,63,160,0.1)", padding: "4px 8px", borderRadius: 20,
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                    {activeDef.plan}+ only
                  </span>
                )}
              </div>

              <ActiveComponent
                resumeId={resumeId}
                userId={userId}
                userPlan={userPlan}
                resume={resume}
                onResumeUpdate={(nextResume) => {
                  setResume(nextResume);
                  setPreviewRefreshKey((prev) => prev + 1);
                }}
                onPreviewDraftChange={(section, payload) => {
                  setPreviewDraft((prev) => {
                    const nextSections = { ...(prev.sections || {}) };

                    if (section === "profile") {
                      return {
                        ...prev,
                        dirty: true,
                        profile: payload ? {
                          ...(prev.profile || {}),
                          ...(payload || {}),
                        } : null,
                      };
                    }

                    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
                      delete nextSections[section];
                    } else {
                      nextSections[section] = payload;
                    }

                    return {
                      ...prev,
                      dirty: true,
                      sections: nextSections,
                    };
                  });
                }}
                onNotify={notify}
              />
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: 300, color: "#8A8578", fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            }}>
              Select a section from the left to start editing
            </div>
          )}
        </div>

        <div className="editor-preview-column">
          <LivePublicPreview
            resume={resume}
            resumeId={resumeId}
            userId={userId}
            refreshKey={previewRefreshKey}
            previewDraft={previewDraft}
          />
        </div>
      </div>
    </UserDashboardLayout>
  );
}

function SideItem({ sec, active, onClick, locked, planRequired }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "11px 12px", borderRadius: 14, border: "none",
        background: active ? "#1C1C1C" : "transparent",
        color: active ? "#F0EDE6" : locked ? "#B0AB9E" : "#5A5550",
        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
        fontFamily: "'DM Sans',sans-serif", width: "100%",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.74)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0 }}>{sec.icon}</span>
      <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, flex: 1, lineHeight: 1.2 }}>
        {sec.label}
      </span>
      {locked && (
        <span style={{
          fontSize: 8.5, fontWeight: 700, color: "#7B3FA0",
          background: "rgba(123,63,160,0.12)", padding: "1px 5px", borderRadius: 10, flexShrink: 0,
        }}>
          {planRequired}
        </span>
      )}
      {active && <ChevronRight size={10} style={{ flexShrink: 0 }}/>}
    </button>
  );
}

const sideLabel = {
  fontSize: 9.5, fontWeight: 700, color: "#B0AB9E",
  textTransform: "uppercase", letterSpacing: "0.08em",
  padding: "0 11px", marginBottom: 4,
  fontFamily: "'DM Sans',sans-serif",
};

const btnStyle = (bg, color) => ({
  display: "flex", alignItems: "center", gap: 5,
  background: bg, color, border: "none", borderRadius: 10,
  padding: "7px 13px", fontSize: 11.5, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  transition: "opacity 0.15s", whiteSpace: "nowrap",
});





















