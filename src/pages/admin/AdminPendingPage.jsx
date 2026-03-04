import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/endpoints";

const AdminPendingPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const load = () => {
    setLoading(true);
    adminAPI.getPending()
      .then((res) => setResumes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const notify = (msg, type = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const handleApprove = (id) => {
    adminAPI.approve(id)
      .then(() => { notify("Approved & published!", "green"); load(); })
      .catch(() => notify("Failed to approve.", "red"));
  };

  const handleReject = (id) => {
    adminAPI.reject(id)
      .then(() => { notify("Resume rejected.", "red"); load(); })
      .catch(() => notify("Failed to reject.", "red"));
  };

  const toastColors = {
    green: "bg-green-50 text-green-700 border border-green-200",
    red:   "bg-red-50   text-red-700   border border-red-200",
  };

  return (
    <AdminDashboardLayout
      title="Pending Approvals"
      subtitle="Review and approve submitted resumes"
    >
      {/* Toast */}
      {toast.msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-6 ${toastColors[toast.type]}`}>
          {toast.msg}
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!loading && resumes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-400 font-medium">No pending resumes — all clear!</p>
        </div>
      )}

      <div className="space-y-3">
        {resumes.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4 flex-wrap hover:shadow-sm transition-shadow"
          >
            <div>
              <p className="font-bold text-gray-900 text-[15px]">{r.title}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {r.professionType} &middot; User: <code className="text-xs bg-gray-100 px-1 rounded">{r.userId}</code>
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Updated: {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleApprove(r.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
              >
                ✓ Approve & Publish
              </button>
              <button
                onClick={() => handleReject(r.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminPendingPage;