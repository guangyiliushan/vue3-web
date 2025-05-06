<template>
    <div>
        <form @submit.prevent="updateUserInfo">
            <div v-if="editEmail">
                <p><strong>Choose Verification Method:</strong></p>
                <label>
                    <input type="radio" v-model="emailVerificationMethod" value="password" />
                    Use Password
                </label>
                <label>
                    <input type="radio" v-model="emailVerificationMethod" value="code" />
                    Use Old Email Verification Code
                </label>
                <div v-if="emailVerificationMethod === 'password'">
                    <p><strong>Password:</strong></p>
                    <input type="password" v-model="password" placeholder="Password" />
                </div>
                <div v-if="emailVerificationMethod === 'code'">
                    <p><strong>Old Email Verification Code:</strong></p>
                    <input v-model="oldEmailCode" placeholder="Old Email Code" />
                    <button type="button" @click="sendVerifyCode('Email')">Send Code</button>
                </div>
                <p><strong>New Email:</strong></p>
                <input type="text" v-model="newEmail" placeholder="New Email" />
                <p><strong>New Email Verification Code:</strong></p>
                <input v-model="newEmailCode" placeholder="New Email Code" />
                <button type="button" @click="sendVerifyCode('Email')">Send Code</button>
                <button type="submit">Save Email</button>
            </div>
            <div v-if="editPassword">
                <p><strong>Choose Verification Method:</strong></p>
                <label>
                    <input type="radio" v-model="passwordVerificationMethod" value="password" />
                    Use Old Password
                </label>
                <label>
                    <input type="radio" v-model="passwordVerificationMethod" value="code" />
                    Use Email Verification Code
                </label>
                <div v-if="passwordVerificationMethod === 'password'">
                    <p><strong>Old Password:</strong></p>
                    <input type="password" v-model="oldPassword" placeholder="Old Password" />
                </div>
                <div v-if="passwordVerificationMethod === 'code'">
                    <p><strong>Email Verification Code:</strong></p>
                    <input v-model="verificationCode" placeholder="Verification Code" />
                    <button type="button" @click="sendVerifyCode('Email')">Send Code</button>
                </div>
                <p><strong>New Password:</strong></p>
                <input type="password" v-model="newPassword" placeholder="New Password" />
                <button type="submit">Save Password</button>
            </div>
            <button type="button" @click="$router.push(`${userPath}`)">Cancel</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const auth = useAuthStore();
const user = ref(auth.user);
const salt = ref(auth.getSalt(auth.user?.email as string) || '');
const userPath = "/user/"+ref(auth.user?.id).value || "/home";
const newEmail = ref('');
const newPassword = ref('');
const oldEmailCode = ref('');
const newEmailCode = ref('');
const verificationCode = ref('');
const oldPassword = ref('');
const password = ref('');
const editPassword = ref(false);
const editEmail = ref(false);
const emailVerificationMethod = ref('password');
const passwordVerificationMethod = ref('code');

const route = useRoute();

watch(
    () => route.path,
    (newPath) => {
        if (newPath === '/user/change/email') {
            editEmail.value = true;
            editPassword.value = false;
        } else if (newPath === '/user/change/password') {
            editEmail.value = false;
            editPassword.value = true;
        }
    },
    { immediate: true }
);

const sendVerifyCode = async (type: string) => {
    console.log(type);
}

const updateUserInfo = async () => {
    
}

onMounted(async () => {
    if (!auth.user) {
        try {
            await auth.fetchUser();
            user.value = auth.user;
        } catch (error) {
            alert('Error fetching user data: ' + error);
            window.location.href = 'login';
        }
    }
});

watch(
    () => auth.user,
    (newUser) => {
        user.value = newUser;
    }
);
</script>