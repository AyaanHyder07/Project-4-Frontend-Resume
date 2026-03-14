/**
 * StepReview.jsx
 * Step 4 — Final review before POST /api/resumes
 *
 * POST /api/resumes body:
 *   { templateId, title, professionType, themeOverrideId? }
 *
 * Backend flow on create:
 *   1. validateResumeCreation (checks resumeLimit from plan)
 *   2. isTemplateAllowed (checks template.planLevel <= user.plan)
 *   3. fetches template → layout → theme
 *   4. sets PRIVATE, DRAFT, version=1, viewCount=0L
 *   5. initializeDefaultSections
 *
 * After create → user is redirected to resume editor
 */

import { Loader2, CheckCircle } from "lucide-react";

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
  const valid = cfg.title.trim() && cfg.professionType.trim() && cfg.templateId;
  const atLimit = resumeCount >= resumeLimit;

  const rows = [
    ["📝", "Title", cfg.title || "(not set)"],
    ["💼", "Profession", cfg.professionType || "(not set)"],
    ["📋", "Template", cfg.templateName || "(not selected)"],
    [
      "🎨",
      "Theme",
      cfg.themeName || "Default (template's theme)",
    ],
    ["💎", "Your Plan", userPlan],
    [
      "📊",
      "Resumes Used",
      resumeLimit === -1
        ? `${resumeCount} / Unlimited`
        : `${resumeCount} / ${resumeLimit}`,
    ],
  ];

  return (
    <div style={{ animation: "studioFadeUp 0.32s both" }}>
      {/* Summary grid */}
      <div style={s.summaryGrid}>
        {rows.map(([ic, label, val]) => (
          <div key={label} style={s.row}>
            <div style={s.rowLeft}>
              <span style={{ fontSize: 14 }}>{ic}</span>
              <span style={s.rowLabel}>{label}</span>
            </div>
            <span
              style={{
                ...s.rowVal,
                color:
                  val === "(not set)" || val === "(not selected)"
                    ? "#B43C3C"
                    : "#1C1C1C",
                fontWeight:
                  val === "(not set)" || val === "(not selected)" ? 400 : 600,
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div style={s.nextBox}>
        <div style={s.nextTitle}>📦 What gets created:</div>
        {[
          "A new private resume in DRAFT status",
          "Default portfolio sections initialized (Experience, Education, Skills…)",
          "Linked to your chosen template + theme",
          "Ready to fill with your content",
        ].map((item) => (
          <div key={item} style={s.nextItem}>
            <CheckCircle size={11} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Plan limit warning */}
      {atLimit && (
        <div style={s.errorBox}>
          ⚠ You've reached the resume limit for your <strong>{userPlan}</strong>{" "}
          plan ({resumeLimit} resume{resumeLimit !== 1 ? "s" : ""}). Please
          upgrade to create more.
        </div>
      )}

      {/* Validation warnings */}
      {!cfg.title.trim() && (
        <div style={s.warnBox}>⚡ Portfolio title is required (Step 1)</div>
      )}
      {!cfg.professionType.trim() && (
        <div style={s.warnBox}>⚡ Profession type is required (Step 1)</div>
      )}
      {!cfg.templateId && (
        <div style={s.warnBox}>⚡ Please select a template (Step 2)</div>
      )}

      {/* API error */}
      {error && <div style={s.errorBox}>⚠ {error}</div>}

      {/* Saving state */}
      {saving && (
        <div style={s.savingBox}>
          <Loader2
            size={13}
            style={{ animation: "spin 1s linear infinite" }}
          />
          {saveMsg || "Creating your portfolio…"}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={saving || !valid || atLimit}
        style={{
          ...s.submitBtn,
          opacity: saving || !valid || atLimit ? 0.6 : 1,
          cursor: saving || !valid || atLimit ? "not-allowed" : "pointer",
        }}
      >
        {saving ? (
          <>
            <Loader2
              size={14}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Creating…
          </>
        ) : (
          "🚀 Create Portfolio"
        )}
      </button>

      <p style={s.note}>
        Your portfolio starts as <strong>Private</strong> and{" "}
        <strong>Draft</strong>. You control when it goes public.
      </p>
    </div>
  );
}

const s = {
  summaryGrid: {
    background: "#FAFAF8",
    border: "1.5px solid #E5E3DE",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 13px",
    borderBottom: "1px solid #F0EDE6",
    gap: 8,
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 11,
    color: "#8A8578",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  rowVal: {
    fontSize: 11.5,
    fontFamily: "'DM Sans', sans-serif",
    textAlign: "right",
    maxWidth: 180,
    wordBreak: "break-word",
  },
  nextBox: {
    background: "#F0F9FF",
    border: "1px solid #BFDBFE",
    borderRadius: 11,
    padding: "11px 13px",
    marginBottom: 14,
  },
  nextTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1d4ed8",
    marginBottom: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  nextItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
    fontSize: 10.5,
    color: "#374151",
    marginBottom: 5,
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.4,
  },
  warnBox: {
    marginBottom: 7,
    padding: "8px 12px",
    borderRadius: 8,
    background: "rgba(180,60,60,0.07)",
    border: "1px solid rgba(180,60,60,0.18)",
    fontSize: 11,
    color: "#B43C3C",
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBox: {
    marginBottom: 10,
    padding: "9px 13px",
    borderRadius: 9,
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
    padding: "9px 13px",
    borderRadius: 9,
    background: "#1C1C1C",
    color: "#F0EDE6",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    width: "100%",
    padding: "13px 0",
    background: "#1C1C1C",
    color: "#F0EDE6",
    border: "none",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
    letterSpacing: "-0.01em",
  },
  note: {
    marginTop: 10,
    fontSize: 10.5,
    color: "#8A8578",
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
  },
};