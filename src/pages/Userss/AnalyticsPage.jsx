import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { analyticsAPI, dashboardAPI } from "../../api/endpoints";

const AnalyticsPage = () => {
  // resumeId may come from URL params or user picks from their resumes
  const { resumeId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(resumeId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user's resume list for the selector
  useEffect(() => {
    dashboardAPI
      .get()
      .then((res) => setResumes(res.data.recentResumes ?? []))
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
    if (selectedResume) load(selectedResume);
  }, [selectedResume]);

  return (
    <UserDashboardLayout title="Analytics" subtitle="Track your resume performance">
      {/* Resume selector */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label>Select Resume</label><br />
        <select
          value={selectedResume}
          onChange={(e) => setSelectedResume(e.target.value)}
        >
          <option value="">— select —</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading analytics...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {analytics && (
        <div>
          {/* Summary Stats */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <StatCard label="Total Views"     value={analytics.totalViews ?? 0} />
            <StatCard label="Unique Visitors" value={analytics.uniqueVisitors ?? 0} />
            <StatCard label="Contact Clicks"  value={analytics.contactClicks ?? 0} />
            <StatCard label="Link Clicks"     value={analytics.linkClicks ?? 0} />
          </div>

          {/* Daily/Weekly breakdown if available */}
          {analytics.dailyStats?.length > 0 && (
            <div>
              <h3>Daily Stats</h3>
              <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Unique</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.dailyStats.map((d, i) => (
                    <tr key={i}>
                      <td>{d.date}</td>
                      <td>{d.views}</td>
                      <td>{d.unique}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top referrers if available */}
          {analytics.topReferrers?.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3>Top Referrers</h3>
              <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topReferrers.map((r, i) => (
                    <tr key={i}>
                      <td>{r.source}</td>
                      <td>{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </UserDashboardLayout>
  );
};

const StatCard = ({ label, value }) => (
  <div style={{ border: "1px solid #ccc", padding: "1rem", minWidth: "140px" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</div>
    <div>{label}</div>
  </div>
);

export default AnalyticsPage;