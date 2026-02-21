import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AnalyticsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics({ page: 0, size: 50 })
      .then(({ data }) => setItems(data.content || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>Analytics</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Resume ID</th>
              <th>Action</th>
              <th>IP</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td className="mono">{a.resumeId}</td>
                <td><span className={`badge badge-${a.action === 'VIEW' ? 'published' : 'approved'}`}>{a.action}</span></td>
                <td className="mono">{a.viewerIp}</td>
                <td>{formatDate(a.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p>No analytics data</p>}
      </div>
    </div>
  );
}
