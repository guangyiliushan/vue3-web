<template>
    <form @submit.prevent="onSubmit">
        <input v-model="email" type="email" placeholder="邮箱" required />
        <input v-model="password" type="password" placeholder="密码" required />
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
const password = ref('');
const errorMessage = ref('');

async function onSubmit() {
    try {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const saltedPassword = password.value + salt;
        const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString();
        await auth.register(email.value, encryptedPassword, salt);
        router.push('/login');
    } catch (err: any) {
        errorMessage.value = err;
    }
}
</script>