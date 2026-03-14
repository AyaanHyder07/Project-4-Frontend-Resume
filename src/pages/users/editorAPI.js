/**
 * editorAPI.js
 * All API calls for the Resume Editor page.
 * Every endpoint, HTTP method, path, and body matches the backend exactly.
 */

const h = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const mh = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const ok = (r) => { if (!r.ok) return r.json().then((e) => Promise.reject(e)); return r.json(); };
const okVoid = (r) => { if (!r.ok) return r.json().then((e) => Promise.reject(e)); };

// Add base URL to bypass proxy issues
const BASE = "http://localhost:8081";
const origFetch = window.fetch;
const fetch = (url, options) => origFetch(url.startsWith('/api') ? BASE + url : url, options);

/* ── RESUME ───────────────────────────────────────────────────────── */
export const resumeAPI = {
  getById: (id) => fetch(`/api/resumes/${id}`, { headers: h() }).then(ok),
  getAll: () => fetch(`/api/resumes`, { headers: h() }).then(ok),
  updateMeta: (id, body) => fetch(`/api/resumes/${id}/meta`, { method: "PATCH", headers: h(), body: JSON.stringify(body) }).then(ok),
  changeTheme: (id, themeId) => fetch(`/api/resumes/${id}/theme`, { method: "PATCH", headers: h(), body: JSON.stringify({ themeId }) }).then(ok),
  submit: (id) => fetch(`/api/resumes/${id}/submit`, { method: "POST", headers: h() }).then(ok),
  publish: (id) => fetch(`/api/resumes/${id}/publish`, { method: "POST", headers: h() }).then(ok),
  unpublish: (id) => fetch(`/api/resumes/${id}/unpublish`, { method: "POST", headers: h() }).then(ok),
  delete: (id) => fetch(`/api/resumes/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
};

/* ── SECTIONS ─────────────────────────────────────────────────────── */
// GET /api/sections/resume/{resumeId}
// PUT /api/sections/{configId}           body: { enabled?, customTitle?, displayOrder? }
// PUT /api/sections/resume/{resumeId}/reorder  body: string[]
export const sectionAPI = {
  getAll: (resumeId) => fetch(`/api/sections/resume/${resumeId}`, { headers: h() }).then(ok),
  update: (configId, body) => fetch(`/api/sections/${configId}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  reorder: (resumeId, ids) => fetch(`/api/sections/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── USER PROFILE ─────────────────────────────────────────────────── */
// POST /api/profile  multipart: data + profilePhoto
// PUT  /api/profile/{resumeId}  multipart: data + profilePhoto
// GET  /api/profile/{resumeId}
// DELETE /api/profile/{resumeId}
export const profileAPI = {
  get: (resumeId) => fetch(`/api/profile/${resumeId}`, { headers: h() }).then(ok),
  create: (resumeId, data, photoFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify({ ...data, resumeId })], { type: "application/json" }));
    if (photoFile) fd.append("profilePhoto", photoFile);
    return fetch(`/api/profile`, { method: "POST", headers: mh(), body: fd }).then(ok);
  },
  update: (resumeId, data, photoFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (photoFile) fd.append("profilePhoto", photoFile);
    return fetch(`/api/profile/${resumeId}`, { method: "PUT", headers: mh(), body: fd }).then(ok);
  },
  delete: (resumeId) => fetch(`/api/profile/${resumeId}`, { method: "DELETE", headers: h() }).then(okVoid),
};

/* ── EXPERIENCE ───────────────────────────────────────────────────── */
// POST /api/experiences            body JSON
// PUT  /api/experiences/{id}       body JSON
// DELETE /api/experiences/{id}
// GET  /api/experiences/resume/{resumeId}
// PUT  /api/experiences/resume/{resumeId}/reorder  body: string[]
export const experienceAPI = {
  getAll: (resumeId) => fetch(`/api/experiences/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/experiences`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/experiences/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/experiences/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/experiences/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── EDUCATION ────────────────────────────────────────────────────── */
export const educationAPI = {
  getAll: (resumeId) => fetch(`/api/educations/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/educations`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/educations/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/educations/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/educations/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── SKILLS ───────────────────────────────────────────────────────── */
// reorder: PUT /api/skills/reorder/{resumeId}  ← note path pattern
export const skillAPI = {
  getAll: (resumeId) => fetch(`/api/skills/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/skills`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/skills/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/skills/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/skills/reorder/${resumeId}`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── PROJECTS ─────────────────────────────────────────────────────── */
// reorder: POST /api/projects/reorder/{resumeId}  ← POST not PUT!
// delete returns ok() not noContent()
export const projectAPI = {
  getAll: (resumeId) => fetch(`/api/projects/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/projects`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/projects/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/projects/${id}`, { method: "DELETE", headers: h() }),
  reorder: (resumeId, ids) => fetch(`/api/projects/reorder/${resumeId}`, { method: "POST", headers: h(), body: JSON.stringify(ids) }),
};

/* ── PROJECT GALLERY ──────────────────────────────────────────────── */
// All multipart. Paths use /project/{projectId} not /resume/
export const galleryAPI = {
  getAll: (projectId) => fetch(`/api/project-gallery/project/${projectId}`, { headers: h() }).then(ok),
  create: (data, mediaFile, thumbnailFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (mediaFile) fd.append("mediaFile", mediaFile);
    if (thumbnailFile) fd.append("thumbnailFile", thumbnailFile);
    return fetch(`/api/project-gallery`, { method: "POST", headers: mh(), body: fd }).then(ok);
  },
  update: (id, data, mediaFile, thumbnailFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (mediaFile) fd.append("mediaFile", mediaFile);
    if (thumbnailFile) fd.append("thumbnailFile", thumbnailFile);
    return fetch(`/api/project-gallery/${id}`, { method: "PUT", headers: mh(), body: fd }).then(ok);
  },
  delete: (id) => fetch(`/api/project-gallery/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (projectId, ids) => fetch(`/api/project-gallery/project/${projectId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── CERTIFICATIONS ───────────────────────────────────────────────── */
// multipart: data + file
export const certificationAPI = {
  getAll: (resumeId) => fetch(`/api/certifications/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (data, file) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (file) fd.append("file", file);
    return fetch(`/api/certifications`, { method: "POST", headers: mh(), body: fd }).then(ok);
  },
  update: (id, data, file) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (file) fd.append("file", file);
    return fetch(`/api/certifications/${id}`, { method: "PUT", headers: mh(), body: fd }).then(ok);
  },
  delete: (id) => fetch(`/api/certifications/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/certifications/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── BLOGS ────────────────────────────────────────────────────────── */
// multipart: data + coverFile. NO reorder endpoint!
// visibility: "Draft" | "Public"  (string, not enum)
export const blogAPI = {
  getAll: (resumeId) => fetch(`/api/blogs/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (data, coverFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (coverFile) fd.append("coverFile", coverFile);
    return fetch(`/api/blogs`, { method: "POST", headers: mh(), body: fd }).then(ok);
  },
  update: (id, data, coverFile) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (coverFile) fd.append("coverFile", coverFile);
    return fetch(`/api/blogs/${id}`, { method: "PUT", headers: mh(), body: fd }).then(ok);
  },
  delete: (id) => fetch(`/api/blogs/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
};

/* ── TESTIMONIALS ─────────────────────────────────────────────────── */
// reorder: PUT /api/testimonials/reorder/{resumeId}
// verified=false always on create
// public only shows verified=true
export const testimonialAPI = {
  getAll: (resumeId) => fetch(`/api/testimonials/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/testimonials`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/testimonials/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/testimonials/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/testimonials/reorder/${resumeId}`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── SERVICE OFFERINGS ────────────────────────────────────────────── */
// NO reorder endpoint!
// visibility default PUBLIC
export const serviceAPI = {
  getAll: (resumeId) => fetch(`/api/services/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/services`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/services/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/services/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
};

/* ── EXHIBITIONS / AWARDS ─────────────────────────────────────────── */
// awardType must be .toUpperCase() — backend does AwardType.valueOf(.toUpperCase())
export const exhibitionAPI = {
  getAll: (resumeId) => fetch(`/api/exhibitions/resume/${resumeId}`, { headers: h() }).then(ok),
  getByType: (resumeId, type) => fetch(`/api/exhibitions/resume/${resumeId}/type/${type}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/exhibitions`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/exhibitions/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/exhibitions/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/exhibitions/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── MEDIA APPEARANCES ────────────────────────────────────────────── */
export const mediaAPI = {
  getAll: (resumeId) => fetch(`/api/media-appearances/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/media-appearances`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/media-appearances/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/media-appearances/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/media-appearances/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── PUBLICATIONS ─────────────────────────────────────────────────── */
// reorder: POST /api/publications/reorder/{resumeId}  ← POST not PUT!
// delete returns ok() not noContent()!
export const publicationAPI = {
  getAll: (resumeId) => fetch(`/api/publications/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (body) => fetch(`/api/publications`, { method: "POST", headers: h(), body: JSON.stringify(body) }).then(ok),
  update: (id, body) => fetch(`/api/publications/${id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  delete: (id) => fetch(`/api/publications/${id}`, { method: "DELETE", headers: h() }),
  reorder: (resumeId, ids) => fetch(`/api/publications/reorder/${resumeId}`, { method: "POST", headers: h(), body: JSON.stringify(ids) }),
};

/* ── FINANCIAL CREDENTIALS ────────────────────────────────────────── */
// multipart: data + file
// credentialType must be .toUpperCase()
// status auto-calculated from validTill
export const financialAPI = {
  getAll: (resumeId) => fetch(`/api/financial-credentials/resume/${resumeId}`, { headers: h() }).then(ok),
  create: (data, file) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (file) fd.append("file", file);
    return fetch(`/api/financial-credentials`, { method: "POST", headers: mh(), body: fd }).then(ok);
  },
  update: (id, data, file) => {
    const fd = new FormData();
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (file) fd.append("file", file);
    return fetch(`/api/financial-credentials/${id}`, { method: "PUT", headers: mh(), body: fd }).then(ok);
  },
  delete: (id) => fetch(`/api/financial-credentials/${id}`, { method: "DELETE", headers: h() }).then(okVoid),
  reorder: (resumeId, ids) => fetch(`/api/financial-credentials/resume/${resumeId}/reorder`, { method: "PUT", headers: h(), body: JSON.stringify(ids) }).then(okVoid),
};

/* ── THEME CUSTOMIZATION (PRO/PREMIUM only) ───────────────────────── */
// Plan enforced by backend — service throws if FREE/BASIC
export const themeCustomAPI = {
  save: (userId, resumeId, body) =>
    fetch(`/api/users/${userId}/resumes/${resumeId}/theme/customize`, { method: "PUT", headers: h(), body: JSON.stringify(body) }).then(ok),
  get: (userId, resumeId) =>
    fetch(`/api/users/${userId}/resumes/${resumeId}/theme/customization`, { headers: h() }).then(ok),
  resolve: (userId, resumeId, baseThemeId) =>
    fetch(`/api/users/${userId}/resumes/${resumeId}/theme/resolved?baseThemeId=${baseThemeId}`, { headers: h() }).then(ok),
  reset: (userId, resumeId) =>
    fetch(`/api/users/${userId}/resumes/${resumeId}/theme/customization`, { method: "DELETE", headers: h() }).then(okVoid),
};

/* ── VERSIONS (PRO/PREMIUM only) ──────────────────────────────────── */
export const versionAPI = {
  getAll: (resumeId) => fetch(`/api/resumes/${resumeId}/versions`, { headers: h() }).then(ok),
  create: (resumeId, changeNote) =>
    fetch(`/api/resumes/${resumeId}/versions`, { method: "POST", headers: h(), body: JSON.stringify({ changeNote }) }).then(ok),
  revert: (resumeId) =>
    fetch(`/api/resumes/${resumeId}/versions/revert`, { method: "POST", headers: h() }).then(ok),
};

/* ── SUBSCRIPTION ─────────────────────────────────────────────────── */
export const subscriptionAPI = {
  getMyPlan: () => fetch(`/api/subscription/plan`, { headers: h() }).then(ok),
  getDetails: () => fetch(`/api/subscription/me`, { headers: h() }).then(ok),
  isActive: () => fetch(`/api/subscription/active`, { headers: h() }).then(ok),
};

/* ── THEMES (for change theme) ────────────────────────────────────── */
export const themeAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`/api/themes${q ? "?" + q : ""}`, { headers: h() }).then(ok);
  },
};