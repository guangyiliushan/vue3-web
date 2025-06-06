<template>
    <div class="container mx-auto p-4">
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <h1 class="card-title text-2xl">用户信息</h1>
                <div v-if="user" class="mt-4">                 
                    <div class="flex flex-col md:flex-row gap-8">                        
                        <div class="flex-grow">
                            <div class="mb-4">
                                <p class="text-sm opacity-70">用户ID</p>
                                <p class="font-medium">{{ user.id }}</p>
                            </div>
                            
                            <div v-if="isEditing">
                                <form @submit.prevent="updateUserInfo" class="space-y-4">
                                    <div>
                                        <label class="label">
                                            <span class="label-text">用户名</span>
                                        </label>
                                        <input v-model="newUsername" class="input input-bordered w-full" />
                                    </div>
                                    
                                    <div class="flex gap-2">
                                        <button type="submit" class="btn btn-primary">保存</button>
                                        <button type="button" @click="toggleEdit" class="btn">取消</button>
                                    </div>
                                </form>
                                
                                <div class="mt-4">
                                    <div class="mb-2">
                                        <p class="text-sm opacity-70">邮箱</p>
                                        <p class="font-medium">{{ user.email }}</p>
                                    </div>
                                    <button @click="$router.push('/user/change/email')" class="btn btn-outline btn-sm">
                                        修改邮箱
                                    </button>
                                </div>
                                
                                <div class="mt-4">
                                    <p class="text-sm opacity-70">密码</p>
                                    <button @click="$router.push('/user/change/password')" class="btn btn-outline btn-sm">
                                        修改密码
                                    </button>
                                </div>
                            </div>
                            
                            <div v-else>
                                <div class="mb-4">
                                    <p class="text-sm opacity-70">用户名</p>
                                    <p class="font-medium">{{ user.username }}</p>
                                </div>
                                
                                <div class="mb-4">
                                    <p class="text-sm opacity-70">邮箱</p>
                                    <p class="font-medium">{{ user.email }}</p>
                                </div>
                                
                                <button @click="toggleEdit" class="btn btn-primary">编辑个人信息</button>
                            </div>
                            
                            <div class="mt-4">
                                <p class="text-sm opacity-70">注册时间</p>
                                <p class="font-medium">{{ new Date(user.createdAt).toLocaleString() }}</p>
                            </div>
                            
                            <div class="mt-6 pt-4 border-t">
                                <button @click="auth.logout()" class="btn btn-error">退出登录</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div v-else class="flex justify-center items-center h-48">
                    <span class="loading loading-spinner loading-lg"></span>
                    <p class="ml-2">加载用户信息中...</p>
                </div>
            </div>
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
        await auth.updateUsername(newUsername.value);
        await auth.fetchUser();
        isEditing.value = false;
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