import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function MyResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeAPI.getMy()
      .then(({ data }) => setResumes(data))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <div className="page-header">
        <h1>My Resumes</h1>
        <Link to="/dashboard/resumes/new" className="btn btn-primary">+ New Resume</Link>
      </div>
      <div className="resume-grid">
        {resumes.length === 0 ? (
          <div className="card empty-state">
            <p>No resumes yet. Create your first resume!</p>
            <Link to="/dashboard/resumes/new" className="btn btn-primary">Create Resume</Link>
          </div>
        ) : (
          resumes.map((r) => (
            <div key={r.id} className="card resume-card">
              <div className="resume-card-header">
                <h3>{r.title}</h3>
                <span className={`badge badge-${r.state.toLowerCase()}`}>{r.state}</span>
              </div>
              <p className="resume-meta">v{r.activeVersion} · Updated {formatDate(r.updatedAt)}</p>
              <div className="resume-card-actions">
                <Link to={`/dashboard/resumes/${r.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                <Link to={`/dashboard/resumes/${r.id}/versions`} className="btn btn-ghost btn-sm">Versions</Link>
                {r.state === 'PUBLISHED' && (
                  <Link to={`/dashboard/resumes/${r.id}/link`} className="btn btn-ghost btn-sm">Public Link</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
