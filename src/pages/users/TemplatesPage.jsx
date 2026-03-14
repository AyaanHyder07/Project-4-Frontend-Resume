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
            style={{ border: "1px solid #ccc", padding: "1rem" }}
          >
            {t.thumbnailUrl && (
              <img
                src={t.thumbnailUrl}
                alt={t.name}
                style={{ width: "100%", height: "140px", objectFit: "cover", marginBottom: "0.5rem" }}
              />
            )}
            <div><strong>{t.name}</strong></div>
            <div style={{ fontSize: "0.85rem", color: "#555" }}>{t.description}</div>
            <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Plan: {t.planLevel || "FREE"} | Profession: {t.professionTags?.length ? t.professionTags.join(", ") : "Any"}
            </div>
          </div>
        ))}
      </div>
    </UserDashboardLayout>
  );
};

export default TemplatesPage;