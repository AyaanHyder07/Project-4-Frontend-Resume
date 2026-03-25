import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8082';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Simple request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor for auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Simple API wrappers for backward compatibility
export const authAPI = {
  register: (data) => axiosInstance.post("/api/auth/signup", data),
  login: (data) => axiosInstance.post("/api/auth/login", data),
  logout: () => axiosInstance.post("/api/auth/logout"),
};

export const dashboardAPI = {
  get: () => axiosInstance.get("/api/dashboard"),
};

// export const resumeAPI = {
//   create: (data) => axiosInstance.post("/api/resumes", data),
//   getById: (resumeId) => axiosInstance.get(`/api/resumes/${resumeId}`),
//   updateMeta: (resumeId, title, profession) =>
//     axiosInstance.patch(`/api/resumes/${resumeId}/meta`, { title, professionType: profession }),
//   changeTheme: (resumeId, themeId) =>
//     axiosInstance.patch(`/api/resumes/${resumeId}/theme`, { themeId }),
//   submit: (resumeId) => axiosInstance.post(`/api/resumes/${resumeId}/submit`),
//   publish: (resumeId) => axiosInstance.post(`/api/resumes/${resumeId}/publish`),
//   unpublish: (resumeId) => axiosInstance.post(`/api/resumes/${resumeId}/unpublish`),
//   delete: (resumeId) => axiosInstance.delete(`/api/resumes/${resumeId}`),
// // };

// export const profileAPI = {
//   // NOTE: create/update are multipart/form-data in backend; use raw axiosInstance in UI code for FormData
//   getPrivate: (resumeId) => axiosInstance.get(`/api/profile/${resumeId}`),
//   getPublic: (resumeId) => axiosInstance.get(`/api/profile/public/${resumeId}`),
//   delete: (resumeId) => axiosInstance.delete(`/api/profile/${resumeId}`),
// };

// export const experienceAPI = {
//   create: (data) => axiosInstance.post("/api/experiences", data),
//   update: (id, data) => axiosInstance.put(`/api/experiences/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/experiences/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/experiences/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/experiences/resume/${resumeId}/reorder`, orderedIds),
// };

// export const educationAPI = {
//   create: (data) => axiosInstance.post("/api/educations", data),
//   update: (id, data) => axiosInstance.put(`/api/educations/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/educations/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/educations/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/educations/resume/${resumeId}/reorder`, orderedIds),
// };

// export const skillAPI = {
//   create: (data) => axiosInstance.post("/api/skills", data),
//   update: (id, data) => axiosInstance.put(`/api/skills/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/skills/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/skills/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/skills/resume/${resumeId}/reorder`, orderedIds),
// };

// export const projectAPI = {
//   create: (data) => axiosInstance.post("/api/projects", data),
//   update: (id, data) => axiosInstance.put(`/api/projects/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/projects/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/projects/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/projects/resume/${resumeId}/reorder`, orderedIds),
// };

// export const certificationAPI = {
//   create: (data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.file) fd.append('file', data.file);
//     return axiosInstance.post("/api/certifications", fd);
//   },
//   update: (id, data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.file) fd.append('file', data.file);
//     return axiosInstance.put(`/api/certifications/${id}`, fd);
//   },
//   delete: (id) => axiosInstance.delete(`/api/certifications/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/certifications/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/certifications/resume/${resumeId}/reorder`, orderedIds),
// };

// export const publicationAPI = {
//   create: (data) => axiosInstance.post("/api/publications", data),
//   update: (id, data) => axiosInstance.put(`/api/publications/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/publications/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/publications/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/publications/resume/${resumeId}/reorder`, orderedIds),
// };

// export const testimonialAPI = {
//   create: (data) => axiosInstance.post("/api/testimonials", data),
//   update: (id, data) => axiosInstance.put(`/api/testimonials/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/testimonials/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/testimonials/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/testimonials/resume/${resumeId}/reorder`, orderedIds),
// };

// export const serviceAPI = {
//   create: (data) => axiosInstance.post("/api/services", data),
//   update: (id, data) => axiosInstance.put(`/api/services/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/services/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/services/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/services/resume/${resumeId}/reorder`, orderedIds),
// };

// export const exhibitionAPI = {
//   create: (data) => axiosInstance.post("/api/exhibitions", data),
//   update: (id, data) => axiosInstance.put(`/api/exhibitions/${id}`, data),
//   delete: (id) => axiosInstance.delete(`/api/exhibitions/${id}`),
//   getAll: (resumeId) => axiosInstance.get(`/api/exhibitions/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/exhibitions/resume/${resumeId}/reorder`, orderedIds),
// };

// export const financialAPI = {
//   create: (data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.file) fd.append('file', data.file);
//     return axiosInstance.post("/api/financial-credentials", fd);
//   },
//   update: (id, data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.file) fd.append('file', data.file);
//     return axiosInstance.put(`/api/financial-credentials/${id}`, fd);
//   },
//   delete: (id) => axiosInstance.delete(`/api/financial-credentials/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/financial-credentials/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/financial-credentials/resume/${resumeId}/reorder`, orderedIds),
// };

// export const blogAPI = {
//   create: (data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.coverFile) fd.append('coverFile', data.coverFile);
//     return axiosInstance.post("/api/blogs", fd);
//   },
//   update: (id, data) => {
//     const fd = new FormData();
//     fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
//     if (data.coverFile) fd.append('coverFile', data.coverFile);
//     return axiosInstance.put(`/api/blogs/${id}`, fd);
//   },
//   delete: (id) => axiosInstance.delete(`/api/blogs/${id}`),
//   getByResume: (resumeId) => axiosInstance.get(`/api/blogs/resume/${resumeId}`),
//   reorder: (resumeId, orderedIds) =>
//     axiosInstance.put(`/api/blogs/resume/${resumeId}/reorder`, orderedIds),
// };

