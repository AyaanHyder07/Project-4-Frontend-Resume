import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../../api';

const emptyContent = () => ({
  personalInfo: { fullName: '', title: '', email: '', phone: '', location: '' },
  summary: '',
  experience: [{ company: '', role: '', duration: '', description: '' }],
  education: [{ institution: '', degree: '', year: '' }],
  skills: [],
  projects: [{ name: '', description: '', link: '' }],
  links: { github: '', linkedin: '', portfolio: '' },
});

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(emptyContent());
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!isNew) {
      resumeAPI.getById(id)
        .then(({ data }) => {
          setState(data.state);
          setTitle(data.title);
          if (data.content) {
            setContent({
              personalInfo: data.content.personalInfo || emptyContent().personalInfo,
              summary: data.content.summary || '',
              experience: data.content.experience?.length ? data.content.experience : emptyContent().experience,
              education: data.content.education?.length ? data.content.education : emptyContent().education,
              skills: data.content.skills || [],
              projects: data.content.projects?.length ? data.content.projects : emptyContent().projects,
              links: data.content.links || emptyContent().links,
            });
            setSkillsInput((data.content.skills || []).join(', '));
          }
        })
        .catch(() => setError('Failed to load resume'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const buildPayload = () => ({
    title,
    personalInfo: content.personalInfo,
    summary: content.summary,
    experience: content.experience.filter((e) => e.company && e.role),
    education: content.education.filter((e) => e.institution && e.degree),
    skills: content.skills,
    projects: content.projects.filter((p) => p.name),
    links: content.links,
  });

  const handleSave = async () => {
    const skills = skillsInput.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    setContent((c) => ({ ...c, skills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const skills = skillsInput.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const payload = { ...buildPayload(), skills };

    try {
      if (isNew) {
        const { data } = await resumeAPI.create(payload);
        navigate(`/dashboard/resumes/${data.id}`);
      } else {
        await resumeAPI.update(id, payload);
        const { data } = await resumeAPI.getById(id);
        setTitle(data.title);
        if (data.content) setContent({ ...content, ...data.content, skills: data.content.skills || [] });
        setSkillsInput((data.content?.skills || []).join(', '));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitResume = async () => {
    if (isNew) return;
    setSaving(true);
    try {
      await resumeAPI.submit(id);
      navigate('/dashboard/resumes');
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const addRow = (section) => {
    const defaults = {
      experience: { company: '', role: '', duration: '', description: '' },
      education: { institution: '', degree: '', year: '' },
      projects: { name: '', description: '', link: '' },
    };
    setContent((c) => ({ ...c, [section]: [...(c[section] || []), defaults[section]] }));
  };

  const removeRow = (section, idx) => {
    setContent((c) => ({
      ...c,
      [section]: c[section].filter((_, i) => i !== idx),
    }));
  };

  const updateRow = (section, idx, field, value) => {
    setContent((c) => ({
      ...c,
      [section]: c[section].map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  if (loading) return <div>Loading...</div>;

  const isReadOnly = !isNew && state && state !== 'DRAFT';

  return (
    <div className="page-content fade-in-up">
      <div className="page-header">
        <h1>{isNew ? 'New Resume' : 'Edit Resume'}</h1>
      </div>
      {error && <div className="auth-error">{error}</div>}
      {isReadOnly && <div className="auth-error">Cannot edit: resume is not in DRAFT state.</div>}
      <form onSubmit={handleSubmit} className="resume-form">
        <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
        <div className="card form-section">
          <h3>Title</h3>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="My Resume" />
        </div>

        <div className="card form-section">
          <h3>Personal Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input className="input" value={content.personalInfo?.fullName || ''} onChange={(e) => setContent((c) => ({ ...c, personalInfo: { ...c.personalInfo, fullName: e.target.value } }))} required />
            </div>
            <div className="form-group">
              <label className="label">Job Title</label>
              <input className="input" value={content.personalInfo?.title || ''} onChange={(e) => setContent((c) => ({ ...c, personalInfo: { ...c.personalInfo, title: e.target.value } }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Email *</label>
              <input type="email" className="input" value={content.personalInfo?.email || ''} onChange={(e) => setContent((c) => ({ ...c, personalInfo: { ...c.personalInfo, email: e.target.value } }))} required />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" value={content.personalInfo?.phone || ''} onChange={(e) => setContent((c) => ({ ...c, personalInfo: { ...c.personalInfo, phone: e.target.value } }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Location</label>
            <input className="input" value={content.personalInfo?.location || ''} onChange={(e) => setContent((c) => ({ ...c, personalInfo: { ...c.personalInfo, location: e.target.value } }))} />
          </div>
        </div>

        <div className="card form-section">
          <h3>Summary</h3>
          <textarea className="textarea" value={content.summary} onChange={(e) => setContent((c) => ({ ...c, summary: e.target.value }))} />
        </div>

        <div className="card form-section">
          <div className="section-header">
            <h3>Experience</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow('experience')}>+ Add</button>
          </div>
          {content.experience?.map((exp, i) => (
            <div key={i} className="repeater-row">
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Company *</label>
                  <input className="input" value={exp.company} onChange={(e) => updateRow('experience', i, 'company', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Role *</label>
                  <input className="input" value={exp.role} onChange={(e) => updateRow('experience', i, 'role', e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Duration</label>
                  <input className="input" value={exp.duration} onChange={(e) => updateRow('experience', i, 'duration', e.target.value)} />
                </div>
                <div className="form-group flex-grow">
                  <label className="label">Description</label>
                  <textarea className="textarea" rows={2} value={exp.description} onChange={(e) => updateRow('experience', i, 'description', e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow('experience', i)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card form-section">
          <div className="section-header">
            <h3>Education</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow('education')}>+ Add</button>
          </div>
          {content.education?.map((ed, i) => (
            <div key={i} className="repeater-row">
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Institution *</label>
                  <input className="input" value={ed.institution} onChange={(e) => updateRow('education', i, 'institution', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Degree *</label>
                  <input className="input" value={ed.degree} onChange={(e) => updateRow('education', i, 'degree', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Year</label>
                  <input className="input" value={ed.year} onChange={(e) => updateRow('education', i, 'year', e.target.value)} />
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow('education', i)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card form-section">
          <h3>Skills (comma or Enter separated)</h3>
          <input className="input" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Java, MongoDB" onBlur={handleSave} />
        </div>

        <div className="card form-section">
          <div className="section-header">
            <h3>Projects</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow('projects')}>+ Add</button>
          </div>
          {content.projects?.map((pr, i) => (
            <div key={i} className="repeater-row">
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Name *</label>
                  <input className="input" value={pr.name} onChange={(e) => updateRow('projects', i, 'name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Link</label>
                  <input className="input" value={pr.link} onChange={(e) => updateRow('projects', i, 'link', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="textarea" rows={2} value={pr.description} onChange={(e) => updateRow('projects', i, 'description', e.target.value)} />
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow('projects', i)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card form-section">
          <h3>Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="label">GitHub</label>
              <input className="input" value={content.links?.github || ''} onChange={(e) => setContent((c) => ({ ...c, links: { ...c.links, github: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="label">LinkedIn</label>
              <input className="input" value={content.links?.linkedin || ''} onChange={(e) => setContent((c) => ({ ...c, links: { ...c.links, linkedin: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="label">Portfolio</label>
              <input className="input" value={content.links?.portfolio || ''} onChange={(e) => setContent((c) => ({ ...c, links: { ...c.links, portfolio: e.target.value } }))} />
            </div>
          </div>
        </div>

        </fieldset>
        <div className="form-actions">
          {!isReadOnly && (
            <>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              {!isNew && state === 'DRAFT' && (
                <button type="button" className="btn btn-secondary" onClick={handleSubmitResume} disabled={saving}>Submit for Review</button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
