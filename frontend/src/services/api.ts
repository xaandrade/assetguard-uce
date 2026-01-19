import axios from 'axios';

/**
 * Configuración centralizada de Axios para AssetGuard.
 * El puerto 3000 apunta a tu API Gateway.
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR DE PETICIONES
 * Este código se ejecuta ANTES de que cada petición salga hacia el Gateway.
 * Si existe un token en el localStorage, lo adjunta en los Headers.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Usamos el formato estándar Bearer Token para JWT
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTAS (Opcional pero recomendado)
 * Si el Gateway devuelve un 401 (Token expirado), podemos redirigir al login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o token faltante. Redirigiendo...");
      localStorage.removeItem('token');
      // Descomenta la siguiente línea si quieres forzar el logout
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;