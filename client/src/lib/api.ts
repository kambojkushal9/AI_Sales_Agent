import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('echosales_token');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  } else {
    cfg.headers['x-demo-mode'] = 'true';
  }
  return cfg;
});

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; company?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const leadsAPI = {
  getAll: (params?: any) => api.get('/leads', { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  create: (data: any) => api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  getHistory: (id: string) => api.get(`/leads/${id}/history`),
};

export const callsAPI = {
  getAll: (params?: any) => api.get('/calls', { params }),
  getById: (id: string) => api.get(`/calls/${id}`),
  create: (data: any) => api.post('/calls', data),
  update: (id: string, data: any) => api.put(`/calls/${id}`, data),
  summarize: (id: string) => api.post(`/calls/${id}/summarize`),
};

export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  getAvailability: (date: string) => api.get('/appointments/availability', { params: { date } }),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
};

export const knowledgeAPI = {
  getAll: () => api.get('/knowledge'),
  upload: (formData: FormData) =>
    api.post('/knowledge/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createManual: (data: { title: string; content: string }) => api.post('/knowledge/manual', data),
  delete: (id: string) => api.delete(`/knowledge/${id}`),
  search: (query: string) => api.post('/knowledge/search', { query }),
};

export const agentAPI = {
  chat: (data: { message: string; sessionId: string; language?: string }) => api.post('/agent/chat', data),
  initialize: (sessionId: string, language?: string) => api.post('/agent/initialize', { sessionId, language }),
  getConfig: () => api.get('/agent/config'),
  updateConfig: (data: any) => api.put('/agent/config', data),
  initVoiceSession: (sessionId: string, language?: string) =>
    api.post('/agent/voice/session', { sessionId, language }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCalls: (params?: any) => api.get('/analytics/calls', { params }),
  getLeads: (params?: any) => api.get('/analytics/leads', { params }),
  getSentiment: () => api.get('/analytics/sentiment'),
  getInsights: () => api.post('/analytics/insights'),
};
