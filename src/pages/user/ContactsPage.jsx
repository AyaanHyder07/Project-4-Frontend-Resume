import { useState, useEffect, useCallback } from "react";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";


/* ─────────────────────────────────────────────────────────────
   API helpers — adjust BASE_URL / auth header to your setup
   ───────────────────────────────────────────────────────────── */
const BASE_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("token"); // adjust if you store JWT differently
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ─────────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────────── */
const FILTERS = ["ALL", "NEW", "READ", "REPLIED", "ARCHIVED"];

const STATUS_META = {
  NEW:      { label: "New",      dot: "#C9A96E", bg: "rgba(201,169,110,0.13)", text: "#B8893E" },
  READ:     { label: "Read",     dot: "#8A8578", bg: "rgba(138,133,120,0.11)", text: "#6a6a6a" },
  REPLIED:  { label: "Replied",  dot: "#6EAA8F", bg: "rgba(110,170,143,0.13)", text: "#4D8C72" },
  ARCHIVED: { label: "Archived", dot: "#4a4a4a", bg: "rgba(74,74,74,0.10)",   text: "#4a4a4a" },
};

/* ─────────────────────────────────────────────────────────────
   Tiny helpers
   ───────────────────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ─────────────────────────────────────────────────────────────
   Inline SVG Icons (zero external deps)
   ───────────────────────────────────────────────────────────── */
const Ic = {
  Inbox:   () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Trash:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  Reply:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>,
  Archive: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  Mail:    () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:   () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Close:   () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Dot:     ({ color }) => <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />,
};

/* ─────────────────────────────────────────────────────────────
   Shared sub-components
   ───────────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.READ;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: m.bg, color: m.text,
    }}>
      <Ic.Dot color={m.dot} />
      {m.label}
    </span>
  );
}

function FilterPill({ label, active, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
      border: `1px solid ${active ? "#1C1C1C" : "#D8D3CA"}`,
      background: active ? "#1C1C1C" : "transparent",
      color: active ? "#F0EDE6" : "#8A8578",
      transition: "all 0.15s ease",
      display: "flex", alignItems: "center", gap: 5,
    }}>
      {label}
      {count !== undefined && (
        <span style={{ opacity: 0.6, fontSize: 11 }}>{count}</span>
      )}
    </button>
  );
}

function ActionBtn({ onClick, variant = "secondary", children, disabled }) {
  const palette = {
    primary:   { bg: "#1C1C1C",              color: "#F0EDE6" },
    secondary: { bg: "#E0DCD3",              color: "#3a3a3a" },
    danger:    { bg: "rgba(200,70,70,0.09)", color: "#B84040" },
  };
  const p = palette[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "none", transition: "all 0.15s ease",
      background: p.bg, color: p.color, opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   MessageCard
   ───────────────────────────────────────────────────────────── */
