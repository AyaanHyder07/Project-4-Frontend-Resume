import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';

export default function OverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminAPI.getDashboard().then(({ data: d }) => setData(d)).catch(() => setData(null));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>Admin Overview</h1>
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-value">{data.totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.totalResumes}</span>
          <span className="stat-label">Total Resumes</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.submittedCount}</span>
          <span className="stat-label">Submitted</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.approvedCount}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{data.publishedCount}</span>
          <span className="stat-label">Published</span>
        </div>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3>Top Resumes by Views</h3>
        {data.topResumes?.length ? (
          <ul className="top-list">
            {data.topResumes.map((r) => (
              <li key={r.resumeId}>
                <Link to={`/resume/${r.resumeId}`} target="_blank">{r.title}</Link>
                <span className="mono">{r.viewCount} views</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No analytics yet</p>
        )}
      </div>
    </div>
  );
}
