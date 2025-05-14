<template>
  <div class="timeline-view">
    <div class="timeline">
      <div
        v-for="post in displayedPosts"
        :key="post.id"
        class="timeline-item"
        v-intersection-observer="{ callback: () => loadPostContent(post) }"
      >
        <div class="circle"></div>
        <div class="item-content">
          <a :href="`/post/${post.id}`">
          <h4>{{ post.title }}</h4>
          <span v-if="post.loaded">{{ post.createdAt }}</span>
          <span v-else class="loading-placeholder">加载中...</span>
          </a>
        </div>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!hasMore && displayedPosts.length > 0" class="end-message">已加载全部文章</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePostStore } from '@/stores/post';
import type { LoadablePost, IntersectionObserverValue } from '@/stores/post';
import type { Directive, DirectiveBinding } from 'vue';

// 数据和状态
const postStore = usePostStore();
const displayedPosts = ref<LoadablePost[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const hasMore = ref(true);
const totalPosts = ref(0);

// 交叉观察器指令
const vIntersectionObserver: Directive<HTMLElement, IntersectionObserverValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<IntersectionObserverValue>) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        binding.value.callback();
        observer.unobserve(el);
      }
    }, {
      threshold: 0.1,
    });
    observer.observe(el);
  },
};

// 加载文章内容
const loadPostContent = async (post: LoadablePost) => {
  if (post.loaded) return;

  try {
    const fullPost = await postStore.getPostById(post.id);
    if (fullPost) {
      Object.assign(post, {
        ...fullPost,
        loaded: true,
      });
    }
  } catch (error) {
    console.error(`Failed to load post ${post.id}:`, error);
  }
};

// 查询文章列表
const fetchPosts = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      isTimeline: true,
    };

    const result = await postStore.fetchPosts(params);

    if (result.posts.length > 0) {
      displayedPosts.value = result.posts.map((post) => ({
        ...post,
        loaded: false,
      }));
    } else {
      displayedPosts.value = [];
    }

    totalPosts.value = result.total;
    hasMore.value = currentPage.value < Math.ceil(result.total / pageSize.value);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    loading.value = false;
  }
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