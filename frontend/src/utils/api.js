import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const testsAPI = {
  getAll: (category) => api.get('/tests', { params: { category } }),
  create: (data) => api.post('/tests', data),
  update: (id, data) => api.put(`/tests/${id}`, data),
  delete: (id) => api.delete(`/tests/${id}`),
};

export const packagesAPI = {
  getAll: () => api.get('/packages'),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

export const membershipsAPI = {
  getAll: () => api.get('/memberships'),
  create: (data) => api.post('/memberships', data),
  update: (id, data) => api.put(`/memberships/${id}`, data),
  delete: (id) => api.delete(`/memberships/${id}`),
};

export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments'),
  getAll: () => api.get('/appointments/all'),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  getSlots: (date) => api.get('/appointments/slots', { params: { date } }),
};

export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

export const reportsAPI = {
  getMy: () => api.get('/reports'),
  upload: (formData) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download: (id) => api.get(`/reports/${id}/download`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  seedData: () => api.post('/admin/seed-data'),
};