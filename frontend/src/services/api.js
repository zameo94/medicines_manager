import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

export const medicineService = {
  getAll: () => api.get('/medicines/'),
  getActive: () => api.get('/medicines/active'),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

export const scheduleService = {
  getAll: () => api.get('/medication-schedules/'),
  getById: (id) => api.get(`/medication-schedules/${id}`),
  create: (data) => api.post('/medication-schedules/', data),
  update: (id, data) => api.put(`/medication-schedules/${id}`, data),
  delete: (id) => api.delete(`/medication-schedules/${id}`),
};

export const logService = {
  getMain: () => api.get('/medication-logs/'),
  create: (data) => api.post('/medication-logs/', data),
  update: (id, data) => api.put(`/medication-logs/${id}`, data),
};

export default api;