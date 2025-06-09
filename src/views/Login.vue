<template>
  <div class="flex justify-center items-center min-h-[70vh]">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center">登录</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-control">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <input type="email" v-model="email" placeholder="Email" required class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input type="password" v-model="password" placeholder="Password" required class="input input-bordered" />
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">登录</button>
          </div>
          <div v-if="errorMessage" class="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import CryptoJS from 'crypto-js';

const auth = useAuthStore();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function onSubmit() {
  try {
    const salt = await auth.getSalt(email.value);
    const saltedPassword = password.value + salt;
    const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString();
    await auth.login(email.value, encryptedPassword);
    window.location.href = '/';
  } catch (err: any) {
    errorMessage.value = err;
  }
}
</script>