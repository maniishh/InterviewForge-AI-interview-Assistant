import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 120000,  // 2 minutes instead of 30 seconds
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register' &&
      !error.config?.url?.includes('/auth/me') &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      localStorage.removeItem('user');
      window.location.href = '/login';

      return Promise.reject(
        new Error('Session expired. Please log in again.')
      );
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;