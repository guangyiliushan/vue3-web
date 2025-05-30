<template>
  <div class="timeline-view">
    <div>
      <category-dropdown @category-selected="selectCategory" />
    </div>
    <div class="timeline">
      <div v-for="post in displayedPosts" :key="post.id" class="timeline-item">
        <div class="circle"></div>
        <a @click="goToPost(post.id)">
          <div class="item-content">
            <h4>{{ post.title }}</h4>
            <span v-if="post.loaded">{{ new Date(post.createdAt).toLocaleString() }}</span>
            <span v-else class="loading-placeholder">加载中...</span>
          </div>
        </a>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!hasMore && displayedPosts.length > 0" class="end-message">已加载全部文章</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePostStore } from '@/stores/post';
import CategoryDropdown from '@/components/CategoryDropdown.vue';
import type { LoadablePost } from '@/stores/post';

const router = useRouter();

// 数据和状态
const postStore = usePostStore();
const displayedPosts = ref<LoadablePost[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const totalPosts = ref(0);
const selectedCategory = ref('');

const selectCategory = (categoryId: string) => {
  selectedCategory.value = selectedCategory.value === categoryId ? '' : categoryId;
  fetchPosts();
};

// 查询文章列表
const fetchPosts = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const params = {
      category: selectedCategory.value,
      timeline: true,
    };

    const result = await postStore.fetchPosts(params);
    console.log('Fetched posts:', result);
    if (result.posts.length > 0) {
      displayedPosts.value = result.posts.map((post) => ({
        ...post,
        loaded: true,
      }));
    } else {
      displayedPosts.value = [];
    }

    totalPosts.value = result.posts.length;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    loading.value = false;
  }
};

// 跳转到文章详情页
const goToPost = (id: string) => {
  // 跳转前先尝试预加载文章内容
  postStore.getPostById(id).then(() => {
    router.push(`/blog/${id}`);
  });
};

// 初始化
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.timeline-view {
  padding: 20px;
}

.timeline {
  position: relative;
  margin-left: 20px;
  border-left: 2px solid #ccc;
}

.timeline-item {
  position: relative;
  padding: 10px 0 10px 20px;
  margin-bottom: 15px;
}

.timeline-item .circle {
  position: absolute;
  left: -11px;
  top: 12px;
  width: 10px;
  height: 10px;
  background-color: #42b983;
  border-radius: 50%;
}

.timeline-item .item-content h4 {
  margin: 0;
  font-size: 16px;
}

.timeline-item .item-content span {
  color: #888;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 1rem;
  margin-top: 10px;
}

.end-message {
  text-align: center;
  padding: 1rem;
  color: #888;
  margin-top: 10px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  gap: 15px;
  align-items: center;
}

.pagination-controls button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-placeholder {
  color: #888;
  font-style: italic;
  height: 20px;
}
</style>