<template>
  <div>
    <div>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/blog/discover">Discover</RouterLink>
      <RouterLink to="/blog/timeline">Timeline</RouterLink>
    </div>
    <div v-if="auth.isAuthenticated">
      <RouterLink :to="`/user/${auth.user?.id}`">User</RouterLink>
    </div>
    <div v-else>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Register</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { watch } from 'vue';

const auth = useAuthStore();

watch(
  () => auth.isAuthenticated,
  id => {id}
);

</script>