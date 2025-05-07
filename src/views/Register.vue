<template>
    <form @submit.prevent="onSubmit">
        <input v-model="email" type="email" placeholder="email" required />
        <input v-model="verifyCode" type="text" placeholder="verifyCode" required />
        <button :disabled="auth.loading" @click="sendVerifyCode">Verify</button>
        <input v-model="password" type="password" placeholder="password" required />
        <button :disabled="auth.loading">注册</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
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