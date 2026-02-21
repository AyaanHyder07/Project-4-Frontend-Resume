import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PublicLinkPage() {
  const { id } = useParams();
  const url = `${window.location.origin}/resume/${id}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content fade-in-up">
      <div className="page-header">
        <h1>Public Link</h1>
        <Link to={`/dashboard/resumes/${id}`} className="btn btn-secondary">Back to Resume</Link>
      </div>
      <div className="card">
        <p className="label">Share this link to let anyone view your resume:</p>
        <div className="link-box">
          <code className="mono">{url}</code>
          <button className="btn btn-primary" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
