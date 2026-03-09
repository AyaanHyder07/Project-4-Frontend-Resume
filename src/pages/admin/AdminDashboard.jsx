import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/api";

const AdminDashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getAllResumes()
      .then((res) => setResumes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:     resumes.length,
    pending:   resumes.filter((r) => r.approvalStatus === "PENDING").length,
    approved:  resumes.filter((r) => r.approvalStatus === "APPROVED").length,
    rejected:  resumes.filter((r) => r.approvalStatus === "REJECTED").length,
    published: resumes.filter((r) => r.published).length,
  };

  return (
    <AdminDashboardLayout title="Dashboard" subtitle="System overview">
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total"     value={counts.total}     color="border-gray-300" />
        <StatCard label="Pending"   value={counts.pending}   color="border-yellow-400" textColor="text-yellow-500" clickable onClick={() => navigate("/admin/pending")} />
        <StatCard label="Approved"  value={counts.approved}  color="border-green-400"  textColor="text-green-500" />
        <StatCard label="Rejected"  value={counts.rejected}  color="border-red-400"    textColor="text-red-500" />
        <StatCard label="Published" value={counts.published} color="border-blue-400"   textColor="text-blue-500" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Btn primary onClick={() => navigate("/admin/pending")}>
            Review Pending ({counts.pending})
          </Btn>
          <Btn onClick={() => navigate("/admin/resumes")}>All Resumes</Btn>
          <Btn onClick={() => navigate("/admin/themes")}>Manage Themes</Btn>
          <Btn onClick={() => navigate("/admin/layouts")}>Manage Layouts</Btn>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

const StatCard = ({ label, value, color, textColor = "text-gray-900", clickable, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border-t-4 ${color} border border-gray-200 p-5
      ${clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
    `}
  >
    <div className={`text-3xl font-extrabold tracking-tight ${textColor}`}>{value}</div>
    <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</div>
  </div>
);

const Btn = ({ children, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      primary
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

export default AdminDashboard;