function MessageCard({ msg, isSelected, delay, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? "#1C1C1C" : hovered ? "#E8E4DA" : "#ECEAE2",
        border: `1px solid ${isSelected ? "#1C1C1C" : "#D8D3CA"}`,
        borderRadius: 14, padding: "15px 16px", cursor: "pointer",
        transition: "all 0.17s ease", position: "relative",
        transform: hovered && !isSelected ? "translateY(-1px)" : "none",
        boxShadow: isSelected
          ? "0 8px 28px rgba(28,28,28,0.16)"
          : hovered ? "0 4px 14px rgba(28,28,28,0.07)" : "none",
        animation: `fadeUp 0.35s ease ${delay}s both`,
      }}
    >
      {/* Gold dot — unread indicator */}
      {msg.status === "NEW" && !isSelected && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#C9A96E", position: "absolute", top: 16, right: 15,
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: isSelected ? "#F0EDE6" : "#1C1C1C" }}>
          {msg.senderName}
        </span>
        <span style={{ fontSize: 11, color: isSelected ? "#6a6a6a" : "#A09890", marginLeft: 8, flexShrink: 0 }}>
          {timeAgo(msg.receivedAt)}
        </span>
      </div>

      <p style={{ fontSize: 12.5, fontWeight: 500, color: isSelected ? "#D8D3CA" : "#3a3a3a", margin: "0 0 4px" }}>
        {msg.subject}
      </p>

      <p style={{
        fontSize: 12, color: isSelected ? "#6a6a6a" : "#8A8578", lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {msg.message}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <StatusPill status={msg.status} />
        <span style={{ fontSize: 11, color: isSelected ? "#5a5a5a" : "#A09890", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {msg.senderEmail}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DetailPanel
   ───────────────────────────────────────────────────────────── */
function DetailPanel({ msg, actioning, onClose, onMarkStatus, onDelete }) {
  return (
    <div style={{ animation: "fadeUp 0.28s ease" }}>

      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 18, right: 18, background: "transparent",
        border: "1px solid #D8D3CA", borderRadius: 8, padding: "5px 7px",
        cursor: "pointer", color: "#5a5a5a", display: "flex", alignItems: "center",
      }}>
        <Ic.Close />
      </button>

      {/* Sender header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "#1C1C1C",
            color: "#F0EDE6", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 500,
            flexShrink: 0, marginRight: 13,
          }}>
            {initials(msg.senderName)}
          </div>
          <div>
            <div style={{ fontSize: 17, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: "#1C1C1C", marginBottom: 5 }}>
              {msg.senderName}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a5a5a" }}>
                <Ic.Mail /> {msg.senderEmail}
              </span>
              {msg.senderPhone && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a5a5a" }}>
                  <Ic.Phone /> {msg.senderPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <StatusPill status={msg.status} />
          <p style={{ fontSize: 11, color: "#8A8578", margin: "6px 0 0" }}>{fmtDate(msg.receivedAt)}</p>
        </div>
      </div>

      {/* Subject */}
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500,
        color: "#1C1C1C", margin: "0 0 4px",
      }}>
        {msg.subject}
      </h2>

      <div style={{ height: 1, background: "#D8D3CA", margin: "18px 0" }} />

      {/* Body */}
      <p style={{ fontSize: 14, lineHeight: 1.85, color: "#3a3a3a", whiteSpace: "pre-wrap", margin: 0 }}>
        {msg.message}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 30, flexWrap: "wrap" }}>
        <ActionBtn
          variant="primary"
          onClick={() => onMarkStatus("REPLIED")}
          disabled={actioning || msg.status === "REPLIED"}
        >
          <Ic.Reply /> {msg.status === "REPLIED" ? "Replied" : "Mark as Replied"}
        </ActionBtn>

        <ActionBtn
          variant="secondary"
          onClick={() => onMarkStatus("ARCHIVED")}
          disabled={actioning || msg.status === "ARCHIVED"}
        >
          <Ic.Archive /> Archive
        </ActionBtn>

        {msg.status === "ARCHIVED" && (
          <ActionBtn variant="secondary" onClick={() => onMarkStatus("READ")} disabled={actioning}>
            Restore
          </ActionBtn>
        )}

        <ActionBtn variant="danger" onClick={onDelete} disabled={actioning}>
          <Ic.Trash /> Delete
        </ActionBtn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ContactsPage  ← default export, wrapped in UserDashboardLayout
   ───────────────────────────────────────────────────────────── */
