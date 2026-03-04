import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { resumeAPI, dashboardAPI } from "../../api/endpoints";
import { templateAPI } from "../../api/endpoints";


const ResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // New resume form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", professionType: "" });
  const [templates, setTemplates] = useState([]);

  const navigate = useNavigate();

  // Load all resumes from dashboard endpoint (has recentResumes + full list)
  const load = () => {
    setLoading(true);
    dashboardAPI
      .get()
      .then((res) => setResumes(res.data.recentResumes ?? []))
      .catch(() => setError("Failed to load resumes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
  templateAPI
    .getAvailable("FREE")   // 🔥 plan-based filter
    .then((res) => setTemplates(res.data))
    .catch((err) => console.error("Failed to load templates", err));
}, []);

  const handleCreate = () => {
if (!form.title || !form.professionType || !form.templateId) {
  alert("Title, profession and template are required.");
  return;
}
    setCreating(true);
    resumeAPI
      .create(form)
      .then((res) => {
        setShowForm(false);
        setForm({ title: "", professionType: "", templateId: "" });
        navigate(`/resumes/${res.data.id}`);
      })
      .catch(() => alert("Failed to create resume."))
      .finally(() => setCreating(false));
  };

  const handleDelete = (resumeId) => {
    if (!window.confirm("Delete this resume?")) return;
    resumeAPI
      .delete(resumeId)
      .then(() => load())
      .catch(() => alert("Failed to delete."));
  };

  const handleSubmit = (resumeId) => {
    resumeAPI
      .submit(resumeId)
      .then(() => { alert("Submitted for approval!"); load(); })
      .catch(() => alert("Failed to submit."));
  };

  const handleUnpublish = (resumeId) => {
    resumeAPI
      .unpublish(resumeId)
      .then(() => load())
      .catch(() => alert("Failed to unpublish."));
  };

  return (
    <UserDashboardLayout
      title="My Resumes"
      rightAction={
        <button onClick={() => setShowForm(true)}>+ New Resume</button>
      }
    >
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Create Form */}
      {showForm && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h3>Create New Resume</h3>
          <div>
            <label>Title</label><br />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. My Portfolio"
            />
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <label>Profession Type</label><br />
            <input
              value={form.professionType}
              onChange={(e) => setForm({ ...form, professionType: e.target.value })}
              placeholder="e.g. DESIGNER, DEVELOPER"
            />
          </div>
          <div style={{ marginTop: "0.5rem" }}>
  <label>Template</label><br />
  <select
    value={form.templateId || ""}
    onChange={(e) =>
      setForm({ ...form, templateId: e.target.value })
    }
  >
    <option value="">-- Select Template --</option>
    {templates.map(t => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
    ))}
  </select>
</div>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ marginLeft: "0.5rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resumes Table */}
      {!loading && resumes.length === 0 && <p>No resumes yet. Create one!</p>}

      {resumes.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Profession</th>
              <th>Approval</th>
              <th>Published</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.professionType}</td>
                <td>{r.approvalStatus}</td>
                <td>{r.published ? "Yes" : "No"}</td>
                <td>{r.slug || "—"}</td>
                <td style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <button onClick={() => navigate(`/resumes/${r.id}`)}>
                    Edit
                  </button>

                  {/* Submit only if DRAFT */}
                  {r.approvalStatus === "DRAFT" && (
                    <button onClick={() => handleSubmit(r.id)}>Submit</button>
                  )}

                  {/* Unpublish if published */}
                  {r.published && (
                    <button onClick={() => handleUnpublish(r.id)}>Unpublish</button>
                  )}

                  {/* View public if published */}
                  {r.published && r.slug && (
                    <button onClick={() => navigate(`/p/${r.slug}`)}>
                      View
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </UserDashboardLayout>
  );
};

export default ResumesPage;
