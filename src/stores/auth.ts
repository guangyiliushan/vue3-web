import { defineStore } from "pinia";
import http from "@/utils/http";
import type { AxiosError } from "axios";

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null") as User | null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw "未找到认证令牌，请登录后重试。";
        }
        const resp = await http.get<{ user: User | null }>("/user/me");
        this.user = resp.data.user;
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (err) {
        this.user = null;
        localStorage.removeItem("user");
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
        localStorage.setItem("token", resp.data.token);
        localStorage.setItem("refreshToken", resp.data.refreshToken);
        this.loading = true;
        await this.fetchUser();
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
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      this.loading = false;
      window.location.href = "/";
    },
    async register(email: string, password: string, salt: string) {
      try {
        const resp = await http.post("/user/register", {
          email,
          password,
          salt,
        });
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
    async updateUsername(newUsername: string) {
      try {
        await http.put("/user/username", {
          user: {
            id: this.user?.id,
            username: newUsername,
          },
        });
        await this.fetchUser();
      } catch (err : any) {
        const axiosError = err as AxiosError<{ error: string }>;
        const { response } = axiosError;
        if (response && response.data && response.data.error) {
          throw response.data.error;
        } else if (axiosError.message) {
          throw axiosError.message;
        }
      }
    },
    async updateEmail(newEmail: string, verificationCode: string) {
      try {
        await http.put('/user/email', {
          newEmail: newEmail,
          verificationCode: verificationCode,
        });
      } catch (err) {}
    },
    async updatePassword(oldPassword: string, newPassword: string) {
      try {
        await http.put("/user/password", {
          user:{
          id: this.user?.id,
          password: oldPassword,
          newPassword: newPassword,
          }
        });
      } catch (err) {}
    },
  },
});
