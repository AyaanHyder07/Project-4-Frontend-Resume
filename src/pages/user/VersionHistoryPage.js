import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function VersionHistoryPage() {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeAPI.getVersions(id)
      .then(({ data }) => setVersions(data))
      .catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <div className="page-header">
        <h1>Version History</h1>
        <Link to={`/dashboard/resumes/${id}`} className="btn btn-secondary">Back to Resume</Link>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id}>
                <td className="mono">v{v.version}</td>
                <td>{formatDate(v.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
