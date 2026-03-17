import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock3,
  Edit3,
  Eye,
  Globe,
  Plus,
} from "lucide-react";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { dashboardAPI } from "../../api/api";

const STATUS = {
  DRAFT: { label: "Draft", className: "status-tone-neutral", Icon: Clock3 },
  PENDING: { label: "Pending", className: "status-tone-warn", Icon: AlertCircle },
  APPROVED: { label: "Approved", className: "status-tone-success", Icon: CheckCircle },
  REJECTED: { label: "Rejected", className: "status-tone-danger", Icon: AlertCircle },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI
      .get()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const d = data ?? {};
  const recent = d.recentResumes ?? [];
  const canCreate = (d.totalResumes ?? 0) < (d.resumeLimit ?? Infinity);

  return (
    <UserDashboardLayout
      title="Dashboard"
      subtitle="Premium command center"
      rightAction={
        canCreate ? (
          <button className="premium-btn primary" onClick={() => navigate("/resumes")}>
            <Plus size={14} />
            New Portfolio
          </button>
        ) : null
      }
    >
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Overview</div>
          <h2 className="page-title">A sharper view of your professional presence.</h2>
          <p className="page-lead">
            Review what is live, what needs attention, and where your portfolio is
            attracting interest.
          </p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <button className="premium-btn primary" onClick={() => navigate("/resumes")}>
              Manage Portfolios
            </button>
            <button className="premium-btn secondary" onClick={() => navigate("/analytics")}>
              View Analytics
            </button>
          </div>
        </section>

        {loading && (
          <section className="premium-panel">
            <p className="premium-muted">Loading dashboard...</p>
          </section>
        )}

        {error && (
          <section className="premium-panel">
            <p className="premium-muted" style={{ color: "var(--wine)" }}>{error}</p>
          </section>
        )}

        {!loading && !error && (
          <>
            <section className="premium-grid metrics">
              <article className="premium-card kpi">
                <span className="premium-meta">Total Portfolios</span>
                <strong className="premium-kpi-value">{d.totalResumes ?? 0}</strong>
                <span className="premium-muted">All professional profiles in your library</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Published</span>
                <strong className="premium-kpi-value">{d.publishedCount ?? 0}</strong>
                <span className="premium-muted">Visible portfolio pages live to the world</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Pending Approval</span>
                <strong className="premium-kpi-value">{d.pendingCount ?? 0}</strong>
                <span className="premium-muted">Submissions waiting for review</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Total Views</span>
                <strong className="premium-kpi-value">{d.totalViews ?? 0}</strong>
                <span className="premium-muted">Signals across all published pages</span>
              </article>
            </section>

            <section className="premium-panel">
              <div className="page-actions" style={{ justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div className="page-eyebrow">Recent Work</div>
                  <h3 style={{ margin: 0, fontSize: "2rem" }}>Latest portfolios</h3>
                </div>
                <button className="premium-btn ghost" onClick={() => navigate("/resumes")}>
                  See All
                  <ArrowRight size={14} />
                </button>
              </div>

              {recent.length === 0 ? (
                <div className="premium-empty">
                  <h4 style={{ marginBottom: 10, fontSize: "1.6rem" }}>No portfolios yet</h4>
                  <p>Start your first one from the portfolios page and build a polished public profile.</p>
                </div>
              ) : (
                <div className="premium-grid cards">
                  {recent.map((resume) => {
                    const status = STATUS[resume.approvalStatus] ?? STATUS.DRAFT;
                    const StatusIcon = status.Icon;

                    return (
                      <article className="premium-card" key={resume.id}>
                        <div className="panel-actions" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: "1.5rem" }}>{resume.title}</h4>
                            <p className="premium-muted" style={{ marginTop: 6 }}>
                              {resume.professionType || "Professional Resume"}
                            </p>
                          </div>
                          <span className={`premium-badge ${status.className}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>

                        {!resume.published && (
                          <div className="premium-card" style={{ padding: 16, marginBottom: 16, borderRadius: 18 }}>
                            <div className="page-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
                              <span className="premium-muted">This portfolio is not published yet.</span>
                              <button
                                className="premium-btn secondary"
                                onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                              >
                                Complete It
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="panel-actions">
                          {resume.published && resume.slug ? (
                            <a
                              className="premium-link-btn ghost"
                              href={`/p/${resume.slug}`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <Globe size={14} />
                              Public Page
                            </a>
                          ) : null}
                          <button
                            className="premium-btn secondary"
                            onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        </div>

                        <div className="page-actions" style={{ justifyContent: "space-between", marginTop: 18 }}>
                          <span className="premium-badge status-tone-info">
                            <Eye size={12} />
                            {resume.viewCount ?? 0} views
                          </span>
                          <span className="premium-muted">
                            Updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : "recently"}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </UserDashboardLayout>
  );
}
