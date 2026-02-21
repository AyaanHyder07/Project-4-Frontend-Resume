import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AuditLogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    adminAPI.getAudit({ page: 0, size: 50 })
      .then(({ data }) => setItems(data.content || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content fade-in-up">
      <h1>Audit Log</h1>
      <div className="card" style={{ marginTop: 16 }}>
        {items.length === 0 ? (
          <p>No audit entries</p>
        ) : (
          <div className="audit-list">
            {items.map((a) => (
              <div key={a.id} className="audit-item">
                <div className="audit-row" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                  <span className="audit-action">{a.action}</span>
                  <span className="audit-entity">{a.entityType} {a.entityId}</span>
                  <span className="audit-actor">{a.actorId}</span>
                  <span>{formatDate(a.timestamp)}</span>
                </div>
                {expanded === a.id && a.metadata && Object.keys(a.metadata).length > 0 && (
                  <pre className="audit-meta">{JSON.stringify(a.metadata, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
