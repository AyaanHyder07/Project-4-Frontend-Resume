/**
 * ResumeStudio.jsx
 * The main studio shell — step nav + editor panel + live preview.
 * Mirrors AdminThemeStudio layout: sticky left nav + center panel + sticky right preview.
 *
 * POST /api/resumes body: { templateId, title, professionType, themeOverrideId? }
 * On success → navigate to /resumes/{id}/edit (resume editor)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import StepBasicInfo from "./StepBasicInfo";
import StepChooseTemplate from "./StepChooseTemplate";
import StepChooseTheme from "./StepChooseTheme";
import StepReview from "./StepReview";
import LiveResumePreview from "./LiveResumePreview";
import { resumeAPI, themeAPI, subscriptionAPI } from "./resumeStudioAPI";

/* ── Step config ─────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 1,
    icon: "📝",
    label: "Basic Info",
    short: "Title & Profession",
  },
  {
    id: 2,
    icon: "📋",
    label: "Template",
    short: "Pick a Layout",
  },
  {
    id: 3,
    icon: "🎨",
    label: "Theme",
    short: "Colors & Fonts",
  },
  {
    id: 4,
    icon: "🚀",
    label: "Create",
    short: "Review & Launch",
  },
];

/* ── Default config state ────────────────────────────────────────── */
const DEF = {
  title: "",
  professionType: "",
  templateId: "",
  templateName: "",
  templatePlanLevel: "FREE",
  themeOverrideId: null,
  themeName: "",
};

