<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="onSubmit">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const email = ref('');
const password = ref('');

async function onSubmit() {
  try {
    await auth.login(email.value, password.value);
    window.location.href = '/';
  } catch {
    alert('登录失败');
  }
}
</script>