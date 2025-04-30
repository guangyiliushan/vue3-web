import { defineStore } from "pinia";
import http from "@/utils/http";
import type { AxiosError } from 'axios';

export interface User {
  id: string;
  username: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const resp = await http.get<{ user: User | null }>("/user/auth");
        this.user = resp.data.user;
      } finally {
        this.loading = false;
      }
    },
    async getSalt(email: string) {
      try {
        const resp = await http.post("/user/salt", { email });
        return resp.data.salt;
      } catch (err: any) {
        const axiosError = err as AxiosError<{ error: string }>;
        const { response } = axiosError;
        if (response && response.data && response.data.error) {
          throw response.data.error;
        } else if (axiosError.message) {
          throw axiosError.message;
        } else {
          throw "获取salt失败: 未知错误，请稍后重试。";
        }
      }
    },
    async login(email: string, password: string) {
      try {
        const resp = await http.post("/user/login", { email, password });
        console.log(resp);
        return resp.data;
      } catch (err: any) {
        const axiosError = err as AxiosError<{ error: string }>;
        const { response } = axiosError;
        if (response && response.data && response.data.error) {
          throw response.data.error;
        } else if (axiosError.message) {
          throw axiosError.message;
        } else {
          throw "登录失败: 未知错误，请稍后重试。";
        }
      }
    },
    async logout() {
      await http.post("/user/logout");
      this.user = null;
    },
    async register(email: string, password: string, salt: string) {
      try {
        const resp = await http.post("/user/register", { email, password, salt });
        return resp.data;
      } catch (err: any) {
        const axiosError = err as AxiosError<{ error: string }>;
        const { response } = axiosError;
        if (response && response.data && response.data.error) {
          throw response.data.error;
        } else if (axiosError.message) {
          throw axiosError.message;
        } else {
          throw "注册失败: 未知错误，请稍后重试。";
        }
      }
    },
  },
});
