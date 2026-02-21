import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function ModerationPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    adminAPI.getResumes({ state: 'SUBMITTED' })
      .then(({ data }) => setResumes(data.content || []))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const approve = (id) => {
    adminAPI.approveResume(id).then(() => load()).catch(console.error);
  };

  const reject = () => {
    if (!rejectModal) return;
    adminAPI.rejectResume(rejectModal.id, { reason: rejectReason }).then(() => {
      setRejectModal(null);
      setRejectReason('');
      load();
    }).catch(console.error);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>Moderation</h1>
      <p className="text-muted">Resumes awaiting approval</p>
      <div className="card" style={{ marginTop: 16 }}>
        {resumes.length === 0 ? (
          <p>No resumes to moderate</p>
        ) : (
          <div className="list">
            {resumes.map((r) => (
              <div key={r.id} className="list-item">
                <div>
                  <strong>{r.title}</strong>
                  <span className="mono" style={{ marginLeft: 8 }}>v{r.activeVersion}</span>
                </div>
                <span>{formatDate(r.updatedAt)}</span>
                <div className="list-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => approve(r.id)}>Approve</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setRejectModal({ id: r.id, title: r.title })}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Reject: {rejectModal.title}</h3>
            <div className="form-group">
              <label className="label">Reason (optional)</label>
              <textarea className="textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={reject}>Reject</button>
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
