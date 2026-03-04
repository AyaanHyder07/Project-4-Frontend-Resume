import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../components/user/UserDashboardLayout";
import {
  resumeAPI, themeAPI, experienceAPI, educationAPI,
  skillAPI, projectAPI, certificationAPI, publicationAPI,
  testimonialAPI, serviceAPI, exhibitionAPI, financialAPI,
  blogAPI, contactAPI, versionAPI,
} from "../../api/endpoints";

import ProfileSection    from "./editor/ProfileSection";
import GenericSection    from "./editor/GenericSection";
import SectionsConfigPanel from "./editor/SectionsConfigPanel";

/* ─── tab list ─── */
const TABS = [
  "Meta", "Sections", "Profile", "Experience", "Education",
  "Skills", "Projects", "Certifications", "Publications",
  "Testimonials", "Services", "Exhibitions", "Financial",
  "Blogs", "Contacts", "Versions",
];

const ResumeEditorPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume]   = useState(null);
  const [themes, setThemes]   = useState([]);
  const [tab, setTab]         = useState("Meta");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");

  // Meta form
  const [metaForm, setMetaForm] = useState({ title: "", profession: "" });

  // Section data
  const [experiences,    setExperiences]    = useState([]);
  const [educations,     setEducations]     = useState([]);
  const [skills,         setSkills]         = useState([]);
  const [projects,       setProjects]       = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [publications,   setPublications]   = useState([]);
  const [testimonials,   setTestimonials]   = useState([]);
  const [services,       setServices]       = useState([]);
  const [exhibitions,    setExhibitions]    = useState([]);
  const [financials,     setFinancials]     = useState([]);
  const [blogs,          setBlogs]          = useState([]);
  const [contacts,       setContacts]       = useState([]);
  const [versions,       setVersions]       = useState([]);

  const [sectionLoading, setSectionLoading] = useState(false);

  /* ── Load resume + themes ── */
  useEffect(() => {
    Promise.all([resumeAPI.getById(resumeId), themeAPI.getAll()])
      .then(([rRes, tRes]) => {
        setResume(rRes.data);
        setMetaForm({ title: rRes.data.title, profession: rRes.data.professionType });
        setThemes(tRes.data);
      })
      .catch(() => setMsg("Failed to load resume."))
      .finally(() => setLoading(false));
  }, [resumeId]);

  /* ── Load section data when tab changes ── */
  useEffect(() => {
    if (!resumeId) return;
    setSectionLoading(true);

    const load = () => {
      switch (tab) {
        case "Experience":     return experienceAPI.getByResume(resumeId).then((r) => setExperiences(r.data));
        case "Education":      return educationAPI.getByResume(resumeId).then((r) => setEducations(r.data));
        case "Skills":         return skillAPI.getByResume(resumeId).then((r) => setSkills(r.data));
        case "Projects":       return projectAPI.getByResume(resumeId).then((r) => setProjects(r.data));
        case "Certifications": return certificationAPI.getByResume(resumeId).then((r) => setCertifications(r.data));
        case "Publications":   return publicationAPI.getByResume(resumeId).then((r) => setPublications(r.data));
        case "Testimonials":   return testimonialAPI.getByResume(resumeId).then((r) => setTestimonials(r.data));
        case "Services":       return serviceAPI.getByResume(resumeId).then((r) => setServices(r.data));
        case "Exhibitions":    return exhibitionAPI.getAll(resumeId).then((r) => setExhibitions(r.data));
        case "Financial":      return financialAPI.getByResume(resumeId).then((r) => setFinancials(r.data));
        case "Blogs":          return blogAPI.getByResume(resumeId).then((r) => setBlogs(r.data));
        case "Contacts":       return contactAPI.getInbox(resumeId).then((r) => setContacts(r.data));
        case "Versions":       return versionAPI.getAll(resumeId).then((r) => setVersions(r.data));
        default: return Promise.resolve();
      }
    };

    load().catch(() => {}).finally(() => setSectionLoading(false));
  }, [tab, resumeId]);

  /* ── Meta save ── */
  const saveMeta = () => {
    resumeAPI
      .updateMeta(resumeId, metaForm.title, metaForm.profession)
      .then((r) => { setResume(r.data); setMsg("Meta saved!"); })
      .catch(() => setMsg("Failed to save meta."));
  };

  /* ── Theme change ── */
  const changeTheme = (themeId) => {
    resumeAPI
      .changeTheme(resumeId, themeId)
      .then((r) => { setResume(r.data); setMsg("Theme updated!"); })
      .catch(() => setMsg("Failed to change theme."));
  };

  /* ── Submit for approval ── */
  const submitForApproval = () => {
    resumeAPI
      .submit(resumeId)
      .then((r) => { setResume(r.data); setMsg("Submitted for approval!"); })
      .catch(() => setMsg("Failed to submit."));
  };

  /* ── Create version snapshot ── */
  const createSnapshot = () => {
    const note = prompt("Version note (optional):") || "Manual snapshot";
    versionAPI
      .create(resumeId, note)
      .then(() => { setMsg("Snapshot created!"); versionAPI.getAll(resumeId).then((r) => setVersions(r.data)); })
      .catch(() => setMsg("Failed to create snapshot."));
  };

  /* ── Revert to previous ── */
  const revert = () => {
    if (!window.confirm("Revert to previous version?")) return;
    versionAPI
      .revert(resumeId)
      .then(() => { setMsg("Reverted!"); window.location.reload(); })
      .catch(() => setMsg("Failed to revert."));
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading resume...</div>;

  return (
    <UserDashboardLayout
      title={resume?.title || "Resume Editor"}
      subtitle={`Status: ${resume?.approvalStatus} | Published: ${resume?.published ? "Yes" : "No"}`}
      rightAction={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {resume?.approvalStatus === "DRAFT" && (
            <button onClick={submitForApproval}>Submit for Approval</button>
          )}
          <button onClick={createSnapshot}>📷 Snapshot</button>
          <button onClick={() => navigate("/resumes")}>← Back</button>
        </div>
      }
    >
      {msg && (
        <div style={{ padding: "0.5rem", background: "#f0f0f0", marginBottom: "1rem" }}>
          {msg} <button onClick={() => setMsg("")}>×</button>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 0.75rem",
              background: tab === t ? "#333" : "#eee",
              color: tab === t ? "#fff" : "#333",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── META TAB ── */}
      {tab === "Meta" && (
        <div>
          <h3>Resume Meta</h3>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Title</label><br />
            <input
              value={metaForm.title}
              onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
              style={{ width: "100%", maxWidth: "400px" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Profession Type</label><br />
            <input
              value={metaForm.profession}
              onChange={(e) => setMetaForm({ ...metaForm, profession: e.target.value })}
              style={{ width: "100%", maxWidth: "400px" }}
            />
          </div>
          <button onClick={saveMeta}>Save Meta</button>

          <hr style={{ margin: "1.5rem 0" }} />

          <h3>Theme</h3>
          <p>Current theme ID: <strong>{resume?.themeId || "None"}</strong></p>
          <select
            onChange={(e) => e.target.value && changeTheme(e.target.value)}
            defaultValue=""
          >
            <option value="">— select theme —</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <hr style={{ margin: "1.5rem 0" }} />

          <h3>Approval Status</h3>
          <p>Current: <strong>{resume?.approvalStatus}</strong></p>
          {resume?.published && resume?.slug && (
            <p>
              Public URL:{" "}
              <a href={`/p/${resume.slug}`} target="_blank" rel="noreferrer">
                /p/{resume.slug}
              </a>
            </p>
          )}
        </div>
      )}

      {/* ── SECTIONS CONFIG TAB ── */}
      {tab === "Sections" && <SectionsConfigPanel resumeId={resumeId} />}

      {/* ── PROFILE TAB ── */}
      {tab === "Profile" && <ProfileSection resumeId={resumeId} />}

      {/* ── EXPERIENCE ── */}
      {tab === "Experience" && (
        <GenericSection
          title="Experience"
          items={experiences}
          loading={sectionLoading}
          fields={[
            { name: "company",       label: "Company" },
            { name: "role",          label: "Role" },
            { name: "startDate",     label: "Start Date", type: "date" },
            { name: "endDate",       label: "End Date",   type: "date" },
            { name: "current",       label: "Currently Working Here", type: "checkbox" },
            { name: "description",   label: "Description", type: "textarea" },
            { name: "resumeId",      label: "Resume ID",  type: "hidden" },
          ]}
          onCreate={(form) =>
            experienceAPI.create({ ...form, resumeId }).then(() =>
              experienceAPI.getByResume(resumeId).then((r) => setExperiences(r.data))
            )
          }
          onUpdate={(id, form) =>
            experienceAPI.update(id, form).then(() =>
              experienceAPI.getByResume(resumeId).then((r) => setExperiences(r.data))
            )
          }
          onDelete={(id) =>
            experienceAPI.delete(id).then(() =>
              experienceAPI.getByResume(resumeId).then((r) => setExperiences(r.data))
            )
          }
        />
      )}

      {/* ── EDUCATION ── */}
      {tab === "Education" && (
        <GenericSection
          title="Education"
          items={educations}
          loading={sectionLoading}
          fields={[
            { name: "institution", label: "Institution" },
            { name: "degree",      label: "Degree" },
            { name: "field",       label: "Field of Study" },
            { name: "startDate",   label: "Start Date", type: "date" },
            { name: "endDate",     label: "End Date",   type: "date" },
            { name: "grade",       label: "Grade / GPA" },
            { name: "description", label: "Description", type: "textarea" },
          ]}
          onCreate={(form) =>
            educationAPI.create({ ...form, resumeId }).then(() =>
              educationAPI.getByResume(resumeId).then((r) => setEducations(r.data))
            )
          }
          onUpdate={(id, form) =>
            educationAPI.update(id, form).then(() =>
              educationAPI.getByResume(resumeId).then((r) => setEducations(r.data))
            )
          }
          onDelete={(id) =>
            educationAPI.delete(id).then(() =>
              educationAPI.getByResume(resumeId).then((r) => setEducations(r.data))
            )
          }
        />
      )}

      {/* ── SKILLS ── */}
      {tab === "Skills" && (
        <GenericSection
          title="Skills"
          items={skills}
          loading={sectionLoading}
          fields={[
            { name: "name",       label: "Skill Name" },
            { name: "level",      label: "Level", type: "select",
              options: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] },
            { name: "category",   label: "Category" },
          ]}
          onCreate={(form) =>
            skillAPI.create({ ...form, resumeId }).then(() =>
              skillAPI.getByResume(resumeId).then((r) => setSkills(r.data))
            )
          }
          onUpdate={(id, form) =>
            skillAPI.update(id, form).then(() =>
              skillAPI.getByResume(resumeId).then((r) => setSkills(r.data))
            )
          }
          onDelete={(id) =>
            skillAPI.delete(id).then(() =>
              skillAPI.getByResume(resumeId).then((r) => setSkills(r.data))
            )
          }
        />
      )}

      {/* ── PROJECTS ── */}
      {tab === "Projects" && (
        <GenericSection
          title="Projects"
          items={projects}
          loading={sectionLoading}
          fields={[
            { name: "title",       label: "Title" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "techStack",   label: "Tech Stack (comma separated)" },
            { name: "liveUrl",     label: "Live URL" },
            { name: "repoUrl",     label: "Repo URL" },
            { name: "startDate",   label: "Start Date", type: "date" },
            { name: "endDate",     label: "End Date",   type: "date" },
          ]}
          onCreate={(form) =>
            projectAPI.create({ ...form, resumeId }).then(() =>
              projectAPI.getByResume(resumeId).then((r) => setProjects(r.data))
            )
          }
          onUpdate={(id, form) =>
            projectAPI.update(id, form).then(() =>
              projectAPI.getByResume(resumeId).then((r) => setProjects(r.data))
            )
          }
          onDelete={(id) =>
            projectAPI.delete(id).then(() =>
              projectAPI.getByResume(resumeId).then((r) => setProjects(r.data))
            )
          }
        />
      )}

      {/* ── CERTIFICATIONS ── */}
      {tab === "Certifications" && (
        <GenericSection
          title="Certifications"
          items={certifications}
          loading={sectionLoading}
          fields={[
            { name: "name",           label: "Certification Name" },
            { name: "issuingOrg",     label: "Issuing Organization" },
            { name: "issueDate",      label: "Issue Date",  type: "date" },
            { name: "expiryDate",     label: "Expiry Date", type: "date" },
            { name: "credentialId",   label: "Credential ID" },
            { name: "credentialUrl",  label: "Credential URL" },
          ]}
          onCreate={(form) =>
            certificationAPI.create({ ...form, resumeId }).then(() =>
              certificationAPI.getByResume(resumeId).then((r) => setCertifications(r.data))
            )
          }
          onUpdate={(id, form) =>
            certificationAPI.update(id, form).then(() =>
              certificationAPI.getByResume(resumeId).then((r) => setCertifications(r.data))
            )
          }
          onDelete={(id) =>
            certificationAPI.delete(id).then(() =>
              certificationAPI.getByResume(resumeId).then((r) => setCertifications(r.data))
            )
          }
        />
      )}

      {/* ── PUBLICATIONS ── */}
      {tab === "Publications" && (
        <GenericSection
          title="Publications"
          items={publications}
          loading={sectionLoading}
          fields={[
            { name: "title",       label: "Title" },
            { name: "publisher",   label: "Publisher" },
            { name: "publishDate", label: "Publish Date", type: "date" },
            { name: "url",         label: "URL" },
            { name: "description", label: "Description", type: "textarea" },
          ]}
          onCreate={(form) =>
            publicationAPI.create({ ...form, resumeId }).then(() =>
              publicationAPI.getByResume(resumeId).then((r) => setPublications(r.data))
            )
          }
          onUpdate={(id, form) =>
            publicationAPI.update(id, form).then(() =>
              publicationAPI.getByResume(resumeId).then((r) => setPublications(r.data))
            )
          }
          onDelete={(id) =>
            publicationAPI.delete(id).then(() =>
              publicationAPI.getByResume(resumeId).then((r) => setPublications(r.data))
            )
          }
        />
      )}

      {/* ── TESTIMONIALS ── */}
      {tab === "Testimonials" && (
        <GenericSection
          title="Testimonials"
          items={testimonials}
          loading={sectionLoading}
          fields={[
            { name: "authorName",  label: "Author Name" },
            { name: "authorTitle", label: "Author Title" },
            { name: "company",     label: "Company" },
            { name: "content",     label: "Testimonial", type: "textarea" },
            { name: "avatarUrl",   label: "Avatar URL" },
          ]}
          onCreate={(form) =>
            testimonialAPI.create({ ...form, resumeId }).then(() =>
              testimonialAPI.getByResume(resumeId).then((r) => setTestimonials(r.data))
            )
          }
          onUpdate={(id, form) =>
            testimonialAPI.update(id, form).then(() =>
              testimonialAPI.getByResume(resumeId).then((r) => setTestimonials(r.data))
            )
          }
          onDelete={(id) =>
            testimonialAPI.delete(id).then(() =>
              testimonialAPI.getByResume(resumeId).then((r) => setTestimonials(r.data))
            )
          }
        />
      )}

      {/* ── SERVICES ── */}
      {tab === "Services" && (
        <GenericSection
          title="Services"
          items={services}
          loading={sectionLoading}
          fields={[
            { name: "title",       label: "Service Title" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "price",       label: "Price" },
            { name: "currency",    label: "Currency" },
            { name: "deliveryDays", label: "Delivery Days", type: "number" },
          ]}
          onCreate={(form) =>
            serviceAPI.create({ ...form, resumeId }).then(() =>
              serviceAPI.getByResume(resumeId).then((r) => setServices(r.data))
            )
          }
          onUpdate={(id, form) =>
            serviceAPI.update(id, form).then(() =>
              serviceAPI.getByResume(resumeId).then((r) => setServices(r.data))
            )
          }
          onDelete={(id) =>
            serviceAPI.delete(id).then(() =>
              serviceAPI.getByResume(resumeId).then((r) => setServices(r.data))
            )
          }
        />
      )}

      {/* ── EXHIBITIONS / AWARDS ── */}
      {tab === "Exhibitions" && (
        <GenericSection
          title="Exhibitions & Awards"
          items={exhibitions}
          loading={sectionLoading}
          fields={[
            { name: "title",       label: "Title" },
            { name: "type",        label: "Type", type: "select",
              options: ["EXHIBITION", "AWARD", "RECOGNITION", "GRANT"] },
            { name: "organizer",   label: "Organizer" },
            { name: "date",        label: "Date", type: "date" },
            { name: "location",    label: "Location" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "url",         label: "URL" },
          ]}
          onCreate={(form) =>
            exhibitionAPI.create({ ...form, resumeId }).then(() =>
              exhibitionAPI.getAll(resumeId).then((r) => setExhibitions(r.data))
            )
          }
          onUpdate={(id, form) =>
            exhibitionAPI.update(id, form).then(() =>
              exhibitionAPI.getAll(resumeId).then((r) => setExhibitions(r.data))
            )
          }
          onDelete={(id) =>
            exhibitionAPI.delete(id).then(() =>
              exhibitionAPI.getAll(resumeId).then((r) => setExhibitions(r.data))
            )
          }
        />
      )}

      {/* ── FINANCIAL CREDENTIALS ── */}
      {tab === "Financial" && (
        <GenericSection
          title="Financial Credentials"
          items={financials}
          loading={sectionLoading}
          fields={[
            { name: "credentialType", label: "Credential Type" },
            { name: "issuingBody",    label: "Issuing Body" },
            { name: "licenseNumber",  label: "License Number" },
            { name: "issueDate",      label: "Issue Date",  type: "date" },
            { name: "expiryDate",     label: "Expiry Date", type: "date" },
            { name: "isPublic",       label: "Show Publicly", type: "checkbox" },
          ]}
          onCreate={(form) =>
            financialAPI.create({ ...form, resumeId }).then(() =>
              financialAPI.getByResume(resumeId).then((r) => setFinancials(r.data))
            )
          }
          onUpdate={(id, form) =>
            financialAPI.update(id, form).then(() =>
              financialAPI.getByResume(resumeId).then((r) => setFinancials(r.data))
            )
          }
          onDelete={(id) =>
            financialAPI.delete(id).then(() =>
              financialAPI.getByResume(resumeId).then((r) => setFinancials(r.data))
            )
          }
        />
      )}

      {/* ── BLOGS ── */}
      {tab === "Blogs" && (
        <GenericSection
          title="Blog Posts"
          items={blogs}
          loading={sectionLoading}
          fields={[
            { name: "title",       label: "Title" },
            { name: "slug",        label: "Slug" },
            { name: "content",     label: "Content", type: "textarea" },
            { name: "coverUrl",    label: "Cover Image URL" },
            { name: "tags",        label: "Tags (comma separated)" },
            { name: "published",   label: "Published", type: "checkbox" },
          ]}
          onCreate={(form) =>
            blogAPI.create({ ...form, resumeId }).then(() =>
              blogAPI.getByResume(resumeId).then((r) => setBlogs(r.data))
            )
          }
          onUpdate={(id, form) =>
            blogAPI.update(id, form).then(() =>
              blogAPI.getByResume(resumeId).then((r) => setBlogs(r.data))
            )
          }
          onDelete={(id) =>
            blogAPI.delete(id).then(() =>
              blogAPI.getByResume(resumeId).then((r) => setBlogs(r.data))
            )
          }
        />
      )}

      {/* ── CONTACTS (READ ONLY INBOX) ── */}
      {tab === "Contacts" && (
        <div>
          <h3>Contact Inbox</h3>
          {sectionLoading && <p>Loading...</p>}
          {contacts.length === 0 && !sectionLoading && <p>No messages yet.</p>}
          {contacts.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem" }}>
              <div><strong>{c.senderName}</strong> — {c.senderEmail}</div>
              <div style={{ margin: "0.25rem 0" }}>{c.message}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  defaultValue={c.status}
                  onChange={(e) =>
                    contactAPI.updateStatus(c.id, e.target.value).catch(() => {})
                  }
                >
                  <option value="UNREAD">UNREAD</option>
                  <option value="READ">READ</option>
                  <option value="REPLIED">REPLIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <button
                  onClick={() =>
                    contactAPI.delete(c.id).then(() =>
                      contactAPI.getInbox(resumeId).then((r) => setContacts(r.data))
                    )
                  }
                  style={{ color: "red" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VERSIONS ── */}
      {tab === "Versions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Version History</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={createSnapshot}>📷 Create Snapshot</button>
              <button onClick={revert} style={{ color: "red" }}>
                ↩ Revert to Previous
              </button>
            </div>
          </div>
          {sectionLoading && <p>Loading...</p>}
          {versions.length === 0 && !sectionLoading && <p>No versions yet.</p>}
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Note</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v, i) => (
                <tr key={v.id}>
                  <td>{i + 1}</td>
                  <td>{v.note || "—"}</td>
                  <td>{new Date(v.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </UserDashboardLayout>
  );
};

export default ResumeEditorPage;
