import { useEffect, useState } from "react";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { analyticsAPI, dashboardAPI } from "../../api/api";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardAPI
      .get()
      .then((res) => {
        const list = res.data.recentResumes ?? [];
        setResumes(list);
        if (!selectedResume && list.length > 0) {
          setSelectedResume(String(list[0].id));
        }
      })
      .catch(() => {});
  }, []);

  const load = (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    analyticsAPI
      .getSummary(id)
      .then((res) => setAnalytics(res.data))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedResume) {
      load(selectedResume);
    }
  }, [selectedResume]);

  return (
    <UserDashboardLayout title="Analytics" subtitle="Audience and performance">
      <div className="page-shell">
        <section className="page-hero">
          <div className="page-eyebrow">Portfolio Signals</div>
          <h2 className="page-title">Measure attention with clarity.</h2>
          <p className="page-lead">
            Select a portfolio and review views, visitors, referrers, and engagement
            patterns in one composed reporting space.
          </p>
        </section>

        <section className="premium-panel">
          <div className="premium-filter-row">
            <div className="premium-field">
              <label>Select Portfolio</label>
              <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)}>
                <option value="">Choose a portfolio</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading && <section className="premium-panel"><p className="premium-muted">Loading analytics...</p></section>}
        {error && <section className="premium-panel"><p className="premium-muted" style={{ color: "var(--wine)" }}>{error}</p></section>}

        {!loading && !error && analytics ? (
          <>
            <section className="premium-grid metrics">
              <article className="premium-card kpi">
                <span className="premium-meta">Total Views</span>
                <strong className="premium-kpi-value">{analytics.totalViews ?? 0}</strong>
                <span className="premium-muted">Every recorded portfolio view</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Unique Visitors</span>
                <strong className="premium-kpi-value">{analytics.uniqueVisitors ?? 0}</strong>
                <span className="premium-muted">Estimated distinct visitors</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Contact Clicks</span>
                <strong className="premium-kpi-value">{analytics.contactClicks ?? 0}</strong>
                <span className="premium-muted">Intent signals from your contact actions</span>
              </article>
              <article className="premium-card kpi">
                <span className="premium-meta">Link Clicks</span>
                <strong className="premium-kpi-value">{analytics.linkClicks ?? 0}</strong>
                <span className="premium-muted">Outbound clicks to your profile links</span>
              </article>
            </section>

            <section className="premium-grid cards">
              <div className="premium-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Views</th>
                      <th>Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.dailyStats ?? []).length > 0 ? (
                      analytics.dailyStats.map((item, index) => (
                        <tr key={`${item.date}-${index}`}>
                          <td>{item.date}</td>
                          <td>{item.views}</td>
                          <td>{item.unique}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="premium-muted">No daily data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="premium-table">
                <table>
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.topReferrers ?? []).length > 0 ? (
                      analytics.topReferrers.map((item, index) => (
                        <tr key={`${item.source}-${index}`}>
                          <td>{item.source}</td>
                          <td>{item.visits}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="premium-muted">No referrer data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </UserDashboardLayout>
  );
};

export default AnalyticsPage;
