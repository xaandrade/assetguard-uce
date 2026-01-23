import axios from 'axios';


const api = axios.create({
  baseURL: 'http://3.232.13.205/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("🔐 Sesión inválida o expirada. Limpiando datos...");
      
      
      localStorage.removeItem('token');
      
      
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;