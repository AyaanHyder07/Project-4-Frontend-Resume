import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import { adminAPI } from "../../api/api";

const STATUS_OPTIONS = ["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"];

const BADGE = {
  DRAFT:    "bg-gray-100 text-gray-600",
  PENDING:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-green-50  text-green-700  border border-green-200",
  REJECTED: "bg-red-50    text-red-700    border border-red-200",
};

const AdminResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [filter, setFilter]   = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");

  const load = (status) => {
    setLoading(true);
    const call = status === "ALL" ? adminAPI.getAllResumes() : adminAPI.getByStatus(status);
    call.then((res) => setResumes(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const handleUnpublish = (id) => {
    adminAPI.forceUnpublish(id)
      .then(() => { notify("Unpublished."); load(filter); })
      .catch(() => notify("Failed."));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Permanently delete this resume?")) return;
    adminAPI.delete(id)
      .then(() => { notify("Deleted."); load(filter); })
      .catch(() => notify("Failed to delete."));
  };

  return (
    <AdminDashboardLayout title="All Resumes" subtitle="Manage every resume in the system">

      {toast && (
        <div className="rounded-lg px-4 py-2.5 text-sm font-medium mb-5 bg-gray-100 text-gray-700">
          {toast}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!loading && resumes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-gray-400 font-medium">No resumes found for this filter.</p>
        </div>
      )}

      {resumes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Title", "Profession", "Approval", "Published", "Slug", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resumes.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.title}</td>
                  <td className="px-4 py-3 text-gray-500">{r.professionType || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${BADGE[r.approvalStatus] || BADGE.DRAFT}`}>
                      {r.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      r.published ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-500"
                    }`}>
                      {r.published ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.slug || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.published && (
                        <button
                          onClick={() => handleUnpublish(r.id)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminDashboardLayout>
  );
};

export default AdminResumesPage;