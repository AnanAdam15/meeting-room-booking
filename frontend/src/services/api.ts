import axios from 'axios';

// สร้าง axios instance
const api = axios.create({
  baseURL: '/api', // จะถูก proxy ไปที่ localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: แนบ token อัตโนมัติทุกครั้งที่เรียก API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: ถ้า token หมดอายุ (401) ให้ logout อัตโนมัติ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;