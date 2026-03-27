import { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminBillingAPI } from "../../api/api";

const formatMoney = (amount = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format((amount || 0) / 100);

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

const AdminSubscriptionsPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ plan: "BASIC", billingCycle: "MONTHLY", durationDays: 30 });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminBillingAPI.getUsers();
      setUsers(data.data || []);
      if (!selectedUserId && data.data?.length) {
        setSelectedUserId(data.data[0].userId);
      }
    } catch {
      setUsers([]);
      setMessage("Failed to load billing users.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (userId) => {
    if (!userId) return;
    setDetailLoading(true);
    try {
      const data = await adminBillingAPI.getUserDetails(userId);
      setDetails(data.data);
    } catch {
      setDetails(null);
      setMessage("Failed to load user billing details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.subscriptionActive).length,
    paid: users.filter((user) => user.currentPlan && user.currentPlan !== "FREE").length,
  }), [users]);

  const assignPlan = async () => {
    if (!selectedUserId) return;
    setAssigning(true);
    try {
      await adminBillingAPI.assignSubscription(selectedUserId, {
        plan: form.plan,
        billingCycle: form.billingCycle || null,
        durationDays: form.durationDays ? Number(form.durationDays) : null,
      });
      setMessage("Subscription updated.");
      await loadUsers();
      await loadDetails(selectedUserId);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update subscription.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminDashboardLayout title="Subscriptions" subtitle="Manage user plans, history, and manual assignments">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Billing Control</div>
          <h2 className="page-title">Manage current plans and full subscription history.</h2>
          <p className="page-lead">Track who is on which plan, review their previous subscriptions, and assign or extend plans without leaving the admin panel.</p>
          <div className="page-actions" style={{ marginTop: 22 }}>
            <span className="premium-badge status-tone-info">{stats.total} users</span>
            <span className="premium-badge status-tone-success">{stats.active} active subscriptions</span>
            <span className="premium-badge status-tone-warn">{stats.paid} paid users</span>
          </div>
        </section>

        {message ? <section className="premium-panel" style={{ padding: 16 }}><span className="premium-badge status-tone-info">{message}</span></section> : null}

        <section className="premium-grid" style={{ gridTemplateColumns: "minmax(320px, 1.1fr) minmax(380px, 1.3fr)", gap: 20 }}>
          <article className="premium-panel">
            <div className="page-actions" style={{ justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div className="page-eyebrow">Users</div>
                <h3 style={{ margin: "6px 0 0", fontSize: "1.6rem" }}>Current plan view</h3>
              </div>
              <button className="premium-btn secondary" onClick={loadUsers}>Refresh</button>
            </div>

            {loading ? (
              <p className="premium-muted">Loading users...</p>
            ) : users.length === 0 ? (
              <div className="premium-empty"><p>No users found.</p></div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {users.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => setSelectedUserId(user.userId)}
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderRadius: 18,
                      border: selectedUserId === user.userId ? "1px solid rgba(122, 102, 255, 0.38)" : "1px solid rgba(15, 23, 42, 0.08)",
                      background: selectedUserId === user.userId ? "rgba(122, 102, 255, 0.08)" : "rgba(255,255,255,0.72)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{user.username}</div>
                        <div className="premium-muted" style={{ marginTop: 4 }}>{user.role} • Joined {formatDate(user.joinedAt)}</div>
                      </div>
                      <span className={`premium-badge ${user.subscriptionActive ? "status-tone-success" : "status-tone-neutral"}`}>{user.currentPlan || "NONE"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                      <span className="premium-badge status-tone-info">{user.portfolioCount} portfolios</span>
                      <span className="premium-badge status-tone-neutral">{user.publishedPortfolioCount} public</span>
                      <span className="premium-badge status-tone-warn">{user.totalPaidOrders} payments</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </article>

          <article className="premium-panel">
            {!selectedUserId ? (
              <div className="premium-empty"><p>Select a user to inspect their plan history.</p></div>
            ) : detailLoading ? (
              <p className="premium-muted">Loading billing details...</p>
            ) : !details ? (
              <div className="premium-empty"><p>No details available.</p></div>
            ) : (
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <div className="page-eyebrow">Selected User</div>
                  <h3 style={{ margin: "6px 0 8px", fontSize: "1.7rem" }}>{details.user?.username}</h3>
                  <div className="page-actions">
                    <span className={`premium-badge ${details.user?.subscriptionActive ? "status-tone-success" : "status-tone-neutral"}`}>{details.user?.currentPlan || "NONE"}</span>
                    <span className="premium-badge status-tone-info">Ends {formatDate(details.user?.subscriptionEndDate)}</span>
                    <span className="premium-badge status-tone-warn">Revenue {formatMoney(details.user?.totalRevenueInSmallestUnit)}</span>
                  </div>
                </div>

                <div className="premium-grid metrics" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  <article className="premium-card kpi"><span className="premium-meta">Portfolios</span><strong className="premium-kpi-value">{details.user?.portfolioCount || 0}</strong></article>
                  <article className="premium-card kpi"><span className="premium-meta">Published</span><strong className="premium-kpi-value">{details.user?.publishedPortfolioCount || 0}</strong></article>
                  <article className="premium-card kpi"><span className="premium-meta">Payments</span><strong className="premium-kpi-value">{details.user?.totalPaidOrders || 0}</strong></article>
                </div>

                <section className="premium-panel" style={{ padding: 18 }}>
                  <div className="page-eyebrow">Assign / Modify Subscription</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 14 }}>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span className="premium-muted">Plan</span>
                      <select value={form.plan} onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))} className="premium-input">
                        <option value="FREE">FREE</option>
                        <option value="BASIC">BASIC</option>
                        <option value="PRO">PRO</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span className="premium-muted">Billing</span>
                      <select value={form.billingCycle} onChange={(e) => setForm((prev) => ({ ...prev, billingCycle: e.target.value }))} className="premium-input">
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span className="premium-muted">Duration Days</span>
                      <input type="number" value={form.durationDays} onChange={(e) => setForm((prev) => ({ ...prev, durationDays: e.target.value }))} className="premium-input" />
                    </label>
                  </div>
                  <div className="panel-actions" style={{ marginTop: 14 }}>
                    <button className="premium-btn primary" disabled={assigning} onClick={assignPlan}>{assigning ? "Saving..." : "Apply Subscription"}</button>
                  </div>
                </section>

                <section>
                  <div className="page-eyebrow">Subscription History</div>
                  <div className="premium-table" style={{ marginTop: 12 }}>
                    <table>
                      <thead><tr><th>Plan</th><th>Billing</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                      <tbody>
                        {(details.subscriptionHistory || []).map((item) => (
                          <tr key={item.id}>
                            <td>{item.plan}</td>
                            <td>{item.billingCycle || "-"}</td>
                            <td>{formatDate(item.startDate)}</td>
                            <td>{formatDate(item.endDate)}</td>
                            <td><span className={`premium-badge ${item.active ? "status-tone-success" : "status-tone-neutral"}`}>{item.active ? "ACTIVE" : "ENDED"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <div className="page-eyebrow">Payment History</div>
                  <div className="premium-table" style={{ marginTop: 12 }}>
                    <table>
                      <thead><tr><th>Plan</th><th>Billing</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {(details.paymentHistory || []).map((item) => (
                          <tr key={item.id}>
                            <td>{item.targetPlan}</td>
                            <td>{item.billingCycle || "-"}</td>
                            <td>{item.displayAmount || formatMoney(item.amountInSmallestUnit, item.currency || "INR")}</td>
                            <td><span className={`premium-badge ${item.status === "PAID" ? "status-tone-success" : item.status === "PENDING" ? "status-tone-warn" : "status-tone-neutral"}`}>{item.status}</span></td>
                            <td>{formatDate(item.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </article>
        </section>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSubscriptionsPage;
