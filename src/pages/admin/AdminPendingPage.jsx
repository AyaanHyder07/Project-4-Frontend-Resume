import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/api";

const AdminPendingPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const load = () => {
    setLoading(true);
    adminAPI
      .getPending()
      .then((res) => setResumes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const handleApprove = (id) => {
    adminAPI
      .approve(id)
      .then(() => {
        notify("Approved and published.", "success");
        load();
      })
      .catch(() => notify("Failed to approve.", "danger"));
  };

  const handleReject = (id) => {
    adminAPI
      .reject(id)
      .then(() => {
        notify("Resume rejected.", "danger");
        load();
      })
      .catch(() => notify("Failed to reject.", "danger"));
  };

  const toastTone = toast.type === "danger" ? "status-tone-danger" : "status-tone-success";

  return (
    <AdminDashboardLayout title="Pending Approvals" subtitle="Review submitted resumes">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Moderation Queue</div>
          <h2 className="page-title">Review submissions with more breathing room.</h2>
          <p className="page-lead">
            Approve strong submissions quickly, reject weak ones clearly, and keep the
            publishing workflow feeling considered instead of cramped.
          </p>
        </section>

        {toast.msg ? (
          <section className="premium-panel" style={{ padding: 18 }}>
            <span className={`premium-badge ${toastTone}`}>{toast.msg}</span>
          </section>
        ) : null}

        {loading ? (
          <section className="premium-panel">
            <p className="premium-muted">Loading pending submissions...</p>
          </section>
        ) : resumes.length === 0 ? (
          <section className="premium-panel">
            <div className="premium-empty">
              <h3 style={{ marginBottom: 10, fontSize: "1.7rem" }}>No pending resumes</h3>
              <p>The queue is clear for now.</p>
            </div>
          </section>
        ) : (
          <section className="premium-list">
            {resumes.map((resume) => (
              <article className="premium-item" key={resume.id}>
                <div className="premium-item-stack">
                  <h3 className="premium-item-title">{resume.title}</h3>
                  <span className="premium-muted">{resume.professionType || "Professional Resume"}</span>
                  <div className="page-actions">
                    <span className="premium-badge status-tone-info">User: {resume.userId}</span>
                    <span className="premium-badge status-tone-neutral">
                      Updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>
                <div className="panel-actions">
                  <button className="premium-btn primary" onClick={() => handleApprove(resume.id)}>
                    Approve
                  </button>
                  <button className="premium-btn secondary" onClick={() => handleReject(resume.id)}>
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminPendingPage;
