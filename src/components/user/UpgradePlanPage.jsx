import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, Zap, ArrowLeft, Sparkles,
  Shield, Star, Crown, ChevronRight, Loader2
} from "lucide-react";
import { paymentAPI, subscriptionAPI } from "../../api/api";

const PLANS = [
  {
    key: "FREE",
    label: "Free Trial",
    icon: <Shield size={18} />,
    color: "#8A8578",
    glow: "rgba(138,133,120,0.25)",
    border: "rgba(138,133,120,0.3)",
    monthlyDisplay: "?0",
    yearlyDisplay: "?0",
    perks: ["1 portfolio draft", "7-day access window", "Limited templates", "No public link", "One-time use only"],
    disabled: true,
    cta: "Included at signup",
  },
  {
    key: "BASIC",
    label: "Basic",
    icon: <Star size={18} />,
    color: "#1C6EA4",
    glow: "rgba(28,110,164,0.25)",
    border: "rgba(28,110,164,0.35)",
    monthlyDisplay: "?199",
    yearlyDisplay: "?1,990",
    monthlyCycle: "MONTHLY",
    yearlyCycle: "YEARLY",
    perks: ["1 portfolio", "1 public link", "Limited template access", "Edit content anytime", "No template switching"],
    cta: "Get Basic",
  },
  {
    key: "PRO",
    label: "Pro",
    icon: <Zap size={18} />,
    color: "#7B3FA0",
    glow: "rgba(123,63,160,0.3)",
    border: "rgba(123,63,160,0.4)",
    monthlyDisplay: "?399",
    yearlyDisplay: "?3,990",
    popular: true,
    monthlyCycle: "MONTHLY",
    yearlyCycle: "YEARLY",
    perks: ["Everything in Basic", "Change template on existing portfolio", "Choose a custom public URL", "1 portfolio", "1 public link", "Version history"],
    cta: "Get Pro",
  },
  {
    key: "PREMIUM",
    label: "Premium",
    icon: <Crown size={18} />,
    color: "#C9963A",
    glow: "rgba(201,150,58,0.3)",
    border: "rgba(201,150,58,0.4)",
    monthlyDisplay: "?699",
    yearlyDisplay: "?6,990",
    monthlyCycle: "MONTHLY",
    yearlyCycle: "YEARLY",
    perks: ["Everything in Pro", "Public page customization", "Choose a custom public URL", "Premium template access", "1 portfolio", "1 public link"],
    cta: "Get Premium",
  },
];

