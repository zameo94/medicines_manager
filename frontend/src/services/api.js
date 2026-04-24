import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const medicineService = {
  getAll: () => api.get('/medicines/'),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

export default api;