export const publicAPI = {
  getPortfolio: (slug) => axiosInstance.get(`/api/public/portfolios/${slug}`),
};

export const contactAPI = {
  getInbox: (resumeId) => axiosInstance.get(`/api/contacts/resume/${resumeId}`),
  // backend uses request param: PUT /api/contacts/{messageId}/status?status=READ
  updateStatus: (id, status) => axiosInstance.put(`/api/contacts/${id}/status`, null, { params: { status } }),
  delete: (id) => axiosInstance.delete(`/api/contacts/${id}`),
  submit: (data) => axiosInstance.post('/api/contacts', data),
};

export const sectionAPI = {
  getSections: (resumeId) => axiosInstance.get(`/api/sections/resume/${resumeId}`),
  update: (configId, data) => axiosInstance.put(`/api/sections/${configId}`, data),
  reorder: (resumeId, orderedIds) =>
    axiosInstance.put(`/api/sections/resume/${resumeId}/reorder`, orderedIds),
};

export const versionAPI = {
  getAll: (resumeId) => axiosInstance.get(`/api/resumes/${resumeId}/versions`),
  create: (resumeId, note) => axiosInstance.post(`/api/resumes/${resumeId}/versions`, { changeNote: note }),
  revert: (resumeId) => axiosInstance.post(`/api/resumes/${resumeId}/versions/revert`),
};

export const analyticsAPI = {
  getSummary: (resumeId) => axiosInstance.get(`/api/analytics/${resumeId}`),
};

export const templateAPI = {
  getAvailable: (params = {}) => axiosInstance.get('/api/templates', { params }),
  getByProfession: (profession) => axiosInstance.get('/api/templates', { params: { profession } }),
  getRecommendations: (professionType, mood) => axiosInstance.get('/api/templates/recommendations', { params: { professionType, mood } }),
  getById: (id) => axiosInstance.get(`/api/templates/${id}`),
};

export const themeAPI = {
  getAll: () => axiosInstance.get('/api/themes'),
  getById: (id) => axiosInstance.get(`/api/themes/${id}`),
};

export const layoutAPI = {
  getAll: (params = {}) => axiosInstance.get('/api/layouts', { params }),
  getById: (id) => axiosInstance.get(`/api/layouts/${id}`),
};

export const blockAPI = {
  getAll: (resumeId) => axiosInstance.get(`/api/blocks/resume/${resumeId}`),
  create: (data) => axiosInstance.post('/api/blocks', data),
  update: (id, data) => axiosInstance.put(`/api/blocks/${id}`, data),
  reorder: (resumeId, orderedIds) => axiosInstance.put(`/api/blocks/resume/${resumeId}/reorder`, orderedIds),
  delete: (id) => axiosInstance.delete(`/api/blocks/${id}`),
};

// Subscription (user) + Plan catalog (public)
export const subscriptionAPI = {
  // existing
  getMyPlan:  () => axiosInstance.get("/api/subscription/plan"),
  isActive:   () => axiosInstance.get("/api/subscription/active"),
  getDetails: () => axiosInstance.get("/api/subscription/me"),
};
 
export const paymentAPI = {
  initiate: (plan, billingCycle) =>
    axiosInstance.post("/api/payments/initiate", { plan, billingCycle }),
  confirm: (orderId, transactionRef) =>
    axiosInstance.post("/api/payments/confirm", { orderId, transactionRef }),
  history: () => axiosInstance.get("/api/payments/history"),
};
 
export const planAPI = {
  getActive: () => axiosInstance.get("/api/plans"),                          // public
  adminGetAll: () => axiosInstance.get("/api/admin/plans"),                  // admin
  adminUpdate: (planType, body) =>
    axiosInstance.put(`/api/admin/plans/${planType}`, body),                 // admin
};
export const adminAPI = {
  getAllResumes: () => axiosInstance.get("/api/admin/resumes"),
  getByStatus: (status) => axiosInstance.get(`/api/admin/resumes/status/${status}`),
  getPending: () => axiosInstance.get("/api/admin/resumes/pending"),
  approve: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/approve`),
  reject: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/reject`),
  forceUnpublish: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/unpublish`),
  delete: (resumeId) => axiosInstance.delete(`/api/admin/resumes/${resumeId}`),
};

// Admin CRUD for appearance + plan management
export const adminThemeAPI = {
  getAll: () => axiosInstance.get("/api/admin/themes"),
  getById: (id) => axiosInstance.get(`/api/admin/themes/${id}`),
  create: (data) => axiosInstance.post("/api/admin/themes", data),
  update: (id, data) => axiosInstance.patch(`/api/admin/themes/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/themes/${id}`),
};

export const adminLayoutAPI = {
  getAll: () => axiosInstance.get("/api/admin/layouts"),
  getById: (id) => axiosInstance.get(`/api/admin/layouts/${id}`),
  create: (data) => axiosInstance.post("/api/admin/layouts", data),
  update: (id, data) => axiosInstance.patch(`/api/admin/layouts/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/layouts/${id}`),
};

export const adminTemplateAPI = {
  getAll: () => axiosInstance.get("/api/admin/templates"),
  getById: (id) => axiosInstance.get(`/api/admin/templates/${id}`),
  create: (data) => axiosInstance.post("/api/admin/templates", data),
  update: (id, data) => axiosInstance.patch(`/api/admin/templates/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/templates/${id}`),
};

export const adminPlansAPI = {
  getAll: () => axiosInstance.get("/api/admin/plans"),
  update: (planType, data) => axiosInstance.put(`/api/admin/plans/${planType}`, data),
};



