<template>
    <form @submit.prevent="onSubmit">
        <input v-model="email" type="email" placeholder="邮箱" required />
        <input v-model="password" type="password" placeholder="密码" required />
        <button :disabled="auth.loading">注册</button>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');

async function onSubmit() {
    try {
        await auth.register( email.value, password.value);
        router.push('/');
    } catch {
        alert('注册失败');
    }
}
</script>