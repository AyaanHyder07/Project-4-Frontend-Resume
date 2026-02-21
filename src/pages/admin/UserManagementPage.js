import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = () => {
    adminAPI.getUsers({ page: 0, size: 50 })
      .then(({ data }) => setUsers(data.content || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const block = (id) => adminAPI.blockUser(id).then(load);
  const unblock = (id) => adminAPI.unblockUser(id).then(load);

  const openResumes = (u) => {
    adminAPI.getUserResumes(u.id).then(({ data }) => setModal({ user: u, resumes: data })).catch(() => setModal({ user: u, resumes: [] }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>User Management</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><span className={`badge badge-${u.status === 'ACTIVE' ? 'approved' : 'disabled'}`}>{u.status}</span></td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openResumes(u)}>Resumes</button>
                  {u.role !== 'ROLE_ADMIN' && (
                    u.status === 'ACTIVE' ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => block(u.id)}>Block</button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => unblock(u.id)}>Unblock</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Resumes: {modal.user.email}</h3>
            {modal.resumes.length === 0 ? <p>No resumes</p> : (
              <ul>
                {modal.resumes.map((r) => (
                  <li key={r.id}>{r.title} — <span className={`badge badge-${r.state.toLowerCase()}`}>{r.state}</span></li>
                ))}
              </ul>
            )}
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
