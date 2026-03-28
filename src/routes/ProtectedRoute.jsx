import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Crown, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { subscriptionAPI } from "../api/api";

const ExpiredPlanGate = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg,#f8f4ec,#efe8db)", padding: 24 }}>
      <div style={{ maxWidth: 560, width: "100%", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(31,29,26,0.08)", borderRadius: 28, padding: "36px 32px", boxShadow: "0 24px 60px rgba(31,29,26,0.08)", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: 20, display: "grid", placeItems: "center", background: "rgba(123,63,160,0.12)", color: "#7B3FA0" }}>
          <Crown size={28} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: "2.1rem", color: "#1C1C1C", fontFamily: "'DM Serif Display', serif" }}>Your plan has expired</h1>
        <p style={{ margin: "0 auto 22px", maxWidth: 420, lineHeight: 1.7, color: "#736755", fontSize: 14 }}>
          Dashboard access is paused until you renew or upgrade your subscription. Choose a plan to restore editing, publishing, and premium tools.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/upgrade")} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, background: "#1C1C1C", color: "#F8F3EA", padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Upgrade Plan <ArrowRight size={14} />
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(31,29,26,0.1)", borderRadius: 999, background: "#fff", color: "#5A5550", padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Lock size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [subscriptionLoading, setSubscriptionLoading] = useState(role === "ROLE_USER");
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  useEffect(() => {
    if (!user || role !== "ROLE_USER" || location.pathname === "/upgrade") {
      setSubscriptionLoading(false);
      setSubscriptionActive(true);
      return;
    }

    let active = true;
    setSubscriptionLoading(true);
    subscriptionAPI.isActive()
      .then((res) => { if (active) setSubscriptionActive(Boolean(res.data)); })
      .catch(() => { if (active) setSubscriptionActive(false); })
      .finally(() => { if (active) setSubscriptionLoading(false); });

    const refresh = () => {
      subscriptionAPI.isActive()
        .then((res) => { if (active) setSubscriptionActive(Boolean(res.data)); })
        .catch(() => { if (active) setSubscriptionActive(false); });
    };
    window.addEventListener("subscription:changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("subscription:changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [user, role, location.pathname]);

  if (loading || subscriptionLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (role === "ROLE_USER" && location.pathname !== "/upgrade" && !subscriptionActive) {
    return <ExpiredPlanGate />;
  }

  return children;
};

export default ProtectedRoute;
