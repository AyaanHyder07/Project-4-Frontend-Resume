import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import { dashboardAPI } from "../../api/endpoints";


const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI
      .get()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserDashboardLayout
      title="Dashboard"
      subtitle="Welcome back"
      rightAction={
        <button onClick={() => navigate("/resumes/new")}>
          + New Resume
        </button>
      }
    >
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          {/* Summary Stats */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <StatCard label="Total Resumes"   value={data.totalResumes ?? 0} />
            <StatCard label="Published"        value={data.publishedCount ?? 0} />
            <StatCard label="Pending Approval" value={data.pendingCount ?? 0} />
            <StatCard label="Total Views"      value={data.totalViews ?? 0} />
          </div>

          {/* Recent Resumes */}
          {data.recentResumes?.length > 0 && (
            <div>
              <h3>Recent Resumes</h3>
              <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Published</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentResumes.map((r) => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td>{r.status}</td>
                      <td>{r.approvalStatus}</td>
                      <td>{r.published ? "Yes" : "No"}</td>
                      <td>
                        <button onClick={() => navigate(`/resumes/${r.id}`)}>
                          Edit
                        </button>
                      </td>
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
  <div style={{ border: "1px solid #ccc", padding: "1rem", minWidth: "150px" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</div>
    <div>{label}</div>
  </div>
);

export default Dashboard;
