import { Link, useNavigate } from "react-router-dom";
import TemplateCardPreview from "../../templates/TemplateCardPreview";
import { IMPLEMENTED_TEMPLATE_KEYS, isImplementedTemplate } from "../../templates/implementedTemplates";
import { getSamplePortfolio } from "../../templates/preview/samplePortfolios";
import { useAuth } from "../../auth/AuthContext";
import { useEffect, useState } from "react";
import { templateAPI } from "../../api/api";

const features = [
  { num: "01", title: "Resume Studio", body: "Build ATS-ready resumes with layouts that read like a private banker prepared them." },
  { num: "02", title: "Portfolio Publishing", body: "Launch a portfolio page with a composed visual hierarchy, custom links, and polished storytelling." },
  { num: "03", title: "Decision-Grade Analytics", body: "Track views, clicks, and signals that help you understand whether your profile is actually landing." },
];

const process = [
  { label: "Profile Foundation", body: "Capture your fundamentals once, then reuse them across resumes, themes, and future portfolio updates." },
  { label: "Editorial Refinement", body: "Choose layouts, tone, and presentation details that feel elevated rather than generic." },
  { label: "Publish With Confidence", body: "Share a memorable public page and keep improving it with analytics-backed feedback." },
];

const stories = [
  { quote: "The most refined resume tool I have encountered. The result speaks for itself.", name: "A. Harrington", role: "Investment Banking Associate" },
  { quote: "I landed three interviews in a week after publishing my portfolio. Exceptional product.", name: "S. Mehta", role: "Senior Product Manager" },
  { quote: "Clean. Authoritative. Everything my resume needed to be.", name: "E. Fontaine", role: "Corporate Counsel" },
];

const editorialNotes = [
  { title: "Old money palette", body: "Cream, charcoal, forest, and antique gold keep the product calm, premium, and credible." },
  { title: "Typography with weight", body: "Serif display moments create distinction while the body copy stays precise and modern." },
  { title: "Spacing that breathes", body: "Sections feel composed and confident, not cramped, noisy, or overly app-like." },
];

const faqs = [
  { q: "Is this just for resumes?", a: "No. The platform is built around resumes, portfolio publishing, analytics, and a growing presentation layer for your professional brand." },
  { q: "Can I start free?", a: "Yes. You can begin on a free tier, then move into premium plans when you need more templates, publishing flexibility, or deeper polish." },
  { q: "Who is it for?", a: "Professionals who care how their experience is framed: consultants, operators, designers, founders, legal talent, and finance candidates alike." },
];

