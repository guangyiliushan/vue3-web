<template>
  <div>
    <button @click="toggleDropdown">Categories</button>
    <div v-if="showDropdown" class="dropdown">
      <ul>
        <li @click="selectCategory('')">All</li>
        <li v-for="category in categories" :key="category.id" @click="selectCategory(category.id)">
          {{ category.name }}
        </li>
      </ul>
    </div>
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
