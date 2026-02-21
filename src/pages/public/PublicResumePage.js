import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI } from '../../api';

export default function PublicResumePage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    publicAPI.getResume(id)
      .then(({ data }) => setResume(data))
      .catch(() => {
        setError('Resume not found or not published');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = () => {
    publicAPI.logDownload(id).catch(() => {});
    window.print();
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading...</p></div>;
  if (error) return <div className="public-404"><h1>404</h1><p>{error}</p><Link to="/">Go Home</Link></div>;

  const c = resume?.content || {};
  const pi = c.personalInfo || {};

  return (
    <div className="public-resume fade-in">
      <div className="no-print public-actions">
        <button className="btn btn-primary" onClick={handleDownload}>Download PDF</button>
        <Link to="/" className="btn btn-secondary">Back</Link>
      </div>
      <article className="resume-document">
        <header>
          <h1>{pi.fullName}</h1>
          {pi.title && <p className="job-title">{pi.title}</p>}
          <div className="contact">
            {pi.email && <span>{pi.email}</span>}
            {pi.phone && <span>{pi.phone}</span>}
            {pi.location && <span>{pi.location}</span>}
          </div>
          {(c.links?.github || c.links?.linkedin || c.links?.portfolio) && (
            <div className="links">
              {c.links.github && <a href={c.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
              {c.links.linkedin && <a href={c.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {c.links.portfolio && <a href={c.links.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
            </div>
          )}
        </header>
        {c.summary && <section><h2>Summary</h2><p>{c.summary}</p></section>}
        {c.experience?.length > 0 && (
          <section>
            <h2>Experience</h2>
            {c.experience.map((e, i) => (
              <div key={i} className="block">
                <strong>{e.role} at {e.company}</strong>
                {e.duration && <span className="muted"> · {e.duration}</span>}
                {e.description && <p>{e.description}</p>}
              </div>
            ))}
          </section>
        )}
        {c.education?.length > 0 && (
          <section>
            <h2>Education</h2>
            {c.education.map((e, i) => (
              <div key={i} className="block">
                <strong>{e.degree}, {e.institution}</strong>
                {e.year && <span className="muted"> · {e.year}</span>}
              </div>
            ))}
          </section>
        )}
        {c.skills?.length > 0 && (
          <section>
            <h2>Skills</h2>
            <p>{c.skills.join(', ')}</p>
          </section>
        )}
        {c.projects?.length > 0 && (
          <section>
            <h2>Projects</h2>
            {c.projects.map((p, i) => (
              <div key={i} className="block">
                <strong>{p.name}</strong>
                {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer"> · Link</a>}
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </section>
        )}
      </article>
    </div>
  );
}
