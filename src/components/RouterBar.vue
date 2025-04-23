<template>
  <div>
    <div>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
    </div>
    <div v-if="isAuthenticated">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
    </div>
    <div v-else>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Register</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isAuthenticated = ref(false);
</script>