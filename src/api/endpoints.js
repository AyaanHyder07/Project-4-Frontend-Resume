import axiosInstance from "./axiosInstance";

/* ─────────────────────────────────────────
   AUTH
   Uses axiosInstance (has detailed logging)
───────────────────────────────────────── */
export const authAPI = {
  register:        (data) => axiosInstance.post("/api/auth/signup", data),
  login:           (data) => axiosInstance.post("/api/auth/login", data),
  logout:          ()     => axiosInstance.post("/api/auth/logout"),
  forgotPassword:  (data) => axiosInstance.post("/api/auth/forgot-password", data),
  resetPassword:   (data) => axiosInstance.post("/api/auth/reset-password", data),
  updateProfile:   (data) => axiosInstance.put("/api/auth/profile", data),
  changePassword:  (data) => axiosInstance.put("/api/auth/change-password", data),
};

/* ─────────────────────────────────────────
   USER DASHBOARD
───────────────────────────────────────── */
export const dashboardAPI = {
  get: () => axiosInstance.get("/api/dashboard"),
};

/* ─────────────────────────────────────────
   RESUMES
───────────────────────────────────────── */
export const resumeAPI = {
  create:    (data)     => axiosInstance.post("/api/resumes", data),
  getById:   (resumeId) => axiosInstance.get(`/api/resumes/${resumeId}`),
  updateMeta: (resumeId, title, profession) =>
    axiosInstance.put(`/api/resumes/${resumeId}/meta`, null, {
      params: { title, profession },
    }),
  changeTheme: (resumeId, themeId) =>
    axiosInstance.put(`/api/resumes/${resumeId}/theme`, null, {
      params: { themeId },
    }),
  submit:    (resumeId) => axiosInstance.put(`/api/resumes/${resumeId}/submit`),
  publish:   (resumeId) => axiosInstance.put(`/api/resumes/${resumeId}/publish`),
  unpublish: (resumeId) => axiosInstance.put(`/api/resumes/${resumeId}/unpublish`),
  delete:    (resumeId) => axiosInstance.delete(`/api/resumes/${resumeId}`),
  getPublic: (slug)     => axiosInstance.get(`/api/resumes/public/${slug}`),
};

/* ─────────────────────────────────────────
   USER PROFILE (per resume)
───────────────────────────────────────── */
export const profileAPI = {
  create:     (data)     => axiosInstance.post("/api/profile", data),
  update:     (resumeId, data) => axiosInstance.put(`/api/profile/${resumeId}`, data),
  getPrivate: (resumeId) => axiosInstance.get(`/api/profile/${resumeId}`),
  getPublic:  (resumeId) => axiosInstance.get(`/api/profile/public/${resumeId}`),
  delete:     (resumeId) => axiosInstance.delete(`/api/profile/${resumeId}`),
};