const stripItems = ["ATS Optimised", "Portfolio Website", "Premium Templates", "Executive Typography", "View Analytics", "Public Profile", "Approval Workflow", "PDF Export"];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogTemplates, setCatalogTemplates] = useState([]);

  const templateGallery = IMPLEMENTED_TEMPLATE_KEYS.map((key) => {
    const apiMatch = catalogTemplates.find((item) => String(item?.templateKey || item?.renderFamily || "").toUpperCase() === key);
    const sample = getSamplePortfolio(key);
    return {
      id: apiMatch?.id || key,
      name: apiMatch?.name || sample.templateKey,
      tagline: apiMatch?.tagline || sample.title,
      description: apiMatch?.description || sample.profile.professionalTitle,
      templateKey: apiMatch?.templateKey || sample.templateKey,
      renderFamily: apiMatch?.renderFamily || sample.renderFamily,
      previewImageUrl: apiMatch?.previewImageUrl || "",
    };
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
      return;
    }
    templateAPI.getAvailable().then((res) => {
      const data = res?.data ?? [];
      setCatalogTemplates(Array.isArray(data) ? data.filter((item) => isImplementedTemplate(item.templateKey || item.renderFamily)) : []);
    }).catch(() => setCatalogTemplates([]));
  }, [user, navigate]);

  return (
    <div className="landing-page">
      <div className="container">
        <nav className="landing-nav">
          <span className="landing-brand">Resume<span>.</span></span>
          <div className="landing-links">
            <a href="#features">Features</a>
            <a href="#templates">Templates</a>
            <a href="#process">Process</a>
            <a href="#stories">Stories</a>
            <a href="#faq">FAQ</a>
            {user ? (
              <Link className="premium-link-btn primary" to="/dashboard">Dashboard</Link>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link className="premium-link-btn primary" to="/register">Get Started</Link>
              </>
            )}
          </div>
        </nav>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="page-eyebrow">Premium Resume and Portfolio Platform</div>
            <h1>Your work,<br />presented with<br />distinction.</h1>
            <p>Build resumes and portfolio pages that feel deliberate, authoritative, and editorial. This is a sharper professional presence, not another template dump.</p>
            <div className="page-actions" style={{ marginTop: 28 }}>
              <Link className="premium-link-btn primary" to={user ? "/dashboard" : "/register"}>{user ? "Open Dashboard" : "Begin Your Portfolio"}</Link>
              {!user && <Link className="premium-link-btn secondary" to="/login">Sign In</Link>}
            </div>
          </div>
          <aside className="landing-hero-aside">
            <div>
              <div className="page-eyebrow" style={{ color: "#c7aa72" }}>Editorial Snapshot</div>
              <h2 style={{ margin: 0, fontSize: "2.2rem", color: "#f4eee3" }}>Built for measured ambition.</h2>
              <p style={{ color: "rgba(244, 238, 227, 0.72)", marginTop: 14 }}>The interface borrows from the calm confidence of private club stationery, not loud startup dashboards.</p>
            </div>
            <div className="landing-editorial-stat"><strong>94%</strong><span style={{ color: "rgba(244, 238, 227, 0.72)" }}>reported stronger confidence in how their experience was framed</span></div>
          </aside>
        </section>

        <div className="landing-strip"><div className="landing-strip-track">{stripItems.concat(stripItems).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div>

        <section className="landing-section" id="features">
          <div className="landing-section-head"><div className="page-eyebrow">What You Get</div><h2 className="page-title">A premium toolkit for modern career presentation</h2></div>
          <div className="landing-feature-grid">{features.map((feature) => <article className="landing-section-card" key={feature.num}><div className="landing-card-number">{feature.num}</div><h3 style={{ margin: "12px 0 10px", fontSize: "1.7rem" }}>{feature.title}</h3><p className="premium-muted">{feature.body}</p></article>)}</div>
        </section>

        <section className="landing-section" id="templates">
          <div className="landing-section-head">
            <div className="page-eyebrow">Template Gallery</div>
            <h2 className="page-title">New users can preview the template direction before signing up</h2>
          </div>
          <div className="landing-feature-grid">
            {templateGallery.map((template) => {
  const key = template.templateKey || template.renderFamily || "CLASSICPRO";
  return (
    <Link
      to={`/template-preview/${key}`}
      key={template.id || key}
      className="landing-section-card"
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div style={{ height: 180, borderRadius: 22, overflow: "hidden", border: "1px solid rgba(17,24,39,0.08)", background: "#f8f5ef", boxShadow: "0 18px 40px rgba(15,23,42,0.08)" }}>
        <TemplateCardPreview template={template} compact={false} />
      </div>
      <h3 style={{ margin: "18px 0 8px", fontSize: "1.45rem" }}>{template.name || key}</h3>
      <p className="premium-muted">{template.tagline || template.description || "Preview the real template demo before signing up."}</p>
      <div className="page-eyebrow" style={{ marginTop: 10 }}>Open live demo</div>
    </Link>
  );
})}
          </div>
        </section>

        <section className="landing-section" id="process">
          <div className="landing-section-head"><div className="page-eyebrow">Working Style</div><h2 className="page-title">A cleaner process from first draft to public page</h2></div>
          <div className="landing-subgrid">{process.map((item, index) => <article className="landing-section-card" key={item.label}><div className="landing-card-number">{`0${index + 1}`}</div><h3 style={{ margin: "12px 0 10px", fontSize: "1.5rem" }}>{item.label}</h3><p className="premium-muted">{item.body}</p></article>)}</div>
        </section>

        <section className="landing-section"><div className="landing-info-grid">{editorialNotes.map((note) => <article className="landing-section-card" key={note.title}><div className="page-eyebrow">Design Note</div><h3 style={{ marginBottom: 10, fontSize: "1.45rem" }}>{note.title}</h3><p className="premium-muted">{note.body}</p></article>)}</div></section>

        <section className="landing-section" id="stories"><div className="landing-section-head"><div className="page-eyebrow">Testimonials</div><h2 className="page-title">Trusted by professionals who value presentation</h2></div><div className="landing-story-grid">{stories.map((story) => <article className="landing-section-card" key={story.name}><p style={{ fontSize: "1.08rem", lineHeight: 1.8, marginBottom: 22 }}>&quot;{story.quote}&quot;</p><div className="premium-meta">{story.name}</div><div className="premium-muted" style={{ marginTop: 6 }}>{story.role}</div></article>)}</div></section>

        <section className="landing-section" id="faq"><div className="landing-section-head"><div className="page-eyebrow">Common Questions</div><h2 className="page-title">A few things serious users usually ask</h2></div><div className="landing-faq-grid">{faqs.map((item) => <article className="landing-section-card" key={item.q}><h3 style={{ marginBottom: 10, fontSize: "1.35rem" }}>{item.q}</h3><p className="premium-muted">{item.a}</p></article>)}</div></section>

        <section className="landing-cta"><div className="page-eyebrow">Your Next Chapter</div><h2 className="page-title">Ready to look unforgettable for the right reasons?</h2><p className="page-lead" style={{ margin: "14px auto 0" }}>Move from generic documents to a sharper, premium presentation of your work.</p><div className="page-actions" style={{ justifyContent: "center", marginTop: 28 }}><Link className="premium-link-btn primary" to={user ? "/dashboard" : "/register"}>{user ? "Go to Dashboard" : "Create Your Portfolio"}</Link></div></section>

        <footer className="landing-footer"><span className="landing-brand" style={{ fontSize: "1.5rem" }}>Resume<span>.</span></span><span>© {new Date().getFullYear()} Crafted for polished careers.</span></footer>
      </div>
    </div>
  );
}