export default function ContactsPage() {
  /*
   * resumeId — pull from your auth context / user profile.
   * Replace localStorage.getItem(...) with e.g.:
   *   const { user } = useAuth();
   *   const resumeId = user?.activeResumeId;
   */
  const resumeId = localStorage.getItem("activeResumeId") || "";

  const [messages,  setMessages]  = useState([]);
  const [counts,    setCounts]    = useState({});
  const [unread,    setUnread]    = useState(0);
  const [filter,    setFilter]    = useState("ALL");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [actioning, setActioning] = useState(false);
  const [error,     setError]     = useState(null);
  const [mounted,   setMounted]   = useState(false);

  /* ── fetch full inbox ── */
  const fetchInbox = useCallback(async () => {
    if (!resumeId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      // GET /api/contacts/resume/{resumeId}
      const data = await apiFetch(`/contacts/resume/${resumeId}`);
      setMessages(data || []);
      // derive per-status counts locally (avoids extra requests)
      const c = {};
      (data || []).forEach((m) => { c[m.status] = (c[m.status] || 0) + 1; });
      setCounts(c);
    } catch {
      setError("Could not load messages. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  /* ── fetch unread count ── */
  const fetchUnread = useCallback(async () => {
    if (!resumeId) return;
    try {
      // GET /api/contacts/resume/{resumeId}/unread-count
      const n = await apiFetch(`/contacts/resume/${resumeId}/unread-count`);
      setUnread(n ?? 0);
    } catch {}
  }, [resumeId]);

  useEffect(() => {
    fetchInbox();
    fetchUnread();
    setTimeout(() => setMounted(true), 50);
  }, [fetchInbox, fetchUnread]);

  /* ── open message (auto-mark NEW → READ) ── */
  async function openMessage(msg) {
    setSelected(msg);
    if (msg.status === "NEW") {
      try {
        // PUT /api/contacts/{messageId}/status?status=READ
        await apiFetch(`/contacts/${msg.id}/status?status=READ`, { method: "PUT" });
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: "READ" } : m));
        setSelected((s) => s ? { ...s, status: "READ" } : s);
        setCounts((c) => ({ ...c, NEW: Math.max(0, (c.NEW || 1) - 1), READ: (c.READ || 0) + 1 }));
        setUnread((u) => Math.max(0, u - 1));
      } catch {}
    }
  }

  /* ── update status ── */
  async function markStatus(id, status) {
    setActioning(true);
    try {
      // PUT /api/contacts/{messageId}/status?status={status}
      await apiFetch(`/contacts/${id}/status?status=${status}`, { method: "PUT" });
      const prev = messages.find((m) => m.id === id)?.status;
      setMessages((ms) => ms.map((m) => m.id === id ? { ...m, status } : m));
      setSelected((s) => s?.id === id ? { ...s, status } : s);
      if (prev) setCounts((c) => ({
        ...c,
        [prev]:  Math.max(0, (c[prev]  || 1) - 1),
        [status]: (c[status] || 0) + 1,
      }));
    } catch {
      setError("Failed to update status.");
    } finally {
      setActioning(false);
    }
  }

  /* ── delete ── */
  async function deleteMsg(id) {
    setActioning(true);
    try {
      // DELETE /api/contacts/{messageId}
      await apiFetch(`/contacts/${id}`, { method: "DELETE" });
      const prev = messages.find((m) => m.id === id)?.status;
      setMessages((ms) => ms.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      if (prev) setCounts((c) => ({ ...c, [prev]: Math.max(0, (c[prev] || 1) - 1) }));
    } catch {
      setError("Failed to delete message.");
    } finally {
      setActioning(false);
    }
  }

  /* ── filtered + searched view ── */
  const visible = messages.filter((m) => {
    const matchF = filter === "ALL" || m.status === filter;
    const q = search.toLowerCase();
    const matchS = !q ||
      (m.senderName  || "").toLowerCase().includes(q) ||
      (m.subject     || "").toLowerCase().includes(q) ||
      (m.message     || "").toLowerCase().includes(q) ||
      (m.senderEmail || "").toLowerCase().includes(q);
    return matchF && matchS;
  });

  /* ── topbar right action (Refresh button) ── */
  const rightAction = (
    <button
      onClick={() => { fetchInbox(); fetchUnread(); }}
      style={{
        display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
        background: "#1C1C1C", color: "#F0EDE6", border: "none", borderRadius: 9,
        fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
      }}
    >
      <Ic.Refresh /> Refresh
    </button>
  );

  /* ─────────────────────────────────────────────────────────────
     Render
     ───────────────────────────────────────────────────────────── */
  return (
    <UserDashboardLayout
      title="Contacts"
      subtitle="YOUR INBOX"
      rightAction={rightAction}
    >
      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#1C1C1C" }}>

        {/* ══ Header area ══ */}
        <div style={{
          padding: "32px 36px 0",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.8px", textTransform: "uppercase", color: "#8A8578", margin: "0 0 6px" }}>
                Inbox
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 500, color: "#1C1C1C", margin: 0 }}>
                Contact Messages
                {unread > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#1C1C1C", color: "#F0EDE6",
                    fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 20,
                    marginLeft: 12, position: "relative", top: -3,
                  }}>
                    <Ic.Dot color="#C9A96E" /> {unread} new
                  </span>
                )}
              </h1>
            </div>
            <span style={{ fontSize: 12, color: "#8A8578" }}>
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(200,70,70,0.09)", border: "1px solid rgba(200,70,70,0.2)",
              borderRadius: 10, padding: "10px 16px", marginBottom: 18,
              fontSize: 13, color: "#B84040", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              {error}
              <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B84040", display: "flex" }}>
                <Ic.Close />
              </button>
            </div>
          )}

          {/* No resumeId warning */}
          {!resumeId && !loading && (
            <div style={{
              background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#8A6020",
            }}>
              No active resume selected. Set <code>activeResumeId</code> in your auth context to load messages.
            </div>
          )}

          {/* Search + filter pills */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8A8578", pointerEvents: "none" }}>
                <Ic.Search />
              </span>
              <input
                style={{
                  width: "100%", padding: "9px 12px 9px 33px",
                  background: "#ECEAE2", border: "1px solid #D8D3CA", borderRadius: 10,
                  fontSize: 13, color: "#1C1C1C", fontFamily: "'DM Sans', sans-serif",
                  outline: "none", boxSizing: "border-box",
                }}
                placeholder="Search by name, subject, message…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <FilterPill
                  key={f}
                  label={f === "ALL" ? "All" : STATUS_META[f]?.label}
                  active={filter === f}
                  count={f !== "ALL" ? (counts[f] || 0) : undefined}
                  onClick={() => setFilter(f)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg,#C4BDB3,transparent)", marginBottom: 24 }} />
        </div>

        {/* ══ Body: list + detail ══ */}
        <div style={{ padding: "0 36px 40px", display: "flex", gap: 18, alignItems: "flex-start" }}>

          {/* ── Message list ── */}
          <div style={{
            flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 8,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s",
          }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 200, color: "#8A8578", fontSize: 13 }}>
                {/* CSS spinner */}
                <span style={{
                  width: 18, height: 18, border: "2px solid #D8D3CA",
                  borderTopColor: "#1C1C1C", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.7s linear infinite",
                }} />
                Loading messages…
              </div>
            ) : visible.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: 180, background: "#ECEAE2", borderRadius: 14, border: "1px solid #D8D3CA",
                color: "#8A8578", gap: 10,
              }}>
                <Ic.Inbox />
                <p style={{ fontSize: 13, margin: 0 }}>
                  {search ? "No messages match your search" : "No messages here"}
                </p>
              </div>
            ) : (
              visible.map((msg, i) => (
                <MessageCard
                  key={msg.id}
                  msg={msg}
                  isSelected={selected?.id === msg.id}
                  delay={i * 0.04}
                  onClick={() => openMessage(msg)}
                />
              ))
            )}
          </div>

          {/* ── Detail panel ── */}
          <div style={{
            flex: 1, background: "#ECEAE2", border: "1px solid #D8D3CA",
            borderRadius: 18, padding: "30px 34px", minHeight: 500,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.45s ease 0.18s, transform 0.45s ease 0.18s",
            position: "relative",
          }}>
            {!selected ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: 360, color: "#8A8578", gap: 10,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: "#E0DCD3",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#A09890",
                }}>
                  <Ic.Inbox />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Select a message</p>
                <p style={{ fontSize: 12, margin: 0, opacity: 0.65 }}>Choose a conversation from the left</p>
              </div>
            ) : (
              <DetailPanel
                msg={selected}
                actioning={actioning}
                onClose={() => setSelected(null)}
                onMarkStatus={(status) => markStatus(selected.id, status)}
                onDelete={() => deleteMsg(selected.id)}
              />
            )}
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        input::placeholder { color:#A09890; }
      `}</style>
    </UserDashboardLayout>
  );
}