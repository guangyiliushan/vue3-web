<template>
    <div class="blog-discover">
        <div class="top-bar">
            <input v-model="searchQuery" placeholder="Search posts..." @input="handleSearchInput" />
        </div>
        <div class="content">
            <div>
                <category-dropdown @category-selected="selectCategory" />
            </div>
            <!-- 列表视图 -->
            <main class="posts">
                <div class="post-list">
                    <div v-for="post in displayedPosts" :key="post.id" class="post-card"
                        v-intersection-observer="{ callback: () => loadPostContent(post) }">
                        <a @click="goToPost(post.id)">
                            <h3>{{ post.title }}</h3>
                            <p>{{ post.excerpt }}</p>
                            <p v-if="post.loaded">
                                <strong>Published:</strong> {{ new Date(post.createdAt).toLocaleString() }} |
                                <strong>Category:</strong> {{ post.category?.name }} |
                                <strong>Views:</strong> {{ post.views }} |
                                <strong>Likes:</strong> {{ post.likes }}
                            </p>
                            <p v-else class="loading-placeholder">加载文章详情中...</p>
                            <button @click="goToPost(post.id)">Read More</button>
                        </a>
                    </div>
                </div>
                <div v-if="loading" class="loading">加载中...</div>
                <div v-if="!hasMore && displayedPosts.length > 0" class="end-message">已加载全部文章</div>
            </main>
            <!-- 分页控制器 -->
            <div class="pagination-controls">
                <button :disabled="!hasPrevPage" @click="prevPage">上一页</button>
                <div>
                    <input type="text" @input="changePage(currentPage)" />
                    <span v-if="totalPages > 0"> {{ currentPage }} / {{ totalPages }}</span>
                </div>
                <button :disabled="!hasNextPage" @click="nextPage">下一页</button>
            </div>

            <div class="sidebar">
                <aside>
                    <h3>Statistics</h3>
                    <p>Total Posts: {{ totalPosts }}</p>
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LoadablePost, IntersectionObserverValue } from '@/stores/post';
import { usePostStore } from '@/stores/post';
import type { Directive, DirectiveBinding } from 'vue';
import CategoryDropdown from '@/components/CategoryDropdown.vue';

const router = useRouter();
const postStore = usePostStore();

// 查询参数
const searchQuery = ref('');
const selectedCategory = ref('');
const nextCursor = computed(() => postStore.pagination.nextCursor);
const prevCursor = computed(() => postStore.pagination.prevCursor);
const hasNextPage = computed(() => postStore.pagination.hasNextPage);
const hasPrevPage = computed(() => postStore.pagination.hasPrevPage);

// 分页相关
const displayedPosts = ref<LoadablePost[]>([]);
const currentPage = computed(() => postStore.pagination.currentPage);
const pageSize = ref(5);
const loading = ref(false);
const hasMore = ref(true);
const totalPosts = ref(0);
const totalPages = computed(() => Math.ceil(totalPosts.value / pageSize.value));

// 交叉观察器指令，用于检测元素是否进入视口
const vIntersectionObserver: Directive<HTMLElement, IntersectionObserverValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<IntersectionObserverValue>) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                binding.value.callback();
                observer.unobserve(el);
            }
        }, {
            threshold: 0.1
        });
        observer.observe(el);
    }
};

// 加载文章内容
const loadPostContent = async (post: LoadablePost) => {
    if (post.loaded) return;

    try {
        // 获取文章详细信息
        const fullPost = await postStore.getPostById(post.id);

        // 更新文章信息
        if (fullPost) {
            Object.assign(post, {
                ...fullPost,
                loaded: true
            });
        }
    } catch (error) {
        console.error(`Failed to load post ${post.id}:`, error);
    }
};

// 防抖处理搜索输入
let searchTimeout: number | null = null;
const handleSearchInput = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = window.setTimeout(() => {
        resetSearch();
    }, 300);
};

// 重置搜索
const resetSearch = () => {
    displayedPosts.value = [];
    hasMore.value = true;
    fetchPosts(1);
};
// 下一页预处理
const nextPage = () => {
    if (!nextCursor.value || currentPage.value >= totalPages.value) return;
    const nextPage = Math.min(currentPage.value + 1, totalPages.value);
    const cursor = JSON.stringify(nextCursor.value);
    fetchPosts(nextPage, cursor, 'next');
};

// 上一页预处理
const prevPage = () => {
    if (!prevCursor.value || currentPage.value <= 1) return;
    const prevPage = Math.max(currentPage.value - 1, 1);
    const cursor = JSON.stringify(prevCursor.value);
    fetchPosts(prevPage, cursor, 'prev');
};

// 切换页面
const changePage = (page: number) => {
    if (page < 1 || (page > totalPages.value && totalPages.value > 0)) return;
    fetchPosts(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 查询文章列表
const fetchPosts = async (page?: number, cursor?: string, direction?: string) => {
    if (loading.value) return;

    loading.value = true;
    try {
        const params: Record<string, any> = {
            pageSize: pageSize.value,
            search: searchQuery.value ? searchQuery.value : undefined,
            category: selectedCategory.value ? selectedCategory.value : undefined,
            page: page? page : currentPage.value,
            cursor,
            direction,
        };

        const result = await postStore.fetchPosts(params);

        if (result.posts.length > 0) {
            displayedPosts.value = result.posts.map(post => ({
                ...post,
                loaded: false,
            }));

            // 更新分页信息
            if (result.pagination.totalCount !== undefined) {
                totalPosts.value = result.pagination.totalCount;
            }
            hasMore.value = result.pagination.hasNextPage;
        } else {
            displayedPosts.value = [];
        }
    } catch (error) {
        console.error('Failed to fetch posts:', error);
    } finally {
        loading.value = false;
    }
};
// 选择分类
const selectCategory = (categoryId: string) => {
    selectedCategory.value = selectedCategory.value === categoryId ? '' : categoryId;
    resetSearch();
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
.post-list {
    width: 100%;
}

.post-card {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: transform 0.2s;
}

.post-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

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