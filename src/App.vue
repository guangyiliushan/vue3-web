<script setup lang="ts">
import RouterBar from '@/components/RouterBar.vue'
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
if (!auth.user && auth.loading) {
  auth.fetchUser();
}
</script>

<template>
  <div class="bg-base-100 h-screen flex flex-col">
    <nav class="sticky top-0 w-full">
      <router-bar />
    </nav>
    
    <p class="container w-full px-4 py-2 text-sm opacity-70">
      <strong>Current route path:</strong> {{ $route.fullPath }}
    </p>
    
    <main class="container mx-auto flex-grow px-4 py-6">
      <RouterView />
    </main>
    
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
      <div>
        <p>Copyright © {{ new Date().getFullYear() }} - All rights reserved</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
</style>
