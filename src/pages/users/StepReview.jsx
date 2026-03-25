import { CheckCircle, Loader2 } from "lucide-react";

export default function StepReview({
  cfg,
  saving,
  saveMsg,
  error,
  onSubmit,
  userPlan,
  resumeCount,
  resumeLimit,
}) {
  const valid = cfg.title.trim() && cfg.professionType && cfg.templateId;
  const atLimit = resumeLimit !== -1 && resumeCount >= resumeLimit;

  const rows = [
    ["Title", cfg.title || "Not set"],
    ["Profession", cfg.professionType?.replace(/_/g, " ") || "Not set"],
    ["Template", cfg.templateName || "Not selected"],
    ["Theme", cfg.themeName || "Template Default"],
    ["Motion", cfg.motionPreset || "SUBTLE"],
    ["Plan", userPlan],
    ["Portfolio Slots", resumeLimit === -1 ? `${resumeCount} / Unlimited` : `${resumeCount} / ${resumeLimit}`],
  ];

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      <div style={s.grid}>
        {rows.map(([label, value]) => (
          <div key={label} style={s.row}>
            <div style={s.label}>{label}</div>
            <div style={s.value}>{value}</div>
          </div>
        ))}
      </div>

      <div style={s.nextBox}>
        {[`
A new draft portfolio will be created with your selected template, theme, and motion preset.`.trim(),
          "Default fixed sections will be initialized for the editor.",
          "You will still be able to add custom blocks later for anything beyond the built-in sections.",
          "The portfolio stays private until you publish it."]
          .map((item) => (
            <div key={item} style={s.nextItem}>
              <CheckCircle size={12} color="#22c55e" />
              <span>{item}</span>
            </div>
          ))}
      </div>

      {atLimit ? <div style={s.errorBox}>You have reached the portfolio limit for your {userPlan} plan.</div> : null}
      {!cfg.title.trim() ? <div style={s.warnBox}>Portfolio title is required.</div> : null}
      {!cfg.professionType ? <div style={s.warnBox}>Profession selection is required.</div> : null}
      {!cfg.templateId ? <div style={s.warnBox}>Template selection is required.</div> : null}
      {error ? <div style={s.errorBox}>{error}</div> : null}

      {saving ? (
        <div style={s.savingBox}>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          {saveMsg || "Creating your portfolio..."}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={saving || !valid || atLimit}
        style={{ ...s.button, opacity: saving || !valid || atLimit ? 0.62 : 1, cursor: saving || !valid || atLimit ? "not-allowed" : "pointer" }}
      >
        {saving ? "Creating..." : "Create Portfolio"}
      </button>
    </div>
  );
}

const s = {
  grid: {
    display: "grid",
    gap: 8,
    marginBottom: 16,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    padding: "10px 13px",
    borderRadius: 12,
    border: "1px solid #E7DED1",
    background: "#FAF7F1",
  },
  label: {
    fontSize: 11,
    color: "#8A8578",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontFamily: "'DM Sans', sans-serif",
  },
  value: {
    fontSize: 12,
    color: "#1C1C1C",
    fontWeight: 600,
    textAlign: "right",
    fontFamily: "'DM Sans', sans-serif",
  },
  nextBox: {
    background: "#EEF6FF",
    border: "1px solid #CFE2FF",
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
  },
  nextItem: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    fontSize: 11,
    color: "#4F6178",
    lineHeight: 1.45,
    marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  },
  warnBox: {
    marginBottom: 8,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(180,60,60,0.07)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBox: {
    marginBottom: 10,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(180,60,60,0.1)",
    border: "1px solid rgba(180,60,60,0.25)",
    fontSize: 11.5,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
  savingBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#1C1C1C",
    color: "#F3EEE4",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  button: {
    width: "100%",
    padding: "13px 0",
    background: "#1C1C1C",
    color: "#F3EEE4",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
};
