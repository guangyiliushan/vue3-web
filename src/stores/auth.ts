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
    async getSalt(email: string) {
      await http.post("/user/salt", { email });
      const resp = await http.get<{ salt: string }>("/user/salt");
      return resp.data.salt;
    },
    async login(email: string, password: string) {
      await http.post("/user/login", { email, password });
    },
    async logout() {
      await http.post("/user/logout");
      this.user = null;
    },
    async register(email: string, password: string , salt: string) {
      try {
        const resp = await http.post("/user/register", { email, password , salt });
        return resp.data;
      } catch (err: any) {
        if (err.response && err.response.data) {
          throw err.response.data;
        }
        throw err;
      }
    },
  },
});
