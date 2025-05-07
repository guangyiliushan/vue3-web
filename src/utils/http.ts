import axios, { AxiosError } from 'axios';
import { useAuthStore } from "@/stores/auth";


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
    console.error("Axios Error:", error);
    if (error.response && error.response.status === 401) {
      const errorData = error.response.data.error;
      if (errorData === 'No refresh token provided.' || errorData === 'Invalid refresh token.') {
        localStorage.removeItem('user');
        const authStore = useAuthStore();
        authStore.user = null;
        return Promise.resolve();
      }
    }
    if (error.response) {
      console.error("Response Error:", error.response.data);
    } else if (error.request) {
      console.error("Request Error:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export function handleAxiosError(err: any): never {
  const axiosError = err as AxiosError<{ error: string }>;
  const { response } = axiosError;
  if (response && response.data && response.data.error) {
    throw response.data.error;
  } else if (axiosError.message) {
    throw axiosError.message;
  } else {
    throw "unknown error occurred. Please try again later.";
  }
}

export default http;