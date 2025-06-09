<template>
  <div class="flex justify-center items-center min-h-[70vh]">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center">注册</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-control">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <div class="join w-full">
              <input v-model="email" type="email" placeholder="email" required class="input input-bordered join-item w-full" />
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">验证码</span>
            </label>
            <div class="join w-full">
              <input v-model="verifyCode" type="text" placeholder="验证码" required class="input input-bordered join-item w-2/3" />
              <button type="button" :disabled="auth.loading || countdown > 0" @click="sendVerifyCode" class="btn join-item w-1/3">
                {{ countdown > 0 ? `${countdown}s` : '发送' }}
              </button>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input v-model="password" type="password" placeholder="密码" required class="input input-bordered" />
          </div>
          
          <div class="form-control mt-6">
            <button :disabled="auth.loading" class="btn btn-primary">注册</button>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import CryptoJS from 'crypto-js';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const verifyCode = ref('');
const password = ref('');
const clicked = ref(false);
const countdown = ref(0);
const errorMessage = ref('');

async function sendVerifyCode() {
    try {
        if (!email.value) {
            return (errorMessage.value = 'please input email');
        }
        if (countdown.value > 0) {
            return (errorMessage.value = `please wait for ${countdown.value} seconds`);
        }
        await auth.sendEmailCode(email.value);
        clicked.value = true;
        countdown.value = 60;

        const timer = setInterval(() => {
            countdown.value -= 1;
            if (countdown.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (error: any) {
        errorMessage.value = error;
    }
}

async function onSubmit() {
    if (!clicked.value) {
        return (errorMessage.value = 'please send the verification code first');
    }
    if (!email.value || !password.value || !verifyCode.value) {
        return (errorMessage.value = 'please input email, password and verifyCode');
    }
    try {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const saltedPassword = password.value + salt;
        const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString();
        await auth.register(email.value, encryptedPassword, salt, verifyCode.value);
        router.push('/login');
    } catch (err: any) {
        errorMessage.value = err;
    }
}
</script>