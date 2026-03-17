import { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/api";

const STATUS_OPTIONS = ["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"];

const STATUS_META = {
  DRAFT: "status-tone-neutral",
  PENDING: "status-tone-warn",
  APPROVED: "status-tone-success",
  REJECTED: "status-tone-danger",
};

const AdminResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const load = (status) => {
    setLoading(true);
    const call = status === "ALL" ? adminAPI.getAllResumes() : adminAPI.getByStatus(status);
    call
      .then((res) => setResumes(res.data))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleUnpublish = (id) => {
    adminAPI
      .forceUnpublish(id)
      .then(() => {
        notify("Resume unpublished.");
        load(filter);
      })
      .catch(() => notify("Failed to unpublish resume."));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Permanently delete this resume?")) return;
    adminAPI
      .delete(id)
      .then(() => {
        notify("Resume deleted.");
        load(filter);
      })
      .catch(() => notify("Failed to delete resume."));
  };

  const publishedCount = useMemo(
    () => resumes.filter((resume) => resume.published).length,
    [resumes]
  );

  return (
    <AdminDashboardLayout title="All Resumes" subtitle="Manage every resume in the system">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Resume Library</div>
          <h2 className="page-title">Every submission, now in a cleaner control surface.</h2>
          <p className="page-lead">
            Filter by approval status, review publication state, and take action without
            the cramped table styling from before.
          </p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <span className="premium-badge status-tone-info">{resumes.length} visible in this view</span>
            <span className="premium-badge status-tone-success">{publishedCount} published</span>
          </div>
        </section>

        {toast ? (
          <section className="premium-panel" style={{ padding: 18 }}>
            <span className="premium-badge status-tone-info">{toast}</span>
          </section>
        ) : null}

        <section className="premium-panel">
          <div className="page-actions">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                className={`premium-btn ${filter === status ? "primary" : "secondary"}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="premium-panel">
            <p className="premium-muted">Loading resumes...</p>
          </section>
        ) : resumes.length === 0 ? (
          <section className="premium-panel">
            <div className="premium-empty">
              <h3 style={{ marginBottom: 10, fontSize: "1.7rem" }}>No resumes found</h3>
              <p>There are no records for the current filter.</p>
            </div>
          </section>
        ) : (
          <section className="premium-table">
            <table>
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
                {resumes.map((resume) => (
                  <tr key={resume.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{resume.title}</div>
                    </td>
                    <td className="premium-muted">{resume.professionType || "-"}</td>
                    <td>
                      <span className={`premium-badge ${STATUS_META[resume.approvalStatus] || STATUS_META.DRAFT}`}>
                        {resume.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`premium-badge ${resume.published ? "status-tone-success" : "status-tone-neutral"}`}>
                        {resume.published ? "Published" : "Private"}
                      </span>
                    </td>
                    <td className="premium-muted" style={{ fontFamily: "var(--font-mono)" }}>
                      {resume.slug || "-"}
                    </td>
                    <td>
                      <div className="panel-actions">
                        {resume.published ? (
                          <button className="premium-btn secondary" onClick={() => handleUnpublish(resume.id)}>
                            Unpublish
                          </button>
                        ) : null}
                        <button className="premium-btn ghost" onClick={() => handleDelete(resume.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminResumesPage;
