import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (data) => axiosInstance.post('/api/auth/register', data),
  login: (data) => axiosInstance.post('/api/auth/login', data),
  logout: () => axiosInstance.post('/api/auth/logout'),
  updateProfile: (data) => axiosInstance.put('/api/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/api/auth/change-password', data),
};

export const resumeAPI = {
  create: (data) => axiosInstance.post('/api/resumes', data),
  update: (id, data) => axiosInstance.put(`/api/resumes/${id}`, data),
  submit: (id) => axiosInstance.put(`/api/resumes/${id}/submit`),
  getMy: () => axiosInstance.get('/api/resumes/my'),
  getById: (id) => axiosInstance.get(`/api/resumes/${id}`),
  getVersions: (id) => axiosInstance.get(`/api/resumes/${id}/versions`),
};

export const adminAPI = {
  getDashboard: () => axiosInstance.get('/api/admin/dashboard'),
  getResumes: (params) => axiosInstance.get('/api/admin/resumes', { params }),
  approveResume: (id) => axiosInstance.put(`/api/admin/resumes/${id}/approve`),
  publishResume: (id) => axiosInstance.put(`/api/admin/resumes/${id}/publish`),
  disableResume: (id) => axiosInstance.put(`/api/admin/resumes/${id}/disable`),
  rejectResume: (id, data) => axiosInstance.put(`/api/admin/resumes/${id}/reject`, data || {}),
  getUsers: (params) => axiosInstance.get('/api/admin/users', { params }),
  blockUser: (id) => axiosInstance.put(`/api/admin/users/${id}/block`),
  unblockUser: (id) => axiosInstance.put(`/api/admin/users/${id}/unblock`),
  getUserResumes: (id) => axiosInstance.get(`/api/admin/users/${id}/resumes`),
  getAnalytics: (params) => axiosInstance.get('/api/admin/analytics', { params }),
  getAudit: (params) => axiosInstance.get('/api/admin/audit', { params }),
};

export const publicAPI = {
  getResume: (id) => axiosInstance.get(`/api/public/resumes/${id}`),
  logDownload: (id) => axiosInstance.post(`/api/public/resumes/${id}/analytics`),
};
