<template>
    <div>
        <form @submit.prevent="updateUserInfo">
            <div v-if="editEmail">
                <p><strong>Choose Verification Method:</strong></p>
                <label>
                    <input type="radio" v-model="emailVerifyMethod" value="password" />
                    Use Password
                </label>
                <label>
                    <input type="radio" v-model="emailVerifyMethod" value="code" />
                    Use Old Email Verification Code
                </label>
                <div v-if="emailVerifyMethod === 'password'">
                    <p><strong>Password:</strong></p>
                    <input type="password" v-model="password" placeholder="Password" />
                </div>
                <div v-if="emailVerifyMethod === 'code'">
                    <p><strong>Old Email Verification Code:</strong></p>
                    <input v-model="oldEmailCode" placeholder="Old Email Code" />
                    <button type="button" @click="sendVerifyCode('default')">Send Code</button>
                </div>
                <p><strong>New Email:</strong></p>
                <input type="text" v-model="newEmail" placeholder="New Email" />
                <p><strong>New Email Verification Code:</strong></p>
                <input v-model="newEmailCode" placeholder="New Email Code" />
                <button type="button" @click="sendVerifyCode(newEmail)">Send Code</button>
                <button type="submit">Save Email</button>
            </div>
            <div v-if="editPassword">
                <p><strong>Choose Verification Method:</strong></p>
                <label>
                    <input type="radio" v-model="passwordVerifyMethod" value="password" />
                    Use Old Password
                </label>
                <label>
                    <input type="radio" v-model="passwordVerifyMethod" value="code" />
                    Use Email Verification Code
                </label>
                <div v-if="passwordVerifyMethod === 'password'">
                    <p><strong>Old Password:</strong></p>
                    <input type="password" v-model="oldPassword" placeholder="Old Password" />
                </div>
                <div v-if="passwordVerifyMethod === 'code'">
                    <p><strong>Email Verification Code:</strong></p>
                    <input v-model="verifyCode" placeholder="Verification Code" />
                    <button type="button" @click="sendVerifyCode('default')">Send Code</button>
                </div>
                <p><strong>New Password:</strong></p>
                <input type="password" v-model="newPassword" placeholder="New Password" />
                <button type="submit">Save Password</button>
            </div>
            <button type="button" @click="$router.push(`${userPath}`)">Cancel</button>
        </form>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';
import CryptoJS from 'crypto-js';

const auth = useAuthStore();
const user = ref(auth.user);
const userPath = ref(auth.user ? `/user/${auth.user.id}` : '/home');
const editPassword = ref(false);
const editEmail = ref(false);
const emailVerifyMethod = ref('password');
const passwordVerifyMethod = ref('code');

const oldEmailCode = ref('');
const newEmail = ref('');
const newEmailCode = ref('');
const password = ref('');

const oldPassword = ref('');
const newPassword = ref('');
const verifyCode = ref('');

const errorMessage = ref('');

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
    if (type === 'default') {
        if (!user.value) {
            throw new Error('User is not available.');
        }
        try {
            await auth.sendEmailCode(user.value.email);
        } catch (error) {
            errorMessage.value = 'Error sending verification code: ' + error;
        }
    }
    else {
        try {
            if (!newEmail.value) {
                throw new Error('New email is required.');
            }
            await auth.sendEmailCode(newEmail.value);
        } catch (error) {
            errorMessage.value = 'Error sending verification code: ' + error;
        }
    }
}

const updateUserInfo = async () => {
    if (!user.value) {
        throw new Error('User is not available.');
    }
    if (editEmail.value) {
        try {
            if (!newEmail.value) {
                throw new Error('New email is required.');
            }
            if (!newEmailCode.value) {
                throw new Error('New email verification code is required.');
            }
            if (emailVerifyMethod.value === 'password') {
                const salt = await auth.getSalt(user.value.email);
                const saltedPassword = password.value + salt;
                const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString();
                await auth.updateEmail('', encryptedPassword, newEmail.value, newEmailCode.value);
            } else {
                await auth.updateEmail(oldEmailCode.value, '', newEmail.value, newEmailCode.value);
            }
        } catch (error) {
            errorMessage.value = 'Error updating email:' + error;
        }
    } else if (editPassword.value) {
        try {
            if (!newPassword.value) {
                throw new Error('New password is required.');
            }
            const salt = CryptoJS.lib.WordArray.random(16).toString();
            const saltedPassword = newPassword.value + salt;
            const encryptedPassword = CryptoJS.SHA256(saltedPassword).toString()
            if (passwordVerifyMethod.value === 'password') {
                const oldSalt = await auth.getSalt(user.value.email);
                const oldSaltedPassword = oldPassword.value + oldSalt;
                const oldEncryptedPassword = CryptoJS.SHA256(oldSaltedPassword).toString();
                await auth.updatePassword(oldEncryptedPassword, '', encryptedPassword, salt);
            } else {
                await auth.updatePassword('', verifyCode.value, encryptedPassword, salt);
            }
        } catch (error) {
            errorMessage.value = 'Error updating password: ' + error;
        }

    }
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