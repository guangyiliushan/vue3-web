import { defineStore } from "pinia";
import http, { handleAxiosError } from "@/utils/http";

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
          throw new Error("No token found");
        }
        const resp = await http.get<{ data: { user: User | null } }>("/users/me");
        this.user = resp.data.data.user;
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (err) {
        this.user = null;
        localStorage.removeItem("user");
        console.error(handleAxiosError(err));
        alert("无法获取用户信息，请重新登录。");
      } finally {
        this.loading = false;
      }
    },
    async getSalt(email: string) {
      try {
        const resp = await http.post<{ data: { salt: string } }>("/users/salt", { email });
        return resp.data.data.salt;
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
    async login(email: string, password: string) {
      try {
        const resp = await http.post<{ data: { token: string; refreshToken: string } }>("/users/login", { email, password });
        localStorage.setItem("token", resp.data.data.token);
        localStorage.setItem("refreshToken", resp.data.data.refreshToken);
        this.loading = true;
        await this.fetchUser();
        return resp.data.data;
      } catch (err: any) {
        handleAxiosError(err);
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
    async register(email: string, password: string, salt: string, verifyCode: string) {
      try {
        const resp = await http.post("/users/register", {
          email,
          password,
          salt,
          verifyCode,
        });
        return resp.data;
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
    async updateUsername(newUsername: string) {
      try {
        await http.put("/users/update/username", {
          user: {
            id: this.user?.id,
            username: newUsername,
          },
        });
        await this.fetchUser();
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
    async updateEmail(oldEmailCode: string, password: string, newEmail: string, newEmailCode: string) {
      try {
        await http.put('/users/update/email', {
          user: {
            id: this.user?.id,
            oldEmailCode: oldEmailCode,
            password: password,
            newEmail: newEmail,
            newEmailCode: newEmailCode,
          }
        });
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
    async updatePassword(oldPassword: string, verifyCode: string, newPassword: string, newSalt: string) {
      try {
        await http.put("/users/update/password", {
          user:{
          id: this.user?.id,
          oldPassword: oldPassword,
          verifyCode: verifyCode,
          newPassword: newPassword,
          newSalt: newSalt,
          }
        });
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
    async sendEmailCode(email: string) {
      try {
        await http.put("/verify/email/send", {
          user: {
            id: this.user?.id || 'register',
          },
          verify: {
            email: email,
          },
        });
      } catch (err: any) {
        handleAxiosError(err);
      }
    },
  },
});
