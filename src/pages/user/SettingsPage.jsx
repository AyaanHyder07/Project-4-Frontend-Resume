import { useState, useEffect } from "react";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { plansAPI, paymentAPI, subscriptionAPI } from "../../api/api";
import { CheckCircle, Zap, CreditCard, Loader2 } from "lucide-react";

const PLAN_META = {
  FREE:    { color:"#8A8578", bg:"rgba(138,133,120,0.15)", label:"Free",    price:0,  perks:["1 resume draft"] },
  BASIC:   { color:"#1C6EA4", bg:"rgba(28,110,164,0.15)",  label:"Basic",   price:9,  perks:["1 resume","1 public link"] },
  PRO:     { color:"#7B3FA0", bg:"rgba(123,63,160,0.15)",  label:"Pro",     price:19, perks:["2 resumes","1 public link","Versioning"] },
  PREMIUM: { color:"#C9963A", bg:"rgba(201,150,58,0.15)",  label:"Premium", price:29, perks:["3 resumes","2 public links","Versioning"] },
};

export default function SettingsPage() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    Promise.all([
      plansAPI.getActivePlans(),
      subscriptionAPI.getMyPlan()
    ]).then(([plansRes, planRes]) => {
      setPlans(plansRes.data);
      setCurrentPlan(planRes.data);
    }).catch(() => {
      setPlans([]);
      setCurrentPlan("FREE");
    }).finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (plan) => {
    setPurchasing(plan);
    try {
      const res = await paymentAPI.initiate(plan, "MONTHLY");
      // Assuming it returns a payment URL or something
      // For now, simulate confirmation
      alert("Payment initiated. In real app, redirect to payment gateway.");
      // After payment, call confirm
      // await paymentAPI.confirm(orderId, transactionRef);
    } catch (error) {
      alert("Failed to initiate payment.");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <UserDashboardLayout title="Settings" subtitle="Manage your subscription"><p>Loading...</p></UserDashboardLayout>;

  return (
    <UserDashboardLayout title="Settings" subtitle="Manage your subscription">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 20 }}>Choose Your Plan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {plans.map(plan => {
            const meta = PLAN_META[plan.level] || PLAN_META.FREE;
            const isCurrent = currentPlan === plan.level;
            return (
              <div key={plan.level} style={{
                border: `2px solid ${isCurrent ? meta.color : "#D8D3CA"}`,
                borderRadius: 12,
                padding: 20,
                background: meta.bg,
                position: "relative"
              }}>
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: meta.color, color: "#fff", padding: "4px 8px",
                    borderRadius: 20, fontSize: 12
                  }}>
                    Current
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
                  <Zap size={24} color={meta.color} />
                  <div>
                    <h3 style={{ margin: 0, color: meta.color }}>{meta.label}</h3>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>${meta.price}/mo</p>
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
                  {meta.perks.map(perk => (
                    <li key={perk} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <CheckCircle size={16} color={meta.color} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button
                    onClick={() => handlePurchase(plan.level)}
                    disabled={purchasing === plan.level}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: meta.color,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    {purchasing === plan.level ? <Loader2 size={16} /> : <CreditCard size={16} />}
                    {purchasing === plan.level ? "Processing..." : "Upgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </UserDashboardLayout>
  );
}