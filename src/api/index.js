
import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (data) => axiosInstance.post('/api/auth/signup', data),
  login: (data) => axiosInstance.post('/api/auth/login', data),
  logout: () => axiosInstance.post('/api/auth/logout'),
  forgotPassword: (data) => axiosInstance.post('/api/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.post('/api/auth/reset-password', data),
  updateProfile: (data) => axiosInstance.put('/api/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/api/auth/change-password', data),
};

export const resumeAPI = {
  create: (data) => axiosInstance.post('/api/resume', data),
  getAll: () => axiosInstance.get('/api/resume'),
  getById: (id) => axiosInstance.get(`/api/resume/${id}`),
  getPublished: () => axiosInstance.get('/api/resume/published'),
  update: (id, data) => axiosInstance.put(`/api/resume/${id}`, data),
  publish: (id) => axiosInstance.put(`/api/resume/${id}/publish`),
  unpublish: (id) => axiosInstance.put(`/api/resume/${id}/unpublish`),
  changeVisibility: (id, visibility) => 
    axiosInstance.patch(`/api/resume/${id}/visibility?visibility=${visibility}`),
  delete: (id) => axiosInstance.delete(`/api/resume/${id}`),
};

export const adminAPI = {
  getAllResumes: () => axiosInstance.get('/api/resume/admin/all'),
  getStats: () => axiosInstance.get('/api/resume/admin/stats'),
  approveResume: (id) => axiosInstance.put(`/api/admin/resumes/${id}/approve`),
  rejectResume: (id, data) => axiosInstance.put(`/api/admin/resumes/${id}/reject`, data || {}),
};

export const contactAPI = {
  submit: (data) => axiosInstance.post('/api/contact', data),
};
