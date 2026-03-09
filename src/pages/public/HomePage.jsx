import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    num: "01",
    title: "Craft Your Resume",
    body: "Build polished, ATS-optimised resumes with professionally designed templates that speak before you do.",
  },
  {
    num: "02",
    title: "Publish Your Portfolio",
    body: "Turn your experience into a living portfolio — a personal URL you own, curated to your standard.",
  },
  {
    num: "03",
    title: "Track & Analyse",
    body: "Understand who views your resume, when, and from where. Make informed decisions about your career.",
  },
];

const testimonials = [
  {
    quote: "The most refined resume tool I have encountered. The result speaks for itself.",
    name: "A. Harrington",
    role: "Investment Banking Associate",
  },
  {
    quote: "I landed three interviews in a week after publishing my portfolio. Exceptional product.",
    name: "S. Mehta",
    role: "Senior Product Manager",
  },
  {
    quote: "Clean. Authoritative. Everything my resume needed to be.",
    name: "E. Fontaine",
    role: "Corporate Counsel",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={styles.page}>
      {/* ── NAV ── */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <span style={styles.navBrand}>Résumé<span style={styles.navDot}>.</span></span>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#testimonials" style={styles.navLink}>Stories</a>
          {user ? (
            <Link to="/dashboard" style={styles.navCta}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Sign In</Link>
              <Link to="/register" style={styles.navCta}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>Professional Resume & Portfolio</p>
          <h1 style={styles.heroHeading}>
            Your career,<br />
            <em style={styles.heroItalic}>presented with distinction.</em>
          </h1>
          <p style={styles.heroSub}>
            Build resumes and portfolios that command attention — crafted for
            those who take their professional presence seriously.
          </p>
          <div style={styles.heroCtas}>
            {user ? (
              <Link to="/dashboard" style={styles.btnPrimary}>Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register" style={styles.btnPrimary}>Begin Your Portfolio</Link>
                <Link to="/login" style={styles.btnSecondary}>Sign In</Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative ruled lines */}
        <div style={styles.heroRule} />
        <div style={styles.heroRuleShort} />
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div style={styles.strip}>
        <div style={styles.stripInner}>
          {Array(3).fill(["ATS Optimised", "Portfolio Website", "Analytics Dashboard", "Professional Templates", "Custom Domain", "PDF Export"]).flat().map((t, i) => (
            <span key={i} style={styles.stripItem}>{t} <span style={styles.stripDivider}>—</span></span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionLabel}>What We Offer</div>
        <h2 style={styles.sectionHeading}>Built for the discerning professional</h2>
        <div style={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.num} style={styles.featureCard}>
              <span style={styles.featureNum}>{f.num}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STAT BAR ── */}
      <div style={styles.statBar}>
        {[["12,000+", "Portfolios Created"], ["94%", "Interview Rate"], ["50+", "Premium Templates"]].map(([val, label]) => (
          <div key={label} style={styles.statItem}>
            <span style={styles.statVal}>{val}</span>
            <span style={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={styles.section}>
        <div style={styles.sectionLabel}>Testimonials</div>
        <h2 style={styles.sectionHeading}>Trusted by professionals</h2>
        <div style={styles.testiGrid}>
          {testimonials.map((t) => (
            <div key={t.name} style={styles.testiCard}>
              <p style={styles.testiQuote}>"{t.quote}"</p>
              <div style={styles.testiRule} />
              <p style={styles.testiName}>{t.name}</p>
              <p style={styles.testiRole}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.ctaSection}>
        <p style={styles.ctaEyebrow}>Your next chapter</p>
        <h2 style={styles.ctaHeading}>Ready to be remembered?</h2>
        <Link to={user ? "/dashboard" : "/register"} style={styles.btnPrimary}>
          {user ? "Open Dashboard" : "Create Your Portfolio — It's Free"}
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <span style={styles.footerBrand}>Résumé<span style={styles.navDot}>.</span></span>
        <span style={styles.footerCopy}>© {new Date().getFullYear()} All rights reserved.</span>
      </footer>
    </div>
  );
}

/* ── STYLES ── */
const CREAM = "#F5F0E8";
const CHARCOAL = "#1C1C1C";
const OLIVE = "#4A5240";
const MUTED = "#8A8578";
const BORDER = "#D6D0C4";

const styles = {
  page: {
    background: CREAM,
    color: CHARCOAL,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  /* NAV */
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    transition: "background 0.4s, border-bottom 0.4s, padding 0.3s",
  },
  navScrolled: {
    background: "rgba(245,240,232,0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${BORDER}`,
    padding: "14px 60px",
  },
  navBrand: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    color: CHARCOAL,
    textDecoration: "none",
  },
  navDot: { color: OLIVE },
  navLinks: { display: "flex", alignItems: "center", gap: "32px" },
  navLink: {
    fontSize: "14px",
    color: MUTED,
    textDecoration: "none",
    letterSpacing: "0.5px",
    transition: "color 0.2s",
  },
  navCta: {
    fontSize: "13px",
    background: CHARCOAL,
    color: CREAM,
    padding: "10px 22px",
    borderRadius: "2px",
    textDecoration: "none",
    letterSpacing: "0.8px",
    fontFamily: "'Georgia', serif",
  },

  /* HERO */
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "120px 60px 80px",
    position: "relative",
    borderBottom: `1px solid ${BORDER}`,
  },
  heroInner: { maxWidth: "680px" },
  heroEyebrow: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: OLIVE,
    marginBottom: "24px",
    fontFamily: "'Georgia', serif",
  },
  heroHeading: {
    fontSize: "clamp(48px, 6vw, 82px)",
    lineHeight: "1.1",
    fontWeight: "400",
    margin: "0 0 28px",
    letterSpacing: "-1px",
  },
  heroItalic: {
    fontStyle: "italic",
    color: OLIVE,
    fontWeight: "400",
  },
  heroSub: {
    fontSize: "18px",
    color: MUTED,
    lineHeight: "1.7",
    maxWidth: "520px",
    marginBottom: "48px",
    fontFamily: "Georgia, serif",
  },
  heroCtas: { display: "flex", gap: "16px", flexWrap: "wrap" },
  heroRule: {
    position: "absolute",
    right: "60px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "1px",
    height: "300px",
    background: BORDER,
  },
  heroRuleShort: {
    position: "absolute",
    right: "80px",
    top: "50%",
    transform: "translateY(-30%)",
    width: "1px",
    height: "160px",
    background: BORDER,
    opacity: 0.5,
  },

  /* BUTTONS */
  btnPrimary: {
    display: "inline-block",
    background: CHARCOAL,
    color: CREAM,
    padding: "14px 32px",
    fontSize: "13px",
    letterSpacing: "1px",
    textDecoration: "none",
    borderRadius: "2px",
    transition: "background 0.2s",
  },
  btnSecondary: {
    display: "inline-block",
    background: "transparent",
    color: CHARCOAL,
    padding: "14px 32px",
    fontSize: "13px",
    letterSpacing: "1px",
    textDecoration: "none",
    border: `1px solid ${CHARCOAL}`,
    borderRadius: "2px",
    transition: "background 0.2s",
  },

  /* STRIP */
  strip: {
    background: CHARCOAL,
    color: CREAM,
    padding: "14px 0",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  stripInner: {
    display: "inline-block",
    animation: "marquee 28s linear infinite",
  },
  stripItem: {
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginRight: "16px",
  },
  stripDivider: { color: OLIVE, marginLeft: "16px" },

  /* SECTION */
  section: {
    padding: "100px 60px",
    borderBottom: `1px solid ${BORDER}`,
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: OLIVE,
    marginBottom: "16px",
  },
  sectionHeading: {
    fontSize: "clamp(28px, 4vw, 46px)",
    fontWeight: "400",
    marginBottom: "60px",
    letterSpacing: "-0.5px",
    maxWidth: "540px",
    lineHeight: "1.2",
  },

  /* FEATURES */
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
  },
  featureCard: {
    borderTop: `2px solid ${CHARCOAL}`,
    paddingTop: "32px",
  },
  featureNum: {
    fontSize: "11px",
    letterSpacing: "3px",
    color: OLIVE,
    display: "block",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "22px",
    fontWeight: "400",
    marginBottom: "12px",
    letterSpacing: "-0.3px",
  },
  featureBody: {
    fontSize: "15px",
    color: MUTED,
    lineHeight: "1.7",
  },

  /* STAT BAR */
  statBar: {
    display: "flex",
    justifyContent: "space-around",
    padding: "60px",
    background: OLIVE,
    borderBottom: `1px solid ${BORDER}`,
    flexWrap: "wrap",
    gap: "32px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  statVal: {
    fontSize: "clamp(32px, 4vw, 52px)",
    fontWeight: "400",
    color: CREAM,
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#C8C0B0",
  },

  /* TESTIMONIALS */
  testiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "32px",
  },
  testiCard: {
    background: "rgba(255,255,255,0.5)",
    border: `1px solid ${BORDER}`,
    padding: "36px 32px",
    borderRadius: "2px",
  },
  testiQuote: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: CHARCOAL,
    fontStyle: "italic",
    marginBottom: "24px",
  },
  testiRule: {
    width: "32px",
    height: "1px",
    background: OLIVE,
    marginBottom: "16px",
  },
  testiName: {
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    margin: "0 0 4px",
    fontFamily: "Georgia, serif",
  },
  testiRole: {
    fontSize: "12px",
    color: MUTED,
    letterSpacing: "1px",
    textTransform: "uppercase",
    margin: 0,
  },

  /* CTA SECTION */
  ctaSection: {
    padding: "120px 60px",
    textAlign: "center",
    borderBottom: `1px solid ${BORDER}`,
  },
  ctaEyebrow: {
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: OLIVE,
    marginBottom: "20px",
  },
  ctaHeading: {
    fontSize: "clamp(32px, 5vw, 64px)",
    fontWeight: "400",
    marginBottom: "40px",
    letterSpacing: "-1px",
  },

  /* FOOTER */
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 60px",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerBrand: {
    fontSize: "18px",
    fontWeight: "700",
    color: CHARCOAL,
  },
  footerCopy: {
    fontSize: "12px",
    color: MUTED,
    letterSpacing: "1px",
  },
};

/* Inject marquee keyframe */
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;
document.head.appendChild(styleTag);
