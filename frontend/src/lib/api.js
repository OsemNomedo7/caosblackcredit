import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adicionar token nas requisições admin
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── LEADS ────────────────────────────────────────────────────────────────────
export const createLead = async (data) => {
  const res = await api.post('/leads', data);
  return res.data;
};

export const updateLeadStatus = async (id, data) => {
  const res = await api.put(`/leads/${id}`, data);
  return res.data;
};

// ─── PIX ──────────────────────────────────────────────────────────────────────
export const generatePix = async (data) => {
  const res = await api.post('/pix/generate', data);
  return res.data;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const adminLogin = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const verifyToken = async () => {
  const res = await api.get('/auth/verify');
  return res.data;
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const getDashboard = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getLeads = async (params = {}) => {
  const res = await api.get('/admin/leads', { params });
  return res.data;
};

export const updateLeadAdmin = async (id, data) => {
  const res = await api.put(`/admin/leads/${id}`, data);
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await api.delete(`/admin/leads/${id}`);
  return res.data;
};

export const getSettings = async () => {
  const res = await api.get('/admin/settings');
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.put('/admin/settings', data);
  return res.data;
};

export const getChats = async () => {
  const res = await api.get('/admin/chats');
  return res.data;
};

export const getChatMessages = async (sessionId) => {
  const res = await api.get(`/admin/chats/${sessionId}`);
  return res.data;
};

// ─── STATS ────────────────────────────────────────────────────────────────────
export const getPublicStats = async () => {
  const res = await api.get('/stats');
  return res.data;
};

// ─── SITE CONFIG ──────────────────────────────────────────────────────────────
export const getSiteConfig = async () => {
  const res = await api.get('/site-config');
  return res.data;
};

export const updateSiteConfig = async (data) => {
  const res = await api.put('/admin/site-config', data);
  return res.data;
};

export const uploadBannerFile = async (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data;
};

export const deleteBannerFile = async (filename) => {
  const res = await api.delete(`/admin/upload/${filename}`);
  return res.data;
};

export const updateCredentials = async (data) => {
  const res = await api.put('/admin/credentials', data);
  return res.data;
};

export const getWebhookUrl = async () => {
  const res = await api.get('/webhook-url');
  return res.data;
};

export default api;
