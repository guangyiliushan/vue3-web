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
        const resp = await http.get<{ user: User | null }>("/auth/me");
        this.user = resp.data.user;
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      await http.post("/auth/login", { email, password });
      await this.fetchUser();
    },
    async logout() {
      await http.post("/auth/logout");
      this.user = null;
    },
    async register(email: string, password: string) {
      await http.post("/auth/register", { email, password });
      await this.fetchUser();
    },
  },
});
