import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/api";

const AdminDashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI
      .getAllResumes()
      .then((res) => setResumes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: resumes.length,
    pending: resumes.filter((resume) => resume.approvalStatus === "PENDING").length,
    approved: resumes.filter((resume) => resume.approvalStatus === "APPROVED").length,
    rejected: resumes.filter((resume) => resume.approvalStatus === "REJECTED").length,
    published: resumes.filter((resume) => resume.published).length,
  };

  return (
    <AdminDashboardLayout title="Dashboard" subtitle="System overview">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Admin Overview</div>
          <h2 className="page-title">A calmer control room for the platform.</h2>
          <p className="page-lead">
            Review submissions, publication status, and the overall health of the
            resume library from one polished admin view.
          </p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <button className="premium-btn primary" onClick={() => navigate("/admin/pending")}>
              Review Pending
            </button>
            <button className="premium-btn secondary" onClick={() => navigate("/admin/resumes")}>
              All Resumes
            </button>
          </div>
        </section>

        {loading ? (
          <section className="premium-panel">
            <p className="premium-muted">Loading dashboard...</p>
          </section>
        ) : (
          <>
            <section className="premium-grid metrics">
              <KpiCard label="Total" value={counts.total} tone="status-tone-neutral" />
              <KpiCard label="Pending" value={counts.pending} tone="status-tone-warn" />
              <KpiCard label="Approved" value={counts.approved} tone="status-tone-success" />
              <KpiCard label="Rejected" value={counts.rejected} tone="status-tone-danger" />
              <KpiCard label="Published" value={counts.published} tone="status-tone-info" />
            </section>

            <section className="premium-panel">
              <div className="page-eyebrow">Quick Actions</div>
              <h3 style={{ margin: 0, fontSize: "2rem" }}>Move through admin tasks with less friction</h3>
              <div className="panel-actions" style={{ marginTop: 20 }}>
                <button className="premium-btn primary" onClick={() => navigate("/admin/pending")}>
                  Review Pending ({counts.pending})
                </button>
                <button className="premium-btn secondary" onClick={() => navigate("/admin/resumes")}>
                  Resume Library
                </button>
                <button className="premium-btn secondary" onClick={() => navigate("/admin/themes")}>
                  Theme Builder
                </button>
                <button className="premium-btn ghost" onClick={() => navigate("/admin/layouts")}>
                  Layouts
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

const KpiCard = ({ label, value, tone }) => (
  <article className="premium-card kpi">
    <span className="premium-meta">{label}</span>
    <strong className="premium-kpi-value">{value}</strong>
    <span className={`premium-badge ${tone}`}>{label} status</span>
  </article>
);

export default AdminDashboard;
