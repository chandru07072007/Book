import axios from 'axios';

// Support a direct backend URL when the frontend and API are deployed separately.
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
  (error) => Promise.reject(error)
);

export default api;
