import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Zap, ArrowRight, CheckCircle } from "lucide-react";

const PLAN_META = {
  FREE:    { color:"#8A8578", bg:"rgba(138,133,120,0.15)", label:"Free",    perks:["1 resume draft"] },
  BASIC:   { color:"#1C6EA4", bg:"rgba(28,110,164,0.15)",  label:"Basic",   perks:["1 resume","1 public link"] },
  PRO:     { color:"#7B3FA0", bg:"rgba(123,63,160,0.15)",  label:"Pro",     perks:["2 resumes","1 public link","Versioning"] },
  PREMIUM: { color:"#C9963A", bg:"rgba(201,150,58,0.15)",  label:"Premium", perks:["3 resumes","2 public links","Versioning"] },
};

export default function SubscriptionBadge() {
  const navigate = useNavigate();
  const [plan, setPlan]       = useState(null);
  const [active, setActive]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cfg   = { headers: { Authorization: `Bearer ${token}` } };
    axios.get("/api/subscription/plan", cfg)
      .then(r => setPlan(r.data))
      .catch(() => setPlan("FREE"));
    axios.get("/api/subscription/active", cfg)
      .then(r => setActive(r.data))
      .catch(() => setActive(false));
  }, []);

  if (!plan) return null;

  const meta = PLAN_META[plan] ?? PLAN_META.FREE;

  return (
    <div style={{
      margin:"0 12px 12px",
      background: meta.bg,
      border:`1px solid ${meta.color}30`,
      borderRadius:10,
      padding:"12px 14px",
    }}>
      {/* plan label */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
        <span style={{
          display:"flex", alignItems:"center", gap:5,
          fontSize:11, fontWeight:600, color: meta.color,
          letterSpacing:".5px", textTransform:"uppercase",
        }}>
          <Zap size={11} fill={meta.color}/> {meta.label}
        </span>
        {!active && (
          <span style={{fontSize:10, color:"#B43C3C", background:"rgba(180,60,60,.12)", padding:"2px 7px", borderRadius:20}}>
            Expired
          </span>
        )}
      </div>

      {/* perks */}
      <div style={{display:"flex", flexDirection:"column", gap:3, marginBottom:10}}>
        {meta.perks.map(p => (
          <span key={p} style={{display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#8A8578"}}>
            <CheckCircle size={10} color={meta.color}/> {p}
          </span>
        ))}
      </div>

      {/* upgrade CTA — only if not premium */}
      {plan !== "PREMIUM" && (
        <button
          onClick={() => navigate("/settings")}
          style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            padding:"6px 0", borderRadius:7, border:"none", cursor:"pointer",
            background:"#1C1C1C", color:"#F0EDE6",
            fontSize:11, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
          }}
        >
          Upgrade <ArrowRight size={11}/>
        </button>
      )}
    </div>
  );
}