import { useEffect, useState } from "react";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { templateAPI } from "../../api/api";

const PLAN_OPTIONS = ["FREE", "PRO", "PREMIUM"];

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [plan, setPlan] = useState("FREE");
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");

    const call = profession
      ? templateAPI.getByProfession(profession)
      : templateAPI.getAvailable();

    call
      .then((res) => setTemplates(res.data))
      .catch(() => setError("Failed to load templates."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [plan]);

  return (
    <UserDashboardLayout title="Templates" subtitle="Curated presentation options">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Template Library</div>
          <h2 className="page-title">Browse premium compositions for different careers.</h2>
          <p className="page-lead">
            Filter by plan or profession, then compare polished layouts designed to
            keep your work clean, premium, and readable.
          </p>
        </section>

        <section className="premium-panel">
          <div className="premium-filter-row">
            <div className="premium-field">
              <label>Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                {PLAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="premium-field">
              <label>Profession</label>
              <input
                placeholder="e.g. DESIGNER"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>
            <div className="premium-field" style={{ alignSelf: "end" }}>
              <button className="premium-btn primary" onClick={load}>
                Refine Selection
              </button>
            </div>
          </div>
        </section>

        {loading && <section className="premium-panel"><p className="premium-muted">Loading templates...</p></section>}
        {error && <section className="premium-panel"><p className="premium-muted" style={{ color: "var(--wine)" }}>{error}</p></section>}

        {!loading && !error && templates.length === 0 ? (
          <section className="premium-panel">
            <div className="premium-empty">
              <h3 style={{ marginBottom: 10, fontSize: "1.6rem" }}>No templates found</h3>
              <p>Try a different profession or broaden the filter.</p>
            </div>
          </section>
        ) : null}

        <section className="premium-grid cards">
          {templates.map((template) => (
            <article className="premium-card" key={template.id}>
              <div
                style={{
                  height: 220,
                  overflow: "hidden",
                  borderRadius: 20,
                  border: "1px solid rgba(163, 132, 78, 0.12)",
                  background: "rgba(255,255,255,0.5)",
                  marginBottom: 18,
                }}
              >
                {template.previewImageUrl ? (
                  <img
                    alt={template.name}
                    src={template.previewImageUrl}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <TemplatePlaceholder template={template} />
                )}
              </div>
              <div className="page-actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.45rem" }}>{template.name}</h3>
                  <p className="premium-muted" style={{ marginTop: 8 }}>
                    {template.description || "A refined template ready for professional use."}
                  </p>
                </div>
                <span className="premium-badge status-tone-info">{template.planLevel || plan}</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </UserDashboardLayout>
  );
};

function TemplatePlaceholder({ template }) {
  const theme = template.theme;
  const layout = template.layout;

  const bg = theme?.background?.solidColor || theme?.colorPalette?.pageBackground || "#F5F3EE";
  const pri = theme?.colorPalette?.primary || "#1C1C1C";
  const sec = theme?.colorPalette?.secondary || "#A3844E";
  const text = theme?.colorPalette?.textPrimary || "#1C1C1C";

  const layoutType = layout?.layoutType || "SINGLE_COLUMN";
  const isTwoCol = ["TWO_COLUMN", "LEFT_SIDEBAR", "RIGHT_SIDEBAR"].includes(layoutType);
  const sidebarLeft = layoutType === "LEFT_SIDEBAR";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        flexDirection: "column",
        padding: 14,
        gap: 8,
      }}
    >
      <div
        style={{
          padding: 12,
          borderRadius: 16,
          background: "rgba(255,255,255,0.36)",
          borderBottom: `1px solid ${theme?.colorPalette?.dividerColor || "rgba(0,0,0,0.08)"}`,
        }}
      >
        <div style={{ width: "62%", height: 12, borderRadius: 999, background: pri, marginBottom: 6 }} />
        <div style={{ width: "38%", height: 6, borderRadius: 999, background: sec }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: sidebarLeft ? "row" : isTwoCol ? "row-reverse" : "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div style={{ flex: isTwoCol ? 2 : 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ width: "36%", height: 7, borderRadius: 999, background: pri, opacity: 0.85 }} />
          {[100, 88, 92, 76].map((width, index) => (
            <div
              key={`main-${index}`}
              style={{ width: `${width}%`, height: 5, borderRadius: 999, background: text, opacity: 0.26 }}
            />
          ))}
        </div>

        {isTwoCol ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              borderLeft: !sidebarLeft ? "1px solid rgba(0,0,0,0.08)" : "none",
              borderRight: sidebarLeft ? "1px solid rgba(0,0,0,0.08)" : "none",
              paddingLeft: sidebarLeft ? 0 : 8,
              paddingRight: sidebarLeft ? 8 : 0,
            }}
          >
            <div style={{ width: "58%", height: 7, borderRadius: 999, background: sec, opacity: 0.85 }} />
            {[70, 58, 80, 46].map((width, index) => (
              <div
                key={`side-${index}`}
                style={{ width: `${width}%`, height: 5, borderRadius: 999, background: text, opacity: 0.22 }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TemplatesPage;
