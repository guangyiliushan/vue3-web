<template>
  <div class="dropdown">
    <label tabindex="0" class="btn m-1">
      分类
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </label>
    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
      <li><a @click="selectCategory('')">全部</a></li>
      <li v-for="category in categories" :key="category.id">
        <a @click="selectCategory(category.id)">{{ category.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePostStore } from '@/stores/post';

// 定义 emit，用于触发事件
const emit = defineEmits<{
  (event: 'category-selected', categoryId: string): void;
}>();

const postStore = usePostStore();
const showDropdown = ref(false);
const categories = computed(() => postStore.categories);

const toggleDropdown = () => {
  postStore.getCategories();
  showDropdown.value = !showDropdown.value;
};

const selectCategory = (categoryId: string) => {
  showDropdown.value = false;
  emit('category-selected', categoryId);
};
</script>
