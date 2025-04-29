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
import CryptoJS from 'crypto-js';

const auth = useAuthStore();
const email = ref('');
const password = ref('');

async function onSubmit() {
  try {
    const salt = await auth.getSalt(email.value);
    const saltedPassword = password.value + salt;
    const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString();
    await auth.login(email.value, encryptedPassword);
    window.location.href = '/';
  } catch (err) {
    alert('登录失败: ' + (err as Error).message);
  }
}
</script>