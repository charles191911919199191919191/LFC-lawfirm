import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lawfirm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling for better UX
    if (!error.response) {
      // Network error or backend unavailable
      console.warn('API backend unavailable:', error.message);
      error.message = 'Backend service unavailable. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export default api;
