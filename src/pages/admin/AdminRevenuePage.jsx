import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminBillingAPI } from "../../api/api";

const formatMoney = (amount = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format((amount || 0) / 100);

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

const AdminRevenuePage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminBillingAPI.getRevenue();
      setSummary(data.data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminDashboardLayout title="Revenue" subtitle="Track subscription income and recent payments">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Revenue Tracking</div>
          <h2 className="page-title">See how much the platform is earning.</h2>
          <p className="page-lead">Review paid orders, plan performance, and monthly versus yearly purchase mix from one clean billing dashboard.</p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <button className="premium-btn secondary" onClick={load}>Refresh</button>
          </div>
        </section>

        {loading ? (
          <section className="premium-panel"><p className="premium-muted">Loading revenue...</p></section>
        ) : !summary ? (
          <section className="premium-panel"><div className="premium-empty"><p>Revenue data is unavailable.</p></div></section>
        ) : (
          <>
            <section className="premium-grid metrics">
              <article className="premium-card kpi"><span className="premium-meta">Total Revenue</span><strong className="premium-kpi-value">{formatMoney(summary.totalRevenueInSmallestUnit, summary.currency)}</strong></article>
              <article className="premium-card kpi"><span className="premium-meta">Paid Orders</span><strong className="premium-kpi-value">{summary.totalPaidOrders || 0}</strong></article>
              <article className="premium-card kpi"><span className="premium-meta">Monthly Sales</span><strong className="premium-kpi-value">{formatMoney(summary.monthlyRevenueInSmallestUnit, summary.currency)}</strong></article>
              <article className="premium-card kpi"><span className="premium-meta">Yearly Sales</span><strong className="premium-kpi-value">{formatMoney(summary.yearlyRevenueInSmallestUnit, summary.currency)}</strong></article>
            </section>

            <section className="premium-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
              <article className="premium-panel">
                <div className="page-eyebrow">Revenue by Plan</div>
                <div className="premium-table" style={{ marginTop: 12 }}>
                  <table>
                    <thead><tr><th>Plan</th><th>Revenue</th><th>Orders</th></tr></thead>
                    <tbody>
                      {Object.keys(summary.revenueByPlan || {}).map((key) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{formatMoney(summary.revenueByPlan[key], summary.currency)}</td>
                          <td>{summary.ordersByPlan?.[key] || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="premium-panel">
                <div className="page-eyebrow">Recent Payments</div>
                <div className="premium-table" style={{ marginTop: 12 }}>
                  <table>
                    <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Date</th></tr></thead>
                    <tbody>
                      {(summary.recentPayments || []).map((payment) => (
                        <tr key={payment.id}>
                          <td style={{ fontFamily: "var(--font-mono)" }}>{payment.userId}</td>
                          <td>{payment.targetPlan}</td>
                          <td>{payment.displayAmount || formatMoney(payment.amountInSmallestUnit, payment.currency || summary.currency)}</td>
                          <td>{formatDate(payment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminRevenuePage;
