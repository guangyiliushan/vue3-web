<template>
    <div>
        <h1>User</h1>
        <div v-if="user">
            <div>
                <p><strong>ID:</strong></p>
                <p>{{ user.id }}</p>
            </div>
            <div>
                <p><strong>Username:</strong></p>
                <div v-if="!editUsername">
                    <p>{{ user.username }}</p>
                    <button @click="editUsername = true">Edit</button>
                </div>
                <div v-else>
                    <input v-model="newUsername" placeholder="Enter new username" />
                    <button @click="">Submit</button>
                    <button @click="editUsername = false">Cancel</button>
                </div>
            </div>
            <div>
                <p><strong>Email:</strong></p>
                <div v-if="!editEmail">
                    <p>{{ user.email }}</p>
                    <button @click="editEmail = true">Edit</button>
                </div>
                <div>
                    <input type="text" v-model="newEmail" placeholder="Enter new email" />
                    <button @click="">Submit</button>
                    <button @click="editEmail = false">Cancel</button>
                </div>
            </div>
            <div>
                <p><strong>Password</strong></p>
                <div v-if="!editPassword">
                    <button @click="">Change Password</button>
                </div>
                <div v-else>
                    <p>"waring"</p>
                </div>
            </div>
            <div>
                <p><strong>Created At:</strong></p>
                <p>{{ user.createdAt }}</p>
            </div>
            <button @click="auth.logout()">Logout</button>
        </div>
        <div v-else>
            <p>Loading user information...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';

const auth = useAuthStore();
const user = ref(auth.user);
const editUsername = ref(false);
const editEmail = ref(false);
const editPassword = ref(false);
const newUsername = ref(user.value?.username || '');
const newEmail = ref(user.value?.email || '');


onMounted(async () => {
    if (!auth.user) {
        try {
            await auth.fetchUser();
            user.value = auth.user;
        } catch (error) {
            alert("Error fetching user data: " + error);
            window.location.href = '/login';
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