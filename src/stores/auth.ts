import { defineStore } from "pinia";
import http from "@/utils/http";

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
    async login(email: string, password: string) {
      await http.post("/user/login", { email, password });
      await this.fetchUser();
    },
    async logout() {
      await http.post("/user/logout");
      this.user = null;
    },
    async register(email: string, password: string , salt: string) {
      try {
        const resp = await http.post("/user/register", { email, password , salt });
        // await this.fetchUser();
        return resp.data;
      } catch (err: any) {
        // 如果后端有返回内容，抛出详细信息
        if (err.response && err.response.data) {
          throw err.response.data;
        }
        throw err;
      }
    },
  },
});
