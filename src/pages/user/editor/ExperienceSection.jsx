import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, Briefcase, ChevronDown, ChevronUp
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   ENDPOINTS USED
   GET  /api/experiences/resume/{resumeId}
   POST /api/experiences                    body: JSON
   PUT  /api/experiences/{experienceId}     body: JSON
   DEL  /api/experiences/{experienceId}
   PUT  /api/experiences/resume/{resumeId}/reorder   body: string[]
───────────────────────────────────────────────────────── */

const EMPLOYMENT_TYPES = [
  "FULL_TIME", "PART_TIME", "CONTRACT",
  "FREELANCE", "INTERNSHIP", "SELF_EMPLOYED"
];

const TYPE_LABEL = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time",
  CONTRACT: "Contract", FREELANCE: "Freelance",
  INTERNSHIP: "Internship", SELF_EMPLOYED: "Self Employed",
};

const EMPTY = {
  organizationName:"", employmentType:"FULL_TIME", roleTitle:"",
  location:"", startDate:"", endDate:"", currentlyWorking:false,
  roleDescription:"", keyAchievements:"", skillsUsed:"",
};

export default function ExperienceSection({ resumeId }) {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState(null);
  const [dragId,     setDragId]     = useState(null);
  const [reordering, setReordering] = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── load ── */
  const load = () =>
    axiosInstance.get(`/api/experiences/resume/${resumeId}`)
      .then(r => setList(r.data))
      .catch(() => showToast("Failed to load experience.", false))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [resumeId]);

  /* ── open create ── */
  const openCreate = () => {
    setForm(EMPTY); setEditId(null); setShowForm(true);
  };

  /* ── open edit ── */
  const openEdit = (exp) => {
    setForm({
      organizationName: exp.organizationName  ?? "",
      employmentType:   exp.employmentType    ?? "FULL_TIME",
      roleTitle:        exp.roleTitle         ?? "",
      location:         exp.location          ?? "",
      startDate:        exp.startDate         ?? "",
      endDate:          exp.endDate           ?? "",
      currentlyWorking: exp.currentlyWorking  ?? false,
      roleDescription:  exp.roleDescription   ?? "",
      keyAchievements:  Array.isArray(exp.keyAchievements)
                          ? exp.keyAchievements.join("\n")
                          : (exp.keyAchievements ?? ""),
      skillsUsed:       Array.isArray(exp.skillsUsed)
                          ? exp.skillsUsed.join(", ")
                          : (exp.skillsUsed ?? ""),
    });
    setEditId(exp.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── validate ── */
  const validate = () => {
    if (!form.organizationName.trim()) { showToast("Organisation name is required.", false); return false; }
    if (!form.roleTitle.trim())        { showToast("Role / Title is required.", false); return false; }
    if (!form.startDate)               { showToast("Start date is required.", false); return false; }
    if (!form.currentlyWorking && !form.endDate) {
      showToast("End date is required (or tick Currently Working).", false); return false;
    }
    if (!form.currentlyWorking && form.endDate < form.startDate) {
      showToast("End date cannot be before start date.", false); return false;
    }
    return true;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);

    // keyAchievements → array (one per line), skillsUsed → array (comma separated)
    const payload = {
      resumeId,
      organizationName: form.organizationName.trim(),
      employmentType:   form.employmentType.toUpperCase(),
      roleTitle:        form.roleTitle.trim(),
      location:         form.location.trim()         || null,
      startDate:        form.startDate,
      endDate:          form.currentlyWorking ? null : (form.endDate || null),
      currentlyWorking: form.currentlyWorking,
      roleDescription:  form.roleDescription.trim()  || null,
      keyAchievements:  form.keyAchievements.trim()
                          ? form.keyAchievements.split("\n").map(s => s.trim()).filter(Boolean)
                          : [],
      skillsUsed:       form.skillsUsed.trim()
                          ? form.skillsUsed.split(",").map(s => s.trim()).filter(Boolean)
                          : [],
    };

    const req = editId
      ? axiosInstance.put(`/api/experiences/${editId}`, payload)
      : axiosInstance.post("/api/experiences", payload);

    req
      .then(() => { showToast(editId ? "Updated!" : "Added!"); setShowForm(false); load(); })
      .catch(() => showToast("Save failed.", false))
      .finally(() => setSaving(false));
  };

  /* ── delete ── */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this experience?")) return;
    axiosInstance.delete(`/api/experiences/${id}`)
      .then(() => { showToast("Deleted."); load(); })
      .catch(() => showToast("Delete failed.", false));
  };

  /* ── drag reorder ── */
  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const reordered = [...list];
    const from = reordered.findIndex(e => e.id === dragId);
    const to   = reordered.findIndex(e => e.id === targetId);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setList(reordered);
    setDragId(null);
    setReordering(true);
    axiosInstance.put(`/api/experiences/resume/${resumeId}/reorder`, reordered.map(e => e.id))
      .catch(() => { showToast("Reorder failed.", false); load(); })
      .finally(() => setReordering(false));
  };

  return (
    <div style={s.wrap}>

      {/* header */}
      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Experience</h2>
          <p style={s.desc}>{list.length} entr{list.length !== 1 ? "ies" : "y"} · drag to reorder</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {reordering && <Loader2 size={14} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>}
          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Experience
            </button>
          )}
        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* ── FORM ── */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>{editId ? "Edit Experience" : "Add Experience"}</span>
            <button style={s.iconBtn} onClick={() => setShowForm(false)}><X size={15}/></button>
          </div>

          {/* employment type pills */}
          <div style={{ marginBottom:20 }}>
            <label style={s.lbl}>Employment Type *</label>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
              {EMPLOYMENT_TYPES.map(t => (
                <button key={t}
                  style={{
                    ...s.typePill,
                    background: form.employmentType === t ? "#1C1C1C" : "transparent",
                    color:      form.employmentType === t ? "#F0EDE6" : "#8A8578",
                    border:     `1px solid ${form.employmentType === t ? "#1C1C1C" : "#D8D3CA"}`,
                  }}
                  onClick={() => f("employmentType", t)}>
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div style={s.grid2}>
            <Field label="Organisation Name *">
              <input style={s.input} value={form.organizationName}
                placeholder="Google, Infosys, Startup Inc."
                onChange={e => f("organizationName", e.target.value)}/>
            </Field>
            <Field label="Role / Title *">
              <input style={s.input} value={form.roleTitle}
                placeholder="Senior Software Engineer"
                onChange={e => f("roleTitle", e.target.value)}/>
            </Field>
            <Field label="Location">
              <input style={s.input} value={form.location}
                placeholder="Pune, India / Remote"
                onChange={e => f("location", e.target.value)}/>
            </Field>
            <Field label="Start Date *">
              <input style={s.input} type="date" value={form.startDate}
                onChange={e => f("startDate", e.target.value)}/>
            </Field>
            <Field label="End Date" hint={form.currentlyWorking ? "Disabled — currently working" : ""}>
              <input style={{ ...s.input, opacity: form.currentlyWorking ? 0.4 : 1 }}
                type="date" value={form.endDate}
                disabled={form.currentlyWorking}
                onChange={e => f("endDate", e.target.value)}/>
            </Field>
            <Field label=" ">
              <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", marginTop:10 }}>
                <input type="checkbox" checked={form.currentlyWorking}
                  onChange={e => {
                    f("currentlyWorking", e.target.checked);
                    if (e.target.checked) f("endDate", "");
                  }}
                  style={{ width:15, height:15, accentColor:"#1C1C1C" }}/>
                <span style={{ fontSize:13, color:"#1C1C1C" }}>Currently Working Here</span>
              </label>
            </Field>
          </div>

          <Field label="Role Description">
            <textarea style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} rows={3}
              value={form.roleDescription}
              placeholder="Brief summary of your responsibilities…"
              onChange={e => f("roleDescription", e.target.value)}/>
          </Field>

          <Field label="Key Achievements" hint="One per line">
            <textarea style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} rows={4}
              value={form.keyAchievements}
              placeholder={"Reduced load time by 40%\nLed a team of 5 engineers\nShipped 3 major features"}
              onChange={e => f("keyAchievements", e.target.value)}/>
          </Field>

          <Field label="Skills Used" hint="Comma separated">
            <input style={s.input} value={form.skillsUsed}
              placeholder="React, Spring Boot, PostgreSQL, Docker"
              onChange={e => f("skillsUsed", e.target.value)}/>
          </Field>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <button style={s.btnSec} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={s.btnPri} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={13} style={{ animation:"spin .8s linear infinite" }}/> : <Save size={13}/>}
              {saving ? "Saving…" : editId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {loading ? <CenterLoader/> : list.length === 0 && !showForm ? (
        <Empty onAdd={openCreate}/>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {list.map(exp => (
            <div key={exp.id} draggable
              onDragStart={() => setDragId(exp.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(exp.id)}
              style={{
                ...s.row,
                opacity: dragId === exp.id ? 0.4 : 1,
                border: dragId && dragId !== exp.id ? "1.5px dashed #8A8578" : "1px solid #D8D3CA",
              }}
            >
              <GripVertical size={15} style={{ color:"#D8D3CA", flexShrink:0, cursor:"grab" }}/>

              <div style={s.rowIcon}><Briefcase size={17} color="#8A8578"/></div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                  <p style={s.rowTitle}>{exp.roleTitle}</p>
                  <span style={s.typeBadge}>{TYPE_LABEL[exp.employmentType] ?? exp.employmentType}</span>
                  {exp.currentlyWorking && (
                    <span style={{ ...s.typeBadge, background:"rgba(58,125,68,0.10)", color:"#3A7D44" }}>
                      Current
                    </span>
                  )}
                </div>
                <p style={s.rowSub}>
                  {exp.organizationName}
                  {exp.location && <><span style={s.dot}>·</span>{exp.location}</>}
                  <span style={s.dot}>·</span>
                  {exp.startDate} – {exp.currentlyWorking ? "Present" : (exp.endDate ?? "—")}
                </p>

                {expanded === exp.id && (
                  <div style={{ marginTop:10 }}>
                    {exp.roleDescription && (
                      <p style={{ fontSize:12, color:"#1C1C1C", lineHeight:1.6, margin:"0 0 8px" }}>
                        {exp.roleDescription}
                      </p>
                    )}
                    {exp.keyAchievements?.length > 0 && (
                      <ul style={{ margin:"0 0 8px", paddingLeft:16 }}>
                        {exp.keyAchievements.map((a, i) => (
                          <li key={i} style={{ fontSize:12, color:"#1C1C1C", lineHeight:1.6 }}>{a}</li>
                        ))}
                      </ul>
                    )}
                    {exp.skillsUsed?.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {exp.skillsUsed.map(sk => (
                          <span key={sk} style={s.skillTag}>{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button style={s.iconBtn}
                  onClick={() => setExpanded(p => p === exp.id ? null : exp.id)}>
                  {expanded === exp.id ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                </button>
                <button style={s.iconBtn} onClick={() => openEdit(exp)}><Edit3 size={13}/></button>
                <button style={{ ...s.iconBtn, color:"#B43C3C" }} onClick={() => handleDelete(exp.id)}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── helpers ── */
const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
      <label style={s.lbl}>{label}</label>
      {hint && <span style={{ fontSize:11, color:"#8A8578" }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const Toast = ({ toast }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:10,
    fontSize:13, marginBottom:16,
    background: toast.ok ? "rgba(58,125,68,0.10)" : "rgba(180,60,60,0.10)",
    border: `1px solid ${toast.ok ? "rgba(58,125,68,0.22)" : "rgba(180,60,60,0.22)"}`,
    color: toast.ok ? "#3A7D44" : "#B43C3C",
  }}>
    {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>} {toast.msg}
  </div>
);

const Empty = ({ onAdd }) => (
  <div style={{ textAlign:"center", padding:"50px 0", background:"#ECEAE2", borderRadius:14, border:"1px solid #D8D3CA" }}>
    <Briefcase size={36} style={{ color:"#D8D3CA", marginBottom:14 }}/>
    <p style={{ margin:"0 0 5px", fontSize:17, fontFamily:"'Cormorant Garamond',serif" }}>No experience added yet</p>
    <p style={{ margin:"0 0 18px", fontSize:13, color:"#8A8578" }}>Add your work history and roles</p>
    <button style={s.btnPri} onClick={onAdd}><Plus size={13}/> Add Experience</button>
  </div>
);

const CenterLoader = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
    <Loader2 size={26} style={{ color:"#8A8578", animation:"spin .8s linear infinite" }}/>
  </div>
);

const s = {
  wrap:      { fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C" },
  topRow:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 },
  title:     { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:500, margin:0 },
  desc:      { fontSize:12, color:"#8A8578", margin:"4px 0 0" },
  card:      { background:"#ECEAE2", border:"1px solid #D8D3CA", borderRadius:14, padding:"20px 22px", marginBottom:16 },
  cardHead:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  cardTitle: { fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',serif" },
  grid2:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:4 },
  row:       { display:"flex", alignItems:"flex-start", gap:12, background:"#ECEAE2", borderRadius:12, padding:"14px 16px", transition:"border .15s" },
  rowIcon:   { width:38, height:38, borderRadius:8, background:"#D8D3CA", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 },
  rowTitle:  { margin:0, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", color:"#1C1C1C" },
  rowSub:    { margin:"3px 0 0", fontSize:11, color:"#8A8578" },
  dot:       { margin:"0 5px" },
  typeBadge: { fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:"rgba(28,28,28,0.08)", color:"#1C1C1C", letterSpacing:".2px" },
  skillTag:  { fontSize:11, padding:"2px 9px", borderRadius:20, background:"rgba(28,28,28,0.07)", color:"#1C1C1C" },
  lbl:       { fontSize:11, fontWeight:600, color:"#8A8578", letterSpacing:".4px", textTransform:"uppercase" },
  input:     { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid #D8D3CA", background:"#F0EDE6", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C", boxSizing:"border-box" },
  iconBtn:   { display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, border:"1px solid #D8D3CA", background:"#F0EDE6", cursor:"pointer", color:"#8A8578", flexShrink:0 },
  typePill:  { padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" },
  btnPri:    { display:"inline-flex", alignItems:"center", gap:7, background:"#1C1C1C", color:"#F0EDE6", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
  btnSec:    { display:"inline-flex", alignItems:"center", gap:7, background:"#E0DCD3", color:"#1C1C1C", border:"none", padding:"10px 18px", borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, cursor:"pointer" },
};