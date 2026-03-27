import axios from 'axios';
import { API_BASE_URL } from '../config/apiBase';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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

export const authAPI = {
  register: (data) => axiosInstance.post('/api/auth/signup', data),
  login: (data) => axiosInstance.post('/api/auth/login', data),
  logout: () => axiosInstance.post('/api/auth/logout'),
};

export const dashboardAPI = {
  get: () => axiosInstance.get('/api/dashboard'),
};

export const publicAPI = {
  getPortfolio: (slug) => axiosInstance.get(`/api/public/portfolios/${slug}`),
};

export const contactAPI = {
  getInbox: (resumeId) => axiosInstance.get(`/api/contacts/resume/${resumeId}`),
  updateStatus: (id, status) => axiosInstance.put(`/api/contacts/${id}/status`, null, { params: { status } }),
  delete: (id) => axiosInstance.delete(`/api/contacts/${id}`),
  submit: (data) => axiosInstance.post('/api/contacts', data),
};

export const sectionAPI = {
  getSections: (resumeId) => axiosInstance.get(`/api/sections/resume/${resumeId}`),
  update: (configId, data) => axiosInstance.put(`/api/sections/${configId}`, data),
  reorder: (resumeId, orderedIds) => axiosInstance.put(`/api/sections/resume/${resumeId}/reorder`, orderedIds),
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

export const subscriptionAPI = {
  getMyPlan: () => axiosInstance.get('/api/subscription/plan'),
  isActive: () => axiosInstance.get('/api/subscription/active'),
  getDetails: () => axiosInstance.get('/api/subscription/me'),
};

export const paymentAPI = {
  initiate: (plan, billingCycle) => axiosInstance.post('/api/payments/initiate', { plan, billingCycle }),
  confirm: (orderId, transactionRef) => axiosInstance.post('/api/payments/confirm', { orderId, transactionRef }),
  history: () => axiosInstance.get('/api/payments/history'),
};

export const planAPI = {
  getActive: () => axiosInstance.get('/api/plans'),
  adminGetAll: () => axiosInstance.get('/api/admin/plans'),
  adminUpdate: (planType, body) => axiosInstance.put(`/api/admin/plans/${planType}`, body),
};

export const adminAPI = {
  getAllResumes: () => axiosInstance.get('/api/admin/resumes'),
  getByStatus: (status) => axiosInstance.get(`/api/admin/resumes/status/${status}`),
  getPending: () => axiosInstance.get('/api/admin/resumes/pending'),
  approve: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/approve`),
  reject: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/reject`),
  forceUnpublish: (resumeId) => axiosInstance.put(`/api/admin/resumes/${resumeId}/unpublish`),
  updateSlug: (resumeId, slug) => axiosInstance.patch(`/api/admin/resumes/${resumeId}/slug`, { slug }),
  delete: (resumeId) => axiosInstance.delete(`/api/admin/resumes/${resumeId}`),
};

export const adminThemeAPI = {
  getAll: () => axiosInstance.get('/api/admin/themes'),
  getById: (id) => axiosInstance.get(`/api/admin/themes/${id}`),
  create: (data) => axiosInstance.post('/api/admin/themes', data),
  update: (id, data) => axiosInstance.patch(`/api/admin/themes/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/themes/${id}`),
};

export const adminLayoutAPI = {
  getAll: () => axiosInstance.get('/api/admin/layouts'),
  getById: (id) => axiosInstance.get(`/api/admin/layouts/${id}`),
  create: (data) => axiosInstance.post('/api/admin/layouts', data),
  update: (id, data) => axiosInstance.patch(`/api/admin/layouts/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/layouts/${id}`),
};

export const adminTemplateAPI = {
  getAll: () => axiosInstance.get('/api/admin/templates'),
  getById: (id) => axiosInstance.get(`/api/admin/templates/${id}`),
  create: (data) => axiosInstance.post('/api/admin/templates', data),
  update: (id, data) => axiosInstance.patch(`/api/admin/templates/${id}`, data),
  deactivate: (id) => axiosInstance.delete(`/api/admin/templates/${id}`),
};

export const adminPlansAPI = {
  getAll: () => axiosInstance.get('/api/admin/plans'),
  update: (planType, data) => axiosInstance.put(`/api/admin/plans/${planType}`, data),
};

export const adminBillingAPI = {
  getUsers: () => axiosInstance.get('/api/admin/billing/users'),
  getUserDetails: (userId) => axiosInstance.get(`/api/admin/billing/users/${userId}`),
  assignSubscription: (userId, data) => axiosInstance.post(`/api/admin/billing/users/${userId}/subscription`, data),
  getRevenue: () => axiosInstance.get('/api/admin/billing/revenue'),
};

