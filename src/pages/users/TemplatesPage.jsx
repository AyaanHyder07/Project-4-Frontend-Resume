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

  useEffect(() => { load(); }, [plan]);

  return (
    <UserDashboardLayout title="Templates" subtitle="Browse and apply templates">
      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <label>Plan</label><br />
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLAN_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Profession (optional)</label><br />
          <input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="e.g. DESIGNER"
          />
        </div>
        <div style={{ alignSelf: "flex-end" }}>
          <button onClick={load}>Search</button>
        </div>
      </div>

      {loading && <p>Loading templates...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && templates.length === 0 && <p>No templates found.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {templates.map((t) => (
          <div
            key={t.id}
            style={{ 
              border: "1px solid #E5E3DE", 
              borderRadius: "12px",
              overflow: "hidden", 
              background: "#fff",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ height: "140px", borderBottom: "1px solid #E5E3DE" }}>
              {t.previewImageUrl ? (
                <img
                  src={t.previewImageUrl}
                  alt={t.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <TemplatePlaceholder template={t} />
              )}
            </div>
            <div style={{ padding: "12px" }}>
              <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{t.name}</div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", minHeight: "36px" }}>{t.description}</div>
              <div style={{ 
                fontSize: "10px", 
                backgroundColor: "#F0EDE6", 
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600
              }}>
                {t.planLevel || "FREE"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </UserDashboardLayout>
  );
};

// Extracted from StepChooseTemplate
function TemplatePlaceholder({ template }) {
  const t = template.theme;
  const l = template.layout;

  const bg = t?.background?.solidColor || t?.colorPalette?.pageBackground || "#F5F3EE";
  const pri = t?.colorPalette?.primary || "#1C1C1C";
  const sec = t?.colorPalette?.secondary || "#4A6FA5";
  const text = t?.colorPalette?.textPrimary || "#1C1C1C";
  
  const layoutType = l?.layoutType || "SINGLE_COLUMN";
  const isTwoCol = layoutType === "TWO_COLUMN" || layoutType === "LEFT_SIDEBAR" || layoutType === "RIGHT_SIDEBAR";
  const sidebarLeft = layoutType === "LEFT_SIDEBAR";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        flexDirection: "column",
        padding: 8,
        gap: 6,
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <div style={{
        backgroundColor: t?.colorPalette?.surfaceBackground || "transparent",
        borderRadius: t?.effects?.cardBorderRadius || 0,
        padding: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: layoutType === "CENTERED" ? "center" : "flex-start",
        borderBottom: `1px solid ${t?.colorPalette?.dividerColor || 'transparent'}`
      }}>
        <div style={{ width: "60%", height: 10, background: pri, borderRadius: 2, marginBottom: 4 }} />
        <div style={{ width: "40%", height: 5, background: sec, borderRadius: 2 }} />
      </div>

      <div style={{
        display: "flex",
        flexDirection: sidebarLeft ? "row" : (isTwoCol ? "row-reverse" : "column"),
        gap: 6,
        flex: 1
      }}>
        <div style={{ flex: isTwoCol ? 2 : 1, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ width: "30%", height: 6, background: pri, borderRadius: 2, opacity: 0.8 }} />
          {[100, 85, 90].map((w, i) => (
             <div key={`m1-${i}`} style={{ width: `${w}%`, height: 4, background: text, opacity: 0.3, borderRadius: 2 }} />
          ))}
          <div style={{ width: "40%", height: 6, background: pri, borderRadius: 2, opacity: 0.8, marginTop: 4 }} />
          {[95, 80].map((w, i) => (
             <div key={`m2-${i}`} style={{ width: `${w}%`, height: 4, background: text, opacity: 0.3, borderRadius: 2 }} />
          ))}
        </div>

        {isTwoCol && (
          <div style={{
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: 5,
            paddingLeft: sidebarLeft ? 0 : 6,
            paddingRight: sidebarLeft ? 6 : 0,
            borderLeft: !sidebarLeft ? `1px solid ${t?.colorPalette?.dividerColor || 'rgba(0,0,0,0.1)'}` : 'none',
            borderRight: sidebarLeft ? `1px solid ${t?.colorPalette?.dividerColor || 'rgba(0,0,0,0.1)'}` : 'none'
          }}>
             <div style={{ width: "60%", height: 6, background: sec, borderRadius: 2, opacity: 0.8 }} />
             {[70, 60, 80, 50].map((w, i) => (
                 <div key={`s-${i}`} style={{ width: `${w}%`, height: 4, background: text, opacity: 0.3, borderRadius: 2 }} />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesPage;