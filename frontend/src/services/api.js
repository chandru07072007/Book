import axios from 'axios';

// Support custom API URL (e.g. when frontend is deployed on Cloudflare Pages and backend on Vercel)
const rawUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
const baseURL = (rawUrl.startsWith('http') && !rawUrl.endsWith('/api'))
  ? `${rawUrl}/api`
  : rawUrl;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