export default function UpgradePlanPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [cycle, setCycle] = useState("MONTHLY");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadCurrentPlan = () => {
    subscriptionAPI.getMyPlan().then((r) => setCurrentPlan(r.data)).catch(() => setCurrentPlan("FREE"));
  };

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const handleUpgrade = async (plan) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(plan.key);
      const billingCycle = cycle;
      const initiate = await paymentAPI.initiate(plan.key, billingCycle);
      const orderId = initiate?.data?.orderId || initiate?.orderId;
      if (!orderId) {
        throw new Error("Could not initiate payment.");
      }
      await paymentAPI.confirm(orderId, `manual-${Date.now()}`);
      loadCurrentPlan();
      window.dispatchEvent(new Event("subscription:changed"));
      setSuccess(plan.label);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const cycleLabel = cycle === "MONTHLY" ? "monthlyDisplay" : "yearlyDisplay";
  const saving = cycle === "YEARLY";

  return (
    <div style={styles.root}>
      <div style={styles.bgGlow} />

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        <div style={styles.headerText}>
          <span style={styles.eyebrow}>
            <Sparkles size={12} style={{ marginRight: 5 }} />
            Choose your plan
          </span>
          <h1 style={styles.title}>Upgrade your portfolio access</h1>
          <p style={styles.subtitle}>Monthly and yearly plans with clear limits for Basic, Pro, and Premium.</p>
        </div>

        <div style={styles.toggle}>
          {["MONTHLY", "YEARLY"].map((c) => (
            <button key={c} onClick={() => setCycle(c)} style={{ ...styles.toggleBtn, background: cycle === c ? "#F0EDE6" : "transparent", color: cycle === c ? "#1C1C1C" : "#8A8578" }}>
              {c === "MONTHLY" ? "Monthly" : "Yearly"}
              {c === "YEARLY" && <span style={styles.saveBadge}>Save more</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={styles.errorBanner}>? {error}<button style={styles.bannerClose} onClick={() => setError(null)}>×</button></div>}
      {success && <div style={styles.successBanner}><CheckCircle size={14} /> You&apos;re now on the <strong>{success}</strong> plan!<button style={styles.bannerClose} onClick={() => setSuccess(null)}>×</button></div>}

      <div style={styles.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const isLoading = loading === plan.key;
          const isUpgrade = currentPlan && PLANS.findIndex((p) => p.key === plan.key) > PLANS.findIndex((p) => p.key === currentPlan);

          return (
            <div key={plan.key} style={{ ...styles.card, border: isCurrent ? `1.5px solid ${plan.color}` : `1px solid ${plan.border}`, boxShadow: isCurrent ? `0 0 28px ${plan.glow}, 0 2px 12px rgba(0,0,0,0.4)` : "0 2px 12px rgba(0,0,0,0.3)" }}>
              {plan.popular && <div style={{ ...styles.popularBadge, background: plan.color }}>Most Popular</div>}
              {isCurrent && <div style={{ ...styles.currentBadge, color: plan.color, border: `1px solid ${plan.border}` }}>? Current plan</div>}

              <div style={{ ...styles.planIcon, color: plan.color, background: plan.glow }}>{plan.icon}</div>
              <div style={{ ...styles.planLabel, color: plan.color }}>{plan.label}</div>

              <div style={styles.price}>
                <span style={styles.priceAmt}>{plan[cycleLabel]}</span>
                <span style={styles.pricePer}>{plan.key !== "FREE" ? (cycle === "MONTHLY" ? "/mo" : "/yr") : ""}</span>
              </div>
              {saving && plan.key !== "FREE" && <div style={styles.saveNote}>Billed yearly</div>}

              <ul style={styles.perks}>
                {plan.perks.map((p) => (
                  <li key={p} style={styles.perk}><CheckCircle size={12} color={plan.color} style={{ flexShrink: 0 }} /><span>{p}</span></li>
                ))}
              </ul>

              <button disabled={isCurrent || isLoading || plan.disabled} onClick={() => !isCurrent && !plan.disabled && handleUpgrade(plan)} style={{ ...styles.cta, background: isCurrent ? plan.glow : plan.disabled ? "rgba(138,133,120,0.1)" : plan.color, color: isCurrent || plan.disabled ? plan.color : "#fff", cursor: isCurrent || plan.disabled ? "default" : "pointer", opacity: plan.disabled ? 0.6 : 1 }}>
                {isLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : isCurrent ? "Current plan" : <>{plan.cta}{isUpgrade && <ChevronRight size={13} style={{ marginLeft: 4 }} />}</>}
              </button>
            </div>
          );
        })}
      </div>

      <p style={styles.footNote}>Free is one-time only · Paid plans renew by cycle · You can revise prices later from admin.</p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#111111", fontFamily: "'DM Sans', sans-serif", color: "#F0EDE6", padding: "32px 24px 56px", position: "relative", overflow: "hidden" },
  bgGlow: { position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(123,63,160,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  header: { maxWidth: 900, margin: "0 auto 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" },
  backBtn: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "rgba(240,237,230,0.06)", border: "1px solid rgba(240,237,230,0.12)", borderRadius: 8, color: "#8A8578", fontSize: 13, padding: "6px 12px", cursor: "pointer", marginBottom: 8 },
  headerText: { textAlign: "center" },
  eyebrow: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#7B3FA0", marginBottom: 10 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400, margin: "0 0 8px", color: "#F0EDE6", letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#8A8578", margin: 0 },
  toggle: { display: "flex", background: "rgba(240,237,230,0.06)", border: "1px solid rgba(240,237,230,0.1)", borderRadius: 10, padding: 3, marginTop: 16, gap: 2 },
  toggleBtn: { border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" },
  saveBadge: { background: "rgba(123,63,160,0.3)", color: "#C08FDF", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 20 },
  errorBanner: { maxWidth: 900, margin: "0 auto 20px", background: "rgba(180,60,60,0.15)", border: "1px solid rgba(180,60,60,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#E07070", display: "flex", alignItems: "center", justifyContent: "space-between" },
  successBanner: { maxWidth: 900, margin: "0 auto 20px", background: "rgba(60,160,80,0.15)", border: "1px solid rgba(60,160,80,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#70C880", display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" },
  bannerClose: { background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14, opacity: 0.7 },
  grid: { maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 16 },
  card: { background: "rgba(28,28,28,0.9)", borderRadius: 16, padding: "24px 20px 20px", display: "flex", flexDirection: "column", gap: 0, position: "relative", transition: "transform 0.2s" },
  popularBadge: { position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", color: "#fff", padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap" },
  currentBadge: { position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "transparent" },
  planIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  planLabel: { fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 },
  price: { display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 },
  priceAmt: { fontSize: 28, fontFamily: "'DM Serif Display', serif", fontWeight: 400, color: "#F0EDE6" },
  pricePer: { fontSize: 12, color: "#8A8578" },
  saveNote: { fontSize: 10, color: "#8A8578", marginBottom: 8 },
  perks: { listStyle: "none", margin: "16px 0", padding: 0, display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  perk: { display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: "#B0AB9E", lineHeight: 1.4 },
  cta: { marginTop: "auto", width: "100%", padding: "10px 0", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s, transform 0.15s" },
  footNote: { maxWidth: 900, margin: "32px auto 0", textAlign: "center", fontSize: 11, color: "#4A4740", lineHeight: 1.8 },
};
