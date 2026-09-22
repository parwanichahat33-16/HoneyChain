import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('honeychain_token') || sessionStorage.getItem('honeychain_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const apiaryApi = {
  create: (data) => api.post('/apiaries', data),
  mine: () => api.get('/apiaries/mine'),
  all: () => api.get('/apiaries'),
  update: (id, data) => api.put(`/apiaries/${id}`, data),
  remove: (id) => api.delete(`/apiaries/${id}`),
};

export const hiveApi = {
  create: (data) => api.post('/hives', data),
  mine: () => api.get('/hives/mine'),
  all: () => api.get('/hives/all'),
  details: (id) => api.get(`/hives/${id}`),
  update: (id, data) => api.put(`/hives/${id}`, data),
  remove: (id) => api.delete(`/hives/${id}`),
  batchHistory: (id) => api.get(`/hives/${id}/batches`),
  sensorHistory: (hiveId) => api.get(`/hives/${hiveId}/sensor-data`),
  simulate: (hiveId, abnormal = false) => api.post(`/hives/${hiveId}/simulate`, { abnormal }),
  myAlerts: () => api.get('/hives/alerts/mine'),
  resolveAlert: (alertId) => api.post(`/hives/alerts/${alertId}/resolve`),
  weather: (id) => api.get(`/hives/${id}/weather`),
};

export const batchApi = {
  create: (data) => api.post('/batches', data),
  addEvent: (batchId, data) => api.post(`/batches/${batchId}/events`, data),
  mine: () => api.get('/batches/mine'),
  all: () => api.get('/batches/all'),
};

export const verifyApi = {
  verify: (batchId) => api.get(`/verify/${batchId}`),
  blockchainDetails: (batchId) => api.get(`/verify/${batchId}/blockchain`),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  clusters: () => api.get('/admin/clusters'),
  hiveHealth: () => api.get('/admin/hive-health'),
  apiaryLocations: () => api.get('/admin/apiary-locations'),
  flaggedHives: () => api.get('/admin/flagged-hives'),
  auditLog: () => api.get('/admin/audit-log'),
};

export const feedbackApi = {
  submit: (batchId, data) => api.post(`/verify/${batchId}/feedback`, data),
  get: (batchId) => api.get(`/verify/${batchId}/feedback`),
};

export default api;
