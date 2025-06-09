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
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        const errorData = data.error || data.message;
        if (errorData === 'No refresh token provided.' || errorData === 'Invalid refresh token.') {
          localStorage.removeItem('user');
          const authStore = useAuthStore();
          authStore.user = null;
          return Promise.resolve();
        }
      }
      const { code, message } = data;
      const friendlyMessage = handleAxiosError({ response: { data: { code, message, error } } });
      alert(friendlyMessage);
    } else if (error.request) {
      console.error("Request Error:", error.request);
      alert('无法连接到服务器，请检查您的网络连接。');
    } else {
      console.error("Error Message:", error.message);
      alert('发生未知错误，请稍后重试。');
    }

    return Promise.reject(error);
  }
);

export function handleAxiosError(err: any): never {
  const axiosError = err as AxiosError<{ error: string; message?: string; code?: string }>;
  const { response } = axiosError;

  if (response && response.data) {
    const { error, message, code } = response.data;
    switch (code) {
      case 'VALIDATION_ERROR':
        throw `请求验证失败：${message || error}`;
      case 'AUTHENTICATION_ERROR':
        throw `身份验证失败：${message || error}`;
      case 'FORBIDDEN_ERROR':
        throw `权限不足：${message || error}`;
      case 'NOT_FOUND_ERROR':
        throw `资源未找到：${message || error}`;
      case 'CONFLICT_ERROR':
        throw `请求冲突：${message || error}`;
      case 'INVALID_TOKEN':
        throw `无效的令牌，请重新登录。`;
      case 'TOKEN_EXPIRED':
        throw `令牌已过期，请重新登录。`;
      case 'FILE_UPLOAD_ERROR':
        throw `文件上传失败：${message || error}`;
      case 'INTERNAL_SERVER_ERROR':
        throw `服务器内部错误，请稍后重试。`;
      default:
        throw message || error || '发生未知错误，请稍后重试。';
    }
  } else if (axiosError.message) {
    throw axiosError.message;
  } else {
    throw '发生未知错误，请稍后重试。';
  }
}

export default http;