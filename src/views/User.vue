<template>
    <div>
        <h1>User</h1>
        <div v-if="user">
            <div>
                <p><strong>ID:</strong></p>
                <p>{{ user.id }}</p>
            </div>
            <div v-if="isEditing">
                <form @submit.prevent="updateUserInfo">
                    <div>
                        <p><strong>Username:</strong></p>
                        <input v-model="newUsername" />
                    </div>
                    <button type="submit">Save Changes</button>
                    <button type="button" @click="toggleEdit">Cancel</button>
                </form>
                <div>
                    <p><strong>Email:</strong></p>
                    <p>{{ user.email }}</p>
                    <button @click="$router.push('/user/change/email')">Edit Email</button>
                </div>
                <div>
                    <p><strong>Password:</strong></p>
                    <button @click="$router.push('/user/change/password')">Edit Password</button>
                </div>
            </div>
            <div v-else>
                <div>
                    <p><strong>Username:</strong></p>
                    <p>{{ user.username }}</p>
                </div>
                <div>
                    <p><strong>Email:</strong></p>
                    <p>{{ user.email }}</p>
                </div>
                <button @click="toggleEdit">Edit User Info</button>
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
const newUsername = ref('');
const isEditing = ref(false);

const toggleEdit = () => {
    isEditing.value = !isEditing.value;
    if (!isEditing.value) {
        newUsername.value = user.value?.username || '';
    }
};

const updateUserInfo = async () => {
    try {
        console.log('Updating user info:', { username: newUsername.value });
        toggleEdit();
        await auth.fetchUser();
    } catch (error) {
        alert('Error updating user info: ' + error);
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