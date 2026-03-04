import { useState, useEffect } from "react";
import axios from "axios";
import { History, RotateCcw, Plus, Lock, Loader2, CheckCircle } from "lucide-react";

export default function ResumeVersionPanel({ resumeId, plan }) {
  const [versions, setVersions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const versioningEnabled = plan === "PRO" || plan === "PREMIUM";

  const authCfg = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const loadVersions = () => {
    if (!versioningEnabled) return;
    setLoading(true);
    axios.get(`/api/resume-versions/${resumeId}`, authCfg())
      .then(r => setVersions(r.data))
      .catch(() => setError("Could not load versions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadVersions(); }, [resumeId]);

  const createSnapshot = () => {
    if (!note.trim()) return;
    setSaving(true);
    axios.post(`/api/resume-versions/${resumeId}?note=${encodeURIComponent(note)}`, {}, authCfg())
      .then(() => { setNote(""); loadVersions(); })
      .catch(() => setError("Failed to create snapshot."))
      .finally(() => setSaving(false));
  };

  const revert = () => {
    if (!window.confirm("Revert to previous version? Current changes will be overwritten.")) return;
    setSaving(true);
    axios.post(`/api/resume-versions/revert/${resumeId}`, {}, authCfg())
      .then(() => loadVersions())
      .catch(() => setError("Revert failed."))
      .finally(() => setSaving(false));
  };

  if (!versioningEnabled) {
    return (
      <div style={p.lockedBox}>
        <Lock size={20} style={{color:"#8A8578", marginBottom:8}}/>
        <p style={{margin:"0 0 4px", fontSize:14, fontWeight:500, color:"#1C1C1C",fontFamily:"'Cormorant Garamond',serif"}}>
          Version History
        </p>
        <p style={{margin:"0 0 14px", fontSize:12, color:"#8A8578"}}>Available on Pro &amp; Premium plans.</p>
        <a href="/settings" style={{fontSize:12, color:"#1C1C1C", fontWeight:500}}>Upgrade →</a>
      </div>
    );
  }

  return (
    <div style={p.panel}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16}}>
        <span style={{display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:500, fontFamily:"'Cormorant Garamond',serif"}}>
          <History size={16}/> Version History
        </span>
        {versions.length >= 2 && (
          <button style={p.revertBtn} onClick={revert} disabled={saving}>
            <RotateCcw size={12}/> Revert
          </button>
        )}
      </div>

      {/* snapshot form */}
      <div style={{display:"flex", gap:8, marginBottom:16}}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Snapshot note…"
          style={p.input}
        />
        <button className="btn-primary" onClick={createSnapshot} disabled={saving || !note.trim()}
          style={{display:"flex", alignItems:"center", gap:5, padding:"8px 14px", flexShrink:0}}>
          {saving ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Plus size={13}/>}
          Save
        </button>
      </div>

      {error && <p style={{fontSize:12, color:"#B43C3C", marginBottom:10}}>{error}</p>}

      {/* version list */}
      {loading ? (
        <div style={{textAlign:"center", padding:"20px 0"}}>
          <Loader2 size={20} style={{color:"#8A8578", animation:"spin 1s linear infinite"}}/>
        </div>
      ) : versions.length === 0 ? (
        <p style={{fontSize:12, color:"#8A8578", textAlign:"center", padding:"16px 0"}}>No snapshots yet.</p>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {versions.map((v, i) => (
            <div key={v.id} style={{
              background: v.current ? "#1C1C1C" : "#E0DCD3",
              borderRadius:8, padding:"10px 14px",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <p style={{margin:0, fontSize:12, fontWeight:500, color: v.current ? "#F0EDE6" : "#1C1C1C"}}>
                  {v.changeNote || "Snapshot"}
                </p>
                <p style={{margin:"2px 0 0", fontSize:11, color: v.current ? "#8A8578" : "#8A8578"}}>
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              {v.current && (
                <span style={{
                  display:"flex", alignItems:"center", gap:4,
                  fontSize:10, color:"#F0EDE6", background:"rgba(255,255,255,0.12)",
                  padding:"2px 8px", borderRadius:12,
                }}>
                  <CheckCircle size={10}/> Current
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const p = {
  panel: {
    background:"#ECEAE2", border:"1px solid #D8D3CA",
    borderRadius:14, padding:20,
  },
  lockedBox: {
    background:"#ECEAE2", border:"1px solid #D8D3CA",
    borderRadius:14, padding:24, textAlign:"center",
  },
  revertBtn: {
    display:"flex", alignItems:"center", gap:5,
    padding:"5px 12px", borderRadius:7, border:"1px solid #D8D3CA",
    background:"transparent", cursor:"pointer", fontSize:12, color:"#1C1C1C",
    fontFamily:"'DM Sans',sans-serif",
  },
  input: {
    flex:1, padding:"8px 12px", borderRadius:8,
    border:"1px solid #D8D3CA", background:"#F0EDE6",
    fontSize:13, fontFamily:"'DM Sans',sans-serif", color:"#1C1C1C",
    outline:"none",
  },
};