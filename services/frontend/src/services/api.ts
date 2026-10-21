import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: BACKEND_URL,
});

// Interceptor de aduana: Inyecta el token antes de que la petición salga
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
