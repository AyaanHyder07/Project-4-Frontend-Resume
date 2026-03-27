import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Save, X, ToggleLeft,
  ToggleRight, Loader2, RefreshCw, ChevronUp, ChevronDown
} from "lucide-react";
import { adminPlansAPI } from "../../api/api";

const adminAPI = {
  getAllPlans: async () => (await adminPlansAPI.getAll()).data,
  updatePlan: async (planType, body) => (await adminPlansAPI.update(planType, body)).data,
};

const FIELD_DEFS = [
  { key: "displayName",             label: "Display Name",          type: "text" },
  { key: "description",             label: "Description",           type: "text" },
  { key: "priceMonthlyInSmallestUnit", label: "Monthly Price (paise)", type: "number" },
  { key: "priceYearlyInSmallestUnit",  label: "Yearly Price (paise)",  type: "number" },
  { key: "displayPriceMonthly",     label: "Display Monthly",       type: "text" },
  { key: "displayPriceYearly",      label: "Display Yearly",        type: "text" },
  { key: "currency",                label: "Currency",              type: "text" },
  { key: "resumeLimit",             label: "Resume Limit",          type: "number" },
  { key: "publicLinkLimit",         label: "Public Link Limit",     type: "number" },
  { key: "displayOrder",            label: "Display Order",         type: "number" },
  { key: "trialDurationDays",        label: "Trial Days",            type: "number" },
];

const BOOL_FIELDS = [
  { key: "versioningEnabled",         label: "Versioning" },
  { key: "themeCustomizationEnabled", label: "Theme Customization" },
  { key: "templateChangeEnabled",    label: "Template Change" },
  { key: "oneTimeOnly",              label: "One-Time Only" },
  { key: "customSlugEnabled",        label: "Custom Slug" },
  { key: "isPopular",                 label: "Mark as Popular" },
  { key: "isActive",                  label: "Active" },
];

const PLAN_COLORS = {
  FREE:    "#8A8578",
  BASIC:   "#1C6EA4",
  PRO:     "#7B3FA0",
  PREMIUM: "#C9963A",
};