/* ── Global CSS (injected once) ──────────────────────────────────── */
const STUDIO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
@keyframes studioFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
.studio-panel::-webkit-scrollbar { width:4px; }
.studio-panel::-webkit-scrollbar-track { background:transparent; }
.studio-panel::-webkit-scrollbar-thumb { background:#E5E3DE; border-radius:4px; }
`;

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ResumeStudio({ onClose }) {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState({ ...DEF });
  const [step, setStep] = useState(1);
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState("FREE");
  const [resumeLimit, setResumeLimit] = useState(1);
  const [resumeCount, setResumeCount] = useState(0);
  const [resolvedTheme, setResolvedTheme] = useState(null);

  const set = useCallback((k, v) => setCfg((p) => ({ ...p, [k]: v })), []);

  /* Load user plan + resume count */
  useEffect(() => {
    subscriptionAPI
      .getMyPlan()
      .then((plan) => {
        const p = typeof plan === "string" ? plan : "FREE";
        setUserPlan(p);
      })
      .catch(() => {});

    subscriptionAPI
      .getDetails()
      .then((sub) => {
        if (sub?.resumeLimit != null) setResumeLimit(sub.resumeLimit);
      })
      .catch(() => {});

    resumeAPI
      .getAll()
      .then((list) => {
        if (Array.isArray(list)) setResumeCount(list.length);
      })
      .catch(() => {});
  }, []);

  /* Fetch resolved theme whenever themeOverrideId changes */
  useEffect(() => {
    if (!cfg.themeOverrideId) {
      setResolvedTheme(null);
      return;
    }
    themeAPI
      .getById(cfg.themeOverrideId)
      .then((t) => setResolvedTheme(t))
      .catch(() => setResolvedTheme(null));
  }, [cfg.themeOverrideId]);

  const markDone = (n) => setDoneSteps((p) => new Set([...p, n]));

  const goNext = () => {
    markDone(step);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const stepValid = (s) => {
    if (s === 1) return cfg.title.trim() && cfg.professionType.trim();
    if (s === 2) return !!cfg.templateId;
    if (s === 3) return true; // theme is optional
    if (s === 4)
      return cfg.title.trim() && cfg.professionType.trim() && cfg.templateId;
    return true;
  };

  /* ── CREATE RESUME ──────────────────────────────────────────────── */
  const handleCreate = async () => {
    setError(null);
    setSaving(true);
    setSaveMsg("Creating your portfolio…");
    try {
      // Body matches CreateResumeRequest exactly:
      // { templateId, title, professionType, themeOverrideId? }
      const body = {
        templateId: cfg.templateId,
        title: cfg.title.trim(),
        professionType: cfg.professionType.trim(),
      };
      if (cfg.themeOverrideId) {
        body.themeOverrideId = cfg.themeOverrideId;
      }

      const resume = await resumeAPI.create(body);
      setSaveMsg("Portfolio created! Redirecting…");

      // Navigate to resume editor after 800ms
      setTimeout(() => {
        navigate(`/resumes/${resume.id}/edit`);
        if (onClose) onClose();
      }, 800);
    } catch (e) {
      const msg =
        e?.message ||
        e?.error ||
        "Failed to create portfolio. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
      setSaveMsg("");
    }
  };

  /* ── RENDER ─────────────────────────────────────────────────────── */
  return (
    <>
      <style>{STUDIO_CSS}</style>

      {/* Studio container */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          padding: "8px 0 40px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── STEP NAV (sticky left) ─────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            width: 152,
            position: "sticky",
            top: 80,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {STEPS.map((st) => {
            const isActive = step === st.id;
            const isDone = doneSteps.has(st.id);
            return (
              <button
                key={st.id}
                onClick={() => setStep(st.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: isActive
                    ? "#1C1C1C"
                    : isDone
                    ? "#F0FDF4"
                    : "#F0EDE6",
                  color: isActive
                    ? "#F0EDE6"
                    : isDone
                    ? "#15803d"
                    : "#5A5550",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.22s",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  boxShadow: isActive
                    ? "0 4px 16px rgba(28,28,28,0.2)"
                    : "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span style={{ fontSize: isActive ? 17 : 15, flexShrink: 0 }}>
                  {isDone && !isActive ? "✅" : st.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}
                  >
                    {st.label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      opacity: 0.6,
                      lineHeight: 1.2,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {st.short}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Discard button */}
          <button
            onClick={onClose}
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 12px",
              borderRadius: 10,
              border: "1.5px solid #E5E3DE",
              background: "transparent",
              color: "#B43C3C",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <X size={12} /> Discard
          </button>
        </div>

        {/* ── EDITOR PANEL ──────────────────────────────────────── */}
        <div style={{ flex: "0 0 430px", minWidth: 0 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1.5px solid #E5E3DE",
              padding: "22px 24px",
              boxShadow: "0 4px 28px rgba(0,0,0,0.05)",
              minHeight: 500,
            }}
          >
            {/* Step header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                paddingBottom: 16,
                marginBottom: 20,
                borderBottom: "2px solid #F0EDE6",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#1C1C1C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {STEPS[step - 1]?.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1C1C1C",
                    fontFamily: "'DM Serif Display', serif",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {STEPS[step - 1]?.label}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#8A8578",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Step {step} of 4 · {STEPS[step - 1]?.short}
                </div>
              </div>
              {/* Progress dots */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {STEPS.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      width: st.id === step ? 20 : 6,
                      height: 6,
                      borderRadius: 99,
                      transition: "width 0.3s, background 0.3s",
                      background:
                        st.id === step
                          ? "#1C1C1C"
                          : doneSteps.has(st.id)
                          ? "#22c55e"
                          : "#E5E3DE",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Panel content */}
            <div
              className="studio-panel"
              style={{
                maxHeight: "52vh",
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {step === 1 && <StepBasicInfo cfg={cfg} set={set} />}
              {step === 2 && (
                <StepChooseTemplate cfg={cfg} set={set} userPlan={userPlan} />
              )}
              {step === 3 && <StepChooseTheme cfg={cfg} set={set} userPlan={userPlan} />}
              {step === 4 && (
                <StepReview
                  cfg={cfg}
                  saving={saving}
                  saveMsg={saveMsg}
                  error={error}
                  onSubmit={handleCreate}
                  userPlan={userPlan}
                  resumeCount={resumeCount}
                  resumeLimit={resumeLimit}
                />
              )}
            </div>

            {/* Nav buttons (not on step 4 — Review has its own submit button) */}
            {step < 4 && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1.5px solid #F0EDE6",
                }}
              >
                {step > 1 && (
                  <button
                    onClick={goPrev}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "#F0EDE6",
                      color: "#5A5550",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={!stepValid(step)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: stepValid(step) ? "#1C1C1C" : "#E5E3DE",
                    color: stepValid(step) ? "#F0EDE6" : "#B0AB9E",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 0",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: stepValid(step) ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.18s",
                  }}
                >
                  {step === 3
                    ? "Review & Create"
                    : `Next: ${STEPS[step]?.label}`}
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── LIVE PREVIEW (sticky right) ───────────────────────── */}
        <div style={{ flex: 1, minWidth: 240, position: "sticky", top: 80 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1.5px solid #E5E3DE",
              overflow: "hidden",
              boxShadow: "0 4px 28px rgba(0,0,0,0.05)",
            }}
          >
            {/* Chrome bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#FAFAF8",
                borderBottom: "1.5px solid #F0EDE6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#8A8578",
                    marginLeft: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Live Preview
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "shimmer 2s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: "#8A8578",
                    fontFamily: "'DM Sans', sans-serif",
                    fontStyle: "italic",
                  }}
                >
                  real-time
                </span>
              </div>
            </div>

            {/* Preview */}
            <div style={{ padding: 12 }}>
              <LiveResumePreview
                cfg={cfg}
                theme={resolvedTheme}
                onZoneClick={(s) => setStep(s)}
              />
            </div>

            {/* Current selections strip */}
            <div
              style={{
                padding: "9px 14px",
                borderTop: "1.5px solid #F0EDE6",
                background: "#FAFAF8",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#8A8578",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Your Selections
              </div>
              {[
                ["📝", "Title", cfg.title || "—"],
                ["💼", "Profession", cfg.professionType || "—"],
                ["📋", "Template", cfg.templateName || "—"],
                ["🎨", "Theme", cfg.themeName || "Default"],
              ].map(([ic, label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9.5,
                      color: "#8A8578",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {ic} {label}
                  </span>
                  <span
                    style={{
                      fontSize: 9.5,
                      color: val === "—" || val === "Default" ? "#B0AB9E" : "#1C1C1C",
                      fontWeight: val !== "—" && val !== "Default" ? 600 : 400,
                      fontFamily: "'DM Sans', sans-serif",
                      maxWidth: 100,
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Hint */}
            <div
              style={{
                padding: "7px 14px",
                background: "#F0F7FF",
                borderTop: "1px solid #BFDBFE",
                fontSize: 9,
                color: "#3b82f6",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              👆 Click any section in the preview to jump to that step
            </div>
          </div>
        </div>
      </div>
    </>
  );
}