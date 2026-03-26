import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import StepBasicInfo from "./StepBasicInfo";
import StepChooseTemplate from "./StepChooseTemplate";
import StepReview from "./StepReview";
import LiveResumePreview from "./LiveResumePreview";
import { resumeAPI, subscriptionAPI } from "./resumeStudioAPI";

const STEPS = [
  { id: 1, label: "Basics", short: "Profession & title" },
  { id: 2, label: "Template", short: "Choose your visual identity" },
  { id: 3, label: "Review", short: "Create portfolio" },
];

const DEFAULT_CFG = {
  title: "",
  professionType: "",
  templateId: "",
  templateKey: "",
  renderFamily: "",
  templateName: "",
  templatePlanLevel: "FREE",
  primaryMood: "",
  layoutId: null,
  layoutType: null,
  recommendedBlockTypes: [],
  enabledSections: [],
  sectionOrder: [],
  navStyle: "TOP_FIXED",
  defaultTheme: null,
};

const STUDIO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
@keyframes studioFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to { transform: rotate(360deg); } }
`;

export default function ResumeStudio({ onClose }) {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [step, setStep] = useState(1);
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [userPlan, setUserPlan] = useState("FREE");
  const [resumeLimit, setResumeLimit] = useState(1);
  const [resumeCount, setResumeCount] = useState(0);

  const set = useCallback((key, value) => setCfg((previous) => ({ ...previous, [key]: value })), []);

  useEffect(() => {
    subscriptionAPI.getMyPlan().then((plan) => setUserPlan(typeof plan === "string" ? plan : "FREE")).catch(() => {});
    subscriptionAPI.getDetails().then((details) => {
      if (details?.resumeLimit != null) setResumeLimit(details.resumeLimit);
    }).catch(() => {});
    resumeAPI.getAll().then((list) => setResumeCount(Array.isArray(list) ? list.length : 0)).catch(() => {});
  }, []);

  const markDone = (value) => setDoneSteps((previous) => new Set([...previous, value]));
  const stepValid = (value) => {
    if (value === 1) return cfg.title.trim() && cfg.professionType;
    if (value === 2) return !!cfg.templateId;
    return true;
  };

  const goNext = () => {
    if (!stepValid(step)) return;
    markDone(step);
    setStep((previous) => Math.min(previous + 1, STEPS.length));
  };

  const goPrev = () => setStep((previous) => Math.max(previous - 1, 1));

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    setSaveMsg("Creating your portfolio...");
    try {
      const body = {
        title: cfg.title.trim(),
        professionType: cfg.professionType,
        templateId: cfg.templateId,
      };
      const resume = await resumeAPI.create(body);
      setSaveMsg("Portfolio created. Opening editor...");
      setTimeout(() => {
        navigate(`/resumes/${resume.id}/edit`);
        onClose?.();
      }, 600);
    } catch (creationError) {
      setError(creationError?.message || creationError?.error || "Failed to create portfolio.");
    } finally {
      setSaving(false);
      setSaveMsg("");
    }
  };

  const currentStep = useMemo(() => {
    if (step === 1) return <StepBasicInfo cfg={cfg} set={set} />;
    if (step === 2) return <StepChooseTemplate cfg={cfg} set={set} userPlan={userPlan} />;
    return <StepReview cfg={cfg} saving={saving} saveMsg={saveMsg} error={error} onSubmit={handleCreate} userPlan={userPlan} resumeCount={resumeCount} resumeLimit={resumeLimit} />;
  }, [cfg, error, resumeCount, resumeLimit, saveMsg, saving, set, step, userPlan]);

  return (
    <>
      <style>{STUDIO_CSS}</style>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "8px 0 40px", fontFamily: "'DM Sans', sans-serif" }}>
        <aside style={{ width: 170, position: "sticky", top: 80, display: "grid", gap: 6 }}>
          {STEPS.map((item) => {
            const active = step === item.id;
            const done = doneSteps.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                style={{
                  textAlign: "left",
                  border: "none",
                  borderRadius: 14,
                  padding: "11px 12px",
                  background: active ? "#1C1C1C" : done ? "#EEF7F0" : "#F5F1E9",
                  color: active ? "#F6EFE4" : done ? "#20734D" : "#5A5550",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: 10, opacity: 0.72 }}>{item.short}</div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClose}
            style={{ marginTop: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px solid #E5E3DE", background: "#fff", color: "#A04646", padding: "10px 12px", cursor: "pointer" }}
          >
            <X size={14} /> Discard
          </button>
        </aside>

        <section style={{ flex: "0 0 460px", minWidth: 0 }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E5E3DE", boxShadow: "0 14px 30px rgba(28,28,28,0.05)", padding: 24, minHeight: 540 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 16, marginBottom: 20, borderBottom: "1px solid #EFE7DB" }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#1C1C1C" }}>{STEPS[step - 1].label}</div>
                <div style={{ fontSize: 10.5, color: "#8A8578" }}>Step {step} of {STEPS.length} . {STEPS[step - 1].short}</div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {STEPS.map((item) => (
                  <span key={item.id} style={{ width: item.id === step ? 18 : 6, height: 6, borderRadius: 999, background: item.id === step ? "#1C1C1C" : doneSteps.has(item.id) ? "#86C79B" : "#DED5C9", transition: "all 0.18s ease" }} />
                ))}
              </div>
            </div>

            {currentStep}

            {step < STEPS.length ? (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 22, paddingTop: 18, borderTop: "1px solid #EFE7DB" }}>
                <button type="button" onClick={goPrev} disabled={step === 1} style={{ ...navButton(false), opacity: step === 1 ? 0.45 : 1, cursor: step === 1 ? "not-allowed" : "pointer" }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button type="button" onClick={goNext} disabled={!stepValid(step)} style={{ ...navButton(true), opacity: !stepValid(step) ? 0.55 : 1, cursor: !stepValid(step) ? "not-allowed" : "pointer" }}>
                  Next <ArrowRight size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ flex: 1, minWidth: 320, position: "sticky", top: 80 }}>
          <div style={{ background: "linear-gradient(180deg, #FFFDFC 0%, #F4EEE4 100%)", borderRadius: 22, border: "1px solid #E6DDCF", padding: 16, boxShadow: "0 18px 40px rgba(28,28,28,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8A8578" }}>Live Preview</div>
                <div style={{ fontSize: 10.5, color: "#948976" }}>Template mood, structure, and defaults update as you choose.</div>
              </div>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite", color: "#1C1C1C" }} /> : null}
            </div>
            <LiveResumePreview cfg={cfg} theme={cfg.defaultTheme} onZoneClick={setStep} />
          </div>
        </section>
      </div>
    </>
  );
}

function navButton(primary) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    border: primary ? "none" : "1px solid #E5E3DE",
    background: primary ? "#1C1C1C" : "#fff",
    color: primary ? "#F6EFE4" : "#5A5550",
    padding: "11px 15px",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  };
}