/* ═══════════════════════════════════════════════════════════ */
export default function AdminPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(null);      // planType string
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setFetching(true);
    adminAPI
      .getAllPlans()
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load plans", "error"))
      .finally(() => setFetching(false));
  };

  useEffect(load, []);

  const startEdit = (plan) => {
    setEditing(plan.planType);
    setDraft({
      displayName: plan.displayName,
      description: plan.description,
      priceMonthlyInSmallestUnit: plan.priceMonthlyInSmallestUnit,
      priceYearlyInSmallestUnit: plan.priceYearlyInSmallestUnit,
      displayPriceMonthly: plan.displayPriceMonthly,
      displayPriceYearly: plan.displayPriceYearly,
      currency: plan.currency,
      resumeLimit: plan.resumeLimit,
      publicLinkLimit: plan.publicLinkLimit,
      displayOrder: plan.displayOrder,
      trialDurationDays: plan.trialDurationDays,
      versioningEnabled: plan.versioningEnabled,
      themeCustomizationEnabled: plan.themeCustomizationEnabled,
      templateChangeEnabled: plan.templateChangeEnabled,
      oneTimeOnly: plan.oneTimeOnly,
      customSlugEnabled: plan.customSlugEnabled,
      isPopular: plan.popular,
      isActive: plan.active,
    });
  };

  const cancelEdit = () => { setEditing(null); setDraft({}); };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await adminAPI.updatePlan(editing, draft);
      setPlans((prev) =>
        prev.map((p) => (p.planType === editing ? updated : p))
      );
      showToast(`${editing} plan updated`, "success");
      cancelEdit();
    } catch {
      showToast("Save failed — check console", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleActive = async (plan) => {
    try {
      const updated = await adminAPI.updatePlan(plan.planType, { isActive: !plan.active });
      setPlans((prev) => prev.map((p) => (p.planType === plan.planType ? updated : p)));
      showToast(`${plan.planType} ${!plan.active ? "activated" : "deactivated"}`, "success");
    } catch {
      showToast("Toggle failed", "error");
    }
  };

  return (
    <div style={s.root}>
      <div style={s.bgGlow} />

      {/* ── Header ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={s.title}>Plan Management</h1>
          <p style={s.subtitle}>Edit pricing, limits, and display settings for each plan.</p>
        </div>
        <button style={s.refreshBtn} onClick={load}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "success" ? "rgba(60,160,80,0.15)" : "rgba(180,60,60,0.15)", borderColor: toast.type === "success" ? "rgba(60,160,80,0.35)" : "rgba(180,60,60,0.35)", color: toast.type === "success" ? "#70C880" : "#E07070" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Content ── */}
      {fetching ? (
        <div style={s.loading}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite", color: "#7B3FA0" }} />
          <span style={{ color: "#8A8578", fontSize: 13 }}>Loading plans…</span>
        </div>
      ) : (
        <div style={s.grid}>
          {plans.map((plan) => {
            const color = PLAN_COLORS[plan.planType] ?? "#8A8578";
            const isEditing = editing === plan.planType;

            return (
              <div
                key={plan.planType}
                style={{
                  ...s.card,
                  border: isEditing ? `1.5px solid ${color}` : "1px solid rgba(240,237,230,0.08)",
                  boxShadow: isEditing ? `0 0 20px rgba(123,63,160,0.2)` : "none",
                }}
              >
                {/* Card header */}
                <div style={s.cardHead}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...s.planTag, color, borderColor: color + "50", background: color + "18" }}>
                      {plan.planType}
                    </span>
                    <span style={{ fontSize: 12, color: plan.active ? "#70C880" : "#B43C3C" }}>
                      {plan.active ? "● Active" : "● Inactive"}
                    </span>
                    {plan.popular && (
                      <span style={s.popularDot}>Popular</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!isEditing && (
                      <>
                        <button
                          style={{ ...s.iconBtn, color: plan.active ? "#B43C3C" : "#70C880" }}
                          title={plan.active ? "Deactivate" : "Activate"}
                          onClick={() => toggleActive(plan)}
                        >
                          {plan.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button style={{ ...s.iconBtn, color }} onClick={() => startEdit(plan)}>
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button style={{ ...s.iconBtn, color: "#E07070" }} onClick={cancelEdit}>
                          <X size={14} />
                        </button>
                        <button
                          style={{ ...s.iconBtn, color: "#70C880" }}
                          onClick={save}
                          disabled={saving}
                        >
                          {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Read view */}
                {!isEditing && (
                  <div style={s.readView}>
                    <Row label="Name" val={plan.displayName} />
                    <Row label="Description" val={plan.description} />
                    <Row label="Monthly" val={`${plan.displayPriceMonthly} (${plan.priceMonthlyInSmallestUnit} ${plan.currency})`} />
                    <Row label="Yearly" val={`${plan.displayPriceYearly} (${plan.priceYearlyInSmallestUnit} ${plan.currency})`} />
                    <Row label="Resume limit" val={plan.resumeLimit} />
                    <Row label="Public links" val={plan.publicLinkLimit} />
                    <Row label="Versioning" val={plan.versioningEnabled ? "✓" : "✗"} />
                    <Row label="Theme custom." val={plan.themeCustomizationEnabled ? "✓" : "✗"} />
                    <Row label="Template change" val={plan.templateChangeEnabled ? "✓" : "✗"} />
                    <Row label="One-time only" val={plan.oneTimeOnly ? "✓" : "✗"} />
                    <Row label="Custom slug" val={plan.customSlugEnabled ? "✓" : "✗"} />
                    <Row label="Trial days" val={plan.trialDurationDays ?? "—"} />
                    <Row label="Display order" val={plan.displayOrder} />
                    <Row label="Updated" val={plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : "—"} />
                  </div>
                )}

                {/* Edit form */}
                {isEditing && (
                  <div style={s.editForm}>
                    {FIELD_DEFS.map((f) => (
                      <label key={f.key} style={s.fieldLabel}>
                        <span style={s.fieldName}>{f.label}</span>
                        <input
                          type={f.type}
                          value={draft[f.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                            }))
                          }
                          style={s.input}
                        />
                      </label>
                    ))}

                    <div style={s.boolRow}>
                      {BOOL_FIELDS.map((f) => (
                        <label key={f.key} style={s.boolLabel}>
                          <input
                            type="checkbox"
                            checked={!!draft[f.key]}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [f.key]: e.target.checked }))
                            }
                            style={{ accentColor: color, width: 13, height: 13 }}
                          />
                          <span style={{ fontSize: 11, color: "#B0AB9E" }}>{f.label}</span>
                        </label>
                      ))}
                    </div>

                    <button style={{ ...s.saveBtn, background: color }} onClick={save} disabled={saving}>
                      {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>
    </div>
  );
}

const Row = ({ label, val }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid rgba(240,237,230,0.05)" }}>
    <span style={{ fontSize: 11, color: "#8A8578", minWidth: 100 }}>{label}</span>
    <span style={{ fontSize: 11, color: "#D0C9BE", textAlign: "right", maxWidth: 160, wordBreak: "break-word" }}>{String(val ?? "—")}</span>
  </div>
);

/* ─── Styles ── */
const s = {
  root: {
    minHeight: "100vh",
    background: "#111111",
    fontFamily: "'DM Sans', sans-serif",
    color: "#F0EDE6",
    padding: "28px 24px 60px",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    top: -80,
    right: -100,
    width: 500,
    height: 400,
    background: "radial-gradient(ellipse, rgba(28,110,164,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    maxWidth: 1100,
    margin: "0 auto 28px",
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(240,237,230,0.06)",
    border: "1px solid rgba(240,237,230,0.1)",
    borderRadius: 8,
    color: "#8A8578",
    fontSize: 12,
    padding: "6px 12px",
    cursor: "pointer",
    marginTop: 4,
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    fontWeight: 400,
    margin: "0 0 4px",
    letterSpacing: "-0.3px",
  },
  subtitle: { fontSize: 13, color: "#8A8578", margin: 0 },
  refreshBtn: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(240,237,230,0.06)",
    border: "1px solid rgba(240,237,230,0.1)",
    borderRadius: 8,
    color: "#8A8578",
    fontSize: 12,
    padding: "7px 14px",
    cursor: "pointer",
    marginTop: 4,
  },
  toast: {
    maxWidth: 1100,
    margin: "0 auto 18px",
    padding: "11px 16px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginTop: 80,
  },
  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(24,24,24,0.95)",
    borderRadius: 14,
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "box-shadow 0.2s",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  planTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.8px",
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid",
    textTransform: "uppercase",
  },
  popularDot: {
    fontSize: 10,
    background: "rgba(123,63,160,0.2)",
    color: "#C08FDF",
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 600,
  },
  iconBtn: {
    background: "rgba(240,237,230,0.05)",
    border: "1px solid rgba(240,237,230,0.08)",
    borderRadius: 7,
    padding: "5px 7px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  readView: { display: "flex", flexDirection: "column", gap: 0 },
  editForm: { display: "flex", flexDirection: "column", gap: 8 },
  fieldLabel: { display: "flex", flexDirection: "column", gap: 3 },
  fieldName: { fontSize: 10, color: "#8A8578", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" },
  input: {
    background: "rgba(240,237,230,0.05)",
    border: "1px solid rgba(240,237,230,0.1)",
    borderRadius: 7,
    color: "#F0EDE6",
    fontSize: 12,
    padding: "6px 10px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  boolRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 },
  boolLabel: { display: "flex", alignItems: "center", gap: 5, cursor: "pointer" },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: 8,
    padding: "9px 0",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: 4,
  },
};



