import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const getVendors = () => api.get('/vendors').then(res => res.data);
export const createVendor = (data: any) => api.post('/vendors', data).then(res => res.data);

export const getRfps = () => api.get('/rfps').then(res => res.data);
export const getRfp = (id: string) => api.get(`/rfps/${id}`).then(res => res.data);
export const createRfp = (prompt: string) => api.post('/rfps', { prompt }).then(res => res.data);
export const sendRfp = (id: string, vendorIds: string[]) => api.post(`/rfps/${id}/send`, { vendorIds }).then(res => res.data);
export const checkResponses = (id: string) => api.post(`/rfps/${id}/check-responses`).then(res => res.data);
export const getComparison = (id: string) => api.get(`/rfps/${id}/comparison`).then(res => res.data);

export const deleteRfp = (id: string) => api.delete(`/rfps/${id}`).then(res => res.data);
export const deleteVendor = (id: string) => api.delete(`/vendors/${id}`).then(res => res.data);
