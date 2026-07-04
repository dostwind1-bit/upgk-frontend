import axios from 'axios';

const configuredBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase.replace(/\/$/, '')}/api`;

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('upgk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('upgk_token');
      localStorage.removeItem('upgk_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
