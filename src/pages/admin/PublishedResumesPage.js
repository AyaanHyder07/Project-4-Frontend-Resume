import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function PublishedResumesPage() {
  const [approved, setApproved] = useState([]);
  const [published, setPublished] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      adminAPI.getResumes({ state: 'APPROVED' }),
      adminAPI.getResumes({ state: 'PUBLISHED' }),
    ])
      .then(([a, p]) => {
        setApproved(a.data?.content || []);
        setPublished(p.data?.content || []);
      })
      .catch(() => { setApproved([]); setPublished([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const publish = (id) => adminAPI.publishResume(id).then(() => load());

  const disable = (id) => adminAPI.disableResume(id).then(() => load());

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>Published Resumes</h1>

      {approved.length > 0 && (
        <div className="card" style={{ marginTop: 16, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Ready to Publish (Approved)</h3>
          <p className="text-muted" style={{ marginBottom: 16 }}>Publish approved resumes to make them publicly visible.</p>
          <div className="list">
            {approved.map((r) => (
              <div key={r.id} className="list-item">
                <div>
                  <strong>{r.title}</strong>
                  <span className="mono" style={{ marginLeft: 8 }}>v{r.activeVersion}</span>
                </div>
                <span>{formatDate(r.updatedAt)}</span>
                <button className="btn btn-primary btn-sm" onClick={() => publish(r.id)}>Publish</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: approved.length > 0 ? 0 : 16 }}>
        <h3 style={{ marginBottom: 16 }}>Published</h3>
        {published.length === 0 ? (
          <p>No published resumes</p>
        ) : (
          <div className="list">
            {published.map((r) => (
              <div key={r.id} className="list-item">
                <div>
                  <Link to={`/resume/${r.id}`} target="_blank">{r.title}</Link>
                </div>
                <span>{formatDate(r.updatedAt)}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => disable(r.id)}>Disable</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
