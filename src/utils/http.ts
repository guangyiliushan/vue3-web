import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (refreshToken) {
    config.headers['x-refresh-token'] = refreshToken;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-token'];
    const newRefreshToken = response.headers['x-refresh-token'];
    if (newToken) localStorage.setItem('token', newToken);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      alert('Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;