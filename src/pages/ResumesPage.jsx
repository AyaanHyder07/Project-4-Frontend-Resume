/**
 * ResumesPage.jsx
 * Route: /resumes
 *
 * Wrapped in UserDashboardLayout.
 * Topbar rightAction = "New Portfolio" button → opens ResumeStudio.
 *
 * Lists all user resumes from GET /api/resumes
 * Resume entity fields used:
 *   id, title, professionType, published, approvalStatus(DRAFT/PENDING/APPROVED),
 *   visibility(PRIVATE/PUBLIC), slug, viewCount, createdAt, updatedAt,
 *   templateId, themeId, version
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Globe, Lock, Eye, FileText,
  Clock, CheckCircle, AlertCircle,
  Trash2, Send, ExternalLink, PenLine,
  Loader2, RefreshCw,
} from "lucide-react";
import UserDashboardLayout from "../components/user/UserDashboardLayout";
import ResumeStudio from "./users/ResumeStudio";
import { resumeAPI } from "./users/resumeStudioAPI";


/* ── Status helpers ──────────────────────────────────────────────── */
const APPROVAL_META = {
  DRAFT: {
    label: "Draft",
    color: "#8A8578",
    bg: "rgba(138,133,120,0.12)",
    icon: <FileText size={10} />,
  },
  PENDING: {
    label: "Pending Review",
    color: "#C9963A",
    bg: "rgba(201,150,58,0.12)",
    icon: <Clock size={10} />,
  },
  APPROVED: {
    label: "Approved",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: <CheckCircle size={10} />,
  },
  REJECTED: {
    label: "Rejected",
    color: "#B43C3C",
    bg: "rgba(180,60,60,0.12)",
    icon: <AlertCircle size={10} />,
  },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function ResumesPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studioOpen, setStudioOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [toast, setToast] = useState(null);

  /* ── Load resumes ─────────────────────────────────────────────── */
  const load = () => {
    setLoading(true);
    resumeAPI
      .getAll()
      .then((data) => setResumes(Array.isArray(data) ? data : []))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Delete ───────────────────────────────────────────────────── */
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      notify("Portfolio deleted");
    } catch {
      notify("Failed to delete", false);
    } finally {
      setDeleting(null);
    }
  };

  /* ── Submit for approval ──────────────────────────────────────── */
  const handleSubmit = async (id) => {
    setSubmitting(id);
    try {
      const updated = await resumeAPI.submit(id);
      setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
      notify("Submitted for review!");
    } catch (e) {
      notify(e?.message || "Submit failed", false);
    } finally {
      setSubmitting(null);
    }
  };

  /* ── NEW PORTFOLIO BUTTON (topbar right action) ───────────────── */
  const NewBtn = (
    <button
      onClick={() => setStudioOpen(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: "#1C1C1C",
        color: "#F0EDE6",
        border: "none",
        borderRadius: 10,
        padding: "9px 18px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 2px 10px rgba(28,28,28,0.2)",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <Plus size={15} />
      New Portfolio
    </button>
  );

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <UserDashboardLayout
      title="My Portfolios"
      subtitle="Create, manage and publish your resume portfolios"
      rightAction={NewBtn}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 99999,
            background: toast.ok ? "#1C1C1C" : "#B43C3C",
            color: "#F0EDE6",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
            fontFamily: "'DM Sans', sans-serif",
            animation: "toastIn 0.28s both",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Studio overlay ───────────────────────────────────────── */}
      {studioOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(28,28,28,0.55)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "24px 16px 40px",
          }}
        >
          <div
            style={{
              background: "#F5F3EE",
              borderRadius: 20,
              width: "100%",
              maxWidth: 1100,
              padding: "24px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            {/* Studio header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: "2px solid #E5E3DE",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 24,
                    fontWeight: 400,
                    color: "#1C1C1C",
                    margin: 0,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Create New Portfolio
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "#8A8578",
                    margin: "4px 0 0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Follow the steps to build your perfect resume portfolio
                </p>
              </div>
            </div>

            <ResumeStudio
              onClose={() => {
                setStudioOpen(false);
                load(); // Refresh list after creation
              }}
            />
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 0",
            gap: 12,
          }}
        >
          <Loader2
            size={24}
            style={{ animation: "spin 1s linear infinite", color: "#7B3FA0" }}
          />
          <span
            style={{
              fontSize: 13,
              color: "#8A8578",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Loading your portfolios…
          </span>
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState onCreate={() => setStudioOpen(true)} />
      ) : (
        <>
          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#8A8578",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {resumes.length} portfolio{resumes.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={load}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: "1px solid #E5E3DE",
                borderRadius: 8,
                padding: "5px 11px",
                fontSize: 11,
                color: "#8A8578",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {/* Resume cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
                onDelete={() => handleDelete(resume.id, resume.title)}
                onSubmit={() => handleSubmit(resume.id)}
                onView={() =>
                  resume.slug && window.open(`/p/${resume.slug}`, "_blank")
                }
                deleting={deleting === resume.id}
                submitting={submitting === resume.id}
              />
            ))}
          </div>
        </>
      )}
    </UserDashboardLayout>
  );
}

/* ─── Resume Card ──────────────────────────────────────────────── */
function ResumeCard({
  resume,
  onEdit,
  onDelete,
  onSubmit,
  onView,
  deleting,
  submitting,
}) {
  const [hov, setHov] = useState(false);
  const approval = APPROVAL_META[resume.approvalStatus] || APPROVAL_META.DRAFT;
  const isPublished = resume.published;
  const canSubmit = resume.approvalStatus === "DRAFT";
  const canView = isPublished && resume.slug;

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1.5px solid #E5E3DE",
        overflow: "hidden",
        transition: "all 0.25s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov
          ? "0 10px 32px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Top color bar */}
      <div
        style={{
          height: 4,
          background: isPublished
            ? "linear-gradient(90deg, #22c55e, #4A6FA5)"
            : "linear-gradient(90deg, #E5E3DE, #D5D3CE)",
        }}
      />

      <div style={{ padding: "16px 18px" }}>
        {/* Title + visibility */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1C1C1C",
              lineHeight: 1.2,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {resume.title || "Untitled Portfolio"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 600,
              color: isPublished ? "#22c55e" : "#8A8578",
              background: isPublished
                ? "rgba(34,197,94,0.1)"
                : "rgba(138,133,120,0.1)",
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {isPublished ? <Globe size={10} /> : <Lock size={10} />}
            {isPublished ? "Public" : "Private"}
          </div>
        </div>

        {/* Profession */}
        <div
          style={{ fontSize: 11.5, color: "#5A5550", marginBottom: 10 }}
        >
          {resume.professionType || "—"}
        </div>

        {/* Status + meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Approval status */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              color: approval.color,
              background: approval.bg,
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {approval.icon}
            {approval.label}
          </span>

          {/* View count */}
          {resume.viewCount > 0 && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10,
                color: "#8A8578",
              }}
            >
              <Eye size={9} /> {resume.viewCount}
            </span>
          )}

          {/* Version */}
          <span style={{ fontSize: 9.5, color: "#B0AB9E" }}>
            v{resume.version || 1}
          </span>
        </div>

        {/* Dates */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
            fontSize: 10,
            color: "#8A8578",
          }}
        >
          <span>Created {formatDate(resume.createdAt)}</span>
          <span>Updated {formatDate(resume.updatedAt)}</span>
        </div>

        {/* Public slug */}
        {resume.slug && (
          <div
            style={{
              fontSize: 10,
              color: "#4A6FA5",
              background: "#F0F4F8",
              padding: "5px 9px",
              borderRadius: 7,
              marginBottom: 14,
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            /p/{resume.slug}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {/* Edit */}
          <button
            onClick={onEdit}
            style={{
              ...btnStyle,
              background: "#1C1C1C",
              color: "#F0EDE6",
              flex: 1,
            }}
          >
            <PenLine size={12} /> Edit
          </button>

          {/* Submit for review */}
          {canSubmit && (
            <button
              onClick={onSubmit}
              disabled={submitting}
              style={{
                ...btnStyle,
                background: "#F0EDE6",
                color: "#1C1C1C",
                flex: 1,
              }}
            >
              {submitting ? (
                <Loader2
                  size={11}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Send size={11} />
              )}
              Submit
            </button>
          )}

          {/* View public */}
          {canView && (
            <button
              onClick={onView}
              style={{ ...btnStyle, background: "#F0EDE6", color: "#1C1C1C" }}
            >
              <ExternalLink size={11} />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              ...btnStyle,
              background: "rgba(180,60,60,0.08)",
              color: "#B43C3C",
            }}
          >
            {deleting ? (
              <Loader2
                size={11}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Trash2 size={11} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  border: "none",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap",
};

/* ─── Empty State ──────────────────────────────────────────────── */
function EmptyState({ onCreate }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        border: "2px dashed #E5E3DE",
        borderRadius: 20,
        background: "#FAFAF8",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
      <h3
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22,
          fontWeight: 400,
          color: "#1C1C1C",
          margin: "0 0 8px",
          letterSpacing: "-0.3px",
        }}
      >
        No portfolios yet
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "#8A8578",
          margin: "0 0 24px",
          lineHeight: 1.6,
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 340,
        }}
      >
        Create your first portfolio — choose a template, theme, and start
        filling in your experience, projects, and skills.
      </p>
      <button
        onClick={onCreate}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1C1C1C",
          color: "#F0EDE6",
          border: "none",
          borderRadius: 11,
          padding: "12px 24px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Plus size={15} /> Create Your First Portfolio
      </button>
    </div>
  );
}