<template>
  <div class="min-h-screen bg-base-100 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <category-dropdown @category-selected="selectCategory" />
      </div>

      <!-- 优化的时间线布局 -->
      <div class="relative">
        <!-- 中央垂直线 -->
        <div 
          v-if="displayedPosts.length > 1" 
          class="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-base-300"
          :style="{
            top: '2rem',
            height: `calc(100% - 4rem)`,
            zIndex: 0
          }"
        ></div>

        <!-- 时间线节点容器 -->
        <div class="relative z-10 space-y-8">
          <div 
            v-for="(post, index) in displayedPosts" 
            :key="post.id"
            class="relative flex items-center"
          >
            <!-- 中央节点 -->
            <div class="absolute left-1/2 transform -translate-x-1/2 z-20">
              <div class="w-4 h-4 bg-primary rounded-full border-4 border-base-100 shadow-lg"></div>
            </div>

            <!-- 内容区域 - 左右交替 -->
            <div 
              :class="[
                'w-5/12 cursor-pointer transition-all duration-300 hover:scale-105',
                index % 2 === 0 ? 'mr-auto pr-8 text-right' : 'ml-auto pl-8 text-left'
              ]"
              @click="goToPost(post.id)"
            >
              <div class="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300">
                <div class="card-body p-4">
                  <!-- 文章标题和时间分布在两端 -->
                  <div 
                    :class="[
                      'flex items-center justify-between',
                      index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
                    ]"
                  >
                    <!-- 文章标题 -->
                    <h4 class="card-title text-lg font-medium text-primary hover:text-primary-focus transition-colors flex-1">
                      {{ post.title }}
                    </h4>
                    
                    <!-- 时间 -->
                    <time 
                      v-if="post.loaded" 
                      :class="[
                        'text-xs opacity-70 font-mono whitespace-nowrap',
                        index % 2 === 0 ? 'mr-4' : 'ml-4'
                      ]"
                    >
                      {{ new Date(post.createdAt).toLocaleString() }}
                    </time>
                    <span v-else class="loading loading-dots loading-xs"></span>
                  </div>
                  
                  <!-- 可选：文章摘要 -->
                  <p v-if="post.excerpt" class="text-sm opacity-60 mt-2 line-clamp-2">
                    {{ post.excerpt }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 单篇文章的特殊处理 -->
      <div v-if="displayedPosts.length === 1" class="flex justify-center">
        <div 
          class="card bg-base-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer max-w-md w-full"
          @click="goToPost(displayedPosts[0].id)"
        >
          <div class="card-body p-6 text-center relative">
            <!-- 单点标记 -->
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div class="w-4 h-4 bg-primary rounded-full border-4 border-base-100 shadow-lg"></div>
            </div>
            
            <h4 class="card-title text-xl font-medium text-primary mt-4">
              {{ displayedPosts[0].title }}
            </h4>
            
            <time class="text-sm opacity-70 font-mono mt-2">
              {{ new Date(displayedPosts[0].createdAt).toLocaleString() }}
            </time>
            
            <p v-if="displayedPosts[0].excerpt" class="text-sm opacity-60 mt-3">
              {{ displayedPosts[0].excerpt }}
            </p>
          </div>
        </div>
      </div>

      <!-- 加载和空状态 -->
      <div v-if="loading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <div v-if="!hasMore && displayedPosts.length > 0" class="text-center py-8">
        <div class="badge badge-outline badge-lg">已加载全部文章</div>
      </div>

      <div v-if="!loading && displayedPosts.length === 0" class="text-center py-16">
        <div class="text-base-content/60">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg">暂无文章</p>
        </div>
      </div>
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
.timeline-item .item-content h4:hover {
  color: hsl(var(--p));
}

.card:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .timeline-start,
  .timeline-end {
    text-align: left !important;
  }
}
</style>