/* ─────────────────────────────────────────
   EXPERIENCE
───────────────────────────────────────── */
export const experienceAPI = {
  create:    (data) => axiosInstance.post("/api/experiences", data),
  update:    (id, data) => axiosInstance.put(`/api/experiences/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/experiences/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/experiences/resume/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/experiences/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   EDUCATION
───────────────────────────────────────── */
export const educationAPI = {
  create:    (data) => axiosInstance.post("/api/educations", data),
  update:    (id, data) => axiosInstance.put(`/api/educations/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/educations/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/educations/resume/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/educations/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   SKILLS
───────────────────────────────────────── */
export const skillAPI = {
  create:    (data) => axiosInstance.post("/api/skills", data),
  update:    (id, data) => axiosInstance.put(`/api/skills/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/skills/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/skills/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/skills/public/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/skills/reorder/${resumeId}`, orderedIds),
};

/* ─────────────────────────────────────────
   PROJECTS
───────────────────────────────────────── */
export const projectAPI = {
  create:    (data) => axiosInstance.post("/api/projects", data),
  update:    (id, data) => axiosInstance.put(`/api/projects/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/projects/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/projects/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/projects/public/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.post(`/api/projects/reorder/${resumeId}`, orderedIds),
};

/* ─────────────────────────────────────────
   PROJECT GALLERY
───────────────────────────────────────── */
export const projectGalleryAPI = {
  create:      (data) => axiosInstance.post("/api/project-gallery", data),
  update:      (id, data) => axiosInstance.put(`/api/project-gallery/${id}`, data),
  delete:      (id)   => axiosInstance.delete(`/api/project-gallery/${id}`),
  getByProject: (projectId) => axiosInstance.get(`/api/project-gallery/project/${projectId}`),
  getPublic:   (projectId)  => axiosInstance.get(`/api/project-gallery/public/${projectId}`),
  reorder:     (projectId, orderedIds) =>
    axiosInstance.put(`/api/project-gallery/project/${projectId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   CERTIFICATIONS
───────────────────────────────────────── */
export const certificationAPI = {
  create:    (data) => axiosInstance.post("/api/certifications", data),
  update:    (id, data) => axiosInstance.put(`/api/certifications/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/certifications/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/certifications/resume/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/certifications/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   PUBLICATIONS
───────────────────────────────────────── */
export const publicationAPI = {
  create:    (data) => axiosInstance.post("/api/publications", data),
  update:    (id, data) => axiosInstance.put(`/api/publications/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/publications/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/publications/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/publications/public/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.post(`/api/publications/reorder/${resumeId}`, orderedIds),
};

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
export const testimonialAPI = {
  create:    (data) => axiosInstance.post("/api/testimonials", data),
  update:    (id, data) => axiosInstance.put(`/api/testimonials/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/testimonials/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/testimonials/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/testimonials/public/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/testimonials/reorder/${resumeId}`, orderedIds),
};

/* ─────────────────────────────────────────
   SERVICE OFFERINGS
───────────────────────────────────────── */
export const serviceAPI = {
  create:    (data) => axiosInstance.post("/api/services", data),
  update:    (id, data) => axiosInstance.put(`/api/services/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/services/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/services/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/services/public/${resumeId}`),
};

/* ─────────────────────────────────────────
   EXHIBITIONS / AWARDS
───────────────────────────────────────── */
export const exhibitionAPI = {
  create:    (data) => axiosInstance.post("/api/exhibitions", data),
  update:    (id, data) => axiosInstance.put(`/api/exhibitions/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/exhibitions/${id}`),
  getAll:    (resumeId) => axiosInstance.get(`/api/exhibitions/resume/${resumeId}`),
  getByType: (resumeId, type) =>
    axiosInstance.get(`/api/exhibitions/resume/${resumeId}/type/${type}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/exhibitions/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   FINANCIAL CREDENTIALS
───────────────────────────────────────── */
export const financialAPI = {
  create:    (data) => axiosInstance.post("/api/financial-credentials", data),
  update:    (id, data) => axiosInstance.put(`/api/financial-credentials/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/financial-credentials/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/financial-credentials/resume/${resumeId}`),
  getPublic: (resumeId)   => axiosInstance.get(`/api/financial-credentials/public/${resumeId}`),
  reorder:   (resumeId, orderedIds) =>
    axiosInstance.put(`/api/financial-credentials/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   BLOGS
───────────────────────────────────────── */
export const blogAPI = {
  create:    (data) => axiosInstance.post("/api/blogs", data),
  update:    (id, data) => axiosInstance.put(`/api/blogs/${id}`, data),
  delete:    (id)   => axiosInstance.delete(`/api/blogs/${id}`),
  getByResume: (resumeId) => axiosInstance.get(`/api/blogs/resume/${resumeId}`),
  getPublic: (resumeId, slug) => axiosInstance.get(`/api/blogs/public/${resumeId}/${slug}`),
};

/* ─────────────────────────────────────────
   CONTACT MESSAGES
───────────────────────────────────────── */
export const contactAPI = {
  submit:       (data)      => axiosInstance.post("/api/contacts", data),
  getInbox:     (resumeId)  => axiosInstance.get(`/api/contacts/resume/${resumeId}`),
  getByStatus:  (resumeId, status) =>
    axiosInstance.get(`/api/contacts/resume/${resumeId}/status/${status}`),
  updateStatus: (messageId, status) =>
    axiosInstance.put(`/api/contacts/${messageId}/status`, null, { params: { status } }),
  delete:       (messageId) => axiosInstance.delete(`/api/contacts/${messageId}`),
  unreadCount:  (resumeId)  => axiosInstance.get(`/api/contacts/resume/${resumeId}/unread-count`),
};

/* ─────────────────────────────────────────
   PORTFOLIO SECTIONS CONFIG
───────────────────────────────────────── */
export const sectionAPI = {
  getSections: (resumeId)  => axiosInstance.get(`/api/sections/resume/${resumeId}`),
  update:      (configId, data) => axiosInstance.put(`/api/sections/${configId}`, data),
  reorder:     (resumeId, orderedIds) =>
    axiosInstance.put(`/api/sections/resume/${resumeId}/reorder`, orderedIds),
};

/* ─────────────────────────────────────────
   RESUME VERSIONS
───────────────────────────────────────── */
export const versionAPI = {
  create: (resumeId, note) =>
    axiosInstance.post(`/api/resume-versions/${resumeId}`, null, { params: { note } }),
  getAll: (resumeId)  => axiosInstance.get(`/api/resume-versions/${resumeId}`),
  revert: (resumeId)  => axiosInstance.post(`/api/resume-versions/revert/${resumeId}`),
};

/* ─────────────────────────────────────────
   ANALYTICS
───────────────────────────────────────── */
export const analyticsAPI = {
  getSummary: (resumeId) => axiosInstance.get(`/api/analytics/${resumeId}`),
};

/* ─────────────────────────────────────────
   TEMPLATES
───────────────────────────────────────── */
export const templateAPI = {
  getAvailable:    (plan)             => axiosInstance.get("/api/templates/available", { params: { plan } }),
  getByProfession: (profession, plan) => axiosInstance.get("/api/templates/profession", { params: { profession, plan } }),
  // Admin only
  create: (data)     => axiosInstance.post("/api/templates", data),
  update: (id, data) => axiosInstance.put(`/api/templates/${id}`, data),
};

/* ─────────────────────────────────────────
   THEMES
───────────────────────────────────────── */
export const themeAPI = {
  getAll:     ()         => axiosInstance.get("/api/themes"),
  getById:    (id)       => axiosInstance.get(`/api/themes/${id}`),
  // Admin only
  create:     (data)     => axiosInstance.post("/api/themes", data),
  update:     (id, data) => axiosInstance.put(`/api/themes/${id}`, data),
  deactivate: (id)       => axiosInstance.delete(`/api/themes/${id}`),
};

/* ─────────────────────────────────────────
   LAYOUTS
───────────────────────────────────────── */
export const layoutAPI = {
  getAll:     ()         => axiosInstance.get("/api/layouts"),
  getById:    (id)       => axiosInstance.get(`/api/layouts/${id}`),
  getByType:  (type)     => axiosInstance.get(`/api/layouts/type/${type}`),
  // Admin only
  create:     (data)     => axiosInstance.post("/api/layouts", data),
  update:     (id, data) => axiosInstance.put(`/api/layouts/${id}`, data),
  deactivate: (id)       => axiosInstance.delete(`/api/layouts/${id}`),
};

/* ─────────────────────────────────────────
   PUBLIC PORTFOLIO
───────────────────────────────────────── */
export const publicAPI = {
  getPortfolio: (slug) => axiosInstance.get(`/api/public/${slug}`),
};

/* ─────────────────────────────────────────
   ADMIN
───────────────────────────────────────── */
export const adminAPI = {
  getAllResumes:  ()         => axiosInstance.get("/api/admin/resumes"),
  getByStatus:   (status)   => axiosInstance.get(`/api/admin/resumes/status/${status}`),
  getPending:    ()         => axiosInstance.get("/api/admin/resumes/pending"),
  approve:       (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/approve`),
  reject:        (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/reject`),
  forceUnpublish:(resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/unpublish`),
  delete:        (resumeId) => axiosInstance.delete(`/api/admin/resumes/${resumeId}`),
};