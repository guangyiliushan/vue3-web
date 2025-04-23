<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const error = ref('');
</script>