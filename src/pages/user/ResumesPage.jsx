import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { resumeAPI, dashboardAPI, templateAPI } from "../../api/api";
import {
  Plus, Edit3, Trash2, Globe, Eye, Clock, CheckCircle,
  AlertCircle, MoreHorizontal, ExternalLink, Send,
  EyeOff, ArrowRight, Loader2, FileText
} from "lucide-react";

const STATUS = {
  DRAFT:    { label:"Draft",    color:"#8A8578", bg:"rgba(138,133,120,0.13)", Icon:Clock },
  PENDING:  { label:"Review",   color:"#C9963A", bg:"rgba(201,150,58,0.13)",  Icon:AlertCircle },
  APPROVED: { label:"Approved", color:"#3A7D44", bg:"rgba(58,125,68,0.13)",   Icon:CheckCircle },
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const [creating, setCreating] = useState(false);
  // const [showForm, setShowForm] = useState(false);
  // const [form, setForm] = useState({ title: "", professionType: "", templateId: "" });
  // const [templates, setTemplates] = useState([]);
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

  // useEffect(() => {
  //   // Load templates for creation
  //   templateAPI.getAvailable()
  //     .then((res) => setTemplates(res.data))
  //     .catch(() => console.error("Failed to load templates"));
  // }, []);

  // const handleCreate = () => {
  //   if (!form.title || !form.professionType || !form.templateId) {
  //     alert("Title, profession and template are required.");
  //     return;
  //   }
  //   setCreating(true);
  //   resumeAPI
  //     .create(form)
  //     .then((res) => {
  //       setShowForm(false);
  //       setForm({ title: "", professionType: "", templateId: "" });
  //       load(); // Reload list
  //     })
  //     .catch(() => alert("Failed to create resume."))
  //     .finally(() => setCreating(false));
  // };

  const doSubmit = (id) => {
    resumeAPI
      .submit(id)
      .then(() => {
        setResumes(p => p.map(r => r.id === id ? {...r, approvalStatus:"PENDING"} : r));
      })
      .catch(() => alert("Failed to submit."));
  };

  const doDelete = (id) => {
    if (!window.confirm("Delete this resume?")) return;
    resumeAPI
      .delete(id)
      .then(() => {
        setResumes(p => p.filter(r => r.id !== id));
      })
      .catch(() => alert("Failed to delete."));
  };

  if (loading) return <UserDashboardLayout title="Resumes" subtitle="Manage your resumes"><p>Loading...</p></UserDashboardLayout>;
  if (error) return <UserDashboardLayout title="Resumes" subtitle="Manage your resumes"><p style={{ color: "red" }}>{error}</p></UserDashboardLayout>;

  return (
    <UserDashboardLayout
      title="Resumes"
      subtitle="Manage your resumes"
      rightAction={
        <button onClick={() => navigate('/resumes/new')} style={css.btnPrimary}>
          <Plus size={14}/> New Resume
        </button>
      }
    >
      {/*
      {showForm && (
        <div style={css.modal}>
          <div style={css.modalContent}>
            <h3>Create New Resume</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label>Title</label><br />
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={css.input}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Profession Type</label><br />
              <input
                value={form.professionType}
                onChange={(e) => setForm({ ...form, professionType: e.target.value })}
                style={css.input}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Template</label><br />
              <select
                value={form.templateId}
                onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                style={css.input}
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={handleCreate} disabled={creating} style={css.btnPrimary}>
                {creating ? <Loader2 size={14} /> : <Plus size={14} />} Create
              </button>
              <button onClick={() => setShowForm(false)} style={css.btnSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      */}

      <div style={css.resumeList}>
        {resumes.map((r) => {
          const statusCfg = STATUS[r.approvalStatus] ?? STATUS.DRAFT;
          return (
            <div key={r.id} style={css.resumeRow}>
              <div style={css.resumeInfo}>
                <h4 style={css.resumeTitle}>{r.title}</h4>
                <p style={css.resumeMeta}>{r.professionType}</p>
                <div style={css.resumeStats}>
                  <span><Eye size={12} /> {r.viewCount ?? 0} views</span>
                  <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={css.resumeStatus}>
                <div style={{ ...css.statusBadge, background: statusCfg.bg, color: statusCfg.color }}>
                  <statusCfg.Icon size={12} />
                  {statusCfg.label}
                </div>
                {r.published && <Globe size={12} style={{ color: "#3A7D44" }} />}
              </div>
              <div style={css.resumeActions}>
                <button style={css.iconBtn} onClick={() => navigate(`/resumes/${r.id}`)}>
                  <Edit3 size={14} />
                </button>
                {r.approvalStatus === "DRAFT" && (
                  <button style={css.iconBtn} onClick={() => doSubmit(r.id)}>
                    <Send size={14} />
                  </button>
                )}
                <button style={css.iconBtn} onClick={() => doDelete(r.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </UserDashboardLayout>
  );
}

const css = {
  btnPrimary: {
    background: "#7B3FA0",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  btnSecondary: {
    background: "#f0f0f0",
    color: "#333",
    border: "1px solid #ddd",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    minWidth: "400px",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  resumeList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  resumeRow: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1rem",
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#333",
  },
  resumeMeta: {
    color: "#666",
    fontSize: "0.9rem",
    margin: "0.25rem 0",
  },
  resumeStats: {
    display: "flex",
    gap: "1rem",
    color: "#888",
    fontSize: "0.8rem",
  },
  resumeStatus: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  resumeActions: {
    display: "flex",
    gap: "0.5rem",
  },
  iconBtn: {
    background: "none",
    border: "1px solid #ddd",
    padding: "0.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};