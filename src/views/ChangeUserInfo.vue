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
                    <button type="button" @click="sendVerificationCode('oldEmail')">Send Code</button>
                </div>
                <p><strong>New Email:</strong></p>
                <input type="text" v-model="newEmail" placeholder="New Email" />
                <p><strong>New Email Verification Code:</strong></p>
                <input v-model="newEmailCode" placeholder="New Email Code" />
                <button type="button" @click="sendVerificationCode('newEmail')">Send Code</button>
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
                    <button type="button" @click="sendVerificationCode('password')">Send Code</button>
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
const isEditing = ref(false);
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

const toggleEdit = (type: string) => {
    isEditing.value = !isEditing.value;
    if (!isEditing.value) {
        newEmail.value = user.value?.email || '';
    } else {
        if (type === 'email') {
            editEmail.value = true;
            editPassword.value = false;
        } else if (type === 'password') {
            editEmail.value = false;
            editPassword.value = true;
        }
    }
};

const updateUserInfo = async () => {
    try {
        if (editEmail.value) {
            if (emailVerificationMethod.value === 'password') {
                console.log('Updating email with password:', { password: password.value });
                // Implement email update logic using password
            } else {
                console.log('Updating email with codes:', { oldEmailCode: oldEmailCode.value, newEmailCode: newEmailCode.value });
                // Implement email update logic using codes
            }
        } else if (editPassword.value) {
            if (passwordVerificationMethod.value === 'password') {
                console.log('Updating password with old password:', { oldPassword: oldPassword.value });
                // Implement password update logic using old password
            } else {
                console.log('Updating password with verification code:', { verificationCode: verificationCode.value });
                // Implement password update logic using verification code
            }
        }
        alert('User info updated successfully!');
        toggleEdit('');
    } catch (error) {
        alert('Error updating user info: ' + error);
    }
};

const sendVerificationCode = async (type: string) => {
    try {
        if (type === 'oldEmail') {
            console.log('Sending verification code to old email...');
            // 实现发送旧邮箱验证码的逻辑
        } else if (type === 'newEmail') {
            console.log('Sending verification code to new email...');
            // 实现发送新邮箱验证码的逻辑
        } else if (type === 'password') {
            console.log('Sending verification code for password reset...');
            // 实现发送密码重置验证码的逻辑
        }
        alert('Verification code sent successfully!');
    } catch (error) {
        alert('Error sending verification code: ' + error);
    }
};

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