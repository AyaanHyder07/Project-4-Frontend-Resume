import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { dashboardAPI } from "../../api/api";
import {
  FileText, Eye, Globe, Clock, CheckCircle, AlertCircle,
  Plus, ArrowRight, TrendingUp, Zap, MoreHorizontal,
  ExternalLink, Edit3, Trash2
} from "lucide-react";

const STATUS = {
  DRAFT:    { label: "Draft",    color: "#8A8578", bg: "rgba(138,133,120,0.13)", Icon: Clock },
  PENDING:  { label: "Pending",  color: "#C9963A", bg: "rgba(201,150,58,0.13)",  Icon: AlertCircle },
  APPROVED: { label: "Approved", color: "#3A7D44", bg: "rgba(58,125,68,0.13)",   Icon: CheckCircle },
};

const PLAN = {
  FREE:    { color: "#8A8578", bg: "rgba(138,133,120,0.13)" },
  BASIC:   { color: "#1C6EA4", bg: "rgba(28,110,164,0.13)" },
  PRO:     { color: "#7B3FA0", bg: "rgba(123,63,160,0.13)" },
  PREMIUM: { color: "#C9963A", bg: "rgba(201,150,58,0.13)" },
};

const css = {
  btnPrimary: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    textAlign: "center",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
  },
  cardLabel: {
    color: "#666",
    marginTop: "0.5rem",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  resumeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  resumeCard: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
  },
  resumeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  resumeTitle: {
    margin: 0,
    fontSize: "1.2rem",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
  },
  resumeMeta: {
    color: "#666",
    marginBottom: "1rem",
  },
  resumeActions: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  btnSecondary: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  resumeStats: {
    display: "flex",
    justifyContent: "space-between",
    color: "#666",
    fontSize: "0.8rem",
  },
  completionBanner: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "4px",
    padding: "0.5rem",
    marginBottom: "1rem",
    color: "#856404",
    fontSize: "0.9rem",
  },
  btnComplete: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    marginLeft: "auto",
  },
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

  if (loading) return <UserDashboardLayout title="Dashboard" subtitle="Welcome back"><p>Loading...</p></UserDashboardLayout>;
  if (error) return <UserDashboardLayout title="Dashboard" subtitle="Welcome back"><p style={{ color: "red" }}>{error}</p></UserDashboardLayout>;

  const d = data;
  const planCfg = PLAN[d.plan] ?? PLAN.FREE;
  const canCreate = d.totalResumes < d.resumeLimit;

  return (
    <UserDashboardLayout
      title="Dashboard"
      subtitle="Welcome back"
      rightAction={
        canCreate && (
          <button style={css.btnPrimary} onClick={() => navigate("/resumes/new")}>
            <Plus size={14}/> New Resume
          </button>
        )
      }
    >
      {/* Summary Cards */}
      <div style={css.summaryGrid}>
        <div style={css.card}>
          <div style={css.cardValue}>{d.totalResumes ?? 0}</div>
          <div style={css.cardLabel}>Total Resumes</div>
        </div>
        <div style={css.card}>
          <div style={css.cardValue}>{d.publishedCount ?? 0}</div>
          <div style={css.cardLabel}>Published</div>
        </div>
        <div style={css.card}>
          <div style={css.cardValue}>{d.pendingCount ?? 0}</div>
          <div style={css.cardLabel}>Pending Approval</div>
        </div>
        <div style={css.card}>
          <div style={css.cardValue}>{d.totalViews ?? 0}</div>
          <div style={css.cardLabel}>Total Views</div>
        </div>
      </div>

      {/* Recent Resumes */}
      {d.recentResumes?.length > 0 && (
        <div style={css.section}>
          <h3 style={css.sectionTitle}>Recent Resumes</h3>
          <div style={css.resumeGrid}>
            {d.recentResumes.map((r) => {
              const statusCfg = STATUS[r.approvalStatus] ?? STATUS.DRAFT;
              return (
                <div key={r.id} style={css.resumeCard}>
                  <div style={css.resumeHeader}>
                    <h4 style={css.resumeTitle}>{r.title}</h4>
                    <div style={{ ...css.statusBadge, background: statusCfg.bg, color: statusCfg.color }}>
                      <statusCfg.Icon size={12} />
                      {statusCfg.label}
                    </div>
                  </div>
                  <p style={css.resumeMeta}>{r.professionType}</p>
                  {!r.published && (
                    <div style={css.completionBanner}>
                      <AlertCircle size={14} />
                      <span>Resume not completed</span>
                      <button style={css.btnComplete} onClick={() => navigate(`/resumes/${r.id}`)}>
                        Complete Resume
                      </button>
                    </div>
                  )}
                  <div style={css.resumeActions}>
                    {r.published && r.slug && (
                      <a href={`/p/${r.slug}`} target="_blank" rel="noreferrer" style={css.link}>
                        <Globe size={14} /> View Public
                      </a>
                    )}
                    <button style={css.btnSecondary} onClick={() => navigate(`/resumes/${r.id}`)}>
                      <Edit3 size={14} /> Edit
                    </button>
                  </div>
                  <div style={css.resumeStats}>
                    <span><Eye size={12} /> {r.viewCount ?? 0} views</span>
                    <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
}