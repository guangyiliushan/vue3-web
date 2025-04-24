import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  withCredentials: true,                // 始终带上 http-only cookie §&#8203;:contentReference[oaicite:5]{index=5}
  headers: { 'Content-Type': 'application/json' },
});
export